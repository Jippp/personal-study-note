import { create } from 'zustand'

interface DefaultCtx {
  inner: Record<string, any>;
  middle: Record<string, any>;
  changeInner: (newStore: Record<string, any>) => void,
  changeMiddle: (newStore: Record<string, any>) => void
}

export const useStore = create<DefaultCtx>((set) => ({
  inner: { a: 'inner' },
  middle: { a: 'middle' },
  // updateInner: (key: string, newVal: any) => set({ inner: { [key]: newVal } }),
  changeInner: (newInner: Record<string, any>) => set({ inner: newInner }),
  changeMiddle: (newMiddle: Record<string, any>) => set({ middle: newMiddle }),
}))
