import { useEffect, useState } from 'react'
import Son from './son'

export default () => {

  const [count, setCount] = useState(0)

  useEffect(() => {
    console.log('%c parent effect', 'color: red; font-size: 20px', count);
    return () => {
      console.log('%c parent effect clear', 'color: red; font-size: 20px', count);
    }
  }, [count])

  console.log('%c parent render', 'color: red; font-size: 20px', );

  return (
    <>
      <p>parent: {count}</p>
      <button onClick={() => setCount(d => d + 1)}>parent add</button>

      <Son parentCount={count} />
    </>
  )
}
