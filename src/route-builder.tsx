import React, { Suspense } from "react"
import type { RouteObject } from "react-router"

type GlobTree = Record<string, () => Promise<{ default: React.ComponentType<any> }>>

interface RouteTreeItem {
  segment: string

  // 如果此项是页面文件 (非 _layout, 非 index)，则为其组件的懒加载器
  pageLoader?: () => Promise<{ default: React.ComponentType<any> }>

  children: Map<string, RouteTreeItem>

  indexLoader?: () => Promise<{ default: React.ComponentType<any> }>
  layoutLoader?: () => Promise<{ default: React.ComponentType<any> }>
}

const LazyLoadedComponent = (loader: () => Promise<{ default: React.ComponentType<any> }>) => {
  const LazyComp = React.lazy(loader)
  return (
    <Suspense>
      <LazyComp />
    </Suspense>
  )
}

export function buildGlobRoutes(globTree: GlobTree, basePath: string = "./pages"): RouteObject[] {
  const rootRouteTree: RouteTreeItem = { segment: "", children: new Map() }

  for (const filePath in globTree) {
    const loader = globTree[filePath]
    const normalizedPath = filePath.replace(basePath, "").replace(/\.tsx$/, "")
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
      // ([id] -> :id)
      const path = childNode.segment.replace(/\[(\w+)\]/g, ":$1")

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

// src/
// ├── App.tsx
// ├── utils/
// │   └── buildGlobRoutes.tsx
// └── pages/
//     ├── index.tsx                 // 对应 /
//     ├── about.tsx                 // 对应 /about
//     ├── blog/
//     │   ├── [slug]/
//     │   │   ├── index.tsx         // 对应 /blog/:slug
//     │   │   └── comments.tsx      // 对应 /blog/:slug/comments
//     └── dashboard/
//         ├── _layout.tsx           // 对应 /dashboard 的布局
//         ├── index.tsx             // 对应 /dashboard
//         ├── settings.tsx          // 对应 /dashboard/settings
//     └── users/
//         ├── index.tsx             // 对应 /users
//         └── [id].tsx              // 对应 /users/:id
