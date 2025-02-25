import useSharedWorker from "./worker/useSharedWorker"

function App() {

  useSharedWorker()

  return (
    <>
      111
      新版本更新内容：zzz
      {/* <button onClick={() => {
        console.log(import.meta.env.VITE_VERSION)
      }}>get version</button> */}
    </>
  )
}

export default App
