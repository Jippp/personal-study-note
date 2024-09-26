'use client'
import Link from 'next/link'
import { FC, PropsWithChildren, memo, useState } from 'react'

const Layout: FC<PropsWithChildren> = ({ children }) => {
  const [count, setCount] = useState(0)
  return (
    <div className='w-[200px] border-[1px] border-[#ccc] rounded-[4px]'>
      <div>
        <Link href='/about' className="w-[80px] h-[30px] p-[4px] border-[1px] border-[#ccc]">about</Link>
        <br />
        <Link href='/about/detail' className="w-[80px] h-[30px] p-[4px] border-[1px] border-[#ccc]">detail</Link>
      </div>
      {children}
      <div>layout count: {count}</div>
      <button className='border-[1px] border-[red] p-[4px]' onClick={() => setCount(d => d += 1)}>layout count + 1</button>
    </div>
  )
}

export default memo(Layout)