import type { Context } from "koishi";

declare module "koishi" {
  interface Tables {
    fortune: Fortune;
  }
}

// 这里是新增表的接口类型
export interface Fortune {
  user: string;
  luckid: string;
  date: Date;
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
}

export default applyModel;
