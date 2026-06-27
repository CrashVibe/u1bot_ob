import path from "path";

import {} from "@mrlingxd/koishi-plugin-renderer";
import type { Context } from "koishi";
import { h } from "koishi";

import { Config } from "./config";
import { buildRelationshipGraph } from "./graph";
import { divorce_waifu, select_waifu } from "./handlers";
import { applyModel } from "./models";
import { get_all_active_relationships } from "./repository";
import { applyCron } from "./scheduler";
import { getAtUsers, isAtBot } from "./utils";

export const name = "waifu";
export const inject = ["database", "cron", "coin", "renderer"];
export { Config };

const packageRoot = path.resolve(__dirname, "..");

export async function apply(ctx: Context, config: Config) {
  applyModel(ctx);
  applyCron(ctx);

  ctx
    .command("waifu", "娶一个群友做你的对象")
    .alias("娶群友")
    .action(async ({ session }) => {
      if (!session) throw new Error("会话对象不存在");
      if (!session.userId) {
        throw new Error("会话对象缺少 userId");
      }
      if (!session.guildId) {
        return h.quote(session.messageId) + "娶群友...当然只能在群里进行啦";
      }
      if (isAtBot(session)) {
        return "不可以啦..."; // 不用 quote 增加真实感
      }

      return h.quote(session.messageId) + (await select_waifu(ctx, session, config));
    });

  // 离婚
  ctx
    .command("divorce", "和你的某个对象离婚")
    .alias("离婚")
    .action(async ({ session }) => {
      if (!session) throw new Error("会话对象不存在");
      if (!session.guildId) {
        return h.quote(session.messageId) + "离婚...当然只能在群里进行啦";
      }
      const at_users = getAtUsers(session);
      if (at_users.length > 1) {
        return h.quote(session.messageId) + "一次只能和一个人离婚啦";
      }

      return h.quote(session.messageId) + (await divorce_waifu(ctx, session, config, at_users[0]));
    });

  // 关系图谱
  ctx
    .command("lovemap", "查看本群的婚姻关系图谱")
    .alias("婚姻图谱")
    .alias("关系图谱")
    .action(async ({ session }) => {
      if (!session) throw new Error("会话对象不存在");
      if (!session.guildId) {
        return h.quote(session.messageId) + "关系图谱...当然只能在群里查看啦";
      }

      const relationships = await get_all_active_relationships(ctx, session.guildId);
      if (relationships.length === 0) {
        return h.quote(session.messageId) + "这个群还没有人结婚呢，先去 /waifu 试试吧～";
      }

      const member_ids = new Set<string>();
      for (const relationship of relationships) {
        member_ids.add(relationship.owner_id);
        member_ids.add(relationship.waifu_id!);
      }

      const guildId = session.guildId;
      const members = await Promise.all(
        Array.from(member_ids).map(async (id) => {
          const member = await session.bot.getGuildMember(guildId, id);
          return {
            id,
            name: member.nick || member.user?.name || id,
            avatar: member.avatar || member.user?.avatar
          };
        })
      );
      const memberMap = new Map(members.map((member) => [member.id, member]));

      const { nodes, edges } = buildRelationshipGraph(
        relationships.map((relationship) => ({ owner_id: relationship.owner_id, waifu_id: relationship.waifu_id! })),
        memberMap
      );

      const img = await ctx.renderer.render_jsx(
        "/templates/Graph.tsx",
        { nodes, edges },
        { width: 1600, height: 1200 },
        { wait_time: 300, type: "png", scale: 1 },
        {
          root: packageRoot,
          configFile: path.resolve(packageRoot, "vite.config.ts"),
          cssUrls: ["/templates/graph.css"]
        }
      );
      return h.image(img, "image/png");
    });
}
