/*
  const useStore = create(({ set }) => ({
    count: 0,
    changeCount: () => set({ count++ })  
  }))
*/
import { useSyncExternalStore } from 'react'

export const create = (creator) => {
  const api = createStore(creator)

  const useSomeStore = (selector) =>  useStore(selector, api)

  return useSomeStore
}

function createStore(creator) {
  let state
  let listeners = new Set()

  const setState = (newState) => {
    if(!Object.is(newState, state)) {
      const prevState = state
      state = newState

      // 有更新执行订阅的函数
      listeners.forEach(listener => listener(state, prevState))
    }
  }
  const getState = () => {
    return state
  }
  const subscribe = (listener) => {
    listeners.add(listener)
  }

  // 初始化state
  state = creator(setState, getState, api);

  return { setState, getState, subscribe, state }
}

function useStore(selector, api) {
  const getState = () => {
    return selector ? selector(api.getState()) : api.getState()
  }
  return useSyncExternalStore(api.subscribe, getState)
}
