import type { Config } from "./config";
import { type FishingRecordModel } from "./model";
import { FishingRodLevel, FishQuality } from "./types";

/**
 * 获取鱼竿等级显示名称
 */
export function getFishingRodDisplay(level: FishingRodLevel, config: Config): string {
  return config.fishing_rods[level].display;
}

/**
 * 获取所有鱼竿等级的数组，按升级顺序排列
 */
export function getFishingRodLevels(): FishingRodLevel[] {
  return [
    FishingRodLevel.normal,
    FishingRodLevel.silver,
    FishingRodLevel.gold,
    FishingRodLevel.holy,
    FishingRodLevel.void
  ];
}

/**
 * 获取鱼竿等级的索引
 */
export function getFishingRodLevelIndex(level: FishingRodLevel): number {
  return getFishingRodLevels().indexOf(level);
}

/**
 * 获取下一个鱼竿等级
 */
export function getNextFishingRodLevel(currentLevel: FishingRodLevel): FishingRodLevel | undefined {
  const levels = getFishingRodLevels();
  const currentIndex = levels.indexOf(currentLevel);
  if (currentIndex === -1 || currentIndex >= levels.length - 1) {
    return undefined; // 已经是最高等级或无效等级
  }
  return levels[currentIndex + 1];
}

/**
 * 获取上一个鱼竿等级
 */
export function getPreviousFishingRodLevel(currentLevel: FishingRodLevel): FishingRodLevel | undefined {
  const levels = getFishingRodLevels();
  const currentIndex = levels.indexOf(currentLevel);
  if (currentIndex <= 0) {
    return undefined; // 已经是最低等级或无效等级
  }
  return levels[currentIndex - 1];
}

/**
 * 检查是否可以升级鱼竿
 */
export function canUpgradeFishingRod(record: FishingRecordModel, config: Config): boolean {
  const nextLevel = getNextFishingRodLevel(record.fishing_rod_level);
  if (!nextLevel) {
    return false;
  }

  const currentConfig = config.fishing_rods[record.fishing_rod_level];
  return record.total_fishing_count >= currentConfig.upgrade_requirement;
}

/**
 * 升级鱼竿
 */
export function upgradeFishingRod(record: FishingRecordModel): FishingRodLevel | null {
  const nextLevel = getNextFishingRodLevel(record.fishing_rod_level);
  if (!nextLevel) {
    return null;
  }

  record.fishing_rod_level = nextLevel;
  record.fishing_rod_experience = 0; // 重置经验值
  return nextLevel;
}

/**
 * 检查是否应该降级鱼竿
 */
export function shouldDowngradeFishingRod(
  record: FishingRecordModel,
  config: Config,
  fishName: string
): { shouldDowngrade: boolean; reason: string|null } {
  const currentConfig = config.fishing_rods[record.fishing_rod_level];

  // 检查是否钓到了倒霉鱼
  if (config.downgrade_events.bad_fish_names.includes(fishName)) {
    const random = Math.random();
    if (random < currentConfig.downgrade_probability) {
      return { shouldDowngrade: true, reason: "钓到了倒霉鱼" };
    }
  }

  // 检查连续钓到低品质鱼
  if (record.consecutive_bad_count >= config.downgrade_events.consecutive_bad_threshold) {
    const random = Math.random();
    const boostedProbability = Math.min(currentConfig.downgrade_probability * 5, 0.5);
    if (random < boostedProbability) {
      return { shouldDowngrade: true, reason: "连续钓到低品质鱼" };
    }
  }

  // 检查不活跃降级
  const daysSinceLastFishing = (Date.now() - record.last_fishing_time.getTime()) / (1000 * 60 * 60 * 24);
  if (daysSinceLastFishing >= config.downgrade_events.inactivity_days) {
    return { shouldDowngrade: true, reason: "鱼竿生锈了" };
  }

  return { shouldDowngrade: false, reason: null };
}

/**
 * 降级鱼竿
 */
export function downgradeFishingRod(record: FishingRecordModel): FishingRodLevel | null {
  const previousLevel = getPreviousFishingRodLevel(record.fishing_rod_level);
  if (!previousLevel) {
    return null;
  }

  record.fishing_rod_level = previousLevel;
  record.fishing_rod_experience = 0; // 重置经验值
  record.consecutive_bad_count = 0; // 重置连续倒霉计数
  return previousLevel;
}

/**
 * 计算鱼竿对品质的加成权重
 */
export function calculateFishingRodBonus(level: FishingRodLevel, quality: FishQuality, config: Config): number {
  const rodConfig = config.fishing_rods[level];
  return rodConfig.quality_bonus[quality] || 1;
}

/**
 * 更新连续倒霉计数
 */
export function updateConsecutiveBadCount(record: FishingRecordModel, quality: FishQuality): void {
  record.frequency += 1;

  if (quality === FishQuality.rotten || quality === FishQuality.moldy) {
    record.consecutive_bad_count++;
  } else {
    record.consecutive_bad_count = 0; // 重置计数
  }
}

/**
 * 获取鱼竿升级进度信息
 */
export function getFishingRodProgress(
  record: FishingRecordModel,
  config: Config
): {
  current: string;
  next: string | null;
  progress: number;
  nextRequirement: number;
} {
  const currentLevel = record.fishing_rod_level;
  const nextLevel = getNextFishingRodLevel(currentLevel);
  const currentConfig = config.fishing_rods[currentLevel];

  let progress = 0;
  let nextRequirement = 0;

  if (nextLevel) {
    nextRequirement = currentConfig.upgrade_requirement;
    progress = Math.min(record.total_fishing_count, nextRequirement);
  }

  return {
    current: getFishingRodDisplay(currentLevel, config),
    next: nextLevel ? getFishingRodDisplay(nextLevel, config) : null,
    progress,
    nextRequirement
  };
}
