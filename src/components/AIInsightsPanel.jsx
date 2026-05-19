import { motion } from 'framer-motion'
import { Sparkles, TrendingUp, Tag, Layers, Zap } from 'lucide-react'
import { useDropsStore } from '../store'

export function AIInsightsPanel() {
  const { drops } = useDropsStore()

  const categories = drops.reduce((acc, d) => {
    if (d.ai_category) acc[d.ai_category] = (acc[d.ai_category] || 0) + 1
    return acc
  }, {})

  const topCategories = Object.entries(categories)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)

  const allTags = drops.flatMap(d => d.tags || [])
  const tagCounts = allTags.reduce((acc, t) => { acc[t] = (acc[t] || 0) + 1; return acc }, {})
  const topTags = Object.entries(tagCounts).sort((a, b) => b[1] - a[1]).slice(0, 8)

  const spaces = [...new Set(drops.map(d => d.ai_space).filter(Boolean))]

  const recentDrops = drops.slice(0, 3)

  return (
    <aside className="w-64 flex-shrink-0 h-screen flex flex-col glass border-l border-white/5 overflow-y-auto p-4 space-y-5">
      {/* AI Header */}
      <div className="flex items-center gap-2">
        <motion.div
          animate={{ scale: [1, 1.1, 1], opacity: [0.7, 1, 0.7] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="w-7 h-7 rounded-lg bg-primary/20 flex items-center justify-center"
        >
          <Sparkles size={14} className="text-primary" />
        </motion.div>
        <span className="text-sm font-semibold text-white">AI Insights</span>
      </div>

      {drops.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center text-center py-8">
          <Zap size={24} className="text-muted/40 mb-3" />
          <p className="text-xs text-muted">Drop something to see AI insights</p>
        </div>
      ) : (
        <>
          {/* Stats */}
          <div className="grid grid-cols-2 gap-2">
            {[
              { label: 'Total Drops', value: drops.length, color: '#8B5CF6' },
              { label: 'Spaces', value: spaces.length, color: '#06B6D4' },
              { label: 'Favorites', value: drops.filter(d => d.is_favorite).length, color: '#F472B6' },
              { label: 'Tags', value: Object.keys(tagCounts).length, color: '#10B981' },
            ].map(stat => (
              <div key={stat.label} className="glass rounded-xl p-3 text-center">
                <p className="text-lg font-bold" style={{ color: stat.color }}>{stat.value}</p>
                <p className="text-xs text-muted">{stat.label}</p>
              </div>
            ))}
          </div>

          {/* Top Categories */}
          {topCategories.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-3">
                <TrendingUp size={13} className="text-muted" />
                <span className="text-xs font-medium text-muted uppercase tracking-wider">Categories</span>
              </div>
              <div className="space-y-2">
                {topCategories.map(([cat, count]) => (
                  <div key={cat} className="flex items-center gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between mb-1">
                        <span className="text-xs text-white/80 truncate">{cat}</span>
                        <span className="text-xs text-muted">{count}</span>
                      </div>
                      <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${(count / drops.length) * 100}%` }}
                          transition={{ duration: 0.8, delay: 0.2 }}
                          className="h-full rounded-full"
                          style={{ background: 'linear-gradient(90deg, #8B5CF6, #06B6D4)' }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Top Tags */}
          {topTags.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Tag size={13} className="text-muted" />
                <span className="text-xs font-medium text-muted uppercase tracking-wider">Top Tags</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {topTags.map(([tag, count]) => (
                  <span key={tag} className="text-xs px-2 py-1 rounded-full bg-white/5 text-muted hover:text-white hover:bg-white/10 transition-colors cursor-pointer">
                    {tag} <span className="text-muted/60">{count}</span>
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* AI Spaces */}
          {spaces.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Layers size={13} className="text-muted" />
                <span className="text-xs font-medium text-muted uppercase tracking-wider">AI Spaces</span>
              </div>
              <div className="space-y-1.5">
                {spaces.slice(0, 5).map(space => (
                  <div key={space} className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-white/5 transition-colors cursor-pointer">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                    <span className="text-xs text-white/70">{space}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Recent AI Activity */}
          {recentDrops.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Zap size={13} className="text-muted" />
                <span className="text-xs font-medium text-muted uppercase tracking-wider">Recent</span>
              </div>
              <div className="space-y-2">
                {recentDrops.map(drop => (
                  <div key={drop.id} className="glass rounded-xl p-2.5">
                    <p className="text-xs text-white/80 truncate font-medium">{drop.title}</p>
                    {drop.ai_category && (
                      <p className="text-xs text-muted mt-0.5">{drop.ai_category}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </aside>
  )
}
