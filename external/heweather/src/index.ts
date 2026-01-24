import {} from "@mrlingxd/koishi-plugin-renderer";
import console from "console";
import { readFile } from "fs/promises";
import type { Context } from "koishi";
import { h, Schema } from "koishi";
import moment from "moment";
import * as path from "path";
import { type AirQualityResponse, HourlyType } from "./model";
import { CityNotFoundError, Weather } from "./services";
import { add_date, add_hour_data, convert_color_to_hex } from "./utils";

export const name = "heweather";
export const inject = ["renderer", "database"];

export interface Config {
    timezone: string;
    qweather_apihost: string;
    qweather_apitype: 0 | 1 | 2;
    qweather_hourlytype: HourlyType;
    qweather_forecast_days: number;
    qweather_use_jwt?: boolean;
    qweather_jwt_sub?: string;
    qweather_apikey?: string;
    qweather_jwt_private_key?: string;
    qweather_jwt_kid?: string;
}

export const Config: Schema<Config> = Schema.object({
    timezone: Schema.string().default("Asia/Shanghai").description("时区"),
    qweather_apihost: Schema.string().description("API Host").default("https://api.qweather.com"),
    qweather_apitype: Schema.union([
        Schema.const(0).description("免费订阅 (3-7 天天气预报)"),
        Schema.const(1).description("标准订阅 (3-30 天天气预报)"),
        Schema.const(2).description("高级订阅 (3-30 天天气预报)")
    ])
        .description("API 类型")
        .default(0),
    qweather_hourlytype: Schema.union([
        Schema.const(HourlyType.current_12h).description("当前12小时"),
        Schema.const(HourlyType.current_24h).description("当前24小时")
    ])
        .description("小时天气类型")
        .default(HourlyType.current_12h),
    qweather_forecast_days: Schema.number().min(3).max(30).description("预报天数").default(3),

    qweather_use_jwt: Schema.boolean().description("是否使用 JWT (官方推荐，仅标准和高级订阅可用)").default(true),

    qweather_apikey: Schema.string().description("API Key (非JWT模式使用)").role("secret"),
    qweather_jwt_sub: Schema.string().description("控制台中的项目管理的项目ID (仅JWT模式)"),
    qweather_jwt_kid: Schema.string().description("控制台上传公钥后获取，凭据 ID (仅JWT模式)"),
    qweather_jwt_private_key: Schema.string().description("JWT 私钥文本 (仅JWT模式)").role("textarea")
});

export async function apply(ctx: Context, config: Config) {
    ctx.on("message", async (session) => {
        if (!session || !session.content) {
            return;
        }
        if (session.guildId) {
            const targetChannels = await ctx.database.get("channel", {
                id: session.guildId,
                platform: session.platform
            });
            if (!targetChannels || targetChannels.length === 0) {
                return;
            }
            if (targetChannels.length === 0) {
                return;
            }
            if (targetChannels[0] && targetChannels[0].assignee !== session.selfId) {
                return;
            }
        }

        const match = session.content.match(/^(.+?)天气\s*$|^天气(.+?)\s*$/);
        if (match) {
            const location = (match[1] || match[2] || "").trim();
            if (!location) {
                await session.send(h.quote(session.messageId) + "请输入一个有效的地点");
                return;
            }
            void session.execute(`heweather -l ${location}`);
        }
    });

    ctx.command("heweather", "查询天气信息")
        .option("location", "-l <location:string>")
        .action(async ({ session, options }) => {
            if (!session || !options) {
                throw new Error("无法获取会话信息");
            }
            const options_result = JSON.parse(JSON.stringify(options));
            const { location } = options_result;
            if (location.includes("天气")) {
                return;
            }
            if (location) {
                await session.send(h.quote(session.messageId) + `查询 ${location} 的天气信息...`);
                if (!(config.qweather_apikey || config.qweather_use_jwt)) {
                    throw new Error("请配置 API Key 或启用 JWT 模式");
                }
                const w_data: Weather = new Weather(location, config);
                try {
                    await w_data.load();
                } catch (error) {
                    if (error instanceof CityNotFoundError) {
                        await session.send(h.quote(session.messageId) + `未找到城市: ${location}`);
                        return;
                    }
                    throw error;
                }
                let airQualityData: (AirQualityResponse["indexes"][0] & { air_color: string }) | null = null;
                let airPollutantData: Record<
                    "pm10" | "pm2p5" | "co" | "no" | "no2" | "so2" | "o3" | "nmhc",
                    number
                > | null = null;
                if (w_data.air) {
                    // 找code是AQI的空气质量指数
                    const air_quality =
                        w_data.air.indexes.find((item) => item.code === "cn-mee") || w_data.air.indexes[0];
                    if (air_quality && air_quality.color) {
                        airQualityData = {
                            ...air_quality,
                            air_color: convert_color_to_hex(air_quality.color)
                        };
                    }
                    airPollutantData = w_data.air.pollutants.reduce<Record<string, number>>((dict, cur) => {
                        dict[cur.code] = cur.concentration.value;
                        return dict;
                    }, {});
                }
                const now = moment.tz(config.timezone);
                const hour = now.hour();
                const theme = hour >= 18 || hour < 6 ? "dark" : "light";
                let template = await readFile(path.resolve(__dirname, "./dist/client/index.html"), "utf-8");

                const propsData = {
                    now: w_data.now?.now,
                    days: add_date(w_data.daily?.daily || []),
                    city: w_data.cityName,
                    warning: w_data.warning,
                    airQualityData: airQualityData,
                    airPollutantData: airPollutantData,
                    hours: add_hour_data(w_data.hourly?.hourly || [], config.qweather_hourlytype, config.timezone),
                    theme: theme
                };

                const { render } = await import("./dist/server/render.js");
                const renderer = await render(propsData);

                // 将 props 序列化到 HTML 中，供客户端使用
                const serializedProps = `<script>window.__INITIAL_STATE__ = ${JSON.stringify(propsData).replace(/</g, "\\u003c")}</script>`;
                const html_str = template
                    .replace("<!--app-html-->", renderer.html ?? "")
                    .replace("<!--app-head-->", renderer.head ?? "")
                    .replace("</head>", `${serializedProps}</head>`);
                const image = await ctx.renderer.render_html(
                    html_str,
                    path.resolve(__dirname, "./dist/client"),
                    { width: 800, height: 1250 },
                    {
                        wait_time: 1000,
                        type: "png",
                        scale: 1
                    }
                );
                return [h.quote(session.messageId), h.image(image, "image/png")];
            }
        });
}
