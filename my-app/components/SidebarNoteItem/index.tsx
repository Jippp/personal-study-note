import dayjs from 'dayjs'
import { NoteItem } from '@/components/interface'
import SidebarNoteContent from '@/components/SidebarNoteContent'

interface ItemProps {
  noteId: string;
  note: NoteItem
}

export default function SidebarNoteItem({
  noteId, note
}: ItemProps) {

  const { title, content = '', updateTime } = note;

  return (
    <SidebarNoteContent
      id={noteId}
      title={note.title}
      // SidebarNoteContent客户端组件中使用服务端组件
      expandedChildren={
        <p className="sidebar-note-excerpt">
          {content?.substring(0, 20) || <i>(No content)</i>}
        </p>
      }
    >
      {/* SidebarNoteContent客户端组件中使用服务端组件 */}
      <header className="sidebar-note-header">
        <strong>{title}</strong>
        <small>{dayjs(updateTime).format('YYYY-MM-DD hh:mm:ss')}</small>
      </header>
    </SidebarNoteContent>
  )
}