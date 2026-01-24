import { SendFetch } from "koishi-plugin-bilibili-login/lib/API/BiliBiliAPI";
import type { Context } from "koishi";

const PAGE_SIZE = 50;

export interface UserBasicInfo {
    name: string;
    face: string;
    follower: number;
    following: number;
}

interface API_CONFIG {
    name: string;
    url: string;
    max_pages: number;
    priority: number;
}

const API_CONFIGS: API_CONFIG[] = [
    {
        name: "biligame",
        url: "https://line3-h5-mobile-api.biligame.com/game/center/h5/user/relationship/following_list",
        max_pages: 200,
        priority: 1
    },
    {
        name: "app.biliapi.net",
        url: "https://app.biliapi.net/x/v2/relation/followings",
        max_pages: 5,
        priority: 2
    }
];

export class BiliBiliUserAPI extends SendFetch {
    public async getUserMedals(uid: number): Promise<any[]> {
        const url = "https://api.live.bilibili.com/xlive/web-ucenter/user/MedalWall";
        const params = new URLSearchParams({ target_id: uid.toString() });
        const response = await this.sendGet(url, params, this.returnBilibiliHeaders());
        if (response.ok) {
            const data = await response.json();
            if (data.code === 0) {
                return data.data.list || [];
            }
        }
        return [];
    }

    public async getUserBasicInfo(uid: number): Promise<UserBasicInfo> {
        const defaultInfo = {
            name: `用户${uid}`,
            face: "",
            follower: 0,
            following: 0
        };

        // 主API请求：获取完整信息
        try {
            const url = "https://api.bilibili.com/x/web-interface/card";
            const params = new URLSearchParams({ mid: uid.toString() });
            const response = await this.sendGet(url, params, this.returnBilibiliHeaders());
            console.info(`请求用户信息: ${url}?${params.toString()}`);
            if (response.ok) {
                const data = await response.json();
                if (data.code === 0) {
                    const { name, face, fans: follower, attention: following } = data.data?.card || {};
                    return {
                        name: name || defaultInfo.name,
                        face: face || defaultInfo.face,
                        follower: follower || defaultInfo.follower,
                        following: following || defaultInfo.following
                    };
                }
                this.logger.warn("主API获取用户信息失败:", data.message || `错误码 ${data.code}`);
            }
        } catch (e) {
            this.logger.warn("主API请求异常:", e);
        }

        // 备用API请求：补充关注数
        try {
            const url = "https://app.biliapi.net/x/v2/relation/followings ";
            const params = new URLSearchParams({
                vmid: uid.toString(),
                pn: "1",
                ps: "1"
            });
            const response = await this.sendGet(url, params, this.returnBilibiliHeaders());

            if (response.ok) {
                const data = await response.json();
                if (data.code === 0) {
                    defaultInfo.following = data.data?.total || 0;
                } else {
                    this.logger.warn("备用API获取关注数失败:", data.message || `错误码 ${data.code}`);
                }
            }
        } catch (e) {
            this.logger.warn("备用API请求异常:", e);
        }

        return defaultInfo;
    }

    public async getUserFollowings(ctx: Context, uid: number): Promise<number[]> {
        const sortedApis = API_CONFIGS.slice().sort((a, b) => (a.priority ?? 999) - (b.priority ?? 999));
        let bestResult: number[] = [];
        let bestApiName: string | undefined;

        for (const api of sortedApis) {
            try {
                ctx.logger.debug(`尝试使用 ${api.name} API获取用户${uid}的关注列表`);
                const followings = await this.fetchAllFollowings(ctx, uid, api);
                if (!followings.length) {
                    continue;
                }

                this.logger.info(`${api.name} API成功获取${followings.length}个关注`);
                if (followings.length > bestResult.length) {
                    [bestResult, bestApiName] = [followings, api.name];
                }
                if ((api.name === "biligame" && followings.length > 1000) || followings.length >= 500) {
                    break;
                }
            } catch (e) {
                this.logger.warn(`${api.name} API失败: ${e}`);
            }
        }

        if (bestResult.length && bestApiName) {
            this.logger.info(`最终选择${bestApiName} API的结果，获取${bestResult.length}个关注`);
        } else {
            this.logger.error(`所有API都失败，无法获取用户${uid}的关注列表`);
        }

        return bestResult;
    }

    async fetchAllFollowings(ctx: Context, uid: number, apiConfig: API_CONFIG): Promise<number[]> {
        let followings: number[] = [];
        let page = 1,
            consecutiveFailures = 0;
        const maxConsecutiveFailures = 3;

        while (page <= apiConfig.max_pages && consecutiveFailures < maxConsecutiveFailures) {
            try {
                const params = new URLSearchParams({
                    vmid: uid.toString(),
                    pn: page.toString(),
                    ps: PAGE_SIZE.toString()
                });
                const response = await this.sendGet(apiConfig.url, params, this.returnBilibiliHeaders());
                if (!response.ok) {
                    throw new Error(`HTTP错误: ${response.status}`);
                }

                const data = await response.json();
                if (data.code !== 0) {
                    throw new Error(data.message || `API错误码: ${data.code}`);
                }

                const pageList = data.data?.list || [];
                if (!pageList.length) {
                    this.logger.info(`${apiConfig.name} API第${page}页无数据，可能已获取完毕`);
                    break;
                }

                const pageFollowings = pageList.map((user: any) => Number(user.mid));
                followings.push(...pageFollowings);
                consecutiveFailures = 0;

                ctx.logger.debug(`${apiConfig.name} API第${page}页获取${pageFollowings.length}个关注`);
                if (pageFollowings.length < PAGE_SIZE) {
                    ctx.logger.debug(`${apiConfig.name} API第${page}页数据不满，认为已获取完毕`);
                    break;
                }
                page++;
            } catch (e) {
                consecutiveFailures++;
                ctx.logger.warn(`${apiConfig.name} API第${page}页异常: ${e}`);
                if (consecutiveFailures >= maxConsecutiveFailures) {
                    ctx.logger.error(`${apiConfig.name} API连续异常${consecutiveFailures}次，停止请求`);
                    break;
                }
                page++;
            }
        }
        return followings;
    }
}

export interface UserInfo {
    mid: string;
    name: string;
    face: string;
    fans: number;
    attention: number;
    attentions: number[];
}

export async function getUserInfo(ctx: Context, uid: number): Promise<UserInfo> {
    const sendFetch = new BiliBiliUserAPI(await ctx.BiliBiliLogin.getBilibiliAccountData());

    const defaultBasicInfo: UserBasicInfo = {
        name: `用户${uid}`,
        face: "",
        follower: 0,
        following: 0
    };
    let basic_info: UserBasicInfo = defaultBasicInfo;
    let followings: number[] = [];

    const [basicResult, followsResult] = await Promise.all([
        sendFetch.getUserBasicInfo(uid),
        sendFetch.getUserFollowings(ctx, uid)
    ]);

    basic_info = basicResult ?? defaultBasicInfo;
    followings = followsResult ?? [];

    return {
        mid: String(uid),
        name: basic_info.name,
        face: basic_info.face,
        fans: basic_info.follower,
        attention: basic_info.following ?? followings.length,
        attentions: followings
    };
}

export async function getMedalList(ctx: Context, uid: number): Promise<any[]> {
    const sendFetch = new BiliBiliUserAPI(await ctx.BiliBiliLogin.getBilibiliAccountData());
    return await sendFetch.getUserMedals(uid);
}
