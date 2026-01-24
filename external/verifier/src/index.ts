import type { Context, Session } from "koishi";
import { Schema } from "koishi";
import type { CachedRequest, Handlers, RequestHandler, SessionProcess } from "./types";
import { handleRequest } from "./handler";
import { applycron, processRequests } from "./scheduler";

export const inject = ["cache", "cron"];

const RequestHandler = Schema.union([
    Schema.const(undefined).description("无操作"),
    Schema.const(true).description("全部通过"),
    Schema.const(false).description("全部拒绝"),
    Schema.natural().description("权限等级").default(0),
    Schema.string().hidden(),
    Schema.function().hidden()
]);

export const name = "verifier";

export interface Config {
    onFriendRequest?: RequestHandler;
    onGuildMemberRequest?: RequestHandler;
    onGuildRequest?: RequestHandler;
    cacheTypes: Array<"friend" | "guild-member" | "guild">;
    cacheDuration: number;
    cronExpression: string;
    batchSize: number;
}

const cacheTypesSchema = Schema.array(
    Schema.union([
        Schema.const("friend" as const).description("好友请求"),
        Schema.const("guild-member" as const).description("入群申请"),
        Schema.const("guild" as const).description("入群邀请")
    ])
)
    .default([])
    .description("需要延迟同意的请求类型");

export const Config: Schema<Config> = Schema.intersect([
    Schema.object({
        onFriendRequest: RequestHandler.description("如何响应好友请求？"),
        onGuildMemberRequest: RequestHandler.description("如何响应入群申请？"),
        onGuildRequest: RequestHandler.description("如何响应入群邀请？"),
        cacheTypes: cacheTypesSchema
    }),
    Schema.object({
        cacheDuration: Schema.number()
            .default(30 * 24 * 60 * 60 * 1000) // 30 days
            .description("缓存时间（毫秒）"),
        cronExpression: Schema.string().default("0 */6 * * *").description("定时表达式"),
        batchSize: Schema.number().default(3).min(1).description("每次处理数量")
    })
]) as Schema<Config>;

export async function apply(ctx: Context, config: Config) {
    if (config.cacheTypes && config.cacheTypes.length > 0) {
        applycron(ctx, config);
    }

    ctx.on("friend-request", (session) => {
        handleEvent(ctx, session, config, "friend");
    });

    ctx.on("guild-request", (session) => {
        handleEvent(ctx, session, config, "guild");
    });

    ctx.on("guild-member-request", (session) => {
        handleEvent(ctx, session, config, "guild-member");
    });

    ctx.command("验证器处理", { authority: 3 }).action(async () => {
        return `已处理 ${await processRequests(ctx, config)} 条缓存请求`;
    });

    ctx.command("验证器状态").action(async ({ session }) => {
        if (!session) {
            throw new Error("无法获取会话信息");
        }
        const friendRequests: SessionProcess[] = [];
        const guildRequests: SessionProcess[] = [];
        const guildMemberRequests: SessionProcess[] = [];
        const allKeys: string[] = [];

        await ctx.cache.forEach("verifier:requests", async (value, key) => {
            allKeys.push(key);
            ctx.bots.forEach((bot) => {
                if (value.data?.selfId !== bot.selfId) return;
                const target =
                    value.type === "friend"
                        ? friendRequests
                        : value.type === "guild"
                          ? guildRequests
                          : value.type === "guild-member"
                            ? guildMemberRequests
                            : undefined;
                if (target) {
                    target.push({
                        ...value,
                        session: bot.session(value.data)
                    });
                }
            });
        });

        const formatTimestamp = (timestamp: number) => {
            const date = new Date(timestamp);
            return date.toLocaleString("zh-CN");
        };

        const formatDuration = (ms: number) => {
            const days = Math.floor(ms / (24 * 60 * 60 * 1000));
            const hours = Math.floor((ms % (24 * 60 * 60 * 1000)) / (60 * 60 * 1000));
            const minutes = Math.floor((ms % (60 * 60 * 1000)) / (60 * 1000));
            return `${days}天${hours}小时${minutes}分钟`;
        };

        const formatRequestList = async (requests: SessionProcess[], type: "friend" | "guild" | "guild-member") => {
            if (requests.length === 0) return "  无";
            const statusMap: Record<string, string> = {
                pending: "待处理",
                processing: "处理中",
                processed: "已处理"
            };
            const user = await session.observeUser(["authority"]);
            function maskId(origin?: string) {
                if (!origin || origin.length < 3) return origin || "未知";
                return `***${origin.slice(3)}`;
            }
            return requests
                .map((req, index) => {
                    const session = req.session;
                    const age = Date.now() - req.timestamp;
                    let id = "未知";
                    if (type === "friend" || type === "guild-member") {
                        id = user.authority >= 3 ? session.userId || "未知" : maskId(session.userId);
                    } else if (type === "guild") {
                        id = user.authority >= 3 ? session.guildId || "未知" : maskId(session.guildId);
                    }
                    const statusText = statusMap[req.status] || req.status;
                    let line = `  ${index + 1}. ${id} | 状态: ${statusText} | 时间: ${formatTimestamp(req.timestamp)}`;
                    if (req.status !== "processed") {
                        line += ` | 已等待: ${formatDuration(age)}`;
                    }
                    return line;
                })
                .join("\n");
        };

        const output = [
            "=== 验证器状态 ===",
            "",
            `总请求: ${allKeys.length}`,
            ...(config.onFriendRequest ? [`好友请求: ${friendRequests.length}`] : []),
            ...(config.onGuildRequest ? [`入群邀请: ${guildRequests.length}`] : []),
            ...(config.onGuildMemberRequest ? [`入群申请: ${guildMemberRequests.length}`] : []),
            ""
        ];

        if (config.onFriendRequest) output.push("【好友请求】", await formatRequestList(friendRequests, "friend"), "");
        if (config.onGuildRequest) output.push("【入群邀请】", await formatRequestList(guildRequests, "guild"), "");
        if (config.onGuildMemberRequest)
            output.push("【入群申请】", await formatRequestList(guildMemberRequests, "guild-member"), "");
        while (output.length && output[output.length - 1] === "") output.pop();
        return output.join("\n");
    });
}

export async function handleEvent(
    ctx: Context,
    session: Session,
    config: Config,
    type: "friend" | "guild" | "guild-member"
) {
    const handlers: Handlers = {
        friend: {
            handler: config.onFriendRequest,
            prefer: true,
            isChannel: false,
            method: "handleFriendRequest"
        },
        guild: {
            handler: config.onGuildRequest,
            prefer: false,
            isChannel: true,
            method: "handleGuildRequest"
        },
        "guild-member": {
            handler: config.onGuildMemberRequest,
            prefer: false,
            isChannel: false,
            method: "handleGuildMemberRequest"
        }
    };
    const { handler, prefer, isChannel, method } = handlers[type];
    if (!handler) return;
    if (config.cacheTypes && config.cacheTypes.includes(type)) {
        await cacheRequest(ctx, session, type, config.cacheDuration);
        return;
    }
    const result = await handleRequest(handler, session, prefer, isChannel);
    if (result && session.messageId) session.bot[method](session.messageId, ...result);
}

async function cacheRequest(
    ctx: Context,
    session: Session,
    type: "friend" | "guild" | "guild-member",
    maxAge?: number
) {
    const key = `${type}:${session.channelId}`;
    const existing = await ctx.cache.get("verifier:requests", key);
    if (existing && existing.status === "pending") {
        return;
    }
    const cachedData: CachedRequest = {
        type,
        timestamp: Date.now(),
        status: "pending" as const,
        data: JSON.parse(JSON.stringify(session))
    };
    await ctx.cache.set("verifier:requests", key, cachedData, maxAge);
}
