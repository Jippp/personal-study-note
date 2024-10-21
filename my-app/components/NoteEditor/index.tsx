'use client'

import { useEffect, useState } from 'react'
import NotePreview from '@/components/NotePreview'
import SaveButton from '@/components/Buttons/SaveButton'
import DeleteButton from '@/components/Buttons/DeleteButton'
import { saveNote, deleteNote, StateProps } from '@/app/action'
import { useFormState } from 'react-dom'

const initialState: StateProps = {
  message: null
}

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
  const [saveState, saveFormAction] = useFormState(saveNote, initialState)
  const [_, delFormAction] = useFormState(deleteNote, undefined)
  const [title, setTitle] = useState(initialTitle)
  const [body, setBody] = useState(initialBody)
  // 根据是否有id来判断是新建还是编辑
  const isDraft = !noteId

  useEffect(() => {
    if (saveState.errors) {
      // 处理错误
      alert(saveState.errors[0].message)
    }
  }, [saveState.errors])

  return (
    <div className="note-editor">
      <form className="note-editor-form" autoComplete="off">

        <div className="note-editor-menu" role="menubar">
          {/* 通过隐藏式Dom 给serverAction传递参数 */}
          <input type="hidden" name="noteId" value={noteId} />
          <SaveButton formAction={saveFormAction} />
          <DeleteButton isDraft={isDraft} formAction={delFormAction} />
        </div>

        <div className="note-editor-menu">
          { saveState?.message }
          { saveState.errors && saveState.errors[0].message }
        </div>

        <label className="offscreen" htmlFor="note-title-input">
          Enter a title for your note
        </label>
        <input
          id="note-title-input"
          type="text"
          name="title"
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
          name="body"
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
