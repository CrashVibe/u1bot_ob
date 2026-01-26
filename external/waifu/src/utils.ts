import type { Session } from "koishi";

/**
 * 判断消息中是否 At 了机器人自己
 * @param session 会话对象
 * @returns 是否 At 了机器人自己
 */
export function isAtBot(session: Session): boolean {
  if (!session.elements) throw new Error("会话中没有元素信息");
  return session.elements.some((element) => element.type === "at" && element.attrs.id === session.bot.selfId);
}

/**
 * 获取可用的群成员列表
 *
 * 排除：机器人自己、QQ 机器人（自带的那种）
 */
export async function getAvailableGroupMembers(session: Session): Promise<string[]> {
  if (!session.guildId) throw new Error("会话不在群组中");
  const members = await session.bot.getGuildMemberList(session.guildId);
  return members.data
    .filter((member) => {
      if (member.user?.isBot) return false;
      if (member.user?.id === "2854196310") return false;
      return true;
    })
    .map((member) => member.user?.id)
    .filter((id): id is string => typeof id === "string");
}
