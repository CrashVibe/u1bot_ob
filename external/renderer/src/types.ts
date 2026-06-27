/**
 * 页面选项
 */
export interface PageOptions {
  /**
   * 视窗大小
   */
  viewport: { width: number; height: number };
  /**
   * 基础 URL，用于解析相对路径
   */
  base_url: string;
}

/**
 * JSX 渲染选项
 */
export interface JsxRenderOptions {
  /**
   * Vite 项目根目录（用于解析 componentUrl 以及加载 configFile）
   */
  root: string;
  /**
   * Vite 配置文件路径
   */
  configFile?: string;
  /**
   * 需要内联到 <style> 中的 CSS 文件绝对路径列表（原样读取，不经过 Vite 处理）
   */
  cssFiles?: string[];
  /**
   * 需要内联到 <style> 中的 CSS 模块 URL 列表（相对 root，经 Vite 插件链处理，
   * 例如 Tailwind 等需要 PostCSS 编译的 CSS）
   */
  cssUrls?: string[];
  /**
   * 截图时用于解析相对资源路径的 base URL，默认为 root
   */
  baseURL?: string;
}

/**
 * 渲染选项
 */
export interface RenderOptions {
  /**
   * 等待时间
   */
  wait_time: number;
  /**
   * 类型
   */
  type: "png" | "jpeg";
  /**
   * 质量
   */
  quality?: number;
  /**
   * 缩放
   */
  scale: number;
}
