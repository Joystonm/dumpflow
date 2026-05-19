import { AnimatePresence, motion } from 'framer-motion'
import { DropCard } from './DropCard'
import { useDropsStore } from '../store'
import { Inbox, Sparkles } from 'lucide-react'

const SECTION_LABELS = {
  inbox: 'Inbox', all: 'All Drops', screenshots: 'Screenshots',
  prompts: 'Prompts', videos: 'Videos', voice: 'Voice Notes',
  links: 'Links', clipboard: 'Clipboard', favorites: 'Favorites',
  archive: 'Archive', notebook: 'Notebook',
}

export function ContentGrid({ onSelect }) {
  const { activeSection, activeSpace, spaces, getFilteredDrops } = useDropsStore()
  const drops = getFilteredDrops()

  const title = activeSpace
    ? spaces.find(s => s.id === activeSpace)?.name || 'Space'
    : SECTION_LABELS[activeSection] || 'Drops'

  return (
    <div className="flex-1 p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-white">{title}</h2>
          <p className="text-sm text-muted mt-0.5">{drops.length} {drops.length === 1 ? 'drop' : 'drops'}</p>
        </div>
      </div>

      {drops.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col items-center justify-center py-24 text-center"
        >
          <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center mb-4">
            {activeSection === 'favorites' ? <Sparkles size={24} className="text-muted/40" /> : <Inbox size={24} className="text-muted/40" />}
          </div>
          <p className="text-white/60 font-medium">Nothing here yet</p>
          <p className="text-muted text-sm mt-1">Drop something to get started</p>
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          <AnimatePresence>
            {drops.map((drop, i) => (
              <DropCard key={drop.id} drop={drop} index={i} onSelect={onSelect} />
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  )
}
