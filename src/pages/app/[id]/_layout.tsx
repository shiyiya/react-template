import { useAppById } from "@/queries/app"
import { useEnvStore } from "@/store/env"
import { Menu } from "antd"
import { isUndefined } from "lodash"
import { useMemo } from "react"
import { Link, Outlet, useLocation, useParams } from "react-router"

export default function () {
  const { pathname, search } = useLocation()

  const path = pathname.match(/\/\w+\/\d+\/(.+)/)?.[1] || "."

  const { appId } = useParams()
  const { data: app } = useAppById(appId)
  const { env } = useEnvStore()

  const context = useMemo(() => ({ app, env }), [env, app])

  const items = useMemo(() => {
    const base = [
      {
        key: ".",
        icon: "App",
        label: <Link to={{ pathname: ".", search: search }}>概述</Link>,
      },
    ]

    return base
  }, [search, env, app])

  return (
    <div className="container mx-auto">
      <div className="relative flex w-full gap-2">
        <div className="sticky top-[81px] h-full w-[164px] [&_.ant-menu]:!border-e-[0px] [&_.anticon]:!text-lg">
          <Menu
            className="h-full [&_.ant-menu-item-icon]:size-5 [&_.ant-menu-item]:flex [&_.ant-menu-item]:items-center"
            selectedKeys={[path]}
            items={items}
          />
        </div>

        <div className="flex-1">
          {useMemo(() => {
            if (isUndefined(app)) return

            if (!app) return "404"

            return <Outlet context={context} />
          }, [context])}
        </div>
      </div>
    </div>
  )
}
