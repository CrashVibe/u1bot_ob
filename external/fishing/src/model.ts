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
  user_id: string;
  frequency: number;
  fishes: Fish[];
  fishing_rod_level: FishingRodLevel;
  fishing_rod_experience: number;
  total_fishing_count: number;
  last_fishing_time: Date;
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
