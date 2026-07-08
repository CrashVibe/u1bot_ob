import type { Bot, Context } from "koishi";
import { Schema } from "koishi";

export const name = "group-assign";
export const inject = ["database"];

export interface Config {}
export const Config: Schema<Config> = Schema.object({});

interface Group {
  groupId: string;
  groupName: string;
}

interface BotGroups {
  selfId: string;
  joinedGroups: Group[];
}

// 分页获取机器人加入的所有群组
async function getAllGroups(bot: Bot, ctx: Context): Promise<Group[]> {
  let allGroups: Group[] = [];
  let nextToken: string | null = null;
  let attempts = 0;
  const maxAttempts = 20; // 防止无限循环
  do {
    try {
      const result = await bot.getGuildList(nextToken ?? undefined);
      allGroups = allGroups.concat(
        result.data.map((g) => ({
          groupId: g.id,
          groupName: g.name || `群组-${g.id.slice(-4)}`
        }))
      );
      nextToken = result.next || null;
      attempts++;
      if (attempts >= maxAttempts) {
        ctx.logger("group-assign").warn(`获取群组列表已达到最大尝试次数 (${maxAttempts})`);
        break;
      }
    } catch (error) {
      ctx.logger("group-assign").error(`分页获取群组列表失败:`, error);
      break;
    }
  } while (nextToken);
  return allGroups;
}

export function apply(ctx: Context) {
  ctx.command("分配群组", { authority: 4 }).action(async () => {
    const qqBots = ctx.bots.filter((bot) => bot.platform === "milky");
    let message = "=== 群组分配报告 ===\n\n";
    if (qqBots.length === 0) {
      message += "当前没有可用的QQ机器人";
      ctx.logger("group-assign").info(message);
      return message;
    }
    message += `找到 ${qqBots.length} 个QQ机器人\n`;
    ctx.logger("group-assign").info(`开始分配群组，找到 ${qqBots.length} 个机器人`);
    // 获取每个机器人的群组列表
    const botsWithGroups: BotGroups[] = await Promise.all(
      qqBots.map(async (bot) => {
        try {
          const groups = await getAllGroups(bot, ctx);
          const botMessage = `机器人 ${bot.selfId} 获取到 ${groups.length} 个群组`;
          message += `${botMessage}\n`;
          ctx.logger("group-assign").info(botMessage);
          return {
            selfId: bot.selfId,
            joinedGroups: groups
          };
        } catch (error) {
          const errorMsg = `机器人 ${bot.selfId} 获取群列表失败: ${(error as Error).message}`;
          message += `${errorMsg}\n`;
          ctx.logger("group-assign").error(errorMsg);
          return {
            selfId: bot.selfId,
            joinedGroups: []
          };
        }
      })
    );
    // 统计所有群组
    const allGroups: Group[] = [];
    const uniqueGroupIds = new Set<string>();
    botsWithGroups.forEach((bot) => {
      bot.joinedGroups.forEach((group) => {
        if (!uniqueGroupIds.has(group.groupId)) {
          uniqueGroupIds.add(group.groupId);
          allGroups.push(group);
        }
      });
    });
    const totalGroupsMsg = `共发现 ${allGroups.length} 个唯一群组`;
    message += `${totalGroupsMsg}\n`;
    ctx.logger("group-assign").info(totalGroupsMsg);
    try {
      // 分配群组并获取结果
      const assignments = await distributeGroupsToBots(ctx, botsWithGroups, allGroups);
      // 构建分配结果消息
      message += `\n成功分配 ${assignments.length} 个群组\n`;
      message += "各机器人负责数量:\n";
      // 统计每个机器人的工作量
      const workloadMap: Record<string, number> = {};
      assignments.forEach((a) => {
        workloadMap[a.assignee] = (workloadMap[a.assignee] || 0) + 1;
      });
      // 添加工作量信息到消息
      botsWithGroups.forEach((bot) => {
        const count = workloadMap[bot.selfId] || 0;
        message += `机器人 ${bot.selfId}: ${count} 个群组\n`;
      });
      message += "\n分配完成";
      ctx.logger("group-assign").success("群组分配完成");
      return message;
    } catch (error) {
      const errorMsg = `群组分配失败: ${(error as Error).message}`;
      message += `\n${errorMsg}\n`;
      ctx.logger("group-assign").error(errorMsg);
      return message;
    }
  });
}

interface Assignment {
  groupId: string;
  assignee: string;
}

// 按最小负载把群分配给机器人，写入 channel.assignee
async function distributeGroupsToBots(ctx: Context, bots: BotGroups[], groups: Group[]): Promise<Assignment[]> {
  const groupToBotsMap: Record<string, string[]> = {};
  groups.forEach((group) => {
    groupToBotsMap[group.groupId] = bots
      .filter((bot) => bot.joinedGroups.some((g) => g.groupId === group.groupId))
      .map((bot) => bot.selfId);
  });
  const assignments: Assignment[] = [];
  const botWorkload: Record<string, number> = {};
  bots.forEach((bot) => {
    botWorkload[bot.selfId] = 0;
  });
  for (const groupId in groupToBotsMap) {
    const availableBots = groupToBotsMap[groupId];
    if (!availableBots || availableBots.length === 0) continue;
    const selectedBot = availableBots.reduce((prev, curr) =>
      ((botWorkload[curr] ?? 0) < (botWorkload[prev] ?? 0) ? curr : prev)
    );
    assignments.push({ groupId, assignee: selectedBot });
    botWorkload[selectedBot] = (botWorkload[selectedBot] ?? 0) + 1;
  }
  await Promise.all(
    assignments.map(async (assignment) => {
      await ctx.database.set(
        "channel",
        {
          platform: "milky",
          id: assignment.groupId
        },
        {
          assignee: assignment.assignee
        }
      );
    })
  );
  return assignments;
}
