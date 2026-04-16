import { useSyncExternalStore } from 'react'

type PersistApi = {
  onFinishHydration: (fn: () => void) => () => void
  hasHydrated: () => boolean
}

export function useHydrated(store: { persist: PersistApi }): boolean {
  return useSyncExternalStore(
    (onStoreChange) => store.persist.onFinishHydration(onStoreChange),
    () => store.persist.hasHydrated(),
    () => true,
  )
}
