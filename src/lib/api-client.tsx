import { createAsyncStoragePersister } from "@tanstack/query-async-storage-persister"
import type { OmitKeyof } from "@tanstack/react-query"
import { QueryClient } from "@tanstack/react-query"
import type { PersistQueryClientOptions } from "@tanstack/react-query-persist-client"
import { FetchError } from "ofetch"

const defaultStaleTime = 600_000 // 10min
const DO_NOT_RETRY_CODES = new Set([400, 401, 403, 404, 422])

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retryDelay: 1000,
      staleTime: defaultStaleTime,
      retry(failureCount, error) {
        console.error(error)
        if (
          error instanceof FetchError &&
          (error.statusCode === undefined || DO_NOT_RETRY_CODES.has(error.statusCode))
        ) {
          return false
        }

        return !!(3 - failureCount)
      },
      // throwOnError: import.meta.env.DEV,
    },
  },
})

const localStoragePersister = createAsyncStoragePersister({
  storage: window.localStorage,
  key: "MGMT_QUERY_PERSIST_KEY",
})

declare module "@tanstack/react-query" {
  interface Meta {
    queryMeta: { persist?: boolean }
  }

  interface Register extends Meta {}
}

export const persistConfig: OmitKeyof<PersistQueryClientOptions, "queryClient"> = {
  persister: localStoragePersister,
  // 7 day
  maxAge: 1 * 24 * 60 * 60 * 1000,
  dehydrateOptions: {
    shouldDehydrateQuery: (query) => {
      if (__DEV__) return false
      if (query.meta?.persist) return true
      return false
    },
  },
}
