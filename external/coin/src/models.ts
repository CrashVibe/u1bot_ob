import type { Context } from "koishi";

declare module "koishi" {
    interface Tables {
        coin: CoinModel;
        coin_source_record: CoinSourceRecord;
    }
}

export interface CoinModel {
    user: string;
    coin: number;
}

export interface CoinSourceRecord {
    id: number;
    user: CoinModel["user"];
    coin: number;
    source: string;
    date: Date;
}

export function applyModel(ctx: Context) {
    ctx.model.extend(
        "coin_source_record",
        {
            id: { type: "unsigned" },
            user: { type: "string" },
            coin: { type: "integer" },
            source: { type: "string" },
            date: { type: "date" }
        },
        {
            primary: "id",
            autoInc: true,
            foreign: {
                user: ["coin", "user"]
            }
        }
    );
    ctx.model.extend(
        "coin",
        {
            user: { type: "string" },
            coin: { type: "integer", initial: 0 }
        },
        {
            primary: "user"
        }
    );
}
