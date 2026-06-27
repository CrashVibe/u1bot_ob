import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

// https://vite.dev/config/
export default defineConfig({
  base: "./",
  plugins: [react()],
  // 覆盖根 tsconfig.json 中为 koishi 元素 (h.jsx) 配置的 jsxImportSource
  esbuild: { jsx: "automatic", jsxImportSource: "react" }
});
