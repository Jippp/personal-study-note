'use client'
import { FC, PropsWithChildren, memo, useState } from 'react'

const Template: FC<PropsWithChildren> = ({ children }) => {
  const [count, setCount] = useState(0)
  return (
    <>
      {children}
      <div>tempalte count: {count}</div>
      <button className='border-[1px] border-[red] p-[4px]' onClick={() => setCount(d => d += 1)}>template count + 1</button>
    </>
  )
}

export default memo(Template)