import type { WaifuRelationship } from "./models";
import type { Context } from "koishi";

/**
 * 获取该群当前所有在婚关系（一对多关系图谱用）
 */
export async function get_all_active_relationships(ctx: Context, group_id: string): Promise<WaifuRelationship[]> {
  const rows = await ctx.database.get("waifu_relationships", { group_id, is_married: true });
  return rows.filter((row) => row.waifu_id !== null);
}

/**
 * 获取某用户作为主人时持有的在婚关系
 *
 * 用于判断是否重复娶同一个人，以及计算娶亲费用
 */
export async function get_owner_relationships(
  ctx: Context,
  group_id: string,
  owner_id: string
): Promise<WaifuRelationship[]> {
  const rows = await ctx.database.get("waifu_relationships", { group_id, owner_id, is_married: true });
  return rows.filter((row) => row.waifu_id !== null);
}

/**
 * 获取某用户今天涉及到的全部关系记录（包含已离婚的），用于离婚罚款计数
 */
export async function get_relationships_involving(
  ctx: Context,
  group_id: string,
  user_id: string
): Promise<WaifuRelationship[]> {
  const rows = await ctx.database.get("waifu_relationships", { group_id });
  return rows.filter((row) => row.owner_id === user_id || row.waifu_id === user_id);
}

/**
 * 获取两人之间当前在婚的关系（不限方向）
 */
export async function get_relationship_between(
  ctx: Context,
  group_id: string,
  user_a: string,
  user_b: string
): Promise<WaifuRelationship | undefined> {
  const rows = await ctx.database.get("waifu_relationships", { group_id, is_married: true });
  return rows.find(
    (row) =>
      (row.owner_id === user_a && row.waifu_id === user_b) || (row.owner_id === user_b && row.waifu_id === user_a)
  );
}

/**
 * 获取某用户当前在婚的全部关系（作为主人或对象）
 */
export async function get_active_relationships_for_user(
  ctx: Context,
  group_id: string,
  user_id: string
): Promise<WaifuRelationship[]> {
  const rows = await ctx.database.get("waifu_relationships", { group_id, is_married: true });
  return rows.filter((row) => row.waifu_id !== null && (row.owner_id === user_id || row.waifu_id === user_id));
}
