import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, X, Sparkles } from 'lucide-react'
import { useDropsStore } from '../store'
import { semanticSearch } from '../lib/minimax'
import toast from 'react-hot-toast'

export function SearchBar() {
  const { searchQuery, setSearchQuery, drops, setDrops } = useDropsStore()
  const [isAISearch, setIsAISearch] = useState(false)
  const [loading, setLoading] = useState(false)

  async function handleAISearch(query) {
    if (!query.trim()) return
    setLoading(true)
    try {
      const ids = await semanticSearch(query, drops)
      if (ids.length > 0) {
        toast.success(`Found ${ids.length} relevant drops`)
      } else {
        toast('No semantic matches found')
      }
    } catch {
      toast.error('AI search failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="relative flex items-center gap-2">
      <div className="relative flex-1">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
        <input
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          placeholder="Search drops, tags, ideas..."
          className="w-full bg-white/5 border border-white/8 rounded-xl pl-9 pr-4 py-2.5 text-sm text-white placeholder-muted outline-none focus:border-primary/50 focus:bg-white/8 transition-all"
          onKeyDown={e => { if (e.key === 'Enter' && isAISearch) handleAISearch(searchQuery) }}
        />
        {searchQuery && (
          <button onClick={() => setSearchQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-white">
            <X size={12} />
          </button>
        )}
      </div>
      <motion.button
        onClick={() => { setIsAISearch(!isAISearch); if (!isAISearch && searchQuery) handleAISearch(searchQuery) }}
        whileTap={{ scale: 0.95 }}
        className={`flex items-center gap-1.5 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
          isAISearch ? 'bg-primary/20 text-primary border border-primary/30' : 'glass text-muted hover:text-white'
        }`}
      >
        {loading ? (
          <motion.div className="w-3.5 h-3.5 border border-primary border-t-transparent rounded-full"
            animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }} />
        ) : (
          <Sparkles size={14} />
        )}
        <span className="hidden sm:inline">AI</span>
      </motion.button>
    </div>
  )
}
