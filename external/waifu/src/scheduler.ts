import {} from "koishi-plugin-cron";
import type { Context } from "koishi";
import { applyModel } from "./models";

export function applyCron(ctx: Context) {
  // 每天凌晨执行
  ctx.cron("0 0 * * *", async () => {
    await ctx.database.drop("waifu_relationships");
    applyModel(ctx);
    ctx.logger.info("每日 娶群友 数据已刷新！");
  });
}
