import { motion } from 'framer-motion'
import { ArrowLeft, ExternalLink, FileText, Copy } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import toast from 'react-hot-toast'

export function DropDetail({ drop, onBack }) {
  const isBundle = drop.ai_metadata?.bundle

  function handleCopy() {
    navigator.clipboard.writeText(drop.content || drop.file_url || drop.title)
    toast.success('Copied!')
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: 30 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 30 }}
      className="flex-1 overflow-y-auto p-6 max-w-3xl mx-auto w-full"
    >
      {/* Back */}
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-muted hover:text-white text-sm mb-6 transition-colors"
      >
        <ArrowLeft size={15} /> Back
      </button>

      <div className="glass rounded-2xl p-6 space-y-5">
        {/* Title + meta */}
        <div>
          <h1 className="text-xl font-bold text-white mb-1">{drop.title || 'Untitled'}</h1>
          <p className="text-xs text-muted">
            {formatDistanceToNow(new Date(drop.created_at), { addSuffix: true })}
            {drop.ai_category && <span className="ml-2 opacity-60">· {drop.ai_category}</span>}
          </p>
        </div>

        {/* AI Summary */}
        {drop.ai_summary && (
          <div className="bg-white/5 rounded-xl p-4">
            <p className="text-xs text-muted/60 uppercase tracking-wider mb-2">AI Summary</p>
            <p className="text-sm text-muted leading-relaxed">{drop.ai_summary}</p>
          </div>
        )}

        {/* Bundle */}
        {isBundle ? (
          <div className="space-y-4">
            {drop.file_url && (
              <div>
                <p className="text-xs text-muted/60 uppercase tracking-wider mb-2">Attached File</p>
                <a href={drop.file_url} target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-2 text-sm text-muted hover:text-white bg-white/5 rounded-xl px-4 py-3 transition-colors">
                  <FileText size={14} />
                  <span className="flex-1 truncate">{drop.file_name || 'File'}</span>
                  <ExternalLink size={12} />
                </a>
              </div>
            )}
            {drop.content && (
              <div>
                <p className="text-xs text-muted/60 uppercase tracking-wider mb-2">Notes</p>
                <p className="text-sm text-white/80 leading-relaxed whitespace-pre-wrap bg-white/5 rounded-xl p-4">{drop.content}</p>
              </div>
            )}
            {drop.ai_metadata.links?.filter(l => l.url).length > 0 && (
              <div>
                <p className="text-xs text-muted/60 uppercase tracking-wider mb-2">Links</p>
                <div className="space-y-2">
                  {drop.ai_metadata.links.filter(l => l.url).map((l, i) => (
                    <a key={i} href={l.url} target="_blank" rel="noopener noreferrer"
                      className="flex items-center gap-2 text-sm bg-white/5 rounded-xl px-4 py-3 hover:bg-white/10 transition-colors">
                      <ExternalLink size={13} className="text-secondary flex-shrink-0" />
                      <span className="text-white flex-1 truncate">{l.label || l.url}</span>
                      {l.label && <span className="text-xs text-muted truncate max-w-[160px]">{l.url}</span>}
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          /* Prompt / Text */
          <div>
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs text-muted/60 uppercase tracking-wider">Content</p>
              <button onClick={handleCopy} className="flex items-center gap-1 text-xs text-muted hover:text-white transition-colors">
                <Copy size={11} /> Copy
              </button>
            </div>
            <pre className="text-sm text-white/80 leading-relaxed whitespace-pre-wrap font-mono bg-white/5 rounded-xl p-4 overflow-x-auto">
              {drop.content}
            </pre>
          </div>
        )}

        {/* Tags */}
        {drop.tags?.length > 0 && (
          <div className="flex flex-wrap gap-2 pt-2 border-t border-white/5">
            {drop.tags.map(tag => (
              <span key={tag} className="text-xs px-2.5 py-1 rounded-full bg-white/5 text-muted">#{tag}</span>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  )
}
