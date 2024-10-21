import { NoteItem } from '@/components/interface'
import SidebarNoteContent from '@/components/SidebarNoteContent'
import SidebarNoteItemHeader from '@/components/SidebarNoteItemHeader'

export interface ItemProps {
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
      <SidebarNoteItemHeader title={title} updateTime={updateTime} />
    </SidebarNoteContent>
  )
}