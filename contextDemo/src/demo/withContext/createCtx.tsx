import { FC, PropsWithChildren, createContext, useContext } from 'react'
import { Updater, useImmer } from 'use-immer'

function createCtx<T>(initStore: T) {

  type CtxType = typeof initStore
  type Store = {
    store: CtxType,
    dispatch: Updater<CtxType>
  }

  const ctx = createContext({
    store: initStore,
    dispatch: () => void 0
  } as Store)

  const Provider: FC<PropsWithChildren> = ({children}) => {

    const [store, updateSotre] = useImmer(initStore)

    return (
      <ctx.Provider value={{
        store,
        dispatch: updateSotre
      }}>{children}</ctx.Provider>
    )
  }

  const useCtx = () => {
    return useContext(ctx)
  }

  return [Provider, useCtx] as const
}

export default createCtx;