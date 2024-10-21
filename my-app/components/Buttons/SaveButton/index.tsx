import { useFormStatus } from "react-dom"

interface SaveButton {
  formAction: (payload: FormData) => void
}

export default function SaveButton({ formAction }: SaveButton) {

  // react 18的新hook，用于处理form表单的一些状态
  const { pending } = useFormStatus()
  
  return (
    <button
      className="note-editor-done"
      disabled={pending}
      type="submit"
      formAction={formAction}
      role="menuitem"
    >
      <img
        src="/checkmark.svg"
        width="14px"
        height="10px"
        alt=""
        role="presentation"
      />
      {pending ? 'Saving' : 'Done'}
    </button>
  )
}