import { notFound } from 'next/navigation'
import { FC, memo } from 'react'

const getData: () => Promise<string> = async() => {
  return await new Promise((resolve) => setTimeout(() => {
    resolve(Math.random() > 0.5 ? 'ji' : '')
  }, 1000))
}

const User: FC = async () => {
  const userName = await getData()
  if(!userName) notFound()
  return (
    <>
      <h1>User page.</h1>
      <div className='font-bold'>userName: {userName}</div>
      <div className='h-[30px] p-[4px] border-[1px] border-[#ccc] rounded-[6px]'>refresh userName</div>
    </>
  )
}

export default memo(User)