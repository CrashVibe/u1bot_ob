import type { Context, Session } from "koishi";
import { h } from "koishi";
import moment from "moment-timezone";
import type { Config } from ".";

/**
 * 添加内容到回声洞
 * @param ctx 上下文
 * @param session 会话
 * @param config 配置
 * @param content 内容
 * @param anonymous 是否匿名
 * @returns
 */
export async function add_cave(ctx: Context, session: Session, config: Config, content: string, anonymous: boolean) {
  if (!content || !session.elements) {
    return "你输入了什么？一个......空气？\n请在投稿内容前加上“投稿”或“匿名投稿”";
  }
  if (!session.userId) {
    throw new Error("出现错误：会话中没有用户 ID");
  }
  const images = session.elements.filter((e) => e.type === "img");
  const result = check_save_content(content, images);
  if (result) {
    return result;
  }

  const need_coin = anonymous ? 400 : 200;

  if (!(await ctx.coin.hasEnoughCoin(session.userId, need_coin))) {
    return `${anonymous ? "匿名" : ""}投稿需要消耗 ${need_coin} 次元币，你只有 ${await ctx.coin.getCoin(
      session.userId
    )}，挣点再来吧！`;
  }
  let messages: h[] = [];
  for (const elem of session.elements) {
    switch (elem.type) {
      case "img":
        let url = elem.attrs.src;
        console.info("处理图片", url);
        try {
          let base64Data: string;
          if (url.startsWith("base64://")) {
            console.info("处理 base64 图片", url);
            base64Data = url.replace("base64://", "");
          } else if (url.startsWith("data:image/")) {
            console.info("处理 data:image 图片", url);
            base64Data = url.split(",")[1] || "";
          } else {
            console.info("处理普通图片", url);
            try {
              const res = await fetch(url);
              const buf = await res.arrayBuffer();
              base64Data = Buffer.from(buf).toString("base64");
            } catch {
              throw new Error("图片获取失败");
            }
          }
          if (!base64Data) {
            throw new Error("无效的图片数据");
          }
          messages.push(h.image("data:image/png;base64," + base64Data));
        } catch (e) {
          console.error("处理图片失败", e);
          return "图片处理失败，请确保图片格式正确。";
        }
        break;
      case "text":
        messages.push(elem);
        break;
    }
  }
  if (!messages[0]) {
    return "你输入了什么？一个......空气？\n请在投稿内容前加上“投稿”或“匿名投稿”";
  }
  messages[0].attrs.content = messages[0].attrs.content.replace(/^.*?\s/, "");
  const create_result = await ctx.database.create("cave", {
    content: messages.map((message) => message.toString()).join(""),
    user_id: session.userId,
    createdAt: new Date(),
    anonymous: false
  });
  await ctx.coin.adjustCoin(
    session.userId,
    -need_coin,
    `${anonymous ? "匿名投稿" : "回声洞投稿"} #${create_result.id}`
  );
  let content_part = `[${anonymous ? "匿名" : ""}投稿成功 #${create_result.id}]\n${create_result.content}`;
  content_part += `\n———————————\n投稿时间: ${moment(create_result.createdAt)
    .tz("Asia/Shanghai")
    .format("YYYY-MM-DD HH:mm:ss")}\n消耗次元币: ${need_coin} | 余额: ${await ctx.coin.getCoin(session.userId)}`;

  for (const manager of config.managers) {
    const { bot } = session;
    if (bot) {
      await bot.sendPrivateMessage(manager, `来自用户 ${session.userId} 的新回声洞投稿：\n${content_part}`);
    }
  }
  return content_part;
}

/**
 * 查看内容是否符合回声洞要求
 *
 * @param content 内容
 * @param images 图片列表
 * @returns 是否符合要求
 */
function check_save_content(content: string, images: Array<any>): string | null {
  if (images.length > 1) {
    return "呃，投稿只能包含一张图片诶~\n再斟酌一下你的投稿内容吧~";
  }
  if (content.length === 0 && images.length === 0) {
    return "你输入了什么？一个......空气？\n请在投稿内容前加上“投稿”或“匿名投稿”";
  }
  if (content.length < 6) {
    return "呃，投稿内容不得少于 6 个字哦~";
  }
  return null;
}
