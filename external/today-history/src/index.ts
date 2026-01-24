import {} from "@mrlingxd/koishi-plugin-renderer";
import type { Context } from "koishi";
import { h, Schema } from "koishi";
import moment from "moment-timezone";
import path from "path";

export const name = "today-history";
export const inject = ["renderer"];

export interface Config {
    timezone: string;
    cacheTime: number;
}

export const Config: Schema<Config> = Schema.object({
    timezone: Schema.string().default("Asia/Shanghai").description("设置时区，默认为 Asia/Shanghai (上海)"),
    cacheTime: Schema.number().default(3600).description("缓存时间（秒）")
});

export async function apply(ctx: Context, config: Config) {
    ctx.command("历史上的今天", "获取今天在历史上发生的事件").action(async ({ session }) => {
        if (!session) {
            throw new Error("无法获取会话信息");
        }

        try {
            const data = await getTodayHistory(config);
            if (!data || data.length === 0) {
                return "今天没有历史事件记录。";
            }
            const templateDir = path.resolve(__dirname, "templates");
            const now = moment.tz(config.timezone);
            const hour = now.hour();
            const theme = hour >= 18 || hour < 6 ? "dark" : "light";
            const currentDate = now.format("YYYY年MM月DD日");
            const img = await ctx.renderer.render_template(
                path.resolve(templateDir, "index.ejs"),
                { data, theme, currentDate },
                {
                    width: 2000,
                    height: 1200
                }
            );
            return h.image(img, "image/png");
        } catch (error) {
            ctx.logger.error("获取历史事件失败:", error);
            return "获取历史事件时发生错误，请稍后再试。";
        }
    });
}

interface TodayHistoryEvent {
    year: string;
    title: string;
    festival: string;
    link: string;
    type: "death" | "birth" | "event";
    desc: string;
    cover: boolean;
    recommend: boolean;
    pic_calender?: string;
    pic_share?: string;
    pic_index?: string;
}

let cache: {
    data: TodayHistoryEvent[] | null;
    timestamp: number;
} = {
    data: null,
    timestamp: 0
};

async function getTodayHistory(config: Config): Promise<TodayHistoryEvent[] | null> {
    const now = Date.now();
    if (cache.data && now - cache.timestamp < config.cacheTime * 1000) {
        return cache.data;
    }

    const today = moment.tz(config.timezone);
    const month = today.format("MM");
    const day = today.format("DD");
    const dateKey = month + day;

    const fetchResponse = await fetch(`https://baike.baidu.com/cms/home/eventsOnHistory/${month}.json`);
    const response = await fetchResponse.json();

    if (response && response[month] && response[month][dateKey] && Array.isArray(response[month][dateKey])) {
        const events: TodayHistoryEvent[] = response[month][dateKey].map((event: any) => ({
            ...event,
            desc: event.desc ? event.desc.replace(/<[^>]*>/g, "") : "暂无描述"
        }));

        cache.data = events;
        cache.timestamp = now;
        return events;
    }

    return null;
}
