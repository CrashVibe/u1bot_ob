import { renderToString } from "@vue/server-renderer";
import { createApp } from "./main";

export async function render(props: any) {
  const { app } = createApp(props, true);
  const html = await renderToString(app, {});
  return { html };
}
