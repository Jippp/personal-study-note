import { useEffect, useState, memo } from 'react'

export default (({ parentCount }) => {

  const [count, setCount] = useState(0)

  useEffect(() => {
    console.log('%c son effect', 'color: red; font-size: 20px', count, parentCount);
    return () => {
      console.log('%c son effect clear', 'color: red; font-size: 20px', count, parentCount);
    }
  }, [parentCount, count])

  useEffect(() => {
    console.log('%c son effect2', 'color: red; font-size: 20px', parentCount);
    return () => {
      console.log('%c son effect clear2', 'color: red; font-size: 20px', parentCount);
    }
  }, [parentCount])

  console.log('%c son render', 'color: red; font-size: 20px', );


  return (
    <>
      <p>son count: {count}</p>
      <p>parent count: {parentCount}</p>
      <button onClick={() => setCount(d => d + 1)}>son add</button>
    </>
  )
})
