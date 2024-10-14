'use client'
import { useRouter } from "next/navigation";

export default function Home() {
  const route = useRouter()
  return (
    <div>
      <button className=" border-[1px] m-[6px]" onClick={() => route.push('/server')}>server</button>
      <button className=" border-[1px] m-[6px]" onClick={() => route.push('/client')}>client</button>
    </div>
  )
}
