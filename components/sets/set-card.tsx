import type { FlashSet } from '@/types/database'
import Link from 'next/link'

export function SetCard({ set }: { set: FlashSet }) {
  return (
    <Link href={`/sets/${set.id}`}
      className="block p-4 bg-white rounded-lg border hover:shadow-md transition-shadow">
      <h2 className="font-semibold text-lg">{set.title}</h2>
      {set.folder && <p className="text-sm text-gray-500">{set.folder}</p>}
      {set.tags.length > 0 && (
        <div className="flex gap-1 mt-2 flex-wrap">
          {set.tags.map(tag => (
            <span key={tag} className="text-xs bg-blue-100 text-blue-700 rounded px-2 py-0.5">{tag}</span>
          ))}
        </div>
      )}
    </Link>
  )
}
