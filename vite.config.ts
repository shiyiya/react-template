import react from "@vitejs/plugin-react"
import fs from "node:fs"
import path from "node:path"
import { defineConfig } from "vite"

// import metaBuilderPlugin from "./meta-builder";

const chunk = {
  0: ["react", "react-dom"],

  1: ["monaco-editor", "monaco-editor", "yaml", "@monaco-editor/react"],

  10: ["antd", "@ant-design/icons"],

  11: ["@ant-design/plots", "@antv/g2", "@antv/component"],

  2: [
    "ofetch",
    "@tanstack/react-query",
    "@tanstack/react-query-persist-client",
    "@tanstack/query-sync-storage-persister",
  ],
  3: [
    "@xterm/xterm",
    "@xterm/addon-attach",
    "@xterm/addon-fit",
    "@xterm/addon-search",
    "@xterm/addon-webgl",
  ],
  4: ["motion/react", "motion"],
  5: ["clsx", "tailwind-merge", "copy-to-clipboard", "toggle-selection"],
  6: ["lodash-es"],
  7: ["react-router"],
  9: ["recharts"],
}

//execSync("git rev-parse HEAD").toString().trim()
function getCommitHash() {
  const gitDir = path.resolve(__dirname, ".git")
  const headFile = path.join(gitDir, "HEAD")

  if (!fs.existsSync(headFile)) return "unknown"

  let head = fs.readFileSync(headFile, "utf8").trim()

  if (head.startsWith("ref:")) {
    const ref = head.split(" ")[1]
    const refFile = path.join(gitDir, ref)
    if (fs.existsSync(refFile)) {
      head = fs.readFileSync(refFile, "utf8").trim()
    }
  }

  return head
}

const APP_ENV = process.env.APP_ENV || "gprod"

const EnvKey = {
  dev: "-dev",
  gprod: "-g",
  prod: "",
}[APP_ENV]

const IS_GPROD = APP_ENV === "gprod"

// 沿静态 import 链向上追溯，统计模块被多少个 chunk 入口（主入口或被动态 import 的模块）共享
function countSharedRoots(
  id: string,
  getModuleInfo: (id: string) => {
    isEntry: boolean
    dynamicImporters: readonly string[]
    importers: readonly string[]
  } | null,
): number {
  const roots = new Set<string>()
  const visited = new Set<string>()
  const stack = [id]
  while (stack.length) {
    const mod = stack.pop()!
    if (visited.has(mod)) continue
    visited.add(mod)
    const info = getModuleInfo(mod)
    if (!info) continue
    if (info.isEntry || info.dynamicImporters.length > 0) {
      roots.add(mod)
    }
    for (const importer of info.importers) stack.push(importer)
  }
  return roots.size
}

export default defineConfig({
  plugins: [
    react(),
    {
      name: "print anything",
      configResolved() {
        console.log(process.env)
      },
    },
  ],
  define: {
    __DEV__: process.env.NODE_ENV == "development",
    APP_ENV: JSON.stringify(APP_ENV),
    GIT_COMMIT_SHA: JSON.stringify(getCommitHash()),
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
      lodash: "lodash-es",
    },
  },
  build: {
    target: "ES2020",
    rollupOptions: {
      output: {
        assetFileNames: "assets/[name].[hash:6][extname]",
        chunkFileNames: (chunkInfo) => {
          return chunkInfo.name.startsWith("vender/")
            ? "[name]-[hash].js"
            : "assets/[name]-[hash].js"
        },
        // manualChunks(id: string) {
        //   if (id.indexOf('node_modules') !== -1) {
        //     const basic = id.toString().split('node_modules/')[1];
        //     const sub1 = basic.split('/')[0];
        //     if (sub1 !== '.pnpm') {
        //       return sub1.toString();
        //     }
        //     const name2 = basic.split('/')[1];
        //     return name2.split('@')[name2[0] === '@' ? 1 : 0].toString();
        //   }
        // }
        manualChunks: (id: string, { getModuleInfo }) => {
          const moduleInfo = getModuleInfo(id)
          if (moduleInfo?.dynamicImporters?.length && moduleInfo?.importers?.length) {
            return null
          }

          // 将 Vite 内部的 preload helper 放到独立 chunk，
          // 避免它被 Rollup 合入 monaco 等大 vendor chunk，导致首页加载时就拉取整个编辑器
          if (id.includes("preload-helper")) {
            return "vendor/preload"
          }

          // 被多个 chunk 入口共享的 src 模块自动归入 common，避免拆成大量碎文件；
          // 只被单一入口使用的模块仍由 Rollup 内联进对应 chunk，无需维护目录清单
          if (
            id.includes("/src/") &&
            !id.includes("node_modules") &&
            countSharedRoots(id, getModuleInfo) > 2
          ) {
            return "common"
          }

          // if (id.includes("/node_modules/rc-")) {
          //   return `vendor/rc`;
          // }

          const matchedDep = Object.entries(chunk).find(([_, dep]) => {
            return dep.some((d) => {
              const pattern = `/node_modules/${d}/`
              return id.includes(pattern) && !id.includes(`${pattern}node_modules/`)
            })
          })

          if (matchedDep) {
            return `vendor/${matchedDep[0]}`
          }

          return null
        },
        // manualChunks: chunk
      },
    },
  },
  server: {
    hmr: true,
    host: true,
    port: 4391,
    watch: {
      ignored: ['**/dist/**', '**/out/**', '**/public/**', '.git/**']
    },
    cors: true,
    proxy: {
      '/api': {
        target: 'http://aliwl-sw529.eng.t-head.cn:31029/app-mgmt/v1',
        rewrite: (path) => path.replace(/^\/api/, '')
      }
    }
  }
})
