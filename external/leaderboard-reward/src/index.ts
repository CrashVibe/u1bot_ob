import type {} from "@u1bot/koishi-plugin-coin";
import type {} from "@u1bot/koishi-plugin-fishing";
import type {} from "@u1bot/koishi-plugin-sleep";
import type { Context } from "koishi";
import { Schema } from "koishi";
import type {} from "koishi-plugin-cron";

export const name = "leaderboard-reward";
export const inject = ["database", "cron", "coin"];

export interface Config {}

export const Config: Schema<Config> = Schema.object({});

// 奖励金额配置
const WEEKLY_FISHING_REWARDS = [500, 300, 150];
const WEEKLY_MORNING_REWARDS = [300, 200, 100];
const MONTHLY_FISHING_REWARDS = [1500, 800, 400];
const MONTHLY_MORNING_REWARDS = [800, 500, 300];

interface FishingRecordRow {
  user_id: string;
  frequency: number;
}

interface SleepUserRow {
  user_id: string;
  total_morning_count: number;
}

async function sendPrivateMessage(ctx: Context, userId: string, message: string) {
  const bots = Object.values(ctx.bots);
  for (const bot of bots) {
    try {
      await bot.sendPrivateMessage(userId, message);
      return;
    } catch {
      // 尝试下一个 bot
    }
  }
  ctx.logger.warn(`无法向用户 ${userId} 发送通知`);
}

async function rewardFishing(ctx: Context, rewards: number[], period: string) {
  const records = (await ctx.database.get(
    "fishing_record",
    {},
    { sort: { frequency: "desc" }, limit: rewards.length }
  )) as FishingRecordRow[];

  for (let i = 0; i < records.length; i++) {
    const record = records[i]!;
    const amount = rewards[i]!;
    await ctx.coin.adjustCoin(record.user_id, amount, `${period}钓鱼排行榜第${i + 1}名奖励`);

    const message = `* 恭喜！你在${period}钓鱼排行榜中获得了第 ${i + 1} 名，奖励 ${amount} 次元币！`;
    await sendPrivateMessage(ctx, record.user_id, message);
  }

  ctx.logger.info(`${period}钓鱼排行榜奖励已发放，共 ${records.length} 人`);
}

async function rewardMorning(ctx: Context, rewards: number[], period: string) {
  const records = (await ctx.database.get(
    "sleep_user",
    {},
    { sort: { total_morning_count: "desc" }, limit: rewards.length }
  )) as SleepUserRow[];

  for (let i = 0; i < records.length; i++) {
    const record = records[i]!;
    const amount = rewards[i]!;
    await ctx.coin.adjustCoin(record.user_id, amount, `${period}早晚安早安榜第${i + 1}名奖励`);

    const message = `* 恭喜！你在${period}早晚安早安排行榜中获得了第 ${i + 1} 名，奖励 ${amount} 次元币！`;
    await sendPrivateMessage(ctx, record.user_id, message);
  }

  ctx.logger.info(`${period}早晚安早安榜奖励已发放，共 ${records.length} 人`);
}

export async function apply(ctx: Context) {
  // 每周一 0:00 结算
  ctx.cron("0 0 * * 1", async () => {
    ctx.logger.info("开始每周排行榜奖励结算...");
    await rewardFishing(ctx, WEEKLY_FISHING_REWARDS, "本周");
    await rewardMorning(ctx, WEEKLY_MORNING_REWARDS, "本周");
    ctx.logger.info("每周排行榜奖励结算完成");
  });

  // 每月 1 日 0:00 结算
  ctx.cron("0 0 1 * *", async () => {
    ctx.logger.info("开始每月排行榜奖励结算...");
    await rewardFishing(ctx, MONTHLY_FISHING_REWARDS, "本月");
    await rewardMorning(ctx, MONTHLY_MORNING_REWARDS, "本月");
    ctx.logger.info("每月排行榜奖励结算完成");
  });
}
