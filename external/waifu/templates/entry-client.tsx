import { hydrateRoot } from "react-dom/client";

import Graph, { type GraphProps } from "./Graph";

declare global {
  interface Window {
    __INITIAL_STATE__?: GraphProps;
  }
}

const initialState: GraphProps = window.__INITIAL_STATE__ || {
  nodes: [
    { id: "1", name: "群友A", x: 500, y: 400 },
    { id: "2", name: "群友B", x: 900, y: 400 },
    { id: "3", name: "群友C", x: 700, y: 700 }
  ],
  edges: [
    { x1: 500, y1: 400, x2: 900, y2: 400 },
    { x1: 700, y1: 700, x2: 500, y2: 400 },
    { x1: 700, y1: 700, x2: 900, y2: 400 }
  ]
};

delete window.__INITIAL_STATE__;

hydrateRoot(document.getElementById("app")!, <Graph {...initialState} />);
