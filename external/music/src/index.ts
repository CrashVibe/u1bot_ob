import type { Context } from "koishi";
import { Schema, h, Logger } from "koishi";

export const name = "@u1bot/koishi-plugin-music";
export const inject = ["http"];

const logger = new Logger("music");

export interface Config {
  sendSearchingText: boolean;
  metingApiBase: string;
  preferredPlatforms: Platform[];
  timeout: number;
}

export const Config: Schema<Config> = Schema.object({
  sendSearchingText: Schema.boolean().default(false).description("如果启用，则发送正在搜索中提示"),
  metingApiBase: Schema.string()
    .default("https://api-meting.wolfyang.fan/api")
    .description("Meting API 基础地址 / Meting API Base URL"),
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
    .description("优先搜索平台 / Preferred search platforms"),
  timeout: Schema.number().default(10000).description("请求超时时间(ms) / Request timeout (ms)")
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

interface MetingResult {
  name: string;
  artist: string;
  url: string;
  pic: string;
  lrc: string;
}

// 国际化文本
const translations = {
  zh: {
    "music.search-failed": "搜索音乐失败",
    "music.not-found": "未找到相关音乐",
    "music.error": "获取音乐信息时出错",
    "music.searching": "正在搜索音乐...",
    "music.found": "找到音乐：{0} - {1}",
    "music.usage": "使用方法：点歌 <歌曲名称>"
  },
  en: {
    "music.search-failed": "Failed to search music",
    "music.not-found": "No music found",
    "music.error": "Error occurred while fetching music",
    "music.searching": "Searching for music...",
    "music.found": "Found music: {0} - {1}",
    "music.usage": "Usage: music <song name>"
  }
};

// 官方 API 实现
const officialAPIs: Record<Platform, (ctx: Context, keyword: string) => Promise<Result[]>> = {
  async netease(ctx, keyword) {
    try {
      /*
      const text = await ctx.http.get('http://music.163.com/api/cloudsearch/pc', {
        params: { s: keyword, type: 1, offset: 0, limit: 5 },
        timeout: 10000
      })
      */

      // https://music.163.com/api/search/get/web?csrf_token=hlpretag=&hlposttag=&s=${encodeURIComponent(keyword)}&type=1&offset=0&total=true&limit=${limit}
      const text = await ctx.http.get("https://music.163.com/api/search/get/web", {
        params: {
          csrf_token: "hlpretag=",
          hlposttag: "",
          s: keyword,
          type: 1,
          offset: 0,
          total: "true",
          limit: 5
        },
        timeout: 10000
      });

      const data = JSON.parse(text);
      // if (data.code !== 200 || !data.result || data.result.songCount === 0) return []
      if (!data.result || !data.result?.songs || data.result?.songs.length === 0) return [];

      return data.result.songs.map((song: any) => ({
        type: "163",
        id: song.id.toString(),
        name: song.name,
        artist: song.artists.map((artist: any) => artist.name).join("/"),
        url: `https://music.163.com/#/song?id=${song.id}`,
        // url: `https://api.qijieya.cn/meting/?type=url&id=${song.id}`,
        album: song.album?.name || ""
        // image: song.album.artist.img1v1Url
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

      const data = JSON.parse(text);

      if (data.code != 0 || !data.data?.song || data.data.song.count === 0) return [];
      return data.data.song.itemlist.map((song: any) => ({
        type: "qq",
        id: song.id.toString(),
        name: song.name,
        artist: song.singer,
        url: `https://y.qq.com/n/ryqq/songDetail/${song.mid}`,
        album: song.album?.name || ""
      }));
    } catch (error) {
      logger.warn("QQ Music API failed:", error);
      return [];
    }
  },

  async qq2(ctx, keyword) {
    try {
      const text = await ctx.http.post("https://u.y.qq.com/cgi-bin/musicu.fcg", {
        comm: {
          ct: 11,
          cv: "1929"
        },
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

      const data = JSON.parse(text);
      const item = data.request?.data?.body?.item_song;

      // if (data.code != 0 || !data.data?.song || data.data.song.count === 0) return []
      return Array.isArray(item)
        ? item.map((song) => ({
            type: "qq",
            // id: song.id,
            name: song.title.replaceAll("<em>", "").replaceAll("</em>", ""),
            artist: song.singer.map((v) => v.name).join("/"),
            url: `https://y.qq.com/n/ryqq/songDetail/${song.mid}`,
            album: song.album?.name || ""
          }))
        : [];
    } catch (error) {
      logger.warn("QQ Music API failed:", error);
      return [];
    }
  },

  // 其他平台暂时返回空数组，因为官方 API 可能不稳定
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
  // 注册国际化
  ctx.i18n.define("zh", translations.zh);
  ctx.i18n.define("en", translations.en);

  // 使用 Meting API 搜索音乐
  async function searchByMeting(platform: Platform, keyword: string): Promise<Result[]> {
    try {
      const searchData = await ctx.http.get(config.metingApiBase, {
        params: {
          server: platform,
          type: "song",
          keyword: keyword
        },
        timeout: config.timeout
      });

      if (!Array.isArray(searchData) || searchData.length === 0) {
        return [];
      }

      // 获取第一首歌的详细信息
      const songId = searchData[0].id;
      const songUrl = `${config.metingApiBase}/song`;
      const songData: MetingResult = await ctx.http.get(songUrl, {
        params: {
          server: platform,
          type: "song",
          id: songId
        },
        timeout: config.timeout
      });

      return [
        {
          type: platform,
          id: songId,
          name: searchData[0].name || songData.name,
          artist: searchData[0].artist?.[0] || songData.artist,
          url: songData.url,
          album: searchData[0].album || ""
        }
      ];
    } catch (error) {
      logger.warn(`Meting API failed for ${platform}:`, error);
      return [];
    }
  }

  // 搜索音乐的主函数
  async function searchMusic(keyword: string): Promise<Result | null> {
    // 优先使用官方 API
    for (const platform of config.preferredPlatforms) {
      try {
        const officialResults = await officialAPIs[platform](ctx, keyword);

        if (officialResults && officialResults.length > 0) {
          logger.success(`Found music via official ${platform} API`);
          return officialResults[0];
        }
      } catch (error) {
        logger.warn(`Official ${platform} API failed:`, error);
      }
    }

    /* // 如果官方 API 都失败，使用 Meting API
    for (const platform of config.preferredPlatforms) {
      try {
        const metingResults = await searchByMeting(platform, keyword)

        logger.success(metingResults)

        if (metingResults && metingResults.length > 0) {
          logger.success(`Found music via Meting ${platform} API`)
          return metingResults[0]
        }
      } catch (error) {
        logger.warn(`Meting ${platform} API failed:`, error)
      }
    }*/

    return null;
  }

  // 注册点歌命令
  ctx
    .command("点歌 <keyword:text>")
    .alias("music")
    .usage("music.usage")
    .action(async ({ session }, keyword) => {
      if (!keyword?.trim()) {
        return session.text("music.usage");
      }

      // 如果启用，则发送搜索中提示
      if (config.sendSearchingText) {
        await session.send(session.text("music.searching"));
      }

      try {
        const result = await searchMusic(keyword.trim());

        if (!result) {
          return session.text("music.not-found");
        }

        // 发送找到音乐的提示
        // await session.send(session.text('music.found', [result.name, result.artist]))

        // 发送音乐卡片（OneBot 格式）
        const musicCard = h("onebot:music", {
          type: result.type,
          ...(result.id && result.id !== "" && { id: result.id }),
          url: result.url,
          audio: result.url,
          title: result.name,
          content: result.artist,
          image:
            result.image || `https://via.placeholder.com/300x300/1e88e5/ffffff?text=${encodeURIComponent(result.name)}`
        });

        return musicCard;
      } catch (error) {
        logger.error("Music search error:", error);
        return session.text("music.error");
      }
    });
}
