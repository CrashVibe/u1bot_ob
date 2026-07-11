import { readFileSync } from "fs";
import { join } from "path";

import type { Config } from "./config";
import {} from "@koishijs/plugin-adapter-qq";
import {} from "@u1bot/koishi-plugin-coin";
import type { Context } from "koishi";
import { h } from "koishi";
import {} from "koishi-plugin-rate-limit";

import { getTop } from "./crud";
import { getFishingRodDisplay, getFishingRodProgress } from "./fishing_rod";
import { applyModel } from "./model";
import {
  choice,
  get_backpack,
  get_display_quality,
  get_fish_info,
  get_fish_price,
  get_quality_display,
  save_fish
} from "./services";
import { FishingRodLevel, type Fish } from "./types";
export { Config } from "./config";
export const name = "fishing";
export const inject = {
  required: ["database", "coin", "redis"],
  optional: ["fortune"]
};

const fishingImageBase64 = `data:image/png;base64,${readFileSync(join(__dirname, "assets", "fishing.png")).toString("base64")}`;

export async function apply(ctx: Context, config: Config) {
  applyModel(ctx);
  ctx
    .command("fishing", "就是钓鱼", {
      minInterval: config.fishing_cooldown * 1000
    })
    .channelFields(["fishing_switch"])
    .alias("钓鱼")
    .action(async ({ session }) => {
      void new Promise((resolve, reject) => {
        (async () => {
          if (!session || !session.messageId) {
            reject(new Error("无法获取会话信息"));
            return;
          }
          if (session.channel && !session.channel.fishing_switch) {
            await session.send("此群钓鱼功能已被禁用，请联系管理员开启");
            resolve(undefined);
            return;
          }

          if (session.isDirect) {
            await session.send([h.quote(session.messageId), h.image(fishingImageBase64)]);
          } else {
            try {
              if (session.channelId) {
                await session.bot.createReaction(session.channelId, session.messageId, "emoji|128051");
              }
            } catch {}
          }
          const fish = await choice(ctx, session, config);
          const waitTime = Math.floor(Math.random() * 6 + 1) * 1000;
          await new Promise((resolve) => setTimeout(resolve, waitTime));

          const fishInfo = get_fish_info(fish.fish.name, fish.fish.quality);

          let result = "";

          if (fishInfo) {
            result = `你钓到了一条 [${get_quality_display(fish.fish.quality)}]${fish.fish.name}，长度为 ${
              fish.fish.length
            }cm！`;
            if (fishInfo.prompt !== undefined) {
              result = fishInfo.prompt_only ? `* ${fishInfo.prompt}` : result + "\n* " + fishInfo.prompt;
            }
          }

          const fishingResult = await save_fish(
            ctx,
            session,
            fish.fish,
            config,
            fish.consumeLuckyBait,
            fish.consumeSuperBait
          );

          let fullResult = result;

          if (fishingResult.protectionUsed) {
            fullResult += `\n[保护绳] 保护绳生效！你的鱼竿免于降级。`;
          }

          if (fishingResult.upgraded) {
            fullResult += `\n你的鱼竿升级到了 [${getFishingRodDisplay(fishingResult.newLevel!, config)}] 等级！`;
          } else if (fishingResult.downgraded) {
            fullResult += `\n${fishingResult.downgradeReason}，你的鱼竿降级到了 [${getFishingRodDisplay(
              fishingResult.newLevel!,
              config
            )}] 等级...`;
          }

          if (!session.isDirect && session.channelId) {
            try {
              await session.bot.deleteReaction(session.channelId, session.messageId, "emoji|128051");
              await session.bot.createReaction(session.channelId, session.messageId, "emoji|127881");
            } catch {}
          }

          await session.send(h.quote(session.messageId) + fullResult);
          resolve(undefined);
        })().catch(reject);
      });
      return;
    });

  ctx.command("背包", "查看背包中的鱼").action(async ({ session }) => {
    if (!session || !session.userId) {
      throw new Error("无法获取用户信息");
    }
    const backpack = await get_backpack(ctx, session.userId);
    if (Object.keys(backpack).length === 0) {
      return h.quote(session.messageId) + "* 你的背包装满了空气";
    }
    const msgList: h[][] = [];
    msgList.push([h.text("你的背包中有以下鱼：")]);
    for (const [quality, fishes] of Object.entries(backpack)) {
      if (fishes.length === 0) {
        continue;
      }
      const qualityDisplay = `${get_quality_display(quality)}：\n${fishes.join("\n")}`;
      msgList.push([h.text(qualityDisplay)]);
    }
    if (session.qq) {
      return msgList.join("\n\n");
    }
    const message = h(
      "message",
      { forward: true },
      ...msgList.map((element) =>
        h(
          "message",
          h("author", {
            id: session.bot.selfId,
            name: session.bot.user?.name || "钓鱼小助手"
          }),
          ...element
        )
      )
    );
    await session.send(message);
  });
  ctx.command("统计信息", "查看钓鱼统计信息").action(async ({ session }) => {
    if (!session || !session.userId) {
      throw new Error("无法获取用户信息");
    }
    const record = await ctx.database.get("fishing_record", { user_id: session.userId });
    if (!record[0]) {
      return h.quote(session.messageId) + "你还没有开始钓鱼呢，快去钓鱼吧！";
    }
    const progress = getFishingRodProgress(record[0], config);

    let progressText = "";
    if (progress.next) {
      progressText = `\n- 升级进度：${progress.progress}/${progress.nextRequirement} (下一级：${progress.next})`;
    } else {
      progressText = `\n- 已达到最高等级！`;
    }

    return `你的钓鱼统计信息：
- 总钓鱼次数：${record[0].frequency}
- 背包中的鱼总长：${record[0].fishes.reduce((sum, fish) => sum + fish.length, 0)}cm
- 当前鱼竿：[${getFishingRodDisplay(record[0].fishing_rod_level, config)}] 等级${progressText}
- 连续倒霉次数：${record[0].consecutive_bad_count}
        `;
  });

  ctx
    .command("鱼竿", "查看鱼竿信息")
    .alias("我的鱼竿")
    .action(async ({ session }) => {
      if (!session || !session.userId) {
        throw new Error("无法获取用户信息");
      }

      const record = await ctx.database.get("fishing_record", {
        user_id: session.userId
      });
      if (!record[0]) {
        return h.quote(session.messageId) + "你还没有开始钓鱼呢，快去钓鱼吧！";
      }

      const progress = getFishingRodProgress(record[0], config);

      let progressText = "";
      if (progress.next) {
        const remaining = progress.nextRequirement - progress.progress;
        progressText = `\n升级进度：${progress.progress}/${progress.nextRequirement}\n还需钓鱼：${remaining} 次可升级到 [${progress.next}]`;
      } else {
        progressText = `\n已达到最高等级！恭喜你成为钓鱼大师！`;
      }

      const rodConfig = config.fishing_rods[record[0].fishing_rod_level];
      const bonusText = Object.entries(rodConfig.quality_bonus)
        .map(([quality, bonus]) => `${get_quality_display(quality)}: ${(bonus * 100).toFixed(0)}%`)
        .join(", ");

      return (
        h.quote(session.messageId) +
        `你的鱼竿信息：
当前等级：[${getFishingRodDisplay(record[0].fishing_rod_level, config)}]${progressText}
品质加成：${bonusText}
特殊鱼加成：${(rodConfig.special_fish_bonus * 100).toFixed(0)}%`
      );
    });
  ctx
    .command("钓鱼开关", "查看或设置钓鱼开关")
    .channelFields(["fishing_switch"])
    .action(async ({ session }) => {
      if (!session || !session.userId) {
        throw new Error("无法获取用户信息");
      }
      if (!session.guildId || !session.channel) {
        return h.quote(session.messageId) + "怎么啦，你要控制自己不要钓鱼嘛";
      }
      if (session.qq) {
        return h.quote(session.messageId) + "暂时不支持此功能";
      }
      const memberRoles = session.event.member?.roles?.map((r) => r.id);
      if (!memberRoles?.includes("admin") && !memberRoles?.includes("owner")) {
        return h.quote(session.messageId) + "你没有权限设置钓鱼开关";
      }
      session.channel.fishing_switch = !session.channel.fishing_switch;
      return h.quote(session.messageId) + `钓鱼开关已${session.channel.fishing_switch ? "打开" : "关闭"}`;
    });
  ctx.command("卖鱼 <name>", "卖掉一条鱼").action(async ({ session }, name: string) => {
    if (!session?.userId) {
      throw new Error("无法获取用户信息");
    }

    if (!name) {
      return h.quote(session.messageId) + "请输入要卖掉的鱼的名称";
    }

    const record = await ctx.database.get("fishing_record", {
      user_id: session.userId
    });
    if (!record[0]) {
      return h.quote(session.messageId) + "没鱼还想卖鱼？！";
    }

    const { fishes } = record[0];

    if (name === "全部") {
      const totalCount = fishes.length;
      const totalPrice = fishes.reduce((sum, fish) => sum + get_fish_price(fish), 0);
      await ctx.coin.adjustCoin(session.userId, totalPrice, "卖全部鱼");
      await ctx.database.set("fishing_record", { user_id: session.userId }, { fishes: [] });
      return (
        h.quote(session.messageId) + `* 你卖掉了所有鱼（共 ${totalCount} 条），获得了 ${totalPrice.toFixed(2)} 次元币`
      );
    }

    let fishIndex = -1;
    try {
      const quality = get_display_quality(name);
      const qualityFishes = fishes.filter((fish) => fish.quality === quality);
      if (qualityFishes.length === 0) {
        return h.quote(session.messageId) + `* 你没有品质为 "${get_quality_display(quality)}" 的鱼`;
      }
      const totalCount = qualityFishes.length;
      const totalPrice = qualityFishes.reduce((sum, fish) => sum + get_fish_price(fish), 0);
      const newFishes = fishes.filter((fish) => fish.quality !== quality);
      await ctx.coin.adjustCoin(session.userId, totalPrice, `卖掉全部品质为 [${get_quality_display(quality)}] 的鱼`);
      await ctx.database.set("fishing_record", { user_id: session.userId }, { fishes: newFishes });
      return (
        h.quote(session.messageId) +
        `* 你卖掉了所有品质为 [${get_quality_display(
          quality
        )}] 的鱼（共 ${totalCount} 条），获得了 ${totalPrice.toFixed(2)} 次元币`
      );
    } catch {
      fishIndex = fishes.findIndex((fish) => fish.name === name);
    }

    if (fishIndex === -1) {
      return h.quote(session.messageId) + `* 你没有名为 "${name}" 的鱼`;
    }

    const fish: Fish = fishes[fishIndex]!;
    const price = get_fish_price(fish);

    fishes.splice(fishIndex, 1);
    await ctx.coin.adjustCoin(session.userId, price, `卖鱼 [${fish.quality}]${fish.name}`);
    await ctx.database.set("fishing_record", { user_id: session.userId }, { fishes });

    return (
      h.quote(session.messageId) +
      `* 你卖掉了一条 [${get_quality_display(fish.quality)}]${fish.name}，长度为 ${
        fish.length
      }cm，获得了 ${price.toFixed(2)} 次元币`
    );
  });

  ctx.command("渔具店", "查看渔具店道具列表").action(async ({ session }) => {
    if (!session?.userId) {
      throw new Error("无法获取用户信息");
    }

    const record = await ctx.database.get("fishing_record", { user_id: session.userId });
    const items = (record[0]?.items || {}) as Record<string, number>;

    const luckyBaitCount = items["幸运饵料"] || 0;
    const protectionRopeCount = items["保护绳"] || 0;
    const superBaitCount = items["超级鱼饵"] || 0;

    const itemList = [];
    if (luckyBaitCount > 0) itemList.push(`幸运饵料×${luckyBaitCount}`);
    if (protectionRopeCount > 0) itemList.push(`保护绳×${protectionRopeCount}`);
    if (superBaitCount > 0) itemList.push(`超级鱼饵×${superBaitCount}`);

    const backpackText = itemList.length > 0 ? itemList.join(", ") : "空空如也";

    return (
      h.quote(session.messageId) +
      `[渔具店]
 ━━━━━━━━━━━━
 幸运饵料 — ${config.shop_items.lucky_bait} 次元币
    效果：下次钓鱼稀有鱼概率 ×1.5
 
 保护绳 — ${config.shop_items.protection_rope} 次元币
    效果：防止鱼竿降级一次（自动触发）
 
 超级鱼饵 — ${config.shop_items.super_bait} 次元币
    效果：下次钓鱼必出普通及以上品质
 
 ━━━━━━━━━━━━
 回复 \`/购买 道具名\` 来购买
 你的道具：${backpackText}`
    );
  });

  ctx.command("购买 <itemName>", "购买渔具店道具").action(async ({ session }, itemName: string) => {
    if (!session?.userId) {
      throw new Error("无法获取用户信息");
    }

    const validItems: Record<string, { price: number; display: string }> = {
      幸运饵料: { price: config.shop_items.lucky_bait, display: "幸运饵料" },
      保护绳: { price: config.shop_items.protection_rope, display: "保护绳" },
      超级鱼饵: { price: config.shop_items.super_bait, display: "超级鱼饵" }
    };

    const item = validItems[itemName];
    if (!item) {
      return h.quote(session.messageId) + `没有这个道具！可购买的道具：幸运饵料、保护绳、超级鱼饵`;
    }

    const balance = await ctx.coin.getCoin(session.userId);
    if (balance < item.price) {
      return (
        h.quote(session.messageId) + `次元币不足！需要 ${item.price} 次元币，你当前只有 ${balance.toFixed(2)} 次元币`
      );
    }

    await ctx.coin.adjustCoin(session.userId, -item.price, `购买${item.display}`);

    const record = await ctx.database.get("fishing_record", { user_id: session.userId });
    if (!record[0]) {
      // 没有钓鱼记录，先创建一个空记录
      await ctx.database.create("fishing_record", {
        user_id: session.userId,
        frequency: 0,
        fishes: [],
        fishing_rod_level: FishingRodLevel.normal,
        fishing_rod_experience: 0,
        total_fishing_count: 0,
        last_fishing_time: new Date(),
        consecutive_bad_count: 0,
        items: { [itemName]: 1 }
      });
    } else {
      const items = (record[0].items || {}) as Record<string, number>;
      items[itemName] = (items[itemName] || 0) + 1;
      await ctx.database.set("fishing_record", { user_id: session.userId }, { items });
    }

    const updatedRecord = await ctx.database.get("fishing_record", { user_id: session.userId });
    const updatedItems = (updatedRecord[0]?.items || {}) as Record<string, number>;

    const itemList = [];
    if (updatedItems["幸运饵料"]) itemList.push(`幸运饵料×${updatedItems["幸运饵料"]}`);
    if (updatedItems["保护绳"]) itemList.push(`保护绳×${updatedItems["保护绳"]}`);
    if (updatedItems["超级鱼饵"]) itemList.push(`超级鱼饵×${updatedItems["超级鱼饵"]}`);

    const newBalance = await ctx.coin.getCoin(session.userId);

    return (
      h.quote(session.messageId) +
      `* 成功购买 ${item.display} ×1，消耗 ${item.price} 次元币\n余额：${newBalance.toFixed(2)} 次元币\n道具：${itemList.join(", ") || "空空如也"}`
    );
  });

  ctx
    .command("fish_leaderboard", "查看本群钓鱼排行榜（所有类型前三名）")
    .alias("钓鱼排行榜")
    .action(async ({ session }) => {
      if (!session || !session.userId) {
        throw new Error("无法获取用户信息");
      }
      if (!session.guildId) {
        return h.quote(session.messageId) + "钓鱼排行榜只能在群内查看～";
      }

      const { guildId } = session;

      const types = ["count", "lucky", "unlucky", "streak", "exp"] as const;
      const typeMap: Record<string, string> = {
        count: "钓鱼次数",
        lucky: "欧皇榜",
        unlucky: "非酋榜",
        streak: "连续倒霉榜",
        exp: "经验榜"
      };
      let msg = [];
      const members = await session.bot.getGuildMemberList(guildId);
      for (const type of types) {
        const result = await getTop(ctx, guildId, type, undefined, 3);
        if (result.length === 0) {
          continue;
        }
        msg.push(`\n[${typeMap[type]}排行榜]\n`);
        result.forEach((item, idx) => {
          const member = members.data.find((m) => m.user?.id === item.value);
          if (!member || !member.user) {
            return;
          }
          msg.push(`No.${idx + 1} -  ${member.user.name}，${typeMap[type]}: ${item.score}\n`);
        });
      }
      if (msg.length === 0) {
        return h.quote(session.messageId) + "本群暂无钓鱼数据～";
      }
      return h.quote(session.messageId) + msg.join("").trim();
    });
}
