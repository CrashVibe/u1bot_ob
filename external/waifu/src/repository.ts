import type { Context } from "koishi";
import { $ } from "koishi";

/**
 * 获取该群的用户关系
 *
 * @param ctx Koishi 上下文
 * @param group_id 群号
 * @param owner_id 用户号
 * @returns 用户关系记录或 null
 */
export async function get_user_relationship(ctx: Context, group_id: string, owner_id: string) {
  const relationship = await ctx.database.get("waifu_relationships", (row) =>
    $.and(
      $.eq(row.group_id, group_id),
      $.eq(row.is_married, true),
      $.or($.eq(row.owner_id, owner_id), $.eq(row.waifu_id, owner_id))
    )
  );
  if (relationship.length === 0) {
    return undefined;
  }
  return relationship[0];
}
