import { FC, memo, PropsWithChildren } from 'react'
import { Provider, useDispatch, useSelector } from './context'

const Son = memo(() => {
  const { inner } = useSelector(store => ({ inner: store.inner }))
  const dispatch = useDispatch()

  console.log('%c inner render', 'color: red; font-size: 20px;', );

  return (
    <>
      <p>{inner.a}</p>
      <button onClick={() => {
        dispatch(d => {
          d.inner.a = '234'
        })
      }}>change inner</button>
    </>
  )
})

const Middle: FC<PropsWithChildren> = memo(({ children }) => {
  const { middle } = useSelector(store => ({ middle: store.middle }))
  const dispatch = useDispatch()

  console.log('%c middle render', 'color: red; font-size: 20px;', );

  return (
    <>
      <p>{middle.a}</p>
      <button onClick={() => {
        dispatch(d => {
          d.middle.a = '123'
        })
      }}>change middle</button>
      {children}
    </>
  )
})

const Demo: FC = () => {
  return (
    <Provider>
      父级节点
      <Middle>
        <Son />
      </Middle>
    </Provider>
  )
}

export default memo(Demo)