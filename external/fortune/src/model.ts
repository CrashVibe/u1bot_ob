import type { Context } from "koishi";

declare module "koishi" {
  interface Tables {
    fortune: Fortune;
    fortune_checkin: FortuneCheckin;
  }
}

export interface Fortune {
  user: string;
  luckid: string;
  date: Date;
}

export interface FortuneCheckin {
  user: string;
  last_date: string;
  streak: number;
}

export function applyModel(ctx: Context) {
  ctx.model.extend(
    "fortune",
    {
      user: { type: "string" },
      luckid: "string",
      date: "date"
    },
    { primary: "user" }
  );
  ctx.model.extend(
    "fortune_checkin",
    {
      user: { type: "string" },
      last_date: { type: "string" },
      streak: { type: "integer", initial: 0 }
    },
    { primary: "user" }
  );
}
