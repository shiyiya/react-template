import { Button } from "antd"
import { type PropsWithChildren } from "react"
import { Link, useParams } from "react-router"

export function AppLayout({ children }: PropsWithChildren) {
  const { appId } = useParams()
  // const { data: app } = useAppById(appId)

  return (
    <>
      <div className="sticky inset-x-0 top-0 z-10 w-full border-b border-[#e6eaedad]">
        <div className="bg-white">
          <div className="flex h-14 items-center justify-between gap-8 px-4">
            <div className="flex items-center gap-4">
              <div className="relative">
                <Link
                  className="logo bg-size-[100% 100%] block h-[25px] w-[123px] invert dark:bg-white"
                  aria-label="Home"
                  to="/app"
                />
                <span className="absolute bottom-[-15px] left-[33%] text-xs font-light text-slate-100">
                  {GIT_COMMIT_SHA.slice(0, 7).toUpperCase()}
                </span>
              </div>
              {/* <AppLauncher /> */}

              {/* {app && <AppSelector app={app!} />} */}
            </div>

            <div className="flex items-center gap-3">
              <Link to="/app/approvals">
                <Button color="default" variant="link">
                  审批中心
                </Button>
              </Link>

              {!appId && (
                <Link to="/app/createOrUpdate">
                  <Button type={!appId ? "primary" : "default"}>新建应用</Button>
                </Link>
              )}
              {/* {app && <PublishButton app={app!} />} */}
            </div>
          </div>
        </div>
      </div>

      <div className="min-h-[calc(100vh-57px)] px-8 py-6">{children}</div>

      <footer className="py-8">
        <div className="mx-auto max-w-7xl px-4">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div className="mb-6 flex items-center gap-3 md:mb-0">
              <span className="font-semibold text-gray-700">APP-NAME</span>
            </div>
            <ul className="flex flex-wrap gap-4">
              <li>
                <Button size="small" type="link" className="text-gray-700">
                  登出
                </Button>
              </li>
            </ul>
          </div>

          <div className="mt-8 text-center text-sm text-gray-400">LESS IS MORE.</div>
          <div className="text-center text-sm text-gray-400">&copy; respect copyright.</div>
        </div>
      </footer>
    </>
  )
}
