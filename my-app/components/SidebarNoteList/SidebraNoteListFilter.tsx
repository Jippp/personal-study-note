'use client'

import { useSearchParams } from 'next/navigation'
import SidebarNoteContent from '@/components/SidebarNoteContent'

interface NoteListProps {
  notes: any[]
}

export default async function ListFilter({ notes } : NoteListProps) {
  const searchParams = useSearchParams()
  const query = searchParams.get('q')

  return (
    <ul className="notes-list">
      {notes.map(noteItem => {
        const {noteId, note, header} = noteItem;
        if (!query || (query && note.title.toLowerCase().includes(query.toLowerCase()))) {
          return (
            <SidebarNoteContent
              key={noteId}
              id={noteId}
              title={note.title}
              expandedChildren={
                <p className="sidebar-note-excerpt">
                  {note.content.substring(0, 20) || <i>(No content)</i>}
                </p>
              }>
                {header}
            </SidebarNoteContent>
          )
        }

        return null
      })}
    </ul>
  )
}