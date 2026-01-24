import type { Context } from "koishi";
import { h, Schema } from "koishi";
import {} from "koishi-plugin-cron";
import { renderDdcheckImage } from "./render";
import { getMedalList, getUserInfo } from "./services/bilibili";
import { getVtbList, updateVtbList } from "./services/vtb";
export const name = "ddcheck";
export const inject = ["renderer", "BiliBiliLogin", "BiliBiliSearch", "cron"];

export interface Config {}

export const Config: Schema<Config> = Schema.object({});

export function apply(ctx: Context) {
    ctx.cron("0 0 */3 * * *", async () => {
        await updateVtbList(ctx);
    });
    ctx.command("查成分 <name:text>", "查询B站用户关注的VTuber成分").action(async (_, name) => {
        if (!name) {
            return "请输入B站用户名或UID";
        }
        let uid: number | undefined = undefined;
        if (/^\d+$/.test(name)) {
            uid = Number(name);
        } else {
            uid = await ctx.BiliBiliSearch.getSearchRequestByType("bili_user", name).then((result) => {
                if (result?.data?.result?.length) {
                    return (result.data.result[0] as { mid: number }).mid;
                }
            });
        }
        if (!uid) {
            return `未找到名为 ${name} 的用户`;
        }
        let fetchedUserInfo;
        try {
            fetchedUserInfo = await getUserInfo(ctx, uid);
        } catch (error) {
            ctx.logger.error(`获取用户信息失败: ${error}`);
            return "获取用户信息失败，请检查名称或稍后再试";
        }
        const vtbList = await getVtbList(ctx);
        if (!vtbList.length) {
            return "获取VTB列表失败，请稍后再试";
        }
        const medalList = await getMedalList(ctx, uid);
        let image;
        try {
            image = await renderDdcheckImage(fetchedUserInfo, vtbList, medalList, ctx);
        } catch (error) {
            ctx.logger.error(`生成图片失败: ${error}`);
            return "生成图片失败，请稍后再试";
        }
        return h.image(image, "image/png");
    });
}
