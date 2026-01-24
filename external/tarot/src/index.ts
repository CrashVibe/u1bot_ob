import type { Context } from "koishi";
import { h, Schema } from "koishi";
import Tarot from "./services";

export const name = "tarot";

export interface Config {
    is_chain_reply: boolean;
}

export const Config: Schema<Config> = Schema.object({
    is_chain_reply: Schema.boolean().default(true).description("是否使用合并转发")
});

export async function apply(ctx: Context, config: Config) {
    ctx.command("塔罗牌", "抽取一张塔罗牌").action(async ({ session }) => {
        if (!session) {
            throw new Error("无法获取用户信息");
        }
        const tarot_manager = new Tarot(config);
        return h.quote(session.messageId) + (await tarot_manager.onetime_divine());
    });
    ctx.command("占卜", "进行一次塔罗牌占卜").action(async ({ session }) => {
        if (!session) {
            throw new Error("无法获取用户信息");
        }
        const tarot_manager = new Tarot(config);
        return await tarot_manager.divine(session);
    });
}
