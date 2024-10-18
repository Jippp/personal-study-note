'use server'

import { redirect } from 'next/navigation'
import {addNote, updateNote, delNote} from '@/lib/redis';
import { revalidatePath } from 'next/cache'

export async function saveNote(formData: FormData) {

  const noteId = formData.get('noteId') as string | undefined
  const title = formData.get('title')
  const body = formData.get('body')

  const data = JSON.stringify({
    title,
    content: body,
    updateTime: new Date()
  })
  let toRedirectId = noteId

  if (noteId) {
    updateNote(noteId, data)
  } else {
    const res = await addNote(data)
    toRedirectId = res
  }

  // 重新验证数据 反正构建时的完全路由缓存影响
  revalidatePath('/', 'layout')

  redirect(`/note/${toRedirectId}`)
}

export async function deleteNote(formData: FormData) {

  const noteId = formData.get('noteId') as string

  delNote(noteId)

  // 重新验证数据 反正构建时的完全路由缓存影响
  revalidatePath('/', 'layout')

  redirect('/')
}
