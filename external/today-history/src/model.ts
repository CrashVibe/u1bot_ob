export interface TodayHistoryEvent {
  year: string;
  title: string;
  festival: string;
  link: string;
  type: "death" | "birth" | "event";
  desc: string;
  cover: boolean;
  recommend: boolean;
  pic_calender?: string;
  pic_share?: string;
  pic_index?: string;
}

/**
 * 历史卡片 React 组件的 props，供 templates/App.tsx 与 src/index.ts 共用，
 * 避免 src/index.ts 直接 import 一个 .tsx 文件（src 的 tsconfig 未配置 jsx）
 */
export interface HistoryAppProps {
  events: TodayHistoryEvent[];
  theme?: "light" | "dark";
  currentDate?: string;
}
