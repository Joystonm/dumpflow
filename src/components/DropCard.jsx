import { useState } from 'react'
import { motion } from 'framer-motion'
import { Heart, Archive, Trash2, ExternalLink, Copy, Clock, Tag, Sparkles, FileText, Image, Video, Link2, GitBranch, Mic, File } from 'lucide-react'
import { toggleFavorite, archiveDrop, deleteDrop } from '../services/drops'
import { useDropsStore } from '../store'
import { formatDistanceToNow } from 'date-fns'
import toast from 'react-hot-toast'

const TYPE_ICONS = {
  screenshot: Image, image: Image, video: Video, pdf: FileText,
  text: FileText, link: Link2, github: GitBranch, prompt: Sparkles,
  voice: Mic, file: File,
}

const TYPE_COLORS = {
  screenshot: '#8B5CF6', image: '#8B5CF6', video: '#F472B6',
  pdf: '#F59E0B', text: '#9CA3AF', link: '#06B6D4',
  github: '#10B981', prompt: '#8B5CF6', voice: '#F472B6', file: '#9CA3AF',
}

const CATEGORY_COLORS = {
  'Design Inspiration': '#F472B6',
  'Code & Dev': '#10B981',
  'AI Prompts': '#8B5CF6',
  'Content Ideas': '#06B6D4',
  'Research': '#F59E0B',
  'Entertainment': '#EF4444',
  'Productivity': '#10B981',
  'Startup Ideas': '#8B5CF6',
  'Learning': '#06B6D4',
  'Other': '#9CA3AF',
}

function ExpiryBadge({ expiresAt }) {
  if (!expiresAt) return null
  const diff = new Date(expiresAt) - Date.now()
  if (diff < 0) return <span className="text-xs text-error flex items-center gap-1"><Clock size={10} />Expired</span>
  const hours = diff / 3600000
  const color = hours < 24 ? 'text-error' : hours < 168 ? 'text-warning' : 'text-muted'
  return (
    <span className={`text-xs flex items-center gap-1 ${color}`}>
      <Clock size={10} />
      {formatDistanceToNow(new Date(expiresAt), { addSuffix: true })}
    </span>
  )
}

export function DropCard({ drop, index, onSelect }) {
  const { updateDrop, removeDrop } = useDropsStore()
  const [hovering, setHovering] = useState(false)
  const Icon = TYPE_ICONS[drop.type] || File
  const typeColor = TYPE_COLORS[drop.type] || '#9CA3AF'

  async function handleFavorite(e) {
    e.stopPropagation()
    try {
      const updated = await toggleFavorite(drop.id, drop.is_favorite)
      updateDrop(drop.id, updated)
    } catch { toast.error('Failed') }
  }

  async function handleArchive(e) {
    e.stopPropagation()
    try {
      const updated = await archiveDrop(drop.id)
      updateDrop(drop.id, updated)
      toast.success('Archived')
    } catch { toast.error('Failed') }
  }

  async function handleDelete(e) {
    e.stopPropagation()
    if (!confirm('Delete this drop?')) return
    try {
      await deleteDrop(drop.id)
      removeDrop(drop.id)
      toast.success('Deleted')
    } catch { toast.error('Failed') }
  }

  function handleCopy(e) {
    e.stopPropagation()
    const text = drop.file_url || drop.content || drop.title
    navigator.clipboard.writeText(text)
    toast.success('Copied!')
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ delay: index * 0.04, duration: 0.3 }}
      onHoverStart={() => setHovering(true)}
      onHoverEnd={() => setHovering(false)}
      className="glass rounded-2xl overflow-hidden group cursor-pointer transition-all duration-300 hover:border-white/15 hover:shadow-lg"
      style={{ '--hover-shadow': `0 8px 32px ${typeColor}20` }}
      onClick={() => onSelect?.(drop)}
    >
      {/* Media preview */}
      {(drop.type === 'screenshot' || drop.type === 'image') && drop.file_url && (
        <div className="relative h-40 overflow-hidden bg-white/5">
          <img src={drop.file_url} alt={drop.title} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        </div>
      )}
      {drop.type === 'video' && drop.file_url && (
        <div className="relative h-40 bg-black/40 flex items-center justify-center">
          <Video size={32} className="text-white/40" />
          <div className="absolute bottom-2 left-2 text-xs text-white/60">{drop.file_name}</div>
        </div>
      )}

      <div className="p-4">
        {/* Header */}
        <div className="flex items-start justify-between gap-2 mb-3">
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
              style={{ background: `${typeColor}20` }}>
              <Icon size={14} style={{ color: typeColor }} />
            </div>
            <h3 className="text-sm font-semibold text-white truncate">{drop.title || 'Untitled'}</h3>
          </div>
          <motion.button
            onClick={handleFavorite}
            whileTap={{ scale: 0.8 }}
            className={`flex-shrink-0 transition-colors ${drop.is_favorite ? 'text-highlight' : 'text-muted/40 hover:text-muted'}`}
          >
            <Heart size={14} fill={drop.is_favorite ? 'currentColor' : 'none'} />
          </motion.button>
        </div>

        {/* Bundle content */}
        {drop.ai_metadata?.bundle && (
          <div className="mb-3 space-y-2">
            {drop.file_url && (
              <a href={drop.file_url} target="_blank" rel="noopener noreferrer"
                onClick={e => e.stopPropagation()}
                className="flex items-center gap-1.5 text-xs text-muted hover:text-white bg-white/5 rounded-lg px-2.5 py-1.5 truncate">
                <FileText size={11} />
                <span className="truncate">{drop.file_name || 'Attached file'}</span>
              </a>
            )}
            {drop.content && (
              <p className="text-xs text-muted/80 leading-relaxed line-clamp-3 bg-white/5 rounded-lg p-2">{drop.content}</p>
            )}
            {drop.ai_metadata.links?.filter(l => l.url).map((l, i) => (
              <a key={i} href={l.url} target="_blank" rel="noopener noreferrer"
                onClick={e => e.stopPropagation()}
                className="flex items-center gap-1.5 text-xs text-secondary hover:text-secondary/80 truncate">
                <ExternalLink size={10} />
                <span className="truncate">{l.label || l.url}</span>
              </a>
            ))}
          </div>
        )}

        {/* Summary */}
        {drop.ai_summary && (
          <p className="text-xs text-muted leading-relaxed mb-3 line-clamp-2">{drop.ai_summary}</p>
        )}

        {/* Content preview for text/prompt */}
        {(drop.type === 'text' || drop.type === 'prompt') && drop.content && !drop.ai_summary && (
          <p className="text-xs text-muted/80 leading-relaxed mb-3 line-clamp-3 font-mono bg-white/5 rounded-lg p-2">
            {drop.content}
          </p>
        )}

        {/* Link preview */}
        {(drop.type === 'link' || drop.type === 'github') && drop.content && (
          <a href={drop.content} target="_blank" rel="noopener noreferrer"
            onClick={e => e.stopPropagation()}
            className="flex items-center gap-1.5 text-xs text-secondary hover:text-secondary/80 mb-3 truncate">
            <ExternalLink size={10} />
            <span className="truncate">{drop.content}</span>
          </a>
        )}

        {/* Tags */}
        {drop.tags?.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-3">
            {drop.tags.slice(0, 3).map(tag => (
              <span key={tag} className="flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-white/5 text-muted">
                <Tag size={9} />
                {tag}
              </span>
            ))}
            {drop.tags.length > 3 && (
              <span className="text-xs px-2 py-0.5 rounded-full bg-white/5 text-muted/60">+{drop.tags.length - 3}</span>
            )}
          </div>
        )}

        {/* Category badge */}
        {drop.ai_category && (
          <div className="mb-3">
            <span className="text-xs px-2 py-0.5 rounded-full font-medium"
              style={{
                background: `${CATEGORY_COLORS[drop.ai_category] || '#9CA3AF'}15`,
                color: CATEGORY_COLORS[drop.ai_category] || '#9CA3AF',
              }}>
              {drop.ai_category}
            </span>
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted/60">
              {formatDistanceToNow(new Date(drop.created_at), { addSuffix: true })}
            </span>
            <ExpiryBadge expiresAt={drop.expires_at} />
          </div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: hovering ? 1 : 0 }}
            className="flex items-center gap-1"
          >
            <button onClick={handleCopy} className="p-1.5 rounded-lg hover:bg-white/10 text-muted hover:text-white transition-colors">
              <Copy size={12} />
            </button>
            <button onClick={handleArchive} className="p-1.5 rounded-lg hover:bg-white/10 text-muted hover:text-white transition-colors">
              <Archive size={12} />
            </button>
            <button onClick={handleDelete} className="p-1.5 rounded-lg hover:bg-error/20 text-muted hover:text-error transition-colors">
              <Trash2 size={12} />
            </button>
          </motion.div>
        </div>
      </div>
    </motion.div>
  )
}
