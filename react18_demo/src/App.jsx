import { useEffect, useState, useSyncExternalStore, useTransition } from 'react'

// const list = [
//   { name: 'Aav', key: '1' },
//   { name: 'Abb', key: '7' },
//   { name: 'Acc', key: '8' },
//   { name: 'Bee', key: '2' },
//   { name: 'Cee', key: '3' },
//   { name: 'Dee', key: '4' },
//   { name: 'Eee', key: '5' },
//   { name: 'Eff', key: '6' }
// ]

// const getResult = (target) => {
//   return new Promise(resolve => {
//     setTimeout(() => {
//       resolve(list.filter(item => item.name.includes(target.toLowerCase())))
//     }, 1000)
//   })
// }

// function App() {

//   const [search, setSearch] = useState('')
//   const [result, setResult] = useState([])
//   const [isPending, startTransition] = useTransition()

//   const handleSearch = (e) => {
//     const target = e.target.value
//     console.log('%ce', 'color: red; font-size: 20px', e);
//     startTransition(() => {
//       setResult(() => {
//         return list.filter(item => item.name.includes(target.toLowerCase()))
//       })
//     })
//     debugger
//     setSearch(target)
//   }

//   return (
//     <>
//       <input type="text" value={search} onChange={handleSearch} />
//       {
//         isPending ? 'loading...' : (
//           <ul>
//             {result.map(item => <li key={item.name}>{item.name}</li>)}
//           </ul>
//         )
//       }
//     </>
//   )
// }

// export default App

// export default () => {
//   const [count, setCount] = useState(0)
//   const [isPending, startTransition] = useTransition()

//   useEffect(() => {
//     console.log('%c count', 'color: red; font-size: 20px', count);
//   }, [count])
  
//   return (
//     <>
//       {count}
//       <button onClick={() => {
//         console.log('%c click', 'color: red; font-size: 20px', count);
//         setCount(d => d + 1)
//         // startTransition(() => {
//         // })
//       }}>add</button>

//       <button onClick={() => {
//         console.log('%c slow click', 'color: red; font-size: 20px', count);
//         startTransition(() => {
//           let now = Date.now()
//           while(Date.now() - now < 2000) {
//           }
//           setCount(d => d + 1)
//         })
//       }}>batch add</button>
//     </>
//   )
// }

const getSnapshot = () => {
  return navigator.onLine;
}
const subscribe = (callback) => {
  window.addEventListener('online', callback)
  window.addEventListener('offline', callback)
  return () => {
    window.removeEventListener('online', callback)
    window.removeEventListener('offline', callback)
  }
}
export default () => {
  const isOnline = useSyncExternalStore(subscribe, getSnapshot)
  return <h1>{isOnline ? "✅ Online" : "❌ Disconnected"}</h1>;
}
