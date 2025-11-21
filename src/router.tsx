import { createBrowserRouter } from "react-router"
import { ErrorElement } from "./components/common/ErrorElement"
import { buildGlobRoutes } from "./route-builder"

const globTree = import.meta.glob(["./pages/**/*.tsx"])

//TODO: build with vite
const tree = buildGlobRoutes(globTree as any)

export const router = createBrowserRouter([
  {
    path: "/",
    children: tree,
    errorElement: <ErrorElement />,
  },
])
