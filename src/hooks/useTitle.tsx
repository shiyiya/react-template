import { isProduct } from "@/utils/env"
import { useEffect, useRef } from "react"

const APP_NAME: string = "T-ONE"

const titleTemplate = `%s | ${APP_NAME}${!isProduct ? ` - ${APP_ENV.toUpperCase()}` : ""}`

export const useTitle = (title?: string | null) => {
  const currentTitleRef = useRef(document.title)
  useEffect(() => {
    if (!title) return
    document.title = titleTemplate.replace("%s", title).replace("t-one", "T-ONE")
    return () => {
      document.title = currentTitleRef.current
    }
  }, [title])
}
