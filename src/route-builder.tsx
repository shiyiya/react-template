import NProgress from "nprogress"
import "nprogress/nprogress.css"
import React, { Suspense, useEffect } from "react"
import type { RouteObject } from "react-router"

// 基于文件系统的路由约定：
// pages/
// ├── index.tsx                  -> /
// ├── about.tsx                  -> /about
// ├── blog/
// │   └── [slug]/
// │       ├── index.tsx          -> /blog/:slug
// │       └── comments.tsx       -> /blog/:slug/comments
// ├── dashboard/
// │   ├── _layout.tsx            -> /dashboard 及其子路由的布局
// │   ├── index.tsx              -> /dashboard
// │   └── settings.tsx           -> /dashboard/settings
// ├── app/
// │   └── (image)/               -> 分组目录，不参与 URL
// │       └── dockerfile.tsx     -> /app/dockerfile
// ├── users/
// │   └── [id].tsx               -> /users/:id
// └── docs/
//     └── [...slug].tsx          -> /docs/* (catch-all)

type PageLoader = () => Promise<{ default: React.ComponentType<any> }>

type GlobTree = Record<string, PageLoader>

interface RouteTreeItem {
  segment: string

  // 如果此项是页面文件 (非 _layout, 非 index)，则为其组件的懒加载器
  pageLoader?: PageLoader

  children: Map<string, RouteTreeItem>

  indexLoader?: PageLoader
  layoutLoader?: PageLoader
}

// (image) 形式的目录为分组目录，不参与 URL 路径
const isGroupSegment = (segment: string) => /^\(.+\)$/.test(segment)

// 文件路径段 -> 路由路径段（[...slug] -> *，[id] -> :id）
const segmentToPath = (segment: string) =>
  segment.replace(/\[\.{3}\w+\]/g, "*").replace(/\[(\w+)\]/g, ":$1")

// 路由懒加载期间显示顶部进度条：挂载时开始，加载完成（卸载）时结束
NProgress.configure({ showSpinner: false })

const RouteProgress = () => {
  useEffect(() => {
    NProgress.start()
    return () => {
      NProgress.done()
    }
  }, [])
  return null
}

const LazyLoadedComponent = (loader: PageLoader) => {
  const LazyComp = React.lazy(loader)
  return (
    <Suspense fallback={<RouteProgress />}>
      <LazyComp />
    </Suspense>
  )
}

export function buildGlobRoutes(globTree: GlobTree, basePath: string = "./pages"): RouteObject[] {
  const rootRouteTree: RouteTreeItem = { segment: "", children: new Map() }

  for (const filePath in globTree) {
    const loader = globTree[filePath]
    const normalizedPath = (
      filePath.startsWith(basePath) ? filePath.slice(basePath.length) : filePath
    ).replace(/\.tsx$/, "")
    const segments = normalizedPath.split("/").filter(Boolean)

    let currentNode = rootRouteTree

    for (let i = 0; i < segments.length; i++) {
      const segment = segments[i]

      if (i === segments.length - 1) {
        // filename
        if (segment === "index") {
          currentNode.indexLoader = loader
        } else if (segment === "_layout") {
          currentNode.layoutLoader = loader
        } else {
          // path about.tsx, settings.tsx, [id].tsx
          if (!currentNode.children.has(segment)) {
            currentNode.children.set(segment, { segment, children: new Map() })
          }
          const pageNode = currentNode.children.get(segment)!
          pageNode.pageLoader = loader
        }
      } else {
        if (!currentNode.children.has(segment)) {
          currentNode.children.set(segment, { segment, children: new Map() })
        }
        currentNode = currentNode.children.get(segment)!
      }
    }
  }

  function buildChildrenRoutes(node: RouteTreeItem): RouteObject[] {
    const routes: RouteObject[] = []

    const childrenNodes = Array.from(node.children.values())

    childrenNodes.sort((a, b) => {
      const isADynamic = a.segment.startsWith("[")
      const isBDynamic = b.segment.startsWith("[")

      // 静态路由优先于动态路由
      if (!isADynamic && isBDynamic) return -1
      if (isADynamic && !isBDynamic) return 1

      return a.segment.localeCompare(b.segment)
    })

    if (node.indexLoader) {
      routes.push({
        index: true,
        element: LazyLoadedComponent(node.indexLoader),
      })
    }

    for (const childNode of childrenNodes) {
      // 分组目录 (image) 不生成路径段，直接把子路由提升到当前层级
      // 例如 /app/(image)/dockerfile -> /app/dockerfile
      if (isGroupSegment(childNode.segment)) {
        routes.push(...buildChildrenRoutes(childNode))
        continue
      }

      const path = segmentToPath(childNode.segment)

      const route: RouteObject = {
        path: path,
        element: childNode.pageLoader ? LazyLoadedComponent(childNode.pageLoader) : undefined,
      }

      const nestedChildren = buildChildrenRoutes(childNode)
      if (nestedChildren.length > 0) {
        route.children = nestedChildren
      }

      routes.push(route)
    }

    // 分组目录拍平后可能产生同名路由（如 (a)/foo.tsx 与 (b)/foo.tsx），开发期警告
    if (import.meta.env.DEV) {
      const seen = new Set<string>()
      for (const route of routes) {
        const key = route.index ? "<index>" : (route.path ?? "")
        if (seen.has(key)) {
          console.warn(`[route-builder] 检测到重复路由 "${key}"，请检查分组目录或同名文件冲突`)
        }
        seen.add(key)
      }
    }

    if (node.layoutLoader) {
      const layoutRoute: RouteObject = {
        path: "",
        element: LazyLoadedComponent(node.layoutLoader),
        children: routes,
      }
      return [layoutRoute]
    }

    return routes
  }

  return buildChildrenRoutes(rootRouteTree)
}
