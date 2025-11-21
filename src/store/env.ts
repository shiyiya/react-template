import { create } from "zustand"
import { persist, createJSONStorage } from "zustand/middleware"

type Store = {
  env: typeof APP_ENV
  setEnv: (e: typeof APP_ENV) => void
}

export const useEnvStore = create(
  persist<Store>(
    (set, get) => ({
      env: APP_ENV || "dev",
      setEnv: (e: typeof APP_ENV) => set({ env: e }),
    }),
    {
      name: "app-env",
      storage: createJSONStorage(() => localStorage),
    },
  ),
)

export const getEnv = () => useEnvStore.getState().env
