import "@u1bot/koishi-plugin-coin";

import type { Context } from "koishi";
import { h, Schema } from "koishi";
import moment from "moment-timezone";

import Tarot from "./services";

export const name = "tarot";

declare module "koishi" {
  interface Tables {
    tarot_usage: TarotUsage;
  }
}

export interface TarotUsage {
  user: string;
  last_divine_date: string;
  divine_count: number;
}

export interface Config {
  is_chain_reply: boolean;
}

export const Config: Schema<Config> = Schema.object({
  is_chain_reply: Schema.boolean().default(true).description("是否使用合并转发")
});

export async function apply(ctx: Context, config: Config) {
  ctx.model.extend(
    "tarot_usage",
    {
      user: { type: "string" },
      last_divine_date: { type: "string" },
      divine_count: { type: "integer", initial: 0 }
    },
    { primary: "user" }
  );

  ctx.command("塔罗牌", "抽取一张塔罗牌").action(async ({ session }) => {
    if (!session) {
      throw new Error("无法获取用户信息");
    }
    const tarot_manager = new Tarot(config);
    return h.quote(session.messageId) + (await tarot_manager.onetime_divine());
  });

  ctx.command("占卜", "进行一次塔罗牌占卜").action(async ({ session }) => {
    if (!session || !session.userId) {
      throw new Error("无法获取用户信息");
    }

    const userId = session.userId;
    const today = moment().tz("Asia/Shanghai").format("YYYY-MM-DD");

    let isPaid = false;
    const records = await ctx.database.get("tarot_usage", { user: userId });

    if (records.length === 0 || records[0]!.last_divine_date !== today) {
      // 今日首次占卜 - 免费
      await ctx.database.upsert("tarot_usage", (_) => [
        {
          user: userId,
          last_divine_date: today,
          divine_count: 1
        }
      ]);
    } else {
      // 今日已占卜过 - 需要扣费
      const hasEnough = await ctx.coin.hasEnoughCoin(userId, 30);
      if (!hasEnough) {
        const balance = await ctx.coin.getCoin(userId);
        return h.quote(session.messageId) + `今日免费占卜已用完，再次占卜需要 30 次元币。你当前余额：${balance} 次元币`;
      }

      await ctx.coin.adjustCoin(userId, -30, "塔罗牌占卜");
      isPaid = true;

      await ctx.database.set(
        "tarot_usage",
        { user: userId },
        {
          last_divine_date: today,
          divine_count: (records[0]!.divine_count ?? 0) + 1
        }
      );
    }

    const tarot_manager = new Tarot(config);
    await tarot_manager.divine(session);

    if (isPaid) {
      const balance = await ctx.coin.getCoin(userId);
      await session.send(`（本次占卜消耗 30 次元币，余额：${balance}）`);
    }
  });
}
