import { Outlet } from "react-router"
import { AppLayout } from "../../modules/app/Layout"

export default () => (
  <AppLayout>
    <Outlet />
  </AppLayout>
)
