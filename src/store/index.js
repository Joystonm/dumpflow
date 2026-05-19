import { create } from 'zustand'
import { supabase } from '../lib/supabase'

export const useAuthStore = create((set) => ({
  user: null,
  profile: null,
  loading: true,
  setUser: (user) => set({ user }),
  setProfile: (profile) => set({ profile }),
  setLoading: (loading) => set({ loading }),
  signOut: async () => {
    await supabase.auth.signOut()
    set({ user: null, profile: null })
  },
}))

export const useDropsStore = create((set, get) => ({
  drops: [],
  spaces: [],
  activeSpace: null,
  activeSection: 'inbox',
  searchQuery: '',
  isUploading: false,
  uploadProgress: null,

  setDrops: (drops) => set({ drops }),
  setSpaces: (spaces) => set({ spaces }),
  setActiveSpace: (space) => set({ activeSpace: space }),
  setActiveSection: (section) => set({ activeSection: section }),
  setSearchQuery: (q) => set({ searchQuery: q }),
  setUploading: (v) => set({ isUploading: v }),
  setUploadProgress: (p) => set({ uploadProgress: p }),

  addDrop: (drop) => set((s) => ({ drops: [drop, ...s.drops] })),
  updateDrop: (id, updates) => set((s) => ({
    drops: s.drops.map(d => d.id === id ? { ...d, ...updates } : d)
  })),
  removeDrop: (id) => set((s) => ({ drops: s.drops.filter(d => d.id !== id) })),

  getFilteredDrops: () => {
    const { drops, activeSection, activeSpace, searchQuery } = get()
    let filtered = drops

    if (searchQuery) {
      const q = searchQuery.toLowerCase()
      filtered = filtered.filter(d =>
        d.title?.toLowerCase().includes(q) ||
        d.ai_summary?.toLowerCase().includes(q) ||
        d.content?.toLowerCase().includes(q) ||
        d.tags?.some(t => t.toLowerCase().includes(q))
      )
    }

    if (activeSpace) return filtered.filter(d => d.space_id === activeSpace)

    switch (activeSection) {
      case 'inbox': return filtered.filter(d => !d.is_archived)
      case 'all': return filtered.filter(d => !d.is_archived)
      case 'screenshots': return filtered.filter(d => d.type === 'screenshot' || d.type === 'image')
      case 'prompts': return filtered.filter(d => d.type === 'prompt')
      case 'videos': return filtered.filter(d => d.type === 'video')
      case 'voice': return filtered.filter(d => d.type === 'voice')
      case 'links': return filtered.filter(d => d.type === 'link' || d.type === 'github')
      case 'clipboard': return filtered.filter(d => d.type === 'text' && !d.ai_metadata?.bundle)
      case 'notebook': return filtered.filter(d => d.ai_metadata?.bundle)
      case 'favorites': return filtered.filter(d => d.is_favorite)
      case 'archive': return filtered.filter(d => d.is_archived)
      default: return filtered.filter(d => !d.is_archived)
    }
  },
}))
