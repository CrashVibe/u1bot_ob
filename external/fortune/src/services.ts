import { createHash } from "crypto";

import type Fortune from ".";
import type { Context } from "koishi";
import moment from "moment-timezone";

import fortuneData from "./fortune_data.json";

export interface FortuneInfo {
  运势: string;
  星级: string;
  签文: string;
  解签: string;
}

// 将 fortuneData 类型断言为支持字符串索引的类型
const fortuneDataMap = fortuneData as Record<string, FortuneInfo>;

/**
 * 从数据库中获取指定用户的幸运星值。
 *
 * @param ctx - 包含数据库实例的上下文对象。
 * @param user - 需要获取星数的用户标识符。
 * @returns 解析为用户的星数值（number），如果未找到则为 null。
 */
export async function get_user_luck_star(ctx: Context, user: string): Promise<number | null> {
  const results = await ctx.database.get("fortune", { user });
  const result = results[0];
  if (result) {
    return fortuneDataMap[result.luckid].星级.split("★").length - 1;
  }
  return null;
}

/**
 * 获取用户完整的运势信息。
 *
 * @param ctx - 包含数据库实例的上下文对象。
 * @param user - 需要获取运势信息的用户标识符。
 * @returns 包含用户运势信息的对象 object，如果未找到则为 null。
 */
export async function get_user_fortune(ctx: Context, config: Fortune.Config, user: string): Promise<FortuneInfo> {
  const results = await ctx.database.get("fortune", { user });
  if (results.length == 0) {
    // 创建
    const randomFortune = random_fortune();
    await ctx.database.create("fortune", {
      user,
      luckid: randomFortune.id,
      date: new Date()
    });
    return randomFortune.fortune;
  }
  if (results.length > 1) {
    console.warn(`用户 ${user} 有多条运势记录，可能是数据异常，请检查数据库。`);
  }
  const recordDate = moment(results[0].date).tz(config.timezone);
  const today = moment().tz(config.timezone);

  if (recordDate.format("YYYY-MM-DD") !== today.format("YYYY-MM-DD")) {
    // 日期不同，随机获取一条运势
    const randomFortune = random_fortune();
    await ctx.database.set(
      "fortune",
      { user },
      {
        luckid: randomFortune.id,
        date: new Date()
      }
    );
    return randomFortune.fortune;
  }
  const result = results[0];
  return fortuneDataMap[result.luckid];
}

/**
 * 随机获取运势信息
 *
 * @param ctx - 包含数据库实例的上下文对象。
 * @returns 包含随机运势信息的对象 object，以及 ID
 */
function random_fortune(): {
  id: string;
  fortune: FortuneInfo;
} {
  const keys = Object.keys(fortuneDataMap);
  const randomKey = keys[Math.floor(Math.random() * keys.length)];
  const fortune = fortuneDataMap[randomKey];
  return { id: randomKey, fortune };
}

/**
 * 获取用户运势的显示信息
 *
 * 如果今天已经获取过运势，则返回之前的运势信息。如果今天还未获取过运势，则随机获取一条运势信息并保存到数据库中。
 *
 * @param ctx - 包含数据库实例的上下文对象。
 * @param user - 需要获取运势信息的用户标识符。
 * @returns 字符串完整的 display 信息
 */
export async function get_user_fortune_display(
  ctx: Context,
  config: Fortune.Config,
  user: string
): Promise<string | null> {
  const today = moment().tz(config.timezone);

  if (
    config.specialUserHash &&
    typeof config.specialMonth === "number" &&
    typeof config.specialDay === "number" &&
    today.month() === config.specialMonth - 1 &&
    today.date() === config.specialDay
  ) {
    const userHash = createHash("sha256").update(user).digest("hex");

    if (userHash === config.specialUserHash) {
      return `📜 今日签文 | 特供版 📜

运势：Plus Pro Pro Max Ultra Extreme Prime Elite Ultimate Supreme
星级：★★★★★★★★★★★★

「签文」
你今天是唯一的主角，
运势极佳，诸事顺遂。
不会被任何傻逼打扰，所求皆如愿。
心想事成，万事大吉。

「解签」
今天运气特别好，做什么都很顺利。适合做自己喜欢的事，想干嘛就干嘛。遇到困难也会有人帮忙，总之就是个各方面都很不错的日子。好好享受今天，放松一下，让自己开心才是最重要的。

——————
https://b23.tv/jUfN6Vk`;
    }
  }

  const fortune = await get_user_fortune(ctx, config, user);
  if (!fortune) {
    return null;
  }

  return `📜 今日签文 📜

运势：${fortune.运势}
星级：${fortune.星级}

「签文」
${fortune.签文}

「解签」
${fortune.解签}`;
}
