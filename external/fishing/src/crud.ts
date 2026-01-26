import type { FishingRecordModel } from "./model";
import type { Context } from "koishi";
import {} from "koishi-plugin-redis";
import moment from "moment";

import { FishQuality, type Fish } from "./types";

export const REDIS_KEY_PREFIX = "fishing:";
const MOMENT_FORMAT = "YYYYMMDD";

/**
 * 更新群排行榜
 */
export async function updateRankings(
  ctx: Context,
  guildId: string,
  userId: string,
  fish: Fish,
  userRecord: FishingRecordModel
): Promise<void> {
  const { consecutive_bad_count } = userRecord;

  await ctx.redis.client.ZINCRBY(
    REDIS_KEY_PREFIX + `rank:${guildId}:count:${moment().format(MOMENT_FORMAT)}`,
    1,
    userId
  );
  await ctx.redis.client.EXPIRE(
    REDIS_KEY_PREFIX + `rank:${guildId}:count:${moment().format(MOMENT_FORMAT)}`,
    86400 * 7 // 7天
  );

  // 判断这钓鱼佬是不是搞到好东西了
  if (fish.quality === FishQuality.hidden_fire || fish.quality === FishQuality.void) {
    await ctx.redis.client.ZINCRBY(
      REDIS_KEY_PREFIX + `rank:${guildId}:lucky:${moment().format(MOMENT_FORMAT)}`,
      1,
      userId
    );
    await ctx.redis.client.EXPIRE(
      REDIS_KEY_PREFIX + `rank:${guildId}:lucky:${moment().format(MOMENT_FORMAT)}`,
      86400 * 7 // 7天
    );
  }

  // 哈哈，没钓到好东西
  if (fish.quality === FishQuality.rotten || fish.quality === FishQuality.moldy) {
    await ctx.redis.client.ZINCRBY(
      REDIS_KEY_PREFIX + `rank:${guildId}:unlucky:${moment().format(MOMENT_FORMAT)}`,
      1,
      userId
    );
    await ctx.redis.client.EXPIRE(
      REDIS_KEY_PREFIX + `rank:${guildId}:unlucky:${moment().format(MOMENT_FORMAT)}`,
      86400 * 7 // 7天
    );
  }

  // 连续倒霉榜
  if (consecutive_bad_count !== 0) {
    await ctx.redis.client.ZADD(
      REDIS_KEY_PREFIX + `rank:${guildId}:streak:${moment().format(MOMENT_FORMAT)}`,
      [{ score: consecutive_bad_count, value: userId }],
      { comparison: "GT" } // 只有更高分才更新
    );
    await ctx.redis.client.EXPIRE(
      REDIS_KEY_PREFIX + `rank:${guildId}:streak:${moment().format(MOMENT_FORMAT)}`,
      86400 * 7 // 7天
    );
  }

  // 今日经验榜
  await ctx.redis.client.ZINCRBY(REDIS_KEY_PREFIX + `rank:${guildId}:exp:${moment().format(MOMENT_FORMAT)}`, 1, userId);
  await ctx.redis.client.EXPIRE(
    REDIS_KEY_PREFIX + `rank:${guildId}:exp:${moment().format(MOMENT_FORMAT)}`,
    86400 * 7 // 7天
  );
}

/** 获取对应类型排行榜 */
export async function getTop(
  ctx: Context,
  guildId: string,
  type: "count" | "lucky" | "unlucky" | "streak" | "exp",
  date: string = moment().format(MOMENT_FORMAT),
  top = 10
) {
  return await ctx.redis.client.ZRANGE_WITHSCORES(REDIS_KEY_PREFIX + `rank:${guildId}:${type}:${date}`, 0, top - 1, {
    REV: true
  });
}
