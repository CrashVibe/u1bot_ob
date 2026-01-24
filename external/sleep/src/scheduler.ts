import type { Context } from "koishi";
import type { Config } from ".";
import { applyModel } from "./models";

async function groupo_daily_refresh(ctx: Context) {
    await ctx.database.drop("sleep_group");
    applyModel(ctx);
    ctx.logger.info("每日早晚安群数据已刷新！");
}

async function user_weekly_refresh(ctx: Context) {
    await ctx.database.set(
        "sleep_user",
        {},
        {
            weekly_morning_count: 0,
            weekly_night_count: 0,
            weekly_sleep_time: 0,
            weekly_earliest_morning_time: null,
            weekly_latest_night_time: null
        }
    );
    ctx.logger.info("每周 早晚安数据-用户 已刷新！");
}

export function applycron(ctx: Context, config: Config) {
    ctx.cron(`0 0 ${config.nightStartHour} * * *`, async () => {
        await groupo_daily_refresh(ctx);
    });

    // day of week 1
    ctx.cron(`0 0 * * 1`, async () => {
        await user_weekly_refresh(ctx);
    });
}
