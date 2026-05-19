import { AnimatePresence, motion } from 'framer-motion'
import { Sidebar } from '../components/Sidebar'
import { DropZone } from '../components/DropZone'
import { ContentGrid } from '../components/ContentGrid'
import { DropDetail } from '../components/DropDetail'
import { AIInsightsPanel } from '../components/AIInsightsPanel'
import { SearchBar } from '../components/SearchBar'
import { UploadProgress } from '../components/UploadProgress'
import { useRealtime } from '../hooks/useRealtime'
import { useClipboard } from '../hooks/useClipboard'
import { useDropsStore, useAuthStore } from '../store'
import { useState } from 'react'
import { PanelRight, PanelLeft } from 'lucide-react'

export default function App() {
  const { user } = useAuthStore()
  const { activeSection } = useDropsStore()
  const showDropZone = !activeSection || activeSection === 'inbox' || activeSection === 'all'
  const [showAI, setShowAI] = useState(true)
  const [showSidebar, setShowSidebar] = useState(true)
  const [selectedDrop, setSelectedDrop] = useState(null)

  useRealtime(user?.id)
  useClipboard()

  const expandable = (drop) => drop.type === 'prompt' || drop.type === 'text' || drop.ai_metadata?.bundle

  return (
    <div className="flex h-screen bg-bg overflow-hidden">
      {/* Sidebar */}
      <AnimatePresence>
        {showSidebar && (
          <motion.div
            initial={{ x: -240, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -240, opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <Sidebar />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top bar */}
        <header className="flex items-center gap-3 px-5 py-3.5 border-b border-white/5 flex-shrink-0">
          <button onClick={() => setShowSidebar(!showSidebar)}
            className="text-muted hover:text-white transition-colors p-1.5 rounded-lg hover:bg-white/5">
            <PanelLeft size={16} />
          </button>
          <div className="flex-1">
            <SearchBar />
          </div>
          <button onClick={() => setShowAI(!showAI)}
            className={`text-muted hover:text-white transition-colors p-1.5 rounded-lg hover:bg-white/5 ${showAI ? 'text-primary' : ''}`}>
            <PanelRight size={16} />
          </button>
        </header>

        {/* Drop zone + content */}
        <div className="flex-1 flex overflow-hidden">
          <div className="flex-1 flex flex-col overflow-y-auto">
            {selectedDrop ? (
              <DropDetail drop={selectedDrop} onBack={() => setSelectedDrop(null)} />
            ) : (
              <>
                {showDropZone && (
                  <div className="px-5 pt-4 pb-2 flex-shrink-0">
                    <DropZone />
                  </div>
                )}
                <ContentGrid onSelect={(drop) => expandable(drop) && setSelectedDrop(drop)} />
              </>
            )}
          </div>

          {/* AI Panel */}
          <AnimatePresence>
            {showAI && (
              <motion.div
                initial={{ x: 260, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: 260, opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                <AIInsightsPanel />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <UploadProgress />
    </div>
  )
}
