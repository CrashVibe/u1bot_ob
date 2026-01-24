import { render } from "ejs";
import { readFile } from "fs/promises";
import type { Context } from "koishi";
import { Schema, Service } from "koishi";
import path from "path";
import type { Browser } from "playwright";
import { chromium } from "playwright";
import type { RenderOptions } from "./types";

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
                    "--disable-features=StrictOriginIsolation",
                    "--disable-features=IsolateOrigins",
                    "--disable-web-security",
                    "--disable-site-isolation-trials",
                    "--disable-features=BlockInsecurePrivateNetworkRequests",
                    "--disable-features=CrossOriginOpenerPolicy",
                    "--disable-features=CrossOriginEmbedderPolicy",
                    "--disable-features=OriginIsolation",
                    "--disable-features=Strict-Origin-Isolation",
                    "--disable-features=StrictOriginWhenCrossOrigin"
                ]
            });
        }
    }

    async stop() {
        if (this.browser) {
            await this.browser.close();
        }
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
        const page = await this.browser.newPage({
            viewport: { width: viewport.width, height: viewport.height }
        });
        await page.goto(`file://${path.dirname(template_path)}/`);
        await page.setContent(content);
        await page.waitForTimeout(render_options.wait_time);
        const screenshotBuffer = await page.screenshot({
            type: render_options.type,
            quality: render_options.quality,
            fullPage: true
        });
        await page.close();
        return screenshotBuffer;
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
        const page = await this.browser.newPage({
            viewport: { width: viewport.width, height: viewport.height }
        });
        await page.goto(`file://${baseURL}`);
        await page.setContent(html_str);
        await page.waitForTimeout(render_options.wait_time);
        const screenshotBuffer = await page.screenshot({
            type: render_options.type,
            quality: render_options.quality,
            fullPage: true
        });
        // await page.close();
        return screenshotBuffer;
    }
}
