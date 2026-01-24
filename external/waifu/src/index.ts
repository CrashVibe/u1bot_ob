import type { Context } from "koishi";
import { h } from "koishi";
import { Config } from "./config";
import { divorce_waifu, handle_existing_cp, select_waifu } from "./handlers";
import { applyModel } from "./models";
import { get_user_relationship } from "./repository";
import { applyCron } from "./scheduler";
import { isAtBot } from "./utils";

export const name = "waifu";
export const inject = ["database", "cron", "coin"];
export { Config };

export async function apply(ctx: Context, config: Config) {
    applyModel(ctx);
    applyCron(ctx);

    ctx.command("waifu", "娶一个群友做你的老婆")
        .alias("娶群友")
        .action(async ({ session }) => {
            if (!session) throw new Error("会话对象不存在");
            if (!session.userId) {
                throw new Error("会话对象缺少 userId");
            }
            if (!session.guildId) {
                return h.quote(session.messageId) + "娶群友...当然只能在群里进行啦";
            }
            if (isAtBot(session)) {
                return "不可以啦..."; // 不用 quote 增加真实感
            }
            const relationship = await get_user_relationship(ctx, session.guildId, session.userId);
            if (relationship) {
                // 是不是已经有对象了（真渣，还想要脚踏 800 条船）
                return (
                    h.quote(session.messageId) +
                    (await handle_existing_cp(
                        session,
                        relationship.owner_id === session.userId ? relationship.waifu_id : relationship.owner_id,
                        config
                    ))
                );
            }

            // 给用户分配一个新的对象，返回结果
            return h.quote(session.messageId) + (await select_waifu(ctx, session, config));
        });

    // 离婚
    ctx.command("divorce", "和你的老婆离婚")
        .alias("离婚")
        .action(async ({ session }) => {
            if (!session) throw new Error("会话对象不存在");
            if (!session.guildId) {
                return h.quote(session.messageId) + "离婚...当然只能在群里进行啦";
            }
            const relationship = await get_user_relationship(ctx, session.guildId, session.userId!);
            if (!relationship) {
                return h.quote(session.messageId) + "你还没结婚...离什么婚？";
            }
            if (relationship.waifu_id === null) {
                return h.quote(session.messageId) + "你今天是单身狗，离什么婚？";
            }
            return h.quote(session.messageId) + (await divorce_waifu(ctx, session, config));
        });
}
