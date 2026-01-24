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
