import type { Context } from "koishi";
import { Random, Schema } from "koishi";

import answers from "../resource/answers.json";
export const name = "answersbook";

export interface Config {}

export const Config: Schema<Config> = Schema.object({});

export function apply(ctx: Context) {
  ctx.command("答案之书 <question>", "获取答案之书中的内容").action(async ({ session }, question) => {
    if (!session) {
      throw new Error("会话对象不存在");
    }
    if (!question) {
      return "如果问题是空气的话，答案就是水";
    }
    if (question.trim() === "答案之书") {
      return "答案之书的答案，真是一个有趣的问题";
    }
    // 不引用/复述用户的问题：QQ 会把带敏感词的引用算成机器人的“违规发言”
    return Random.pick(answers);
  });
}
