import { readFile } from "fs/promises";
import path from "path";

import type { JsxRenderOptions, RenderOptions } from "./types";
import { render } from "ejs";
import type { Context } from "koishi";
import { Schema, Service } from "koishi";
import type { Browser } from "playwright";
import { chromium } from "playwright";
import type { ViteDevServer } from "vite";

export const name = "renderer";

export interface Config {}

export const Config: Schema<Config> = Schema.object({});

declare module "koishi" {
  interface Context {
    renderer: Renderer;
  }
}

export default class Renderer extends Service {
  private browser!: Browser;
  private viteServers = new Map<string, Promise<ViteDevServer>>();

  constructor(ctx: Context) {
    super(ctx, "renderer");
  }

  async start() {
    if (!this.browser) {
      this.browser = await chromium.launch({
        headless: true,
        args: [
          "--no-sandbox",
          "--disable-setuid-sandbox",
          "--disable-web-security",
          "--disable-site-isolation-trials",
          // 多个 --disable-features 只有最后一个生效，合并成一条逗号列表
          "--disable-features=StrictOriginIsolation,IsolateOrigins,OriginIsolation,BlockInsecurePrivateNetworkRequests,CrossOriginOpenerPolicy,CrossOriginEmbedderPolicy"
        ]
      });
    }
  }

  async stop() {
    if (this.browser) {
      await this.browser.close();
    }
    for (const promise of this.viteServers.values()) {
      const server = await promise;
      await server.close();
    }
    this.viteServers.clear();
  }

  /**
   * 渲染 EJS 模板
   */
  async render_template(
    template_path: string,
    props: object = {},
    viewport: { width: number; height: number },
    render_options: RenderOptions = {
      wait_time: 1000,
      type: "png",
      scale: 2
    }
  ): Promise<Buffer> {
    const template_str = await readFile(template_path, "utf-8");
    const content = await render(template_str, props, { async: true });
    return this._capture(content, `${path.dirname(template_path)}/`, viewport, render_options);
  }

  /**
   * 渲染 html 内容
   */
  async render_html(
    html_str: string,
    baseURL: string,
    viewport: { width: number; height: number },
    render_options: RenderOptions = {
      wait_time: 1000,
      type: "png",
      scale: 2
    }
  ): Promise<Buffer> {
    return this._capture(html_str, baseURL, viewport, render_options);
  }

  /**
   * 直接从 React 组件源码按需编译并渲染（通过 Vite 的 ssrLoadModule，无需预先 build）。
   * 源码变化会被 Vite 自身的文件监听自动失效缓存，无需重启即可生效。
   */
  async render_jsx(
    component_url: string,
    props: object = {},
    viewport: { width: number; height: number },
    render_options: RenderOptions = {
      wait_time: 1000,
      type: "png",
      scale: 2
    },
    jsx_options: JsxRenderOptions
  ): Promise<Buffer> {
    const server = await this._getViteServer(jsx_options.root, jsx_options.configFile);
    const [{ default: Component }, { createElement }, { renderToString }] = await Promise.all([
      server.ssrLoadModule(component_url),
      import("react"),
      import("react-dom/server")
    ]);
    const appHtml = renderToString(createElement(Component, props));

    const cssParts = await Promise.all([
      ...(jsx_options.cssFiles ?? []).map((file) => this._loadCssFile(file)),
      ...(jsx_options.cssUrls ?? []).map((url) => this._loadProcessedCss(server, url))
    ]);
    const css = cssParts.join("\n");

    const html_str = `<!doctype html>
<html>
  <head>
    <meta charset="UTF-8" />
    <style>${css}</style>
  </head>
  <body>
    <div id="app">${appHtml}</div>
  </body>
</html>`;

    return this._capture(html_str, jsx_options.baseURL ?? jsx_options.root, viewport, render_options);
  }

  // CSS 模块在 SSR transform 下不会导出处理后的内容（例如 Tailwind 编译结果），
  // 必须走客户端 transform 拿到注入用的 JS，再从中取出编译好的 CSS 文本
  private async _loadProcessedCss(server: ViteDevServer, url: string): Promise<string> {
    const result = await server.transformRequest(url);
    const match = result?.code.match(/const __vite__css = (".*")/s);
    if (!match) {
      throw new Error(`无法从 Vite 编译结果中提取 CSS: ${url}`);
    }
    const css = match[1];
    if (!css) throw new Error(`CSS match group is empty for: ${url}`);
    return JSON.parse(css);
  }

  private async _loadCssFile(cssFile: string): Promise<string> {
    const content = await readFile(cssFile, "utf-8");
    // Strip ?inline suffix from font URLs (Vite convention, unnecessary for file:// loading)
    return content.replace(/url\((["']?)([^"')]+)\?inline\1\)/g, "url($1$2$1)");
  }

  private _getViteServer(root: string, configFile?: string): Promise<ViteDevServer> {
    const key = configFile ?? root;
    let promise = this.viteServers.get(key);
    if (!promise) {
      promise = import("vite").then(({ createServer }) =>
        createServer({
          root,
          configFile,
          // hmr:false 不会阻止 Vite 监听默认的 HMR WebSocket 端口，
          // 多个插件各自起一个 Vite 实例时会互相抢占该端口，需要显式关闭 ws
          server: { middlewareMode: true, hmr: false, ws: false, watch: {} },
          appType: "custom"
        })
      );
      this.viteServers.set(key, promise);
    }
    return promise;
  }

  private async _capture(
    html_str: string,
    baseURL: string,
    viewport: { width: number; height: number },
    render_options: RenderOptions
  ): Promise<Buffer> {
    const page = await this.browser.newPage({
      viewport: { width: viewport.width, height: viewport.height }
    });

    // Intercept font file requests and serve from disk, avoiding CORS issues with setContent
    const fontsDir = path.join(baseURL, "fonts");
    const fontMimes: Record<string, string> = { woff2: "font/woff2", woff: "font/woff", ttf: "font/truetype" };
    await page.route(/\.(?:woff2|woff|ttf)(?:\?.*)?$/i, async (route) => {
      const segment = route.request().url().split("/").pop();
      if (!segment) { route.continue(); return; }
      const filename = segment.split("?")[0];
      if (!filename) { route.continue(); return; }
      try {
        const ext = path.extname(filename).slice(1).toLowerCase();
        await route.fulfill({
          body: await readFile(path.join(fontsDir, filename)),
          contentType: fontMimes[ext] ?? "application/octet-stream"
        });
      } catch {
        route.continue();
      }
    });

    await page.goto(`file://${baseURL}`);
    await page.setContent(html_str);
    await page.waitForTimeout(render_options.wait_time);

    // 内容比给定 viewport 矮时，<html> 仍会撑满 viewport 高度，
    // 截图前收缩到实际内容高度，避免出现多余的空白
    const contentHeight = await page.evaluate(() => document.body.scrollHeight);
    if (contentHeight < viewport.height) {
      await page.setViewportSize({ width: viewport.width, height: contentHeight });
    }

    const screenshotBuffer = await page.screenshot({
      type: render_options.type,
      quality: render_options.quality,
      fullPage: true
    });
    await page.close();
    return screenshotBuffer;
  }
}
