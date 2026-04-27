import type { FlashSet } from '@/types/database'
import Link from 'next/link'

export function SetCard({ set }: { set: FlashSet }) {
  return (
    <Link href={`/sets/${set.id}`}
      className="block p-5 bg-white rounded-2xl border border-slate-200 hover:shadow-md hover:border-indigo-200 transition-all">
      <h2 className="font-semibold text-slate-900 text-lg">{set.title}</h2>
      {set.folder && <p className="text-sm text-slate-500 mt-0.5">{set.folder}</p>}
      {set.tags.length > 0 && (
        <div className="flex gap-1 mt-3 flex-wrap">
          {set.tags.map(tag => (
            <span key={tag} className="text-xs bg-indigo-50 text-indigo-600 rounded-full px-2.5 py-0.5 border border-indigo-100">{tag}</span>
          ))}
        </div>
      )}
    </Link>
  )
}
