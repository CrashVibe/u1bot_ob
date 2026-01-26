import type { Context } from "koishi";
import { $ } from "koishi";
import moment from "moment-timezone";
import type { Config } from ".";
import { get_adjusted_minutes, isTimeInMorningRange, isTimeInNightRange, updateConsecutiveDays } from "./utils";

/**
 * 获取早安消息
 * @param ctx 上下文
 * @param uid 用户ID
 * @param gid 群组ID
 **/
export async function get_morning(ctx: Context, config: Config, uid: string, gid: string) {
  const now_time = moment().tz(config.timezone);

  if (config.morningEnable) {
    // 检查早安时的限制
    const start_time = config.morningStartHour;
    const end_time = config.morningEndHour;
    if (!isTimeInMorningRange(config.timezone, now_time, start_time, end_time)) {
      if (now_time.hour() < start_time) {
        return `这么早就起床啦~ 不过现在还是 ${now_time.hour()} 点呢，要不再休息一会儿？ (´∀｀)`;
      } else {
        return `现在 ${now_time.hour()} 点了呢~ 虽然有点晚，但新的一天加油哦！ (´∀｀)`;
      }
    }
  }

  const result = await ctx.database.get("sleep_user", { user_id: uid });

  if (result.length == 0) {
    const randomIndex = Math.floor(Math.random() * config.morningPrompts.length);
    return config.morningPrompts[randomIndex];
  }

  const target_user = result[0]; // 拿第一个记录

  const last_sleep_time = moment(target_user.night_time).tz(config.timezone);

  // 检查是否隔日了
  if (last_sleep_time.isBefore(now_time, "day")) {
    const randomIndex = Math.floor(Math.random() * config.morningPrompts.length);
    return config.morningPrompts[randomIndex];
  }

  // 能不能多次起床
  if (!config.multiGetUpEnable && target_user.night_time) {
    const last_morning_time = moment(target_user.morning_time).tz(config.timezone);
    // 检查是否在间隔之内
    if (now_time.diff(last_morning_time, "hours") < config.multiGetUpInterval) {
      return `(｀へ′) ${config.multiGetUpInterval} 小时内已经早安过啦~`;
    }
  }

  // 能不能超级起床，就是只睡一点点
  if (!config.superGetUpEnable && now_time.diff(last_sleep_time, "hours") < config.superGetUpInterval) {
    return `睡这么点没关系吗？要不再睡一会吧... /_ \\`;
  }

  // 更新数据库
  const morningResult = await morning_and_update(ctx, config, uid, gid, now_time);

  const randomIndex = Math.floor(Math.random() * config.morningPrompts.length);
  let message = `你是第 ${morningResult.global_rank} 个起床哒，群里第 ${morningResult.num} 个\n睡了 ${morningResult.duration}，`;

  if (morningResult.is_broken) {
    message += `连续打卡已中断...\n${config.morningPrompts[randomIndex]}`;
  } else if (morningResult.consecutive_days > 0) {
    message += `连续打卡 ${morningResult.consecutive_days} 天！\n${config.morningPrompts[randomIndex]}`;
  } else {
    message += config.morningPrompts[randomIndex];
  }

  return message;
}

/**
 * 获取或创建群组记录
 *
 * @param ctx 上下文
 * @param gid 群组ID
 */
async function get_or_create_group(ctx: Context, gid: string) {
  const result = await ctx.database.get("sleep_group", { group_id: gid });
  if (result.length == 0) {
    return await ctx.database.create("sleep_group", {
      group_id: gid,
      morning_count: 0,
      night_count: 0
    });
  }
  return result[0];
}

/**
 * 获取或创建用户记录
 *
 * @param ctx 上下文
 * @param uid 用户ID
 */
async function get_or_create_user(ctx: Context, uid: string) {
  const result = await ctx.database.get("sleep_user", { user_id: uid });
  if (result.length == 0) {
    return await ctx.database.create("sleep_user", { user_id: uid });
  }
  return result[0];
}

/**
 * 晚安打卡返回的数据结构
 */
interface MorningResult {
  /** 今日累计打卡人数 */
  num: number;
  /** 全群睡眠排名 */
  global_rank: number;
  /** 睡眠时长（格式化字符串）
   * @example "7小时30分钟20秒"
   */
  duration: string;
  /** 连续打卡天数 */
  consecutive_days: number;
  /** 是否中断 */
  is_broken: boolean;
}

/**
 * 获取晚安消息并更新数据
 * @param ctx 上下文
 * @param config 配置对象
 * @param uid 用户ID
 * @param gid 群组ID
 * @param now_time 当前时间（moment 对象）
 */
async function morning_and_update(
  ctx: Context,
  config: Config,
  uid: string,
  gid: string,
  now_time: moment.Moment
): Promise<MorningResult> {
  const result = await ctx.database.get("sleep_user", { user_id: uid });
  if (result.length == 0) {
    throw new Error("用户记录不存在");
  }
  const target_user = result[0]; // 拿第一个记录

  if (!target_user.night_time) {
    throw new Error("用户没有晚安打卡记录");
  }

  const target_group = await get_or_create_group(ctx, gid);

  const night_time = moment(target_user.night_time).tz(config.timezone);
  const sleep_duration = now_time.diff(night_time, "seconds");
  const sleep_duration_str = moment.utc(sleep_duration * 1000).format("H小时m分钟s秒");

  // 检查最早记录
  let week_emt = target_user.weekly_earliest_morning_time;
  if (!week_emt || now_time.isBefore(moment(week_emt).tz(config.timezone))) {
    week_emt = now_time.toDate();
  }

  // 获取全群早安总人数
  const total_morning_count = await ctx.database.eval("sleep_group", (row) => {
    return $.sum(row.morning_count);
  });

  // 计算连续打卡
  const new_consecutive_days = updateConsecutiveDays(
    target_user.morning_time,
    now_time,
    target_user.consecutive_days,
    config.timezone
  );

  // 更新用户记录
  await ctx.database.set(
    "sleep_user",
    { user_id: uid },
    {
      morning_time: now_time.toDate(),
      weekly_morning_count: target_user.weekly_morning_count + 1,
      total_morning_count: target_user.total_morning_count + 1,
      weekly_sleep_time: target_user.weekly_sleep_time + sleep_duration,
      total_sleep_time: target_user.total_sleep_time + sleep_duration,
      weekly_earliest_morning_time: week_emt,
      consecutive_days: new_consecutive_days
    }
  );

  await ctx.database.set(
    "sleep_group",
    { group_id: gid },
    {
      morning_count: target_group.morning_count + 1
    }
  );

  return {
    num: target_group.morning_count + 1,
    global_rank: total_morning_count + 1,
    duration: sleep_duration_str,
    consecutive_days: new_consecutive_days,
    is_broken: target_user.consecutive_days > 0 && new_consecutive_days === 0
  };
}

interface NightResult {
  /** 今日累计打卡人数 */
  num: number;
  /** 全群睡眠排名 */
  global_rank: number;
  /** 活动时长（格式化字符串）, 空表示没有早安打卡
   * @example "7小时30分钟20秒"
   */
  duration: string | null;
}

/**  晚安打卡并更新数据
 * @param ctx 上下文
 * @param config 配置对象
 * @param uid 用户ID
 * @param gid 群组ID
 * @param now_time 当前时间（moment 对象）
 */
async function night_and_update(
  ctx: Context,
  config: Config,
  uid: string,
  gid: string,
  now_time: moment.Moment
): Promise<NightResult> {
  const target_user = await get_or_create_user(ctx, uid);
  const target_group = await get_or_create_group(ctx, gid);

  // 检查最晚记录
  let week_emt = target_user.weekly_latest_night_time;
  if (week_emt) {
    const now_adjusted_minutes = get_adjusted_minutes(config, {
      hour: now_time.hour(),
      minute: now_time.minute()
    })[0];
    const week_emt_adjusted_minutes = get_adjusted_minutes(config, {
      hour: moment(week_emt).tz(config.timezone).hour(),
      minute: moment(week_emt).tz(config.timezone).minute()
    })[0];
    if (now_adjusted_minutes < week_emt_adjusted_minutes) {
      week_emt = now_time.toDate();
    }
  } else {
    week_emt = now_time.toDate();
  }

  let day_activity_string: null | string = null;
  if (target_user.morning_time) {
    const day_activity_duration = now_time.diff(moment(target_user.morning_time).tz(config.timezone), "seconds");
    day_activity_string = moment.utc(day_activity_duration * 1000).format("H小时m分钟s秒");
  }

  // 统计全群晚安总人数
  const total_night_count = await ctx.database.eval("sleep_group", (row) => {
    return $.sum(row.night_count);
  });

  // 更新用户记录
  await ctx.database.set(
    "sleep_user",
    { user_id: uid },
    {
      night_time: now_time.toDate(),
      total_night_count: target_user.total_night_count + 1,
      weekly_night_count: target_user.weekly_night_count + 1,
      weekly_latest_night_time: week_emt
    }
  );

  await ctx.database.set(
    "sleep_group",
    { group_id: gid },
    {
      night_count: target_group.night_count + 1
    }
  );

  return {
    num: target_group.night_count + 1,
    global_rank: total_night_count + 1,
    duration: day_activity_string
  };
}

/**
 * 获取晚安消息
 * @param ctx 上下文
 * @param config 配置对象
 * @param uid 用户ID
 * @param gid 群组ID
 **/
export async function get_night(ctx: Context, config: Config, uid: string, gid: string) {
  const now_time = moment().tz(config.timezone);
  if (config.nightEnable) {
    const start_time = config.nightStartHour;
    const end_time = config.nightEndHour;
    if (!isTimeInNightRange(config.timezone, now_time, start_time, end_time)) {
      if (now_time.hour() >= end_time && now_time.hour() < start_time) {
        return `现在是 ${now_time.hour()} 点，正是美好的一天呢~ 要不要先享受这美好时光？ (◕‿◕)`;
      } else {
        return `现在 ${now_time.hour()} 点了~ 虽然时间有点特殊，但如果累了就好好休息吧！ (´ω｀)`;
      }
    }
  }

  const result = await ctx.database.get("sleep_user", { user_id: uid });
  if (!(result.length == 0)) {
    const target_user = result[0]; // 拿第一个记录
    if (
      config.goodSleepEnable &&
      target_user.night_time &&
      now_time.diff(moment(target_user.night_time).tz(config.timezone), "hours") < config.goodSleepInterval
    ) {
      return `(｀へ′)  ${now_time.diff(
        moment(target_user.night_time).tz(config.timezone),
        "hours"
      )} 小时前你已经晚安过啦~`;
    }
    if (
      !config.deepSleepEnable &&
      target_user.morning_time &&
      now_time.diff(moment(target_user.morning_time).tz(config.timezone), "hours") < config.deepSleepInterval
    ) {
      return `这是要睡回笼觉吗？要不再玩一会吧... /_ \\`;
    }
  }
  const nightResult = await night_and_update(ctx, config, uid, gid, now_time);

  const randomIndex = Math.floor(Math.random() * config.nightPrompts.length);
  if (nightResult.duration) {
    return `你是第 ${nightResult.global_rank} 个睡觉哒，群里第 ${nightResult.num} 个\n活动了 ${nightResult.duration}，${config.nightPrompts[randomIndex]}`;
  }
  return `你是第 ${nightResult.global_rank} 个睡觉哒，群里第 ${nightResult.num} 个\n${config.nightPrompts[randomIndex]}`;
}

/**
 * 全服早晚安数据统计
 */
export interface MorningNightStats {
  /** 全服早安次数 */
  morning_count: number;
  /** 全服晚安次数 */
  night_count: number;
  /** 今日睡觉人数 */
  sleeping_count: number;
  /** 今日起床人数 */
  getting_up_count: number;
  /** 本群在全服的早安占比 */
  morning_percent: number;
  /** 本群在全服的晚安占比 */
  night_percent: number;
  /** 本群早安次数 */
  group_morning_count: number;
  /** 本群晚安次数 */
  group_night_count: number;
}

/**
 * 全服早晚安数据统计
 */
export async function get_all_morning_night_data(ctx: Context, gid: string): Promise<MorningNightStats> {
  // 全服早安/晚安总次数
  const morning_count = await ctx.database.eval("sleep_group", (row) => $.sum(row.morning_count));
  const night_count = await ctx.database.eval("sleep_group", (row) => $.sum(row.night_count));

  // 今日起床人数 = 早安次数
  const getting_up_count = morning_count;
  // 今日睡觉人数 = 晚安次数 - 早安次数
  const sleeping_count = night_count - getting_up_count;

  // 获取本群数据
  const group = await ctx.database.get("sleep_group", { group_id: gid });
  const group_morning_count = group[0]?.morning_count || 0;
  const group_night_count = group[0]?.night_count || 0;

  // 计算全服占比
  const morning_percent = morning_count ? group_morning_count / morning_count : 0;
  const night_percent = night_count ? group_night_count / night_count : 0;

  return {
    morning_count,
    night_count,
    sleeping_count,
    getting_up_count,
    morning_percent,
    night_percent,
    group_morning_count,
    group_night_count
  };
}

/**
 * 获取用户个人作息统计
 */
export async function get_user_sleep_stats(ctx: Context, uid: string) {
  const result = await ctx.database.get("sleep_user", { user_id: uid });
  if (result.length === 0) {
    return null;
  }
  return result[0];
}
