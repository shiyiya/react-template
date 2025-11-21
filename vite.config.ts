import react from '@vitejs/plugin-react'
import fs from 'node:fs'
import path from 'node:path'
import { defineConfig } from 'vite'

// import metaBuilderPlugin from "./meta-builder";

const chunk = {
  0: ['react', 'react-dom'],

  2: [
    'ofetch',
    '@tanstack/react-query',
    '@tanstack/react-query-persist-client',
    '@tanstack/query-sync-storage-persister'
  ],
  3: ['@xterm/xterm', '@xterm/addon-attach', '@xterm/addon-fit'],
  4: ['motion/react'],
  5: ['clsx', 'tailwind-merge'],
  6: ['lodash'],
  7: ['react-router']
}

//execSync("git rev-parse HEAD").toString().trim()
function getCommitHash() {
  const gitDir = path.resolve(__dirname, '.git')
  const headFile = path.join(gitDir, 'HEAD')

  if (!fs.existsSync(headFile)) return 'unknown'

  let head = fs.readFileSync(headFile, 'utf8').trim()

  if (head.startsWith('ref:')) {
    const ref = head.split(' ')[1]
    const refFile = path.join(gitDir, ref)
    if (fs.existsSync(refFile)) {
      head = fs.readFileSync(refFile, 'utf8').trim()
    }
  }
  return head
}

export default defineConfig({
  plugins: [
    react(),
    {
      name: 'print anything',
      configResolved() {
        console.log(process.env.NODE_ENV)
      }
    }
  ],
  define: {
    __DEV__: process.env.NODE_ENV == 'development',
    APP_ENV: JSON.stringify(process.env.APP_ENV) || '"dev"',
    GIT_COMMIT_SHA: JSON.stringify(getCommitHash())
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src')
    }
  },
  build: {
    target: 'ES2022',
    rollupOptions: {
      output: {
        assetFileNames: 'assets/[name].[hash:6][extname]',
        chunkFileNames: (chunkInfo) => {
          return chunkInfo.name.startsWith('vender/') ? '[name]-[hash].js' : 'assets/[name]-[hash].js'
        }, // manualChunks(id: string) {
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
        }
        // manualChunks: chunk
      }
    }
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
