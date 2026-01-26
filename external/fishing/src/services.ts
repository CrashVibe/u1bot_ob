import type { Config } from "./config";
import {} from "@u1bot/koishi-plugin-fortune";
import type { Context } from "koishi";
import { Random, type Session } from "koishi";

import { type Fish, FISH_CONFIG, type FishInfo, FishingRodLevel, FishQuality } from "./config";
import {
  calculateFishingRodBonus,
  canUpgradeFishingRod,
  downgradeFishingRod,
  getFishingRodDisplay,
  shouldDowngradeFishingRod,
  updateConsecutiveBadCount,
  upgradeFishingRod
} from "./fishing_rod";

export async function choice(ctx: Context, session: Session, config: Config) {
  if (!session.userId) {
    throw new Error("无法获取用户ID");
  }

  const { weight, adjustment_mode, luck_star_num, fishing_rod_level } = await get_weight(ctx, config, session.userId);

  // 加权随机
  const fish_quality = weighted_choice(Object.values(FishQuality), Object.values(weight));

  // 获取该品质对应的配置
  const selected_fish_config = FISH_CONFIG[fish_quality];

  // 从鱼类信息中随机选择一条鱼
  const selected_fish_info = Random.pick(selected_fish_config.fishes);
  const random_length = Random.int(selected_fish_config.lengthRange[0], selected_fish_config.lengthRange[1]);

  return {
    fish: {
      name: selected_fish_info.name,
      quality: fish_quality,
      length: random_length,
      price: selected_fish_config.price
    } as Fish,
    fishInfo: selected_fish_info, // 添加鱼类信息，用于获取prompt
    adjustment_mode,
    luck_star_num,
    fishing_rod_level
  };
}

/**
 * 根据权重进行随机选择
 */
function weighted_choice(items: FishQuality[], weights: number[]) {
  const total = weights.reduce((sum, w) => sum + (w ?? 0), 0);
  let random = Math.random() * total;

  for (const [i, item] of items.entries()) {
    random -= weights[i] ?? 0;
    if (random < 0) return item;
  }
  return items.at(-1)!;
}

/**
 * 计算幸运星数量对权重的影响 (指数函数)
 * @param config 配置
 * @param luck_star_num 星数量
 * @returns 权重增加值
 */
function calculate_weight_increase(config: Config, luck_star_num: number): number {
  const base = config.base_weight_increase;
  return base * (Math.pow(1.1, luck_star_num) - 1);
}

/**
 * 根据用户运势和鱼竿调整鱼权重，返回对应权重值
 *
 * @param ctx 上下文
 * @param config 配置
 * @param userId 用户ID
 * @returns
 */
async function get_weight(ctx: Context, config: Config, userId: string) {
  let luck_star_num: number | null = null;
  if (ctx.fortune) {
    luck_star_num = await ctx.fortune.get_user_luck_star(userId);
  }

  const [userRecord] = await ctx.database.get("fishing_record", {
    user_id: userId
  });

  const fishingRodLevel = userRecord?.fishing_rod_level ?? FishingRodLevel.normal;

  const qualities = Object.values(FishQuality);
  const adjustment_mode = !!(luck_star_num && luck_star_num > 0);

  const weight: Record<FishQuality, number> = {
    [FishQuality.rotten]: 0,
    [FishQuality.moldy]: 0,
    [FishQuality.common]: 0,
    [FishQuality.golden]: 0,
    [FishQuality.void]: 0,
    [FishQuality.hidden_fire]: 0
  };

  const luckMultiplier = adjustment_mode ? calculate_weight_increase(config, luck_star_num!) : 0;

  const luckFactorMap: Record<FishQuality, number> = {
    [FishQuality.hidden_fire]: 1 + luckMultiplier * 2,
    [FishQuality.void]: 1 + luckMultiplier * 2,
    [FishQuality.golden]: 1 + luckMultiplier * 1.5,
    [FishQuality.common]: 1,
    [FishQuality.moldy]: 1 - luckMultiplier * 0.3,
    [FishQuality.rotten]: 1 - luckMultiplier * 0.5
  };

  for (const quality of qualities) {
    const baseWeight = FISH_CONFIG[quality].weight;
    const rodBonus = calculateFishingRodBonus(fishingRodLevel, quality, config);

    let w = baseWeight * rodBonus;

    if (adjustment_mode) {
      w *= luckFactorMap[quality];
      w = Math.max(w, 0.01);
    }

    weight[quality] = w;
  }

  const totalWeight = Object.values(weight).reduce((s, w) => s + w, 0);

  if (totalWeight > 0) {
    for (const quality of qualities) {
      weight[quality] = (weight[quality] / totalWeight) * 100;
    }
  }

  return {
    weight,
    adjustment_mode,
    luck_star_num,
    fishing_rod_level: fishingRodLevel
  };
}

export async function save_fish(
  ctx: Context,
  session: Session,
  fish: Fish,
  config: Config
): Promise<{
  upgraded: boolean;
  downgraded: boolean;
  newLevel?: FishingRodLevel;
  downgradeReason?: string;
}> {
  const { userId } = session;
  let record = await ctx.database.get("fishing_record", { user_id: userId });

  let fishingResult = {
    upgraded: false,
    downgraded: false,
    newLevel: undefined as FishingRodLevel | undefined,
    downgradeReason: undefined as string | undefined
  };

  if (!record[0]) {
    // 创建新记录
    const newRecord = await ctx.database.create("fishing_record", {
      user_id: userId,
      frequency: 1,
      fishes: [fish],
      fishing_rod_level: FishingRodLevel.normal,
      fishing_rod_experience: 1,
      total_fishing_count: 1,
      last_fishing_time: new Date(),
      consecutive_bad_count: fish.quality === FishQuality.rotten || fish.quality === FishQuality.moldy ? 1 : 0
    });

    record = [newRecord];
  } else {
    const userRecord = record[0];

    // 更新鱼记录
    const fish_record = userRecord.fishes;
    const existing = fish_record.find((f) => f.quality === fish.quality && f.name === fish.name);
    if (existing) {
      existing.length += fish.length;
    } else {
      fish_record.push(fish);
    }

    // 更新倒霉计数
    updateConsecutiveBadCount(userRecord, fish.quality);

    const downgradeCheck = shouldDowngradeFishingRod(userRecord, config, fish.name);
    if (downgradeCheck.shouldDowngrade) {
      const downgradedLevel = downgradeFishingRod(userRecord);
      if (downgradedLevel) {
        fishingResult.downgraded = true;
        fishingResult.newLevel = downgradedLevel;
        fishingResult.downgradeReason = downgradeCheck.reason;
      }
    }

    userRecord.frequency += 1;
    userRecord.total_fishing_count += 1;
    userRecord.last_fishing_time = new Date();
    userRecord.fishing_rod_experience += 1;

    // 检查升级
    if (canUpgradeFishingRod(userRecord, config)) {
      const upgradedLevel = upgradeFishingRod(userRecord);
      if (upgradedLevel) {
        fishingResult.upgraded = true;
        fishingResult.newLevel = upgradedLevel;
      }
    }

    await ctx.database.set(
      "fishing_record",
      { user_id: userId },
      {
        frequency: userRecord.frequency,
        fishes: fish_record,
        fishing_rod_level: userRecord.fishing_rod_level,
        fishing_rod_experience: userRecord.fishing_rod_experience,
        total_fishing_count: userRecord.total_fishing_count,
        last_fishing_time: userRecord.last_fishing_time,
        consecutive_bad_count: userRecord.consecutive_bad_count
      }
    );
  }

  return fishingResult;
}

export function get_quality_display(quality: string): string {
  const qualityEnum = quality as FishQuality;
  if (FISH_CONFIG[qualityEnum]) {
    return FISH_CONFIG[qualityEnum].display;
  }
  throw new Error(`未知的鱼品质: ${quality}`);
}

export function get_display_quality(quality_name: string): FishQuality {
  for (const [quality, qualityConfig] of Object.entries(FISH_CONFIG)) {
    if (qualityConfig.display === quality_name) {
      return quality as FishQuality;
    }
  }
  throw new Error(`未知的鱼品质名称: ${quality_name}`);
}

export function get_fish_price(fish: Fish): number {
  const quality_config = FISH_CONFIG[fish.quality];
  return fish.length * quality_config.price;
}

export function get_fish_info(fishName: string, quality: FishQuality): FishInfo | null {
  const qualityConfig = FISH_CONFIG[quality];
  return qualityConfig.fishes.find((f) => f.name === fishName) || null;
}

export async function get_backpack(ctx: Context, userId: string) {
  // 按照鱼的品质分组
  const record = await ctx.database.get("fishing_record", {
    user_id: userId
  });
  if (!record[0]) {
    return {
      rotten: [],
      moldy: [],
      common: [],
      golden: [],
      void: [],
      hidden_fire: []
    };
  }
  const { fishes } = record[0];
  const grouped: Record<FishQuality, Fish[]> = {
    rotten: [],
    moldy: [],
    common: [],
    golden: [],
    void: [],
    hidden_fire: []
  };
  for (const fish of fishes) {
    grouped[fish.quality].push(fish);
  }
  const formatted: Record<FishQuality, string[]> = {
    rotten: grouped.rotten.map((f) => `${f.name} (${f.length}cm)`),
    moldy: grouped.moldy.map((f) => `${f.name} (${f.length}cm)`),
    common: grouped.common.map((f) => `${f.name} (${f.length}cm)`),
    golden: grouped.golden.map((f) => `${f.name} (${f.length}cm)`),
    void: grouped.void.map((f) => `${f.name} (${f.length}cm)`),
    hidden_fire: grouped.hidden_fire.map((f) => `${f.name} (${f.length}cm)`)
  };

  return formatted;
}

export async function get_fishing_stats(ctx: Context, userId: string) {
  const record = await ctx.database.get("fishing_record", {
    user_id: userId
  });
  if (!record[0]) {
    return {
      frequency: 0,
      fishes: [],
      fishing_rod_level: FishingRodLevel.normal,
      total_fishing_count: 0,
      consecutive_bad_count: 0
    };
  }
  return {
    frequency: record[0].frequency,
    fishes: record[0].fishes,
    fishing_rod_level: record[0].fishing_rod_level || FishingRodLevel.normal,
    total_fishing_count: record[0].total_fishing_count || 0,
    consecutive_bad_count: record[0].consecutive_bad_count || 0
  };
}

export async function get_user_fishing_rod_info(ctx: Context, userId: string, config: Config) {
  const record = await ctx.database.get("fishing_record", {
    user_id: userId
  });
  if (!record[0]) {
    return {
      level: FishingRodLevel.normal,
      display: getFishingRodDisplay(FishingRodLevel.normal, config),
      total_fishing_count: 0,
      experience: 0
    };
  }

  const userRecord = record[0];
  return {
    level: userRecord.fishing_rod_level || FishingRodLevel.normal,
    display: getFishingRodDisplay(userRecord.fishing_rod_level || FishingRodLevel.normal, config),
    total_fishing_count: userRecord.total_fishing_count || 0,
    experience: userRecord.fishing_rod_experience || 0
  };
}
