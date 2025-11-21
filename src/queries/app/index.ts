import { apiFetch } from "@/lib/api-fetch"
import { useQuery } from "@tanstack/react-query"

export const useAppById = (appId?: string | null) =>
  useQuery<any | null>({
    enabled: !!appId,
    queryKey: ["app", { appId }],
    queryFn: async () => {
      const res = await apiFetch(`/api/app/getAppById/${appId}`)
      return res.data
    },
  })
