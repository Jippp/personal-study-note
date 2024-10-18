'use client'

import { useState } from 'react'
import NotePreview from '@/components/NotePreview'
import { saveNote, deleteNote } from '@/app/action'
import { useFormStatus } from 'react-dom'

interface NoteEditorProps {
  initialTitle: string
  noteId?: string
  initialBody?: string
}

export default function NoteEditor({
  noteId,
  initialTitle,
  initialBody
}: NoteEditorProps) {
  // react 18的新hook，用于处理form表单的一些状态
  const { pending } = useFormStatus()
  const [title, setTitle] = useState(initialTitle)
  const [body, setBody] = useState(initialBody)
  // 根据是否有id来判断是新建还是编辑
  const isDraft = !noteId

  return (
    <div className="note-editor">
      <form className="note-editor-form" autoComplete="off">

        <div className="note-editor-menu" role="menubar">
          {/* 通过隐藏式Dom 给serverAction传递参数 */}
          <input type="hidden" name="noteId" value={noteId} />
          <button
            className="note-editor-done"
            disabled={pending}
            type="submit"
            formAction={saveNote}
            role="menuitem"
          >
            <img
              src="/checkmark.svg"
              width="14px"
              height="10px"
              alt=""
              role="presentation"
            />
            Done
          </button>
          {!isDraft && (
            <button
              className="note-editor-delete"
              disabled={pending}
              formAction={deleteNote}
              role="menuitem"
            >
              <img
                src="/cross.svg"
                width="10px"
                height="10px"
                alt=""
                role="presentation"
              />
              Delete
            </button>
          )}
        </div>

        <label className="offscreen" htmlFor="note-title-input">
          Enter a title for your note
        </label>
        <input
          id="note-title-input"
          type="text"
          value={title}
          onChange={(e) => {
            setTitle(e.target.value)
          }}
        />
        <label className="offscreen" htmlFor="note-body-input">
          Enter the body for your note
        </label>
        <textarea
          value={body}
          id="note-body-input"
          onChange={(e) => setBody(e.target.value)}
        />
      </form>

      <div className="note-editor-preview">
        <div className="label label--preview" role="status">
          Preview
        </div>
        <h1 className="note-title">{title}</h1>
        <NotePreview>{body}</NotePreview>
      </div>
    </div>
  )
}
