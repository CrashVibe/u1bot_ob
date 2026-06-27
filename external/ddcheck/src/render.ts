import path from "path";

import type { MedalItem, MedalInfo, UserInfo } from "./services/bilibili";
import type { VtbInfo } from "./services/vtb";
import {} from "@mrlingxd/koishi-plugin-renderer";
import type { Context } from "koishi";

export async function renderDdcheckImage(
  userInfo: UserInfo,
  vtbList: VtbInfo[],
  medalList: MedalItem[],
  ctx: Context
): Promise<Buffer> {
  const attentions: number[] = userInfo.attentions || [];
  const follows_num = Number(userInfo.attention) || 0;
  const attentionSet = new Set(attentions);
  const vtbDict: Record<number, VtbInfo> = {};
  for (const info of vtbList) vtbDict[Number(info.mid)] = info;
  const medalDict: Record<string, MedalItem> = {};
  for (const medal of medalList) medalDict[medal.target_name] = medal;
  const vtbs = Object.entries(vtbDict)
    .filter(([uid]) => attentionSet.has(Number(uid)))
    .map(([_, info]) => formatVtbInfo(info, medalDict));
  const vtbs_num = vtbs.length;
  const percent = follows_num ? (vtbs_num / follows_num) * 100 : 0;
  const num_per_col = vtbs_num ? Math.ceil(vtbs_num / Math.ceil(vtbs_num / 100)) : 1;
  const info = {
    name: userInfo.name,
    uid: userInfo.mid,
    face: userInfo.face,
    fans: userInfo.fans,
    follows: follows_num,
    percent: `${percent.toFixed(2)}% (${vtbs_num}/${follows_num})`,
    vtbs,
    num_per_col
  };
  const templateDir = path.resolve(__dirname, "templates");
  return await ctx.renderer.render_template(
    path.resolve(templateDir, "info.ejs"),
    { info: info },
    {
      width: 100,
      height: 100
    }
  );
}

interface VtbEntry {
  name: string;
  uid: number;
  medal?: { name: string; level: number; color_border: string; color_start: string; color_end: string };
}

function formatVtbInfo(info: VtbInfo, medalDict: Record<string, MedalItem>): VtbEntry {
  const name = info.uname;
  const uid = info.mid;
  let medal: VtbEntry["medal"];
  const medalInfo: MedalInfo | undefined = medalDict[name]?.medal_info;
  if (medalInfo) {
    medal = {
      name: medalInfo.medal_name,
      level: medalInfo.level,
      color_border: formatColor(medalInfo.medal_color_border),
      color_start: formatColor(medalInfo.medal_color_start),
      color_end: formatColor(medalInfo.medal_color_end)
    };
  }
  return { name, uid, medal };
}

function formatColor(color: number): string {
  return `#${color.toString(16).padStart(6, "0").toUpperCase()}`;
}
