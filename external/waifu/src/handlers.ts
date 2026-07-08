import type { Config } from ".";
import {} from "@u1bot/koishi-plugin-coin";
import type { Context, Element, Session } from "koishi";
import { h, Random } from "koishi";

import {
  get_active_relationships_for_user,
  get_owner_relationships,
  get_relationship_between,
  get_relationships_involving
} from "./repository";
import { getAtUsers, getAvailableGroupMembers } from "./utils";

/**
 * 给用户分配一个新的对象
 *
 * 一对多关系：同一时间可以持有多个对象，超出免费次数后需要支付聘礼
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
  if (rate > config.successRate) {
    await ctx.database.create("waifu_relationships", {
      group_id: session.guildId,
      owner_id: session.userId,
      waifu_id: null,
      married_at: new Date()
    });
    return "* " + Random.pick(config.noWaifuMessages);
  }

  // 当前已持有的对象，用于排除重复迎娶
  const owner_relationships = await get_owner_relationships(ctx, session.guildId, session.userId);
  const existing_target_ids = new Set(owner_relationships.map((row) => row.waifu_id));

  /** 构建最终消息用 */
  const msg: Element[] = [];
  let target_id: string | null = null;

  // 看看有没有喜欢的
  const at_users = getAtUsers(session);
  if (at_users.length > 1) {
    return "不要那么渣！一次只能一个对象啊喂";
  } else if (at_users.length === 1) {
    const target = at_users[0];
    if (!target) return "未找到目标用户";
    if (target === session.userId) {
      return "自己跟自己...这也太自恋了吧";
    }
    if (existing_target_ids.has(target)) {
      return "你已经娶过这个人了，不许重复迎娶啦～";
    }
    // 计算成功率
    const rate = Math.random() * 100;
    if (rate < config.atSuccessRate) {
      target_id = target;
    } else {
      msg.push(h.text("看来你的运气不太好，没能成功娶到心上人"));
      msg.push(h.text("不过...我给你找了新的 CP ！"));
    }
  }

  if (!target_id) {
    // 能到这里，要么没at，要么没有娶到心上人～
    const candidates = await getAvailableGroupMembers(session);
    /** 最终候选人名单：排除自己和已经娶过的人 */
    const filtered_candidates = candidates.filter((id) => id !== session.userId && !existing_target_ids.has(id));
    if (filtered_candidates.length === 0) {
      return "看起来你已经娶遍全群了...也挺好的～";
    }

    target_id = Random.pick(filtered_candidates);
  }

  // 超出免费次数后，娶亲需要花次元币，指数增长
  const owned_count = owner_relationships.length;
  const cost =
    owned_count < config.marryFreeCount ? 0 : config.marryFineBase * 2 ** (owned_count - config.marryFreeCount);
  if (cost > 0) {
    const isSuccess = await ctx.coin.adjustCoin(session.userId, -cost, `迎娶第 ${owned_count + 1} 个对象的聘礼`);
    if (!isSuccess) {
      return `你看上了新的对象，但这次需要 ${cost} 枚次元币的聘礼，你的钱包不够，只能忍痛放弃...`;
    }
  }

  const member = await session.bot.getGuildMember(session.guildId, target_id);
  msg.push(h.text("你的 CP 是！"));
  if (member.avatar) {
    msg.push(h.image(member.avatar));
  }
  msg.push(h.text(`『${member.nick || member.user?.name}』!`));
  msg.push(h.text(Random.pick(config.happyEndMessages)));
  if (cost > 0) {
    msg.push(h.text(`（这次花费了 ${cost} 枚次元币的聘礼）`));
  }

  await ctx.database.create("waifu_relationships", {
    group_id: session.guildId,
    owner_id: session.userId,
    waifu_id: target_id,
    married_at: new Date()
  });

  return msg.join("\n");
}

/**
 * 离婚
 *
 * @param target_id 指定要离婚的对象。不传时要求用户当前只有一段在婚关系
 */
export async function divorce_waifu(ctx: Context, session: Session, config: Config, target_id?: string) {
  if (!session.guildId) {
    throw new Error("此函数在非群聊环境下被调用");
  }
  if (!session.userId) {
    throw new Error("会话对象缺少 userId");
  }

  let relationship;
  if (target_id) {
    relationship = await get_relationship_between(ctx, session.guildId, session.userId, target_id);
    if (!relationship) {
      return "你和对方之间目前没有这段关系哦";
    }
  } else {
    const relationships = await get_active_relationships_for_user(ctx, session.guildId, session.userId);
    if (relationships.length === 0) {
      return "你今天是单身狗，离什么婚？";
    }
    if (relationships.length > 1) {
      return "你现在有多个对象，请 @ 指定要和谁离婚哦～";
    }
    relationship = relationships[0]!;
  }

  const cooldownPassed = Date.now() - relationship.married_at.getTime() >= config.divorceCooldown * 1000;
  let marriedCount = 0;
  let cost = 0;
  let isSuccess = true;

  if (!cooldownPassed) {
    marriedCount = (await get_relationships_involving(ctx, session.guildId, session.userId)).length;
    cost = config.divorceFine * 2 ** marriedCount;
    isSuccess = await ctx.coin.adjustCoin(session.userId, -cost, `第 ${marriedCount} 次离婚罚款`); // 罚款，罚死你，渣男/女
    if (!isSuccess) {
      return `离婚冷静期还没过呢...本次需要 ${cost} 次元币才能离婚，你的钱包不够你离啦`;
    } // 琼 B 还想离婚？！
  }

  await ctx.database.set("waifu_relationships", { id: relationship.id }, { is_married: false });

  if (!cooldownPassed) {
    const coinLeft = await ctx.coin.getCoin(session.userId);
    return `离婚冷静期还没过呢...不过你花费了 ${cost} 次元币（今日第 ${marriedCount} 次离婚）\n剩余 ${coinLeft} 次元币`;
  }

  return Random.pick(config.divorceMessages);
}
