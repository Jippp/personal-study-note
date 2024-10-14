"use client"

import { FC, memo, useEffect } from 'react'

const Client: FC = () => {
  console.log('%cclient comp', 'color: red; font-size: 20px', );

  useEffect(() => {
    console.log('%clocation.pathname', 'color: red; font-size: 20px', location.pathname);
  }, [])

  return (
    <>Client Component</>
  )
}

export default memo(Client)