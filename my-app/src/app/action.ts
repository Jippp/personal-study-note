'use server'

import { redirect } from 'next/navigation'
import {addNote, updateNote, delNote} from '@/lib/redis';
import { revalidatePath } from 'next/cache'
import { z, ZodIssue } from 'zod'

export interface StateProps {
  message?: string | null;
  errors?: ZodIssue[];
}

// 对内容进行规则校验
const schema = z.object({
  title: z.string(),
  content: z.string().min(1, '请填写内容').max(100, '字数最多 100')
});

export async function saveNote(prevState: StateProps, formData: FormData) {

  const noteId = formData.get('noteId') as string | undefined
  const data = {
    title: formData.get('title'),
    content: formData.get('body'),
    updateTime: Date.now()
  }

  // 校验数据
  const validate = schema.safeParse(data)
  if(!validate.success) {
    return {
      errors: validate.error.issues 
    }
  }

  const JSONData = JSON.stringify(data)

  if (noteId) {
    updateNote(noteId, JSONData)
  } else {
    await addNote(JSONData)
  }
  // 重新验证数据 防止构建时的完全路由缓存影响
  revalidatePath('/', 'layout')

  return { message: `Add Success!` }
}

export async function deleteNote(prevState: StateProps | void, formData: FormData) {

  const noteId = formData.get('noteId') as string

  delNote(noteId)

  // 重新验证数据 反正构建时的完全路由缓存影响
  revalidatePath('/', 'layout')

  redirect('/')
}
