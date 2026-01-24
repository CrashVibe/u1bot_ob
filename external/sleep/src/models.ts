import type { Context } from "koishi";

declare module "koishi" {
    interface Tables {
        sleep_group: SleepGroup;
        sleep_user: SleepUser;
    }
}

/**
 * 睡眠组统计信息
 */
export interface SleepGroup {
    /**
     * 组唯一标识符
     */
    group_id: string;

    /**
     * 当日早晨打卡人数
     */
    morning_count: number;

    /**
     * 当日晚上打卡人数
     */
    night_count: number;
}

/**
 * 用户睡眠记录详情
 */
export interface SleepUser {
    /**
     * 用户唯一标识符
     */
    user_id: string;

    /**
     * 当日早晨打卡时间（UTC）
     */
    morning_time: Date | null;

    /**
     * 当日晚上打卡时间（UTC）
     */
    night_time: Date | null;

    // 周统计（当前周）
    /**
     * 当前周早晨打卡次数
     */
    weekly_morning_count: number;

    /**
     * 当前周晚上打卡次数
     */
    weekly_night_count: number;

    /**
     * 当前周累计睡眠时间（秒）
     */
    weekly_sleep_time: number;

    /**
     * 当前周最早早晨打卡时间（UTC）
     */
    weekly_earliest_morning_time: Date | null;

    /**
     * 当前周最晚晚上打卡时间（UTC）
     */
    weekly_latest_night_time: Date | null;

    // 累计统计
    /**
     * 总累计早晨打卡次数
     */
    total_morning_count: number;

    /**
     * 总累计晚上打卡次数
     */
    total_night_count: number;

    /**
     * 总累计睡眠时间（秒）
     */
    total_sleep_time: number;

    /**
     * 连续打卡天数
     */
    consecutive_days: number;
}

export function applyModel(ctx: Context) {
    ctx.model.extend(
        "sleep_group",
        {
            group_id: { type: "string", nullable: false },
            morning_count: { type: "unsigned", initial: 0, nullable: false },
            night_count: { type: "unsigned", initial: 0, nullable: false }
        },
        {
            primary: "group_id"
        }
    );
    ctx.model.extend(
        "sleep_user",
        {
            user_id: { type: "string" },
            morning_time: { type: "timestamp" },
            night_time: { type: "timestamp" },
            weekly_morning_count: { type: "unsigned", initial: 0 },
            weekly_night_count: { type: "unsigned", initial: 0 },
            weekly_sleep_time: { type: "unsigned", initial: 0 },
            weekly_earliest_morning_time: { type: "timestamp" },
            weekly_latest_night_time: { type: "timestamp" },
            total_morning_count: { type: "unsigned", initial: 0 },
            total_night_count: { type: "unsigned", initial: 0 },
            total_sleep_time: { type: "unsigned", initial: 0 },
            consecutive_days: { type: "unsigned", initial: 0 }
        },
        {
            primary: "user_id"
        }
    );
}
