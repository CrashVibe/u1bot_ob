import { hydrateRoot } from "react-dom/client";

import App, { type AppProps } from "./App";

declare global {
  interface Window {
    __INITIAL_STATE__?: AppProps;
  }
}

const initialState: AppProps = window.__INITIAL_STATE__ || {
  currentDate: "2026年6月18日",
  theme: "light",
  events: [
    {
      year: "1969",
      title: "阿波罗11号登月",
      festival: "",
      link: "",
      type: "event",
      desc: "美国宇航员尼尔·阿姆斯特朗成为第一个踏上月球表面的人类。",
      cover: false,
      recommend: true
    },
    {
      year: "1898",
      title: "居里夫人发现镧系元素镭",
      festival: "",
      link: "",
      type: "birth",
      desc: "玛丽·居里与皮埃尔·居里宣布发现新元素镭，开创了放射性研究的新时代。",
      cover: false,
      recommend: false
    },
    {
      year: "1916",
      title: "某位历史人物逝世",
      festival: "",
      link: "",
      type: "death",
      desc: "这是一段示例描述文字，用于在本地预览时展示卡片排版效果。",
      cover: false,
      recommend: false
    }
  ]
};

delete window.__INITIAL_STATE__;

hydrateRoot(document.getElementById("app")!, <App {...initialState} />);
