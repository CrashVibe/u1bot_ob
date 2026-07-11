import type { Context } from "koishi";

declare module "koishi" {
  interface Tables {
    coin: CoinModel;
    coin_source_record: CoinSourceRecord;
    red_packet: RedPacket;
    red_packet_record: RedPacketRecord;
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

export interface RedPacket {
  id: number;
  sender: string;
  guild_id: string;
  total_amount: number;
  total_count: number;
  remaining_amount: number;
  remaining_count: number;
  packages: string;
  created_at: Date;
  expired_at: Date;
  is_active: boolean;
}

export interface RedPacketRecord {
  id: number;
  packet_id: number;
  user: string;
  amount: number;
  created_at: Date;
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
  ctx.model.extend(
    "red_packet",
    {
      id: { type: "unsigned" },
      sender: { type: "string" },
      guild_id: { type: "string" },
      total_amount: { type: "integer" },
      total_count: { type: "integer" },
      remaining_amount: { type: "integer" },
      remaining_count: { type: "integer" },
      packages: { type: "text" },
      created_at: { type: "date" },
      expired_at: { type: "date" },
      is_active: { type: "boolean" }
    },
    {
      primary: "id",
      autoInc: true
    }
  );
  ctx.model.extend(
    "red_packet_record",
    {
      id: { type: "unsigned" },
      packet_id: { type: "unsigned" },
      user: { type: "string" },
      amount: { type: "integer" },
      created_at: { type: "date" }
    },
    {
      primary: "id",
      autoInc: true,
      foreign: {
        packet_id: ["red_packet", "id"]
      }
    }
  );
}
