import type { Context } from "koishi";
import { Schema } from "koishi";

export const name = "ncm-saying";

export interface Config {}

export const Config: Schema<Config> = Schema.object({});

export function apply(ctx: Context) {
  ctx
    .command("ncm-saying", "网易云热评")
    .alias("网抑云")
    .alias("网易云热评")
    .action(async ({ session }) => {
      if (!session) {
        throw new Error("无法获取会话信息");
      }
      const response = await fetch("https://zj.v.api.aa1.cn/api/wenan-wy/?type=json");
      const data = await response.json();
      if (response && !response.ok) {
        return "获取网抑云失败咯，请稍后再试...";
      }

      return data.msg;
    });
}
