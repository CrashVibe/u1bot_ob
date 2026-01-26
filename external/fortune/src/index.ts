import type { Awaitable, Context } from "koishi";
import { h, Schema, Service } from "koishi";
import { get_user_fortune_display, get_user_luck_star } from "./services";
import { applyModel } from "./model";

export const name = "fortune";

declare module "koishi" {
  interface Context {
    fortune: Fortune;
  }
}

/**
 * 运势服务类，提供运势相关的功能
 *
 * API 接口
 */
class Fortune extends Service {
  static inject = ["database"];
  ctx: Context;
  config: Fortune.Config;
  constructor(ctx: Context, config: Fortune.Config) {
    super(ctx, "fortune", true);
    this.ctx = ctx;
    this.config = config;
    applyModel(ctx);
  }

  start(): Awaitable<void> {
    this.ctx
      .command("运势", "获取今日运势 (每天刷新)")
      .alias("今日运势")
      .action(async ({ session }) => {
        if (!session || !session.userId) {
          throw new Error("会话对象不存在");
        }
        const result = await get_user_fortune_display(this.ctx, this.config, session.userId);
        return h.quote(session.messageId) + (result ?? "未能获取到今日运势。");
      });
  }

  public async get_user_luck_star(userId: string) {
    return await get_user_luck_star(this.ctx, userId);
  }
}
namespace Fortune {
  export interface Config {
    timezone: string;
    specialUserHash?: string;
    specialMonth?: number;
    specialDay?: number;
  }

  export const Config: Schema<Config> = Schema.object({
    timezone: Schema.string().default("Asia/Shanghai"),
    specialUserHash: Schema.string().description("生日用户 ID 的 SHA256 哈希值"),
    specialMonth: Schema.number().min(1).max(12).description("生日的用户的 Month"),
    specialDay: Schema.number().min(1).max(31).description("生日的用户的 Day")
  });
}
export default Fortune;
