'use client'

import { ChangeEventHandler, FC, memo, useTransition } from 'react'
import { useRouter } from 'next/navigation'

const SidebarImport: FC = () => {
  const router = useRouter()
  // 优先级相关，可以在不阻塞UI的请求下，更新状态
  const [isPending, startTransition] = useTransition()

  const onChange: ChangeEventHandler<HTMLInputElement> = async (e) => {
    const fileInput = e.target
    if (!fileInput.files || fileInput.files.length === 0) {
      console.warn("files list is empty");
      return;
    }

    const file = fileInput.files[0];

    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        console.error("something went wrong");
        return;
      }

      const data = await response.json();

      startTransition(() => router.push(`/note/${data.uid}`))

      // 清除客户端的路由缓存
      startTransition(() => router.refresh())

    } catch (error) {
      console.error("something went wrong");
    }

    // 重置 file input
    e.target.type = "text";
    e.target.type = "file";
  }

  return (
    <div style={{ textAlign: 'center' }}>
      <label htmlFor="file" style={{ cursor: 'pointer' }}>Import .md File</label>
      <input 
        type="file" 
        id="file" 
        name="file" 
        style={{ position : "absolute", clip: "rect(0 0 0 0)" }} 
        onChange={onChange} 
      />

    </div>
  )
}

export default memo(SidebarImport)