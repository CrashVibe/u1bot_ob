import {} from "@u1bot/koishi-plugin-coin";
import type { Context, Element, Session } from "koishi";
import { $, h, Random } from "koishi";
import type { Config } from ".";
import { get_user_relationship } from "./repository";
import { getAvailableGroupMembers } from "./utils";

/** 处理已有对象的情况 */
export async function handle_existing_cp(session: Session, existing_cp_id: string | null, config: Config) {
    if (!session.guildId) {
        throw new Error("此函数在非群聊环境下被调用");
    }
    if (!existing_cp_id) {
        return "* " + Random.pick(config.noWaifuMessages);
    }
    const msg: Element[] = [h.text("你已经有 CP 了，不许花心哦～")];
    const member = await session.bot.getGuildMember(session.guildId, existing_cp_id);
    if (member.user?.avatar) {
        msg.push(h.image(member.user.avatar));
    }
    msg.push(h.text(`你的 CP ：${member.nick || member.user?.name} `));
    return msg.join("\n");
}

/**
 * 给用户分配一个新的对象
 *
 * 注意：使用前提是用户当前没有对象
 */
export async function select_waifu(ctx: Context, session: Session, config: Config) {
    if (!session.guildId) {
        throw new Error("此函数在非群聊环境下被调用");
    }
    if (!session.userId) {
        throw new Error("会话对象缺少 userId");
    }
    // 计算成功率
    const rate = Math.random() * 100;
    if (rate >= config.successRate) {
        await ctx.database.create("waifu_relationships", {
            group_id: session.guildId!,
            owner_id: session.userId!,
            waifu_id: null,
            married_at: new Date()
        });
        return "* " + Random.pick(config.noWaifuMessages);
    }

    // 结过婚/已经有结果（命运的结果）的
    const married_user_ids = await ctx.database
        .get("waifu_relationships", {}, ["owner_id", "waifu_id", "is_married"])
        .then((rows) => {
            const ids = new Set<string>();
            for (const row of rows) {
                if (!row.is_married) continue;
                // 不排除单身狗，不能给单身狗机会哈哈
                // 命运啊～
                ids.add(row.owner_id);
                if (row.waifu_id) {
                    ids.add(row.waifu_id);
                }
            }
            return ids;
        });

    /** 构建最终消息用 */
    let msg: Element[] = [];

    // 看看有没有喜欢的
    const at_users = session.elements?.filter((el) => el.type === "at").map((el) => el.attrs.id as string) || [];
    if (at_users.length > 1) {
        return "不要那么渣！一次只能一个对象啊喂";
    } else if (at_users.length === 1) {
        const target_id = at_users[0];
        if (target_id === session.userId) {
            return "自己跟自己...这也太自恋了吧";
        }
        if (married_user_ids.has(target_id)) {
            return "可惜，这个人已经有 CP 了哦～";
        }
        // 计算成功率
        const rate = Math.random() * 100;
        if (rate <= config.atSuccessRate) {
            return target_id;
        }
        msg.push(h.text("看来你的运气不太好，没能成功娶到心上人"));
        msg.push(h.text("不过...我给你找了新的 CP ！"));
    }

    // 能到这里，要么没at，要么没有娶到心上人～
    const candidates = await getAvailableGroupMembers(session);
    /** 最终候选人名单 */
    const filtered_candidates = candidates.filter((id) => id !== session.userId && !married_user_ids.has(id));
    if (filtered_candidates.length === 0) {
        return "看起来大家都已经有对象了...其实一个人也挺好的～";
    }

    const waifu_id = Random.pick(filtered_candidates);
    const member = await session.bot.getGuildMember(session.guildId, waifu_id);
    msg.push(h.text("你的 CP 是！"));
    if (member.avatar) {
        msg.push(h.image(member.avatar));
    }
    msg.push(h.text(`『${member.name}』!`));
    msg.push(h.text(Random.pick(config.happyEndMessages)));

    await ctx.database.create("waifu_relationships", {
        group_id: session.guildId,
        owner_id: session.userId,
        waifu_id: waifu_id,
        married_at: new Date()
    });

    return msg.join("\n");
}

/**
 * 离婚咯
 *
 * 注意：使用前提是用户当前有对象
 */
export async function divorce_waifu(ctx: Context, session: Session, config: Config) {
    if (!session.guildId) {
        throw new Error("此函数在非群聊环境下被调用");
    }
    if (!session.userId) {
        throw new Error("会话对象缺少 userId");
    }
    const relationship = await get_user_relationship(ctx, session.guildId, session.userId);
    if (!relationship) {
        throw new Error("用户当前没有对象，无法离婚");
    }
    if (relationship.waifu_id === null) {
        throw new Error("用户当前是单身狗，无法离婚");
    }

    const cooldownPassed = Date.now() - relationship.married_at.getTime() >= config.divorceCooldown * 1000;
    let marriedCount = 0;
    let cost = 0;
    let isSuccess = true;

    if (!cooldownPassed) {
        marriedCount = await ctx.database.eval("waifu_relationships", (row) => $.count(row.id), {
            $and: [
                {
                    $or: [{ owner_id: session.userId }, { waifu_id: session.userId }]
                },
                { group_id: session.guildId }
            ]
        });
        cost = config.divorceFine * 2 ** marriedCount;
        isSuccess = await ctx.coin.adjustCoin(session.userId, -cost, `第 ${marriedCount} 次离婚罚款`); // 罚款，罚死你，渣男/女
        if (!isSuccess) {
            return `离婚冷静期还没过呢...本次需要 ${cost} 次元币才能离婚，你的钱包不够你离啦`;
        } // 琼 B 还想离婚？！
    }

    await ctx.database.set(
        "waifu_relationships",
        {
            $and: [
                {
                    $or: [{ owner_id: session.userId }, { waifu_id: session.userId }]
                },
                { group_id: session.guildId }
            ]
        },
        {
            is_married: false
        }
    );

    if (!cooldownPassed) {
        const coinLeft = await ctx.coin.getCoin(session.userId);
        return `离婚冷静期还没过呢...不过你花费了 ${cost} 次元币（今日第 ${marriedCount} 次离婚）\n剩余 ${coinLeft} 次元币`;
    }

    return Random.pick(config.divorceMessages);
}
