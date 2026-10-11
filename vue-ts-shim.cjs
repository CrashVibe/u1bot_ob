/**
 * Vue 的 SFC 编译器要靠 TypeScript 的 JS API（sys / resolveModuleName）解析 defineProps<导入的类型>，
 * 而本仓库的 typescript 是 7（原生版）：require 出来只有版本号存根，于是开发模式下控制台报
 * “No fs option provided to compileScript”。这里把 vue 默认注册的加载器换成 typescript-js
 * （typescript@5 的 npm 别名，只给 Vue 工具链用）；tsc 仍走原生版，缺这个 devDependency 就退回原来的报错。
 */
let hasJsApi = false
try {
  hasJsApi = typeof require('typescript').sys !== 'undefined'
} catch {}

if (!hasJsApi) {
  try {
    // register-ts.js 只在 vue/compiler-sfc 首次加载时跑，所以先加载它，再覆盖
    require('vue/compiler-sfc')
  } catch {}
  try {
    require('@vue/compiler-sfc').registerTS(() => require('typescript-js'))
  } catch {}
}
