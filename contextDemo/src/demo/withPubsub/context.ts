import createStore from "./createStore";

interface DefaultCtx {
  outer: Record<string, any>;
  inner: Record<string, any>;
  middle: Record<string, any>;
}

const defaultCtx: DefaultCtx = {
  outer: {  },
  inner: { a: 'inner' },
  middle: { a: 'middle' },
}

export const { Provider, useDispatch, useSelector } = createStore(defaultCtx)
