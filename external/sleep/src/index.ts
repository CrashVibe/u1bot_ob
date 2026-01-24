import type { Context } from "koishi";
import { h, Schema } from "koishi";
import {} from "koishi-plugin-cron";
import moment from "moment-timezone";
import { applyModel } from "./models";
import { applycron } from "./scheduler";
import { get_all_morning_night_data, get_morning, get_night, get_user_sleep_stats } from "./services";

export const name = "sleep";
export const inject = ["database", "cron"];

export interface Config {
    timezone: string;
    morningEnable: boolean;
    morningStartHour: number;
    morningEndHour: number;
    multiGetUpEnable: boolean;
    multiGetUpInterval: number;
    superGetUpEnable: boolean;
    superGetUpInterval: number;
    nightEnable: boolean;
    nightStartHour: number;
    nightEndHour: number;
    goodSleepEnable: boolean;
    goodSleepInterval: number;
    deepSleepEnable: boolean;
    deepSleepInterval: number;
    MORNING_MESSAGES: string[];
    NIGHT_MESSAGES: string[];
    morningPrompts: string[];
    nightPrompts: string[];
}

export const Config: Schema<Config> = Schema.object({
    timezone: Schema.string().default("Asia/Shanghai").description("设置时区，默认为 Asia/Shanghai (上海)"),
    morningEnable: Schema.boolean().default(true).description("早安时段功能开关"),
    morningStartHour: Schema.number().default(6).description("早安时段最早时间 (小时)"),
    morningEndHour: Schema.number().default(15).description("早安时段最晚时间 (小时)"),
    multiGetUpEnable: Schema.boolean().default(false).description("多次起床功能开关"),
    multiGetUpInterval: Schema.number().default(6).description("多次起床间隔 (小时)"),
    superGetUpEnable: Schema.boolean().default(false).description("超级起床功能开关"),
    superGetUpInterval: Schema.number().default(1).description("超级起床间隔 (小时)"),
    nightEnable: Schema.boolean().default(true).description("晚安时段功能开关"),
    nightStartHour: Schema.number().default(18).description("晚安时段最早时间 (小时)"),
    nightEndHour: Schema.number().default(6).description("晚安时段最晚时间 (小时)"),
    goodSleepEnable: Schema.boolean().default(true).description("好梦功能开关"),
    goodSleepInterval: Schema.number().default(6).description("好梦间隔 (小时)"),
    deepSleepEnable: Schema.boolean().default(false).description("深度睡眠功能开关"),
    deepSleepInterval: Schema.number().default(3).description("深度睡眠间隔 (小时)"),
    MORNING_MESSAGES: Schema.array(Schema.string())
        .default(["早安", "早哇", "起床", "早上好", "ohayo", "哦哈哟", "お早う", "good morning"])
        .description("触发早安的关键词"),
    NIGHT_MESSAGES: Schema.array(Schema.string())
        .default(["晚安", "睡觉", "睡了", "晚安哇", "good night", "おやすみ", "お休みなさい"])
        .description("触发晚安的关键词"),
    morningPrompts: Schema.array(Schema.string())
        .default([
            "元气满满的一天开始啦！ (/▽＼)",
            "迎接美好的一天吧！ (￣▽￣)~*",
            "今天也要干劲满满哦~ (๑•̀ㅂ•́)و✧",
            "今天也要加油哦！ (ง •_•)ง",
            "早安～今天是充满希望的一天呢！ (ﾟ∀ﾟ)/",
            "阳光这么好，心情也要像阳光一样灿烂哦~ (´▽`)",
            "新的一天，新的开始！ ᕙ(⇀‸↼‰)ᕗ",
            "早起的鸟儿有虫吃，早起的你有好运哦~ (◕‿◕)♡",
            "起床啦起床啦～美好的一天在等着你呢！ (≧∇≦)/",
            "Morning sunshine~ 愿你的一天像阳光一样温暖！ (´∀`*)ゞ",
            "今天的你一定会很棒的！加油加油~ ᕦ(ò_óˇ)ᕤ",
            "早安安~ 记得要好好吃早餐哦！ (｡◕‿◕｡)",
            "新的一天开始了！今天要做什么有趣的事呢～ (☆▽☆)",
            "おはよう！今日も一日よろしくお願いします~ (｡･ω･｡)ﾉ♡",
            "早安呀~ 今天的空气都特别清新呢！ (^◡^)っ",
            "一日之计在于晨，今天也要元气满满哦！ ヾ(≧▽≦*)o"
        ])
        .description("早安提示语"),
    nightPrompts: Schema.array(Schema.string())
        .default([
            "很累了罢~(。-ω-)zzz",
            "祝你有个好梦～(￣o￣) . z Z",
            "晚安(∪｡∪)｡｡｡zzz",
            "おやすみなさい～(´-ω-)`~*",
            "睡个好觉哦 (˘ω˘)ｽﾞﾔｧ…",
            "今天辛苦啦～好好休息，明天继续加油！ (´∀`)ノ~",
            "夜深了，该让身心都放松下来了呢~ (｡･ω･｡)ﾉ♡",
            "愿你在梦里遇见最美好的事情～ (´-ω-`)zzz",
            "Good night~ 让疲惫随着夜风飘走吧！ (´-ω-`)zzz",
            "月亮都困了，你也该睡觉觉啦~ (´-ω-`)zzz",
            "晚安安～希望你做个甜甜的梦！ (´-ω-`)zzz",
            "一天的忙碌结束了，现在是属于你的休息时间~ (´-ω-`)zzz",
            "Sleep tight～ 愿星星为你点亮美梦！ (´-ω-`)zzz",
            "慢慢闭上眼睛，让今天的美好伴你入眠~ (˘▾˘)~",
            "夜安~ 记得盖好小被子哦！ (｡◕‿◕｡)ﾉ",
            "今天也很棒呢！现在就安心地休息吧~ ♪(´▽`)",
            "お疲れ様～今夜もゆっくり休んでね！ (´-ω-`)zzz",
            "放下手机，放下烦恼，好好睡一觉吧~ (◡ ω ◡)",
            "晚安，愿你的梦境比现实更美丽~ (´-ω-`)zzz"
        ])
        .description("晚安提示语")
});

export async function apply(ctx: Context, config: Config) {
    applyModel(ctx);
    applycron(ctx, config);
    ctx.on("message", async (session) => {
        if (!session || !session.content) {
            return;
        }
        if (session.guildId) {
            const targetChannels = await ctx.database.get("channel", {
                id: session.guildId,
                platform: session.platform
            });
            if (targetChannels.length === 0) {
                return;
            }
            if (targetChannels[0].assignee !== session.selfId) {
                return;
            }
        }
        if (config.MORNING_MESSAGES.some((msg) => session.content?.startsWith(msg)) || session.content === "早") {
            void session.execute("morning");
        } else if (config.NIGHT_MESSAGES.some((msg) => session.content?.startsWith(msg)) || session.content === "晚") {
            void session.execute("night");
        }
    });

    ctx.command("morning", "早安消息打卡").action(async ({ session }) => {
        if (!session || !session.content) {
            return;
        }
        if (session.guildId && session.userId) {
            return h.quote(session.messageId) + (await get_morning(ctx, config, session.userId, session.guildId));
        } else {
            // TODO: 添加私聊的处理逻辑
            return "私聊早晚安还在开发中，去群里试试吧～";
        }
    });

    ctx.command("night", "晚安消息打卡").action(async ({ session }) => {
        if (!session || !session.content) {
            return;
        }
        if (session.guildId && session.userId) {
            return h.quote(session.messageId) + (await get_night(ctx, config, session.userId, session.guildId));
        } else {
            return "私聊早晚安还在开发中，去群里试试吧～";
        }
    });

    ctx.command("早晚安统计", "查看早晚安统计信息").action(async ({ session }) => {
        if (!session) {
            throw new Error("无法获取会话信息");
        }
        if (session.guildId && session.userId) {
            const result = await get_all_morning_night_data(ctx, session.guildId);
            const today = moment().tz(config.timezone).format("YYYY年MM月DD日");
            return (
                h.quote(session.messageId) +
                (`✨ 今日睡眠统计 (${today}) ✨\n` +
                    `╔═══════════\n` +
                    `║ 全服统计:\n` +
                    `║  早安次数: ${result.morning_count.toString().padStart(6)}\n` +
                    `║  晚安次数: ${result.night_count.toString().padStart(6)}\n` +
                    `║  正在睡觉: ${result.sleeping_count.toString().padStart(6)}\n` +
                    `║  已经起床: ${result.getting_up_count.toString().padStart(6)}\n` +
                    `╠═══════════\n` +
                    `║ 本群统计:\n` +
                    `║  早安次数: ${result.group_morning_count.toString().padStart(6)}\n` +
                    `║  晚安次数: ${result.group_night_count.toString().padStart(6)}\n` +
                    `║  早安占比: ${(result.morning_percent * 100).toFixed(2).padStart(6)}%\n` +
                    `║  晚安占比: ${(result.night_percent * 100).toFixed(2).padStart(6)}%\n` +
                    `╚═══════════`)
            );
        } else {
            return h.quote(session.messageId) + "只能在群聊中使用早晚安统计哦～";
        }
    });

    ctx.command("我的作息", "查看个人作息统计").action(async ({ session }) => {
        if (!session || !session.userId) {
            throw new Error("无法获取用户信息");
        }

        const stats = await get_user_sleep_stats(ctx, session.userId);
        if (!stats) {
            return h.quote(session.messageId) + "还没有打卡记录呢～从现在开始吧！";
        }

        const totalSleepHours = Math.floor(stats.total_sleep_time / 3600);
        const totalSleepMinutes = Math.floor((stats.total_sleep_time % 3600) / 60);
        const weeklySleepHours = Math.floor(stats.weekly_sleep_time / 3600);
        const weeklySleepMinutes = Math.floor((stats.weekly_sleep_time % 3600) / 60);

        return (
            h.quote(session.messageId) +
            (`你的个人作息统计\n` +
                `╔═══════════\n` +
                `║ 打卡成绩:\n` +
                `║  早安次数: ${stats.total_morning_count.toString().padStart(5)}\n` +
                `║  晚安次数: ${stats.total_night_count.toString().padStart(5)}\n` +
                `║  连续打卡: ${stats.consecutive_days.toString().padStart(5)} 天\n` +
                `╠═══════════\n` +
                `║ 累计睡眠:\n` +
                `║  总时长: ${totalSleepHours.toString().padStart(3)}小时${totalSleepMinutes
                    .toString()
                    .padStart(2)}分\n` +
                `╠═══════════\n` +
                `║ 本周数据:\n` +
                `║  早安次数: ${stats.weekly_morning_count.toString().padStart(5)}\n` +
                `║  晚安次数: ${stats.weekly_night_count.toString().padStart(5)}\n` +
                `║  睡眠总时: ${weeklySleepHours.toString().padStart(3)}小时${weeklySleepMinutes
                    .toString()
                    .padStart(2)}分\n` +
                `║  最早早安: ${
                    stats.weekly_earliest_morning_time
                        ? moment(stats.weekly_earliest_morning_time).tz(config.timezone).format("HH:mm:ss")
                        : "暂无"
                }\n` +
                `║  最晚晚安: ${
                    stats.weekly_latest_night_time
                        ? moment(stats.weekly_latest_night_time).tz(config.timezone).format("HH:mm:ss")
                        : "暂无"
                }\n` +
                `╚═══════════`)
        );
    });
}
