import { useTitle } from "@/hooks/useTitle"
import { useCurrentApp } from "@/modules/app/useCurrentApp"

export default function Index() {
  const { app } = useCurrentApp()
  useTitle(`${app.id}`)

  return "hello " + app.id
}
