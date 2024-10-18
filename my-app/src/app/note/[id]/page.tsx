import { getNote } from '@/lib/redis';
import Note from '@/components/Note'
import { NoteItem } from '@/components/interface';

export default async function Page({ params }: { params: {id: string} }) {

  // 动态路由 获取笔记 id
  const noteId = params.id;
  const note = await getNote(noteId)

  // 为了让 Suspense 的效果更明显
  const sleep = (ms: number) => new Promise(r => setTimeout(r, ms));
  await sleep(3000);

  if (!note) {
    return (
      <div className="note--empty-state">
        <span className="note-text--empty-state">
          This note does not exist. 🥺
        </span>
      </div>
    )
  }

  return <Note noteId={noteId} note={JSON.parse(note) as NoteItem} />
}
