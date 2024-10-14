import { FC, memo } from 'react'

const Sercer: FC = () => {
  console.log('%cserver comp', 'color: red; font-size: 20px', );
  return (
    <>server component</>
  )
}

export default memo(Sercer)