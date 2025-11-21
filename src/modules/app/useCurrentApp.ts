import { useOutletContext } from "react-router"
//@ts-ignore
import type { App } from "../../types/app"

export type CurrentAppData = {
  app: App._
  env: string
}

export const useCurrentApp = () => useOutletContext<CurrentAppData>()
