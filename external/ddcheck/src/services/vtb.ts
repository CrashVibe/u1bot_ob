import type { Context } from "koishi";
import axios from "axios";
import path from "path";
import fsa from "fs/promises";

export interface VtbInfo {
    mid: number;
    uname: string;
    [key: string]: any;
}

const VTB_LIST_URLS = [
    "https://api.vtbs.moe/v1/short",
    "https://cfapi.vtbs.moe/v1/short",
    "https://hkapi.vtbs.moe/v1/short",
    "https://kr.vtbs.moe/v1/short"
];

export async function updateVtbList(ctx: Context): Promise<void> {
    const vtbList: VtbInfo[] = [];
    for (const url of VTB_LIST_URLS) {
        try {
            const resp = await axios.get(url, { timeout: 20000 });
            const result = resp.data;
            if (!Array.isArray(result) || !result.length) {
                continue;
            }
            for (const info of result) {
                if (info.uid && info.uname) {
                    vtbList.push({
                        mid: Number(info.uid),
                        uname: info.uname,
                        ...info
                    });
                } else if (info.mid && info.uname) {
                    vtbList.push(info);
                }
            }
            break;
        } catch (e: any) {
            if (e.code === "ECONNABORTED") {
                console.warn(`Get ${url} timeout`);
            } else {
                console.warn(`Error when getting ${url}, ignore`, e);
            }
        }
    }
    await dumpVtbList(ctx, vtbList);
}

function getVtbListPath(ctx: Context): string {
    return path.join(ctx.baseDir, "data", "ddcheck", "vtb_list.json");
}

export async function loadVtbList(ctx: Context): Promise<VtbInfo[]> {
    const VTB_LIST_PATH = getVtbListPath(ctx);
    try {
        await fsa.access(VTB_LIST_PATH);
        const raw = await fsa.readFile(VTB_LIST_PATH, "utf-8");
        return JSON.parse(raw);
    } catch (e) {
        if ((e as NodeJS.ErrnoException).code !== "ENOENT") {
            console.warn("vtb列表解析错误，将重新获取");
            try {
                await fsa.unlink(VTB_LIST_PATH);
            } catch {}
        }
        return [];
    }
}

export async function dumpVtbList(ctx: Context, vtbList: VtbInfo[]): Promise<void> {
    const VTB_LIST_PATH = getVtbListPath(ctx);
    await fsa.mkdir(path.dirname(VTB_LIST_PATH), { recursive: true });
    await fsa.writeFile(VTB_LIST_PATH, JSON.stringify(vtbList, null, 4), "utf-8");
}

export async function getVtbList(ctx: Context): Promise<VtbInfo[]> {
    let vtbList = await loadVtbList(ctx);
    if (!vtbList.length) {
        await updateVtbList(ctx);
        vtbList = await loadVtbList(ctx);
    }
    return vtbList;
}
