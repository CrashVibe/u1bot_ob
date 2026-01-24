import {} from "@koishijs/plugin-adapter-qq";
import {} from "@u1bot/koishi-plugin-coin";
import type { Context } from "koishi";
import { h, Random, Schema } from "koishi";
import moment from "moment-timezone";
import { applyModel } from "./model";
import { add_cave } from "./service";
export const name = "cave";

export const inject = ["database", "coin"];
export interface Config {
    managers: Array<string>;
}

export const Config: Schema<Config> = Schema.object({
    managers: Schema.array(Schema.string()).description("管理者列表").required().default([])
});

export async function apply(ctx: Context, config: Config) {
    applyModel(ctx);
    ctx.command("add_cave <content:text>", "添加内容到回声洞")
        .alias("投稿")
        .alias("回声洞投稿")
        .action(async ({ session }, content) => {
            if (!content || !session) {
                return "你输入了什么？一个......空气？\n请在投稿内容前加上“投稿”或“匿名投稿”";
            }
            if (session.qq) {
                return "此功能暂不支持该平台";
            }
            if (session.guildId) {
                return "还是请来私聊我投稿罢~";
            }
            return await add_cave(ctx, session, config, content, false);
        });

    ctx.command("add_anonymous_cave <content:text>", "匿名添加内容到回声洞")
        .alias("匿名投稿")
        .alias("匿名回声洞投稿")
        .action(async ({ session }, content) => {
            if (!content || !session) {
                return "你输入了什么？一个......空气？\n请在投稿内容前加上“投稿”或“匿名投稿”";
            }
            if (session.qq) {
                return "此功能暂不支持该平台";
            }
            if (session.guildId) {
                return "还是请来私聊我投稿罢~";
            }
            return await add_cave(ctx, session, config, content, true);
        });

    ctx.command("cave [id:number]", "随机查看一个回声洞秘密")
        .alias("回声洞")
        .action(async (_, id) => {
            const idList = await ctx.database.get("cave", {}, ["id"]);
            if (!idList.length) {
                return "洞穴里还没有秘密";
            }
            const targetId: number = id ? Number(id) : Random.pick(idList).id;
            const item = (await ctx.database.get("cave", { id: targetId }))[0];
            if (!item) {
                return "没有找到对应的洞穴秘密";
            }
            let message = `[回声洞 #${item.id}]\n${item.content}\n————————————\n`;
            message += item.anonymous ? "投稿人：不愿透露姓名的TA\n" : `投稿人：${item.user_id}\n`;
            message += `时间：${new Date(item.createdAt).toLocaleString()}\n`;
            message += "\n私聊机器人可以投稿：\n投稿 [内容] | 匿名投稿 [内容]";

            return message;
        });

    ctx.command("remove_cave <id> [...reason]", "删除指定的洞穴秘密")
        .alias("删除回声洞")
        .alias("删除")
        .action(async ({ session }, id, ...reason) => {
            if (!session || !session.userId) {
                throw new Error("会话信息缺失");
            }
            const reason_str = reason.join(" ");
            if (session.qq) {
                return "此功能暂不支持该平台";
            }
            const cave_query = await ctx.database.get("cave", id);
            if (!cave_query[0]) {
                return "没有找到对应的回声洞内容诶~";
            }
            const cave = cave_query[0];
            const isManager = config.managers.includes(session.userId);
            const isAuthor = session.userId === cave.user_id;
            if (!isManager && !isAuthor) {
                return "你没有权限删除这个回声洞内容~";
            }
            await ctx.database.remove("cave", id);
            if (isManager && !isAuthor) {
                const deleteReason = reason_str || "管理员删除";
                await session.bot.sendPrivateMessage(
                    cave.user_id,
                    `你的回声洞投稿（编号 ${cave.id}）已被管理员删除。\n内容：${cave.content}\n————————————\n原因：${deleteReason}`
                );
                return `[删除成功] 编号 ${cave.id} 的投稿已删除\n${cave.content}\n————————————\n已通知作者。`;
            }
            return `[删除成功] 编号 ${cave.id} 的投稿已删除\n${cave.content}`;
        });

    ctx.command("cave_history", "回声洞投稿历史")
        .alias("回声洞记录")
        .action(async ({ session }) => {
            if (!session || !session.userId) {
                throw new Error("会话信息缺失");
            }
            if (session.qq) {
                return "此功能暂不支持该平台";
            }
            const list = await ctx.database.get("cave", {
                user_id: session.userId
            });
            if (!list.length) {
                return "你还没有投稿过回声洞哦~";
            }
            list.sort((a, b) => b.id - a.id);
            const msgList: h[][] = [];
            for (const item of list) {
                msgList.push([
                    h.text(`[编号 #${item.id}]\n`),
                    ...h.parse(item.content),
                    h.text(`\n————————————\n时间：${moment(item.createdAt).format("YYYY-MM-DD HH:mm:ss")}`)
                ]);
            }

            if (session.qq) {
                return msgList.join("\n\n");
            }

            const message = h(
                "message",
                { forward: true },
                ...msgList.map((element) =>
                    h(
                        "message",
                        h("author", {
                            id: session.bot.selfId,
                            name: session.bot.user?.name || "回声洞助手"
                        }),
                        ...element
                    )
                )
            );

            await session.send(message);
        });
}
