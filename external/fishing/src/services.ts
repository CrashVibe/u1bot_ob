import {} from "@u1bot/koishi-plugin-fortune";
import type { Context } from "koishi";
import { Random, type Session } from "koishi";
import {} from "koishi-plugin-redis";

import { FISH_CONFIG, type Config } from "./config";
import { updateRankings } from "./crud";
import {
  calculateFishingRodBonus,
  canUpgradeFishingRod,
  downgradeFishingRod,
  shouldDowngradeFishingRod,
  updateConsecutiveBadCount,
  upgradeFishingRod
} from "./fishing_rod";
import { FishQuality, type Fish, FishingRodLevel, type FishInfo } from "./types";

export async function choice(ctx: Context, session: Session, config: Config) {
  if (!session.userId) {
    throw new Error("无法获取用户ID");
  }

  const { weight, adjustment_mode, luck_star_num, fishing_rod_level, items, consumeLuckyBait } = await get_weight(
    ctx,
    config,
    session.userId
  );

  // 超级鱼饵效果：排除腐烂/发霉品质
  let consumeSuperBait = false;
  let availableQualities = Object.values(FishQuality);
  let availableWeights = Object.values(weight);

  if ((items["超级鱼饵"] || 0) > 0) {
    consumeSuperBait = true;
    availableQualities = availableQualities.filter((q) => q !== FishQuality.rotten && q !== FishQuality.moldy);
    availableWeights = availableQualities.map((q) => weight[q]);
  }

  const fish_quality = weighted_choice(availableQualities, availableWeights);
  const selected_fish_config = FISH_CONFIG[fish_quality];
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
    fishing_rod_level,
    consumeLuckyBait,
    consumeSuperBait
  };
}

// 根据权重进行随机选择
function weighted_choice(items: FishQuality[], weights: number[]) {
  const total = weights.reduce((sum, w) => sum + (w ?? 0), 0);
  let random = Math.random() * total;

  for (const [i, item] of items.entries()) {
    random -= weights[i] ?? 0;
    if (random < 0) return item;
  }
  return items.at(-1)!;
}

// 计算幸运星数量对权重的影响 (指数函数)
function calculate_weight_increase(config: Config, luck_star_num: number): number {
  const base = config.base_weight_increase;
  return base * (Math.pow(1.1, luck_star_num) - 1);
}

// 根据用户运势和鱼竿调整鱼权重，返回对应权重值
async function get_weight(ctx: Context, config: Config, userId: string) {
  let luck_star_num: number | null = null;
  if (ctx.fortune) {
    luck_star_num = await ctx.fortune.get_user_luck_star(userId);
  }

  const [userRecord] = await ctx.database.get("fishing_record", {
    user_id: userId
  });

  const fishingRodLevel = userRecord?.fishing_rod_level ?? FishingRodLevel.normal;
  const items = (userRecord?.items || {}) as Record<string, number>;

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

  // 幸运饵料效果：高品质鱼权重 ×1.5
  let consumeLuckyBait = false;
  if ((items["幸运饵料"] || 0) > 0) {
    weight[FishQuality.golden] *= 1.5;
    weight[FishQuality.void] *= 1.5;
    weight[FishQuality.hidden_fire] *= 1.5;
    consumeLuckyBait = true;
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
    fishing_rod_level: fishingRodLevel,
    items,
    consumeLuckyBait
  };
}

export async function save_fish(
  ctx: Context,
  session: Session,
  fish: Fish,
  config: Config,
  consumeLuckyBait = false,
  consumeSuperBait = false
): Promise<{
  upgraded: boolean;
  downgraded: boolean;
  newLevel?: FishingRodLevel;
  downgradeReason?: string;
  protectionUsed?: boolean;
}> {
  if (!session.userId) {
    throw new Error("无法获取用户ID");
  }
  const { userId } = session;
  let record = await ctx.database.get("fishing_record", { user_id: userId });

  let fishingResult: {
    upgraded: boolean;
    downgraded: boolean;
    newLevel?: FishingRodLevel;
    downgradeReason?: string;
    protectionUsed?: boolean;
  } = {
    upgraded: false,
    downgraded: false,
    newLevel: undefined,
    downgradeReason: undefined,
    protectionUsed: false
  };

  if (!record[0]) {
    const newRecord = await ctx.database.create("fishing_record", {
      user_id: userId,
      frequency: 1,
      fishes: [fish],
      fishing_rod_level: FishingRodLevel.normal,
      fishing_rod_experience: 1,
      total_fishing_count: 1,
      last_fishing_time: new Date(),
      consecutive_bad_count: fish.quality === FishQuality.rotten || fish.quality === FishQuality.moldy ? 1 : 0,
      items: {}
    });

    record = [newRecord];
  } else {
    const userRecord = record[0];

    const fish_record = userRecord.fishes;
    const existing = fish_record.find((f) => f.quality === fish.quality && f.name === fish.name);
    if (existing) {
      existing.length += fish.length;
    } else {
      fish_record.push(fish);
    }

    updateConsecutiveBadCount(userRecord, fish.quality);

    const downgradeCheck = shouldDowngradeFishingRod(userRecord, config, fish.name);
    if (downgradeCheck.shouldDowngrade) {
      // 保护绳效果：防止鱼竿降级一次
      const items: Record<string, number> = (userRecord.items || {}) as Record<string, number>;
      const ropeCount = items["保护绳"] || 0;
      if (ropeCount > 0) {
        items["保护绳"] = ropeCount - 1;
        userRecord.items = items;
        fishingResult.protectionUsed = true;
      } else {
        const downgradedLevel = downgradeFishingRod(userRecord);
        if (downgradedLevel) {
          fishingResult.downgraded = true;
          fishingResult.newLevel = downgradedLevel;
          fishingResult.downgradeReason = downgradeCheck.reason === null ? undefined : downgradeCheck.reason;
        }
      }
    }

    userRecord.total_fishing_count += 1;
    userRecord.last_fishing_time = new Date();
    userRecord.fishing_rod_experience += 1;

    if (canUpgradeFishingRod(userRecord, config)) {
      const upgradedLevel = upgradeFishingRod(userRecord);
      if (upgradedLevel) {
        fishingResult.upgraded = true;
        fishingResult.newLevel = upgradedLevel;
      }
    }

    // 消耗道具：幸运饵料、超级鱼饵
    const items: Record<string, number> = (userRecord.items || {}) as Record<string, number>;
    if (consumeLuckyBait) {
      const luckyCount = items["幸运饵料"] || 0;
      if (luckyCount > 0) {
        items["幸运饵料"] = luckyCount - 1;
      }
    }
    if (consumeSuperBait) {
      const superCount = items["超级鱼饵"] || 0;
      if (superCount > 0) {
        items["超级鱼饵"] = superCount - 1;
      }
    }
    userRecord.items = items;

    if (session.guildId) {
      await updateRankings(ctx, session.guildId, userId, fish, userRecord);
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
        consecutive_bad_count: userRecord.consecutive_bad_count,
        items: userRecord.items
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
