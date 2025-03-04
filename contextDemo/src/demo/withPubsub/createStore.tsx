import { createContext, FC, PropsWithChildren, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'
import PubSub from 'pubsub-js'
import { useImmer, Updater } from 'use-immer'
import { isEqual } from 'lodash'
import { useMemoizedFn } from 'ahooks'

const useForceRender = () => {
  const [_, setRender] = useState(false)
  
  const forceRender = useCallback(() => {
    setRender(d => !d)
  }, [])
  
  return forceRender
}

function createStore<T>(defaultStore: T) {
  const CTX_KEY = Symbol()

  type Store = {
    getStore: () => T,
    dispatch: Updater<T>
  }

  const ctx = createContext<Store>({
    getStore: () => defaultStore,
    dispatch: () => void 0,
  })

  const Provider: FC<PropsWithChildren> = ({ children }) => {
    const [store, updateStore] = useImmer(defaultStore)

    // 2. 每次store变化，都需要重新发布该事件
    useEffect(() => {
      PubSub.publish(CTX_KEY)
    }, [store])

    const getStore = useMemoizedFn(() => store)

    // 1. 这里传两个函数引用而不是store，避免了store变化导致的组件重渲染
    const pStore = useMemo(() => ({
      getStore,
      dispatch: updateStore,
    }), [getStore, updateStore])

    return <ctx.Provider value={pStore}>{children}</ctx.Provider>
  }

  const useDispatch = () => {
    return useContext(ctx).dispatch
  }

  const useSelector = (selector: (props: T) => any) => {
    const forceRender = useForceRender()
    const { getStore } = useContext(ctx)
    const selectorRef = useRef(selector)
    const prevStoreRef = useRef(getStore())

    selectorRef.current = selector
    prevStoreRef.current = selector(getStore())

    const isUpdate = useCallback(() => {
      // 4. 等到store变化会执行该函数，取到新值，和闭包的旧值对比
      const newStore = selectorRef.current(getStore())
      if(!isEqual(newStore, prevStoreRef.current)) {
        forceRender()
      }
    }, [getStore, forceRender])

    useEffect(() => {
      // 3. 使用useSelector取值时，订阅事件，去判断是否需要更新当前组件
      const token = PubSub.subscribe(CTX_KEY, isUpdate)
      return () => {
        PubSub.unsubscribe(token)
      }
    }, [isUpdate])

    return prevStoreRef.current
  }

  return {
    Provider, useDispatch, useSelector
  }
}

export default createStore
