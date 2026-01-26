export enum FishQuality {
  /** 腐烂品质 */
  rotten = "rotten",
  /** 发霉品质 */
  moldy = "moldy",
  /** 普通品质 */
  common = "common",
  /** 金品质 */
  golden = "golden",
  /** 虚空品质 */
  void = "void",
  /** 隐火品质 */
  hidden_fire = "hidden_fire"
}

export enum FishingRodLevel {
  /** 普通鱼竿 */
  normal = "normal",
  /** 银鱼竿 */
  silver = "silver",
  /** 金鱼竿 */
  gold = "gold",
  /** 圣物鱼竿 */
  holy = "holy",
  /** 虚空鱼竿*/
  void = "void"
}

export interface FishingRodConfig {
  /** 鱼竿内部标识符 */
  name: string;
  /** 鱼竿显示名称 */
  display: string;
  /**  升级所需钓鱼次数 */
  upgrade_requirement: number;
  /** 品质加成系数 */
  quality_bonus: Record<FishQuality, number>;
  /** 基础降级概率 */
  downgrade_probability: number;
  /** 特殊鱼类概率加成 */
  special_fish_bonus: number;
}
export interface FishInfo {
  /** 鱼的名称 */
  name: string;
  /** 特殊描述，如果有则优先显示 */
  prompt?: string;
}

export interface QualityConfig {
  /** 品质内部标识符 */
  name: string;
  /** 品质显示名称 */
  display: string;
  /** 品质权重 */
  weight: number;
  /** 鱼的价格系数 */
  price: number;
  /** 鱼的长度范围 [最小, 最大] */
  lengthRange: [number, number];
  /** 该品质等级的鱼类列表 */
  fishes: FishInfo[];
}

export interface Fish {
  /** 鱼的名称 */
  name: string;
  /** 鱼的品质等级 */
  quality: FishQuality;
  /** 鱼的长度 */
  length: number;
}


