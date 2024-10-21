
import { getAllNotes } from '@/lib/redis'
import { sleep } from '@/lib/utils'
import SidebraNoteListFilter from './SidebraNoteListFilter'
import SidebarNoteItemHeader from '@/components/SidebarNoteItemHeader'

export default async function NoteList() {

  // 延长时间
  await sleep(1000);

  const notes = await getAllNotes()

  const arr = Object.entries(notes);

  if (arr.length == 0) {
    return (
      <div className="notes-empty">
        {'No notes created yet!'}
      </div>
    )
  }

  return (
    <SidebraNoteListFilter
      notes = {
        Object.entries(notes).map(([noteId, note]) => {
          const noteData = JSON.parse(note)
          return {
            noteId,
            note: noteData,
            // 通过props传递，该组件被视为服务端组件
            header: <SidebarNoteItemHeader title={noteData.title} updateTime={noteData.updateTime} />
          }
        })
      } 
    />
  )
}