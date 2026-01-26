import { createApp as createCSRApp, createSSRApp } from "vue";
import App from "./App.vue";

export function createApp(props?: any, isSSR = false) {
  const app = isSSR ? createSSRApp(App, props) : createCSRApp(App, props);
  return { app };
}
