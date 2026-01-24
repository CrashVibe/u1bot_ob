import type { Context } from "koishi";
import { h, Schema, Service } from "koishi";
import { applyModel } from "./models";
export const name = "coin";
export interface Config {}
export const Config: Schema<Config> = Schema.object({});

declare module "koishi" {
    interface Context {
        coin: Coin;
    }
}

export default class Coin extends Service {
    static inject = ["database"];
    ctx: Context;
    constructor(ctx: Context) {
        super(ctx, "coin");
        this.ctx = ctx;
        applyModel(ctx);
    }

    start() {
        this.ctx.command("次元币", "查看你的次元币余额").action(async ({ session }) => {
            if (!session || !session.userId) {
                throw new Error("会话对象不存在");
            }
            const coinnum = await this.getCoin(session.userId);
            return h.quote(session.messageId) + `你当前的次元币余额为：${coinnum}`;
        });
    }

    /**
     * 获取用户的金币数量
     *
     * @param user 用户 ID
     * @returns 用户的金币数量
     */
    public async getCoin(user: string): Promise<number> {
        let result = await this.ctx.database.get("coin", user);
        if (result.length === 0) {
            await this.ctx.database.set("coin", user, { coin: 0 });
            return 0;
        }
        return result[0]?.coin || 0;
    }

    /**
     * 设置用户的金币数量
     *
     * @param user 用户 ID
     * @param coin 金币数量
     */
    async setCoin(user: string, coin: number, source: string): Promise<void> {
        await this.ctx.database.set("coin", user, { coin });
        await this.ctx.database.create("coin_source_record", {
            user,
            coin,
            date: new Date(),
            source
        });
    }

    /**
     * 加减用户的金币数量
     *
     * @param user 用户 ID
     * @param coin 金币数量，可以为正数或负数
     * @param source 来源
     * @returns 是否成功调整金币数量
     */
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

    /**
     * 检查用户是否有足够的金币
     *
     * @param user 用户 ID
     * @param coin 要求的金币数量
     * @returns 是否有足够的金币
     */
    async hasEnoughCoin(user: string, coin: number): Promise<boolean> {
        const data = await this.ctx.database.get("coin", user);
        const currentCoin = data[0]?.coin || 0;
        return currentCoin >= coin;
    }
}
