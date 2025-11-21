import { PersistQueryClientProvider } from "@tanstack/react-query-persist-client"
import { RouterProvider } from "react-router"
import { Toaster } from "sonner"
import { persistConfig, queryClient } from "./lib/api-client"
import { router } from "./router"

import dayjs from "dayjs"
import "dayjs/locale/zh-cn"
import { NuqsAdapter } from "nuqs/adapters/react-router/v7"

dayjs.locale("zh-cn")

export default function () {
  return (
    <>
      <Toaster position="top-center" expand richColors />

      <PersistQueryClientProvider persistOptions={persistConfig} client={queryClient}>
        <NuqsAdapter>
          <RouterProvider router={router} />
        </NuqsAdapter>
      </PersistQueryClientProvider>
    </>
  )
}
