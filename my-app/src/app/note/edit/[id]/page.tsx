import NoteEditor from '@/components/NoteEditor'
import {getNote} from '@/lib/redis';
import { NoteItem } from '@/components/interface'
import { sleep } from '@/lib/utils'

export default async function EditPage({ params }: { params: { id: string } }) {

  const noteId = params.id;
  const note = await getNote(noteId)

  // 让效果更明显
  await sleep(500);

  if (!note) {
    return (
      <div className="note--empty-state">
        <span className="note-text--empty-state">
          Click a note on the left to view something! 🥺
        </span>
      </div>
    )
  }

  const noteItem: NoteItem = JSON.parse(note)

  return <NoteEditor noteId={noteId} initialTitle={noteItem.title} initialBody={noteItem.content} />
}

