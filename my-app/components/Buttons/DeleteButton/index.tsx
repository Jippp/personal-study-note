import { useFormStatus } from "react-dom"

interface DeleteButtonProps {
  isDraft: boolean;
  formAction: (payload: FormData) => void
}

export default function DeleteButton({ isDraft, formAction }: DeleteButtonProps) {

  // react 18的新hook，用于处理form表单的一些状态
  const { pending } = useFormStatus()

  return (
    <>
      {!isDraft && (
        <button
          className="note-editor-delete"
          disabled={pending}
          formAction={formAction}
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
    </>
  )
}