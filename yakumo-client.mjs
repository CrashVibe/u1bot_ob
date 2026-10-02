/**
 * yakumo 3 兼容的 client 构建任务。
 *
 * 上游 `@koishijs/client/lib` 的 apply() 还是 yakumo 1 的写法：
 *   ctx.register('client', ...) + ctx.yakumo.argv
 * 而 yakumo 3 基于 cordis 4，Context 上已经没有 register 方法，
 * 命令注册不出来 —— 于是 `pipeline.build` 里的 client 步骤从未真正执行，
 * external/aichat 等插件的前端产物 dist/ 一直停留在旧版本。
 *
 * 这里保留 @koishijs/client 的构建逻辑，只把注册方式换成 yakumo 3 的 ctx.cli.command。
 */
import { resolve } from 'node:path'

export const inject = ['yakumo', 'cli']

export function apply(ctx) {
  ctx.cli
    .command('client [...packages]', 'Build client bundles with vite')
    .action(async ({ args }) => {
      await ctx.yakumo.initialize()
      const mod = await import('@koishijs/client/lib')
      const build = mod.build ?? mod.default.build
      const paths = ctx.yakumo.locate(args)
      for (const path of paths) {
        const meta = ctx.yakumo.workspaces[path]
        const deps = {
          ...meta.dependencies,
          ...meta.devDependencies,
          ...meta.peerDependencies,
          ...meta.optionalDependencies,
        }
        let config = {}
        if (meta.yakumo?.client) {
          const filename = resolve(ctx.yakumo.cwd + path, meta.yakumo.client)
          const exports = (await import(filename)).default
          if (typeof exports === 'function') {
            await exports()
            continue
          }
          config = exports
        } else if (!deps['@koishijs/client']) {
          continue
        }
        await build(ctx.yakumo.cwd + path, config)
      }
    })
}
