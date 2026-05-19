import { NavLink } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  Inbox, LayoutGrid, Layers, Sparkles, Image, Video, Mic,
  Link2, Clipboard, Heart, Archive, LogOut, Zap, ChevronRight
} from 'lucide-react'
import { useDropsStore } from '../store'
import { useAuthStore } from '../store'

const NAV_ITEMS = [
  { id: 'inbox', label: 'Inbox', icon: Inbox },
  { id: 'all', label: 'All Drops', icon: LayoutGrid },
  null, // divider
  { id: 'screenshots', label: 'Screenshots', icon: Image },
  { id: 'prompts', label: 'Prompts', icon: Sparkles },
  { id: 'videos', label: 'Videos', icon: Video },
  { id: 'voice', label: 'Voice Notes', icon: Mic },
  { id: 'links', label: 'Links', icon: Link2 },
  { id: 'clipboard', label: 'Clipboard', icon: Clipboard },
  { id: 'notebook', label: 'Notebook', icon: Layers },
  null,
  { id: 'favorites', label: 'Favorites', icon: Heart },
  { id: 'archive', label: 'Archive', icon: Archive },
]

export function Sidebar() {
  const { activeSection, setActiveSection, setActiveSpace, spaces, drops } = useDropsStore()
  const { profile, signOut } = useAuthStore()

  function handleNav(id) {
    setActiveSection(id)
    setActiveSpace(null)
  }

  const countFor = (section) => {
    if (section === 'inbox') return drops.filter(d => !d.is_archived).length
    if (section === 'favorites') return drops.filter(d => d.is_favorite).length
    return null
  }

  return (
    <aside className="w-60 flex-shrink-0 h-screen flex flex-col glass border-r border-white/5 overflow-y-auto">
      {/* Logo */}
      <div className="p-5 border-b border-white/5">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, #8B5CF6, #06B6D4)' }}>
            <Zap size={16} className="text-white" />
          </div>
          <span className="font-bold text-white text-lg tracking-tight">DumpFlow</span>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-3 space-y-0.5">
        {NAV_ITEMS.map((item, i) => {
          if (!item) return <div key={i} className="my-2 border-t border-white/5" />
          const Icon = item.icon
          const count = countFor(item.id)
          const active = activeSection === item.id

          return (
            <motion.button
              key={item.id}
              onClick={() => handleNav(item.id)}
              whileTap={{ scale: 0.97 }}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm transition-all ${
                active
                  ? 'bg-primary/15 text-white font-medium'
                  : 'text-muted hover:text-white hover:bg-white/5'
              }`}
            >
              <Icon size={15} className={active ? 'text-primary' : ''} />
              <span className="flex-1 text-left">{item.label}</span>
              {count !== null && count > 0 && (
                <span className={`text-xs px-1.5 py-0.5 rounded-full ${active ? 'bg-primary/30 text-primary' : 'bg-white/10 text-muted'}`}>
                  {count}
                </span>
              )}
            </motion.button>
          )
        })}

        {/* Spaces */}
        {spaces.length > 0 && (
          <>
            <div className="my-2 border-t border-white/5" />
            <p className="text-xs text-muted/60 px-3 py-1 uppercase tracking-wider">Spaces</p>
            {spaces.map(space => (
              <motion.button
                key={space.id}
                onClick={() => { setActiveSpace(space.id); setActiveSection(null) }}
                whileTap={{ scale: 0.97 }}
                className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm text-muted hover:text-white hover:bg-white/5 transition-all"
              >
                <span>{space.icon}</span>
                <span className="flex-1 text-left truncate">{space.name}</span>
              </motion.button>
            ))}
          </>
        )}
      </nav>

      {/* Profile */}
      <div className="p-3 border-t border-white/5">
        <div className="flex items-center gap-3 px-3 py-2">
          <div className="w-7 h-7 rounded-full bg-primary/30 flex items-center justify-center text-xs font-bold text-primary">
            {profile?.full_name?.[0] || profile?.email?.[0]?.toUpperCase() || '?'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-white truncate">{profile?.full_name || 'User'}</p>
            <p className="text-xs text-muted truncate">{profile?.email}</p>
          </div>
          <button onClick={signOut} className="text-muted hover:text-white transition-colors">
            <LogOut size={14} />
          </button>
        </div>
      </div>
    </aside>
  )
}
