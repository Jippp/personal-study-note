import { FC, memo, PropsWithChildren } from 'react'
import { useStore } from './context'

const Son = memo(() => {
  const inner = useStore(store => store.inner)
  const changeInner = useStore(store => store.changeInner)

  console.log('%c inner render', 'color: red; font-size: 20px;', );

  return (
    <>
      <p>{inner.a}</p>
      <button onClick={() => {
        changeInner({
          a: '234'
        })
      }}>change inner</button>
    </>
  )
})

const Middle: FC<PropsWithChildren> = memo(({ children }) => {
  const middle = useStore(store => store.middle)
  const changeMiddle = useStore(store => store.changeMiddle)

  console.log('%c middle render', 'color: red; font-size: 20px;', );

  return (
    <>
      <p>{middle.a}</p>
      <button onClick={() => {
        changeMiddle({a: '123'})
      }}>change middle</button>
      {children}
    </>
  )
})

const Demo: FC = () => {
  return (
    <>
      父级节点
      <Middle>
        <Son />
      </Middle>
    </>
  )
}

export default memo(Demo)