import dayjs from 'dayjs';

interface HeaderProps {
  title: string;
  updateTime: string;
}

export default function SidebarNoteHeader({
  title, updateTime
}: HeaderProps) {
  return (
    <header className="sidebar-note-header">
      <strong>{title}</strong>
      <small>{dayjs(updateTime).format('YYYY-MM-DD hh:mm:ss')}</small>
    </header>
  )
}