// export const revalidate = 1

// 动态函数实现动态渲染
// import { cookies } from "next/headers"

// export default async () => {

//   const cookieStore = cookies()
//   const token = cookieStore.get('aaa')

//   console.log(token)

//   const res = (await (await fetch('https://api.thecatapi.com/v1/images/search')).json())[0].url

//   return <img src={res} alt="" width={200} height={200} />
// }

// searchParams 动态渲染
// export default async function Page ({ searchParams }: {
//   searchParams: any
// }) {

//   const res = (await (await fetch('https://api.thecatapi.com/v1/images/search')).json())[0].url

//   return (
//     <>
//       <img src={res} alt="" width={200} height={200} />
//       {Date.now()}
//       <p>{JSON.stringify(searchParams)}</p>
//     </>
//   )
// }

export default async function Page () {

  const res = (await (await fetch('https://api.thecatapi.com/v1/images/search', {
    cache: 'no-store'
  })).json())[0].url

  return (
    <>
      <img src={res} alt="" width={200} height={200} />
      {Date.now()}
    </>
  )
}