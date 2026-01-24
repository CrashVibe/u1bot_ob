import type { Context } from "koishi";

declare module "koishi" {
    interface Tables {
        waifu_relationships: WaifuRelationship;
    }
}

/**
 * 娶群友关系表
 */
export interface WaifuRelationship {
    /** 自增 ID */
    id: number;
    /**
     * 群 ID
     */
    group_id: string;

    /**
     * 主人 ID
     * 如果 waifu_id 为空，表示这个主人是单身狗
     */
    owner_id: string;

    /**
     * 老婆 ID
     * 为空表示这个主人是单身狗
     */
    waifu_id: string | null;

    /**
     * 娶群友时间
     */
    married_at: Date;

    /**
     * 是否在婚中
     */
    is_married: boolean;
}

export function applyModel(ctx: Context) {
    ctx.model.extend(
        "waifu_relationships",
        {
            id: "unsigned",
            group_id: "string",
            owner_id: "string",
            waifu_id: "string",
            is_married: {
                type: "boolean",
                initial: true
            },
            married_at: "timestamp"
        },
        {
            primary: "id",
            autoInc: true
        }
    );
}
