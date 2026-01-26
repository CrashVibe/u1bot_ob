import type { Context } from "koishi";
import { type Fish, FishingRodLevel } from "./config";

declare module "koishi" {
  interface Tables {
    fishing_record: FishingRecordModel;
  }
  interface Channel {
    fishing_switch: boolean;
  }
}

export interface FishingRecordModel {
  /** 用户ID */
  user_id: string;
  /** 倒霉次数 */
  frequency: number;
  /** 鱼的列表 */
  fishes: Fish[];
  /** 钓鱼竿等级 */
  fishing_rod_level: FishingRodLevel;
  /** 钓鱼竿经验 */
  fishing_rod_experience: number;
  /** 总钓鱼次数 */
  total_fishing_count: number;
  /** 上次钓鱼时间 */
  last_fishing_time: Date;
  /** 连续倒霉次数 */
  consecutive_bad_count: number;
}

export function applyModel(ctx: Context) {
  ctx.model.extend("channel", {
    fishing_switch: {
      type: "boolean",
      initial: true
    }
  });
  ctx.model.extend(
    "fishing_record",
    {
      user_id: "string",
      frequency: "unsigned",
      fishes: "json",
      fishing_rod_level: {
        type: "string",
        initial: FishingRodLevel.normal
      },
      fishing_rod_experience: { type: "unsigned", initial: 0 },
      total_fishing_count: { type: "unsigned", initial: 0 },
      last_fishing_time: { type: "timestamp", initial: new Date() },
      consecutive_bad_count: { type: "unsigned", initial: 0 }
    },
    {
      primary: "user_id"
    }
  );
}
