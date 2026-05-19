import { motion } from 'framer-motion'
import { useDropsStore } from '../store'

const stages = { uploading: 'Uploading...', analyzing: 'AI analyzing...', saving: 'Saving...', done: 'Done!' }

export function UploadProgress() {
  const { uploadProgress } = useDropsStore()
  if (!uploadProgress) return null

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      className="fixed bottom-6 right-6 z-50 glass-strong rounded-2xl p-4 w-72"
    >
      <div className="flex items-center gap-3 mb-3">
        <motion.div
          className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent"
          animate={{ rotate: uploadProgress.stage === 'done' ? 0 : 360 }}
          transition={{ duration: 1, repeat: uploadProgress.stage === 'done' ? 0 : Infinity, ease: 'linear' }}
        />
        <div>
          <p className="text-sm font-medium text-white">{stages[uploadProgress.stage]}</p>
          {uploadProgress.stage === 'analyzing' && (
            <p className="text-xs text-muted">MiniMax AI is reading your content</p>
          )}
        </div>
      </div>
      <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
        <motion.div
          className="h-full rounded-full"
          style={{ background: 'linear-gradient(90deg, #8B5CF6, #06B6D4)' }}
          animate={{ width: `${uploadProgress.percent}%` }}
          transition={{ duration: 0.4 }}
        />
      </div>
    </motion.div>
  )
}
