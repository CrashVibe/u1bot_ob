import type { Context } from "koishi";
import { h, Schema, Service } from "koishi";

import { applyModel } from "./models";
export const name = "coin";
export interface Config {}
export const Config: Schema<Config> = Schema.object({});

// 二倍均值法随机分配红包金额
function splitRedPacket(totalAmount: number, totalCount: number): number[] {
  let remaining = totalAmount;
  const amounts: number[] = [];
  for (let i = 1; i <= totalCount - 1; i++) {
    const remainCount = totalCount - i + 1;
    const avg = Math.floor(remaining / remainCount);
    let maxAmount = Math.max(1, avg * 2);
    const maxAllowed = remaining - (totalCount - i);
    maxAmount = Math.min(maxAmount, maxAllowed);
    const amount = Math.floor(Math.random() * maxAmount) + 1;
    amounts.push(amount);
    remaining -= amount;
  }
  amounts.push(remaining);
  return amounts;
}

declare module "koishi" {
  interface Context {
    coin: Coin;
  }
}

export default class Coin extends Service {
  static inject = ["database"];
  declare ctx: Context;
  constructor(ctx: Context) {
    super(ctx, "coin");
  }

  start() {
    applyModel(this.ctx);
    this.ctx.command("次元币", "查看你的次元币余额").action(async ({ session }) => {
      if (!session || !session.userId) {
        throw new Error("会话对象不存在");
      }
      const coinnum = await this.getCoin(session.userId);
      return h.quote(session.messageId) + `你当前的次元币余额为：${coinnum}`;
    });

    // 转账命令
    this.ctx.command("转账", "转账给其他用户").action(async ({ session }) => {
      if (!session?.userId) throw new Error("会话对象不存在");

      const elements = session.elements || [];
      const ats = elements.filter((el) => el.type === "at");
      if (ats.length !== 1) return "请@一个要转账的用户，格式：转账 @用户 金额";
      const targetId = ats[0]!.attrs.id;
      if (targetId === session.userId) return "不能给自己转账哦～";

      // 从解析后的元素中提取文本内容（排除 at 元素），避免原始 @mention 文本干扰金额解析
      const atsIndex = elements.findIndex((el) => el.type === "at");
      const amountText = elements
        .slice(atsIndex + 1)
        .filter((el) => el.type === "text")
        .map((el) => (el.attrs as { content: string }).content)
        .join("")
        .trim();
      const amount = parseInt(amountText);
      if (isNaN(amount) || amount <= 0 || !Number.isInteger(amount)) return "请输入正确的转账金额（正整数）";

      const fee = Math.max(1, Math.ceil(amount * 0.01));
      const totalCost = amount + fee;

      const balance = await this.getCoin(session.userId);
      if (balance < totalCost) {
        return (
          h.quote(session.messageId) +
          `余额不足！当前余额：${balance} 次元币，需要：${totalCost} 次元币（含 ${fee} 手续费）`
        );
      }

      await this.adjustCoin(session.userId, -totalCost, `转账给 ${targetId}（含手续费 ${fee}）`);
      await this.adjustCoin(targetId, amount, `收到来自 ${session.userId} 的转账`);

      const newBalance = await this.getCoin(session.userId);
      return (
        h.quote(session.messageId) +
        `转账成功！向 ${h("at", { id: targetId })} 转账 ${amount} 次元币（手续费 ${fee} 次元币），余额 ${newBalance} 次元币`
      );
    });

    this.ctx.command("发红包 <total:number> <count:number>", "发群红包").action(async ({ session }, total, count) => {
      if (!session?.userId) throw new Error("会话对象不存在");
      if (!session.guildId) return "红包只能在群聊中发送哦～";

      if (count < 2 || count > 50) return "红包份数必须在 2-50 之间";
      if (total < count) return `总金额（${total}）不能少于份数（${count}），每份至少 1 次元币`;

      const balance = await this.getCoin(session.userId);
      if (balance < total) {
        return h.quote(session.messageId) + `余额不足！当前余额：${balance} 次元币，需要：${total} 次元币`;
      }

      await this.adjustCoin(session.userId, -total, `发红包（${total}币/${count}份）`);

      const amounts = splitRedPacket(total, count);

      const expiredAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
      await this.ctx.database.create("red_packet", {
        sender: session.userId,
        guild_id: session.guildId,
        total_amount: total,
        total_count: count,
        remaining_amount: total,
        remaining_count: count,
        packages: JSON.stringify(amounts),
        created_at: new Date(),
        expired_at: expiredAt,
        is_active: true
      });

      return (
        h.quote(session.messageId) +
        `[红包] ${h("at", { id: session.userId })} 发了一个红包！总金额 ${total} 次元币，共 ${count} 份。回复「抢」来抢红包！`
      );
    });

    this.ctx.command("抢", "抢红包").action(async ({ session }) => {
      if (!session?.userId) throw new Error("会话对象不存在");
      if (!session.guildId) return "红包只能在群聊中抢哦～";

      const now = new Date();

      const packets = await this.ctx.database.get("red_packet", {
        guild_id: session.guildId,
        is_active: true
      });

      // 过期红包：退款并停用
      for (const pkt of packets) {
        if (new Date(pkt.expired_at) < now && pkt.remaining_amount > 0) {
          await this.adjustCoin(pkt.sender, pkt.remaining_amount, `红包过期退款（${pkt.remaining_amount}币）`);
          await this.ctx.database.set("red_packet", pkt.id, {
            is_active: false
          });
        }
      }

      const validPackets = packets.filter((p) => p.remaining_count > 0 && new Date(p.expired_at) >= now);

      if (validPackets.length === 0) return "当前群没有可抢的红包～";

      const available: typeof validPackets = [];
      for (const pkt of validPackets) {
        const records = await this.ctx.database.get("red_packet_record", {
          packet_id: pkt.id,
          user: session.userId
        });
        if (records.length === 0) available.push(pkt);
      }

      if (available.length === 0) return "你已经抢过当前群的所有红包啦～";

      const pkt = available[Math.floor(Math.random() * available.length)]!;

      const packages: number[] = JSON.parse(pkt.packages);
      const idx = Math.floor(Math.random() * packages.length);
      const amount = packages.splice(idx, 1)[0]!;

      const newRemaining = pkt.remaining_amount - amount;
      const newCount = pkt.remaining_count - 1;
      const isActive = newCount > 0;

      await this.ctx.database.set("red_packet", pkt.id, {
        remaining_amount: newRemaining,
        remaining_count: newCount,
        packages: JSON.stringify(packages),
        is_active: isActive
      });

      await this.ctx.database.create("red_packet_record", {
        packet_id: pkt.id,
        user: session.userId,
        amount,
        created_at: new Date()
      });

      await this.adjustCoin(session.userId, amount, `抢红包（来自 ${pkt.sender}）`);

      return (
        h.quote(session.messageId) +
        `${h("at", { id: session.userId })} 抢到了 ${amount} 次元币！(红包来自 ${h("at", { id: pkt.sender })}) [剩余${newCount}份]`
      );
    });
  }

  // 获取用户的金币数量
  public async getCoin(user: string): Promise<number> {
    let result = await this.ctx.database.get("coin", user);
    if (result.length === 0) {
      await this.ctx.database.set("coin", user, { coin: 0 });
      return 0;
    }
    return result[0]?.coin || 0;
  }

  // 设置用户的金币数量
  async setCoin(user: string, coin: number, source: string): Promise<void> {
    await this.ctx.database.set("coin", user, { coin });
    await this.ctx.database.create("coin_source_record", {
      user,
      coin,
      date: new Date(),
      source
    });
  }

  // 加减用户的金币数量
  async adjustCoin(user: string, coin: number, source: string): Promise<boolean> {
    const data = await this.ctx.database.get("coin", user);
    const currentCoin = data[0]?.coin || 0;
    if (coin < 0 && !(await this.hasEnoughCoin(user, -coin))) {
      return false;
    }
    await this.ctx.database.upsert("coin", (_) => [{ user: user, coin: currentCoin + coin }]);
    await this.ctx.database.create("coin_source_record", {
      user,
      coin,
      source,
      date: new Date()
    });
    return true;
  }

  // 检查用户是否有足够的金币
  async hasEnoughCoin(user: string, coin: number): Promise<boolean> {
    const data = await this.ctx.database.get("coin", user);
    const currentCoin = data[0]?.coin || 0;
    return currentCoin >= coin;
  }
}
