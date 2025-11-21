import { ofetch } from "ofetch"
import { toast } from "sonner"
import { getEnv } from "@/store/env"
import { has } from "lodash"

export const apiFetch = ofetch.create({
  credentials: "include",
  retry: false,

  onRequest: ({ options, request }) => {
    if (
      ["/es"].some((key) => request.toString().includes(key)) &&
      getEnv() == "prod" &&
      (APP_ENV == "prod" || __DEV__)
    ) {
      options.baseURL = "/_"
    }

    if (request.toString().startsWith("/es")) {
      return
    }

    const token = `SSO.token`

    if (token) {
      const header = new Headers(options.headers)
      header.set(`SSO.headerKey`, token)
      options.headers = header
    }
  },

  onResponse({ response, request }) {
    if (request.toString().startsWith("/es")) {
      return
    }

    const rawData = response._data

    if (+rawData.code == 403) {
      // SSO.clean();
      // window.location.href = getLoginUrl();
      return
    }

    if (has(rawData, "code") && rawData.code != 200) {
      const msg = rawData.message || rawData.msg || `code: ${rawData.code}`
      toast.error(msg, { id: msg })
      throw Error(msg)
    }
    if (rawData.data?.message) {
      toast.info(rawData.data?.message)
    }

    if (rawData.data?.error) {
      toast.error(rawData.data.error, { id: rawData.data.error })
    }
  },

  onResponseError({ response }) {
    if (response.status === 401) {
    }
  },
})
