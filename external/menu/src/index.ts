import { readFileSync } from "node:fs";
import * as path from "node:path";

import type { Context } from "koishi";
import { h, Schema } from "koishi";

export const name = "menu";

const DEFAULT_TEXT = "查看姚奕主页的 QQ 频道二维码，扫码加入频道后即可查询～";

// 内置二维码随插件一起发，避免依赖外链
let qrcode: Buffer | null = null;
try {
  qrcode = readFileSync(path.resolve(__dirname, "../resource/qrcode.webp"));
} catch {
  qrcode = null;
}

export interface Config {
  text?: string;
  image?: string;
}

export const Config: Schema<Config> = Schema.object({
  text: Schema.string().default(DEFAULT_TEXT).description("菜单回复的文字"),
  image: Schema.string().description("可选：覆盖内置二维码的图片地址")
});

export async function apply(ctx: Context, config: Config) {
  ctx
    .command("菜单")
    .alias("menu")
    .action(async () => {
      const text = config.text?.trim() || DEFAULT_TEXT;
      if (config.image) {
        return [text, h.image(config.image)];
      }
      if (qrcode) {
        return [text, h.image(qrcode, "image/webp")];
      }
      return text;
    });
}
