import type { Context } from "koishi";
import { Schema } from "koishi";

export const name = "menu";

export interface Config {}

export const Config: Schema<Config> = Schema.object({});

export async function apply(ctx: Context) {
  ctx
    .command("菜单")
    .alias("menu")
    .action(async () => {
      return "使用文档：\nhttps://u1.crashvibe.cn/intro\n请复制该链接到浏览器查看";
    });
}
