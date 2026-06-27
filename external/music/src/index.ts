import type { Context } from "koishi";
import { Schema, h, Logger } from "koishi";

export const name = "@u1bot/koishi-plugin-music";
export const inject = ["http"];

const logger = new Logger("music");

export interface Config {
  sendSearchingText: boolean;
  preferredPlatforms: Platform[];
}

export const Config: Schema<Config> = Schema.object({
  sendSearchingText: Schema.boolean().default(false).description("如果启用，则发送正在搜索中提示"),
  preferredPlatforms: Schema.array(
    Schema.union([
      Schema.const("netease" as const).description("网易云音乐 / NetEase Music"),
      Schema.const("qq" as const).description("QQ 音乐 / QQ Music"),
      Schema.const("qq2" as const).description("QQ 音乐备用 / QQ Music Lite"),
      Schema.const("xiami" as const).description("虾米音乐 / Xiami Music"),
      Schema.const("kugou" as const).description("酷狗音乐 / Kugou Music"),
      Schema.const("kuwo" as const).description("酷我音乐 / Kuwo Music"),
      Schema.const("baidu" as const).description("百度音乐 / Baidu Music")
    ])
  )
    .default(["netease", "qq"])
    .description("优先搜索平台 / Preferred search platforms")
});

type Platform = "netease" | "qq" | "qq2" | "xiami" | "kugou" | "kuwo" | "baidu";

interface Result {
  type: string;
  id?: string;
  name: string;
  artist: string;
  url: string;
  album: string;
  image?: string;
}

const placeholderImage = (name: string) =>
  `https://via.placeholder.com/300x300/1e88e5/ffffff?text=${encodeURIComponent(name)}`;

const MUSIC_SIGN_URL = "https://ss.xingzhige.com/music_card/card";

const signMusicTypes: Record<string, string> = {
  "163": "163",
  netease: "163",
  qq: "qq",
  qq2: "qq",
  kugou: "kugou",
  kuwo: "kuwo"
};

async function signMusicCard(ctx: Context, result: Result): Promise<string> {
  const musicType = signMusicTypes[result.type];
  const payload =
    musicType && result.id
      ? { type: musicType, id: result.id }
      : {
          type: "custom",
          url: result.url,
          audio: result.url,
          title: result.name,
          singer: result.artist,
          image: result.image || placeholderImage(result.name)
        };

  const jsonPayload = await ctx.http.post<string>(MUSIC_SIGN_URL, payload, {
    headers: {
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
      Referer: "https://ss.xingzhige.com/"
    }
  });

  // 签名服务偶尔会返回纯文本错误（如歌曲信息获取失败）而不是 Ark JSON，
  // 不能原样转发给 light_app，否则客户端会显示卡片解析异常
  try {
    JSON.parse(jsonPayload);
  } catch {
    throw new Error(`音乐卡片签名服务返回异常内容: ${jsonPayload}`);
  }
  return jsonPayload;
}

const translations = {
  zh: {
    "music.not-found": "未找到相关音乐",
    "music.error": "获取音乐信息时出错",
    "music.searching": "正在搜索音乐...",
    "music.usage": "使用方法：点歌 <歌曲名称>",
    "music.unsupported-platform": "当前平台不支持发送音乐卡片"
  },
  en: {
    "music.not-found": "No music found",
    "music.error": "Error occurred while fetching music",
    "music.searching": "Searching for music...",
    "music.usage": "Usage: music <song name>",
    "music.unsupported-platform": "Music cards are not supported on this platform"
  }
};

const supportedPlatforms = new Set(["onebot", "milky"]);

interface NeteaseSearchResponse {
  result?: {
    songs?: { id: number; name: string; artists: { name: string }[]; album?: { name?: string } }[];
  };
}

interface QQSmartboxResponse {
  code: number;
  data?: { song?: { itemlist?: { id: number; name: string; singer: string; mid: string }[] } };
}

interface QQ2SearchResponse {
  request?: {
    data?: { body?: { item_song?: { title: string; singer: { name: string }[]; mid: string }[] } };
  };
}

const officialAPIs: Record<Platform, (ctx: Context, keyword: string) => Promise<Result[]>> = {
  async netease(ctx, keyword) {
    try {
      const text = await ctx.http.get("https://music.163.com/api/search/get/web", {
        params: { csrf_token: "hlpretag=", hlposttag: "", s: keyword, type: 1, offset: 0, total: "true", limit: 5 },
        timeout: 10000
      });

      const data: NeteaseSearchResponse = JSON.parse(text);
      if (!data.result?.songs?.length) return [];

      return data.result.songs.map((song) => ({
        type: "163",
        id: song.id.toString(),
        name: song.name,
        artist: song.artists.map((artist) => artist.name).join("/"),
        url: `https://music.163.com/#/song?id=${song.id}`,
        album: song.album?.name || ""
      }));
    } catch (error) {
      logger.warn("NetEase API failed:", error);
      return [];
    }
  },

  async qq(ctx, keyword) {
    try {
      const text = await ctx.http.get("https://c.y.qq.com/splcloud/fcgi-bin/smartbox_new.fcg", {
        params: { key: keyword, format: "json" },
        timeout: 10000
      });

      const data: QQSmartboxResponse = JSON.parse(text);
      if (data.code != 0 || !data.data?.song?.itemlist?.length) return [];

      return data.data.song.itemlist.map((song) => ({
        type: "qq",
        id: song.id.toString(),
        name: song.name,
        artist: song.singer,
        url: `https://y.qq.com/n/ryqq/songDetail/${song.mid}`,
        album: ""
      }));
    } catch (error) {
      logger.warn("QQ Music API failed:", error);
      return [];
    }
  },

  async qq2(ctx, keyword) {
    try {
      const text = await ctx.http.post("https://u.y.qq.com/cgi-bin/musicu.fcg", {
        comm: { ct: 11, cv: "1929" },
        request: {
          module: "music.search.SearchCgiService",
          method: "DoSearchForQQMusicLite",
          param: {
            search_id: "83397431192690042",
            remoteplace: "search.android.keyboard",
            query: keyword,
            search_type: 0,
            num_per_page: 10,
            page_num: 1,
            highlight: 1,
            nqc_flag: 0,
            page_id: 1,
            grp: 1
          }
        },
        timeout: 10000
      });

      const data: QQ2SearchResponse = JSON.parse(text);
      const item = data.request?.data?.body?.item_song;
      if (!item) return [];

      return item.map((song) => ({
        type: "qq",
        name: song.title.replaceAll("<em>", "").replaceAll("</em>", ""),
        artist: song.singer.map((v) => v.name).join("/"),
        url: `https://y.qq.com/n/ryqq/songDetail/${song.mid}`,
        album: ""
      }));
    } catch (error) {
      logger.warn("QQ Music API failed:", error);
      return [];
    }
  },

  async xiami() {
    return [];
  },
  async kugou() {
    return [];
  },
  async kuwo() {
    return [];
  },
  async baidu() {
    return [];
  }
};

export function apply(ctx: Context, config: Config) {
  ctx.i18n.define("zh", translations.zh);
  ctx.i18n.define("en", translations.en);

  async function searchMusic(keyword: string): Promise<Result | null> {
    for (const platform of config.preferredPlatforms) {
      try {
        const results = await officialAPIs[platform](ctx, keyword);
        if (results.length > 0) {
          logger.success(`Found music via official ${platform} API`);
          return results[0];
        }
      } catch (error) {
        logger.warn(`Official ${platform} API failed:`, error);
      }
    }
    return null;
  }

  ctx
    .command("点歌 <keyword:text>")
    .alias("music")
    .usage("music.usage")
    .action(async ({ session }, keyword) => {
      if (!keyword?.trim()) {
        return session.text("music.usage");
      }

      if (config.sendSearchingText) {
        await session.send(session.text("music.searching"));
      }

      try {
        const result = await searchMusic(keyword.trim());
        if (!result) {
          return session.text("music.not-found");
        }

        if (!supportedPlatforms.has(session.platform)) {
          return session.text("music.unsupported-platform");
        }

        if (session.platform === "milky") {
          try {
            const jsonPayload = await signMusicCard(ctx, result);
            return h("milky:light-app", { appName: "com.tencent.music.lua", jsonPayload });
          } catch (error) {
            logger.warn("Music card signing failed:", error);
            return session.text("music.error");
          }
        }

        return h("onebot:music", {
          type: result.type,
          ...(result.id && { id: result.id }),
          url: result.url,
          audio: result.url,
          title: result.name,
          content: result.artist,
          image: result.image || placeholderImage(result.name)
        });
      } catch (error) {
        logger.error("Music search error:", error);
        return session.text("music.error");
      }
    });
}
