import { useEffect, useCallback } from 'react'
import { createDrop } from '../services/drops'
import { useAuthStore } from '../store'
import toast from 'react-hot-toast'

export function useClipboard() {
  const { user } = useAuthStore()

  const handlePaste = useCallback(async (e) => {
    if (!user) return
    const items = e.clipboardData?.items
    if (!items) return

    for (const item of items) {
      if (item.type.startsWith('image/')) {
        const file = item.getAsFile()
        if (file) {
          toast.loading('Analyzing screenshot...', { id: 'paste' })
          try {
            await createDrop({ file, userId: user.id })
            toast.success('Screenshot saved!', { id: 'paste' })
          } catch { toast.error('Failed to save', { id: 'paste' }) }
          return
        }
      }
    }

    const text = e.clipboardData?.getData('text')
    if (text?.trim() && text.length > 3) {
      // Only auto-capture links, not all text (to avoid noise)
      if (/^https?:\/\//i.test(text.trim())) {
        toast.loading('Saving link...', { id: 'paste' })
        try {
          await createDrop({ content: text.trim(), userId: user.id })
          toast.success('Link saved!', { id: 'paste' })
        } catch { toast.error('Failed to save', { id: 'paste' }) }
      }
    }
  }, [user])

  useEffect(() => {
    window.addEventListener('paste', handlePaste)
    return () => window.removeEventListener('paste', handlePaste)
  }, [handlePaste])
}
