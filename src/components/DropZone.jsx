import { useState, useCallback, useRef } from 'react'
import { useDropzone } from 'react-dropzone'
import { motion, AnimatePresence } from 'framer-motion'
import { Upload, Link2, FileText, Mic, MicOff, Send, ChevronDown, BookOpen, Plus, X } from 'lucide-react'
import { createDrop, createBundleDrop } from '../services/drops'
import { useAuthStore } from '../store'
import toast from 'react-hot-toast'

const EXPIRY_OPTIONS = [
  { label: '24h', value: '24h' },
  { label: '7 days', value: '7d' },
  { label: '30 days', value: '30d' },
  { label: 'Forever', value: 'never' },
]

function Section({ icon: Icon, label, open, onToggle, children }) {
  return (
    <div className="glass rounded-2xl">
      <button
        onClick={onToggle}
        className="w-full flex items-center gap-2.5 px-4 py-3 text-sm font-medium text-muted hover:text-white transition-colors"
      >
        <Icon size={14} className={open ? 'text-primary' : ''} />
        <span className={open ? 'text-white' : ''}>{label}</span>
        <ChevronDown size={13} className={`ml-auto transition-transform ${open ? 'rotate-180 text-primary' : ''}`} />
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <div className="px-4 pb-4 border-t border-white/5 pt-3">
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export function DropZone() {
  const { user } = useAuthStore()
  const [text, setText] = useState('')
  const [linkUrl, setLinkUrl] = useState('')
  const [linkTitle, setLinkTitle] = useState('')
  const [isDragOver, setIsDragOver] = useState(false)
  const [isRecording, setIsRecording] = useState(false)
  const [expiry, setExpiry] = useState('never')
  const [open, setOpen] = useState({ drop: true, text: false, link: false, bundle: false })
  const [bundle, setBundle] = useState({ title: '', notes: '', file: null, links: [{ url: '', label: '' }] })
  const bundleFileRef = useRef(null)
  const mediaRef = useRef(null)
  const chunksRef = useRef([])

  const toggle = (key) => setOpen(o => ({ ...o, [key]: !o[key] }))

  const handleDrop = useCallback(async (files) => {
    if (!user || !files.length) return
    for (const file of files) {
      toast.loading(`Processing ${file.name}...`, { id: file.name })
      try {
        await createDrop({ file, userId: user.id, expiresIn: expiry })
        toast.success('Saved to DumpFlow!', { id: file.name })
      } catch {
        toast.error('Failed to save', { id: file.name })
      }
    }
  }, [user, expiry])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: handleDrop,
    onDragEnter: () => setIsDragOver(true),
    onDragLeave: () => setIsDragOver(false),
    accept: { 'image/*': [], 'video/*': [], 'audio/*': [], 'application/pdf': [] },
    noClick: !open.drop,
    noDrag: !open.drop,
  })

  async function handleSubmitText() {
    if (!text.trim() || !user) return
    toast.loading('Analyzing...', { id: 'text' })
    try {
      await createDrop({ content: text.trim(), userId: user.id, expiresIn: expiry })
      setText('')
      toast.success('Saved!', { id: 'text' })
    } catch { toast.error('Failed', { id: 'text' }) }
  }

  async function handleSubmitLink() {
    if (!linkUrl.trim() || !user) return
    toast.loading('Saving link...', { id: 'link' })
    try {
      await createDrop({
        content: linkUrl.trim(),
        title: linkTitle.trim() || undefined,
        userId: user.id,
        expiresIn: expiry,
      })
      setLinkUrl('')
      setLinkTitle('')
      toast.success('Link saved!', { id: 'link' })
    } catch { toast.error('Failed', { id: 'link' }) }
  }

  async function handleSubmitBundle() {
    if (!bundle.title.trim() && !bundle.notes.trim() && !bundle.file && !bundle.links[0]?.url) return
    toast.loading('Saving bundle...', { id: 'bundle' })
    try {
      await createBundleDrop({
        title: bundle.title.trim() || undefined,
        notes: bundle.notes.trim() || undefined,
        file: bundle.file || undefined,
        links: bundle.links,
        userId: user.id,
        expiresIn: expiry,
      })
      setBundle({ title: '', notes: '', file: null, links: [{ url: '', label: '' }] })
      toast.success('Bundle saved!', { id: 'bundle' })
    } catch { toast.error('Failed', { id: 'bundle' }) }
  }

  async function toggleRecording() {
    if (isRecording) {
      mediaRef.current?.stop()
      setIsRecording(false)
      return
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const recorder = new MediaRecorder(stream)
      chunksRef.current = []
      recorder.ondataavailable = e => chunksRef.current.push(e.data)
      recorder.onstop = async () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' })
        const file = new File([blob], `voice-${Date.now()}.webm`, { type: 'audio/webm' })
        stream.getTracks().forEach(t => t.stop())
        toast.loading('Saving voice note...', { id: 'voice' })
        try {
          await createDrop({ file, userId: user.id, expiresIn: expiry })
          toast.success('Voice note saved!', { id: 'voice' })
        } catch { toast.error('Failed', { id: 'voice' }) }
      }
      recorder.start()
      mediaRef.current = recorder
      setIsRecording(true)
    } catch { toast.error('Microphone access denied') }
  }

  const isActive = isDragActive || isDragOver

  return (
    <div className="w-full space-y-2">
      {/* Drop Files */}
      <Section icon={Upload} label="Drop Files" open={open.drop} onToggle={() => toggle('drop')}>
        <div
          {...getRootProps()}
          className={`relative rounded-xl border-2 border-dashed transition-all duration-300 cursor-pointer overflow-hidden ${
            isActive ? 'border-primary bg-primary/10 scale-[1.01]' : 'border-white/10 hover:border-primary/50 hover:bg-white/[0.02]'
          }`}
        >
          <input {...getInputProps()} />
          {isActive && (
            <motion.div
              className="absolute inset-0 rounded-xl"
              animate={{ opacity: [0.3, 0.6, 0.3] }}
              transition={{ duration: 1, repeat: Infinity }}
              style={{ background: 'linear-gradient(135deg, rgba(139,92,246,0.15), rgba(6,182,212,0.15))' }}
            />
          )}
          <div className="relative flex flex-col items-center justify-center py-7 px-6 text-center">
            <motion.div
              animate={isActive ? { scale: [1, 1.1, 1], rotate: [0, 5, -5, 0] } : {}}
              transition={{ duration: 0.5, repeat: isActive ? Infinity : 0 }}
              className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${isActive ? 'bg-primary/30' : 'bg-white/5'}`}
            >
              <Upload size={18} className={isActive ? 'text-primary' : 'text-muted'} />
            </motion.div>
            <p className="text-white font-semibold text-sm mb-1">{isActive ? 'Drop it!' : 'Drag & drop anything'}</p>
            <p className="text-muted text-xs">Screenshots, videos, PDFs, audio — or <span className="text-primary">browse files</span></p>
          </div>
        </div>
      </Section>

      {/* Paste Text */}
      <Section icon={FileText} label="Paste Text" open={open.text} onToggle={() => toggle('text')}>
        <textarea
          value={text}
          onChange={e => setText(e.target.value)}
          placeholder="Paste a prompt, idea, code snippet, caption, hook..."
          className="w-full bg-transparent text-white placeholder-muted text-sm resize-none outline-none min-h-[90px]"
          onKeyDown={e => { if (e.key === 'Enter' && e.metaKey) handleSubmitText() }}
        />
        <div className="flex items-center justify-between mt-2 pt-2 border-t border-white/5">
          <span className="text-xs text-muted">{text.length} chars · ⌘↵ to save</span>
          <button
            onClick={handleSubmitText}
            disabled={!text.trim()}
            className="flex items-center gap-2 bg-primary hover:bg-primary/80 disabled:opacity-40 text-white text-xs font-medium px-3 py-1.5 rounded-lg transition-all"
          >
            <Send size={12} /> Save
          </button>
        </div>
      </Section>

      {/* Add Link */}
      <Section icon={Link2} label="Add Link" open={open.link} onToggle={() => toggle('link')}>
        <div className="space-y-2">
          <input
            value={linkUrl}
            onChange={e => setLinkUrl(e.target.value)}
            placeholder="Paste a URL, GitHub repo, YouTube link..."
            className="w-full bg-white/5 text-white placeholder-muted text-sm outline-none rounded-lg px-3 py-2.5 border border-white/10 focus:border-primary/50 transition-colors"
          />
          <input
            value={linkTitle}
            onChange={e => setLinkTitle(e.target.value)}
            placeholder='Title (e.g. "YouTube", "GitHub Repo")'
            className="w-full bg-white/5 text-white placeholder-muted text-sm outline-none rounded-lg px-3 py-2.5 border border-white/10 focus:border-primary/50 transition-colors"
          />
          <div className="flex justify-end">
            <button
              onClick={handleSubmitLink}
              disabled={!linkUrl.trim()}
              className="flex items-center gap-2 bg-primary hover:bg-primary/80 disabled:opacity-40 text-white text-xs font-medium px-3 py-1.5 rounded-lg transition-all"
            >
              <Send size={12} /> Save
            </button>
          </div>
        </div>
      </Section>

      {/* Bundle / Notebook */}
      <Section icon={BookOpen} label="Bundle (file + notes + links)" open={open.bundle} onToggle={() => toggle('bundle')}>
        <div className="space-y-2">
          <input
            value={bundle.title}
            onChange={e => setBundle(b => ({ ...b, title: e.target.value }))}
            placeholder="Bundle title (e.g. 'Research on React')"
            className="w-full bg-white/5 text-white placeholder-muted text-sm outline-none rounded-lg px-3 py-2.5 border border-white/10 focus:border-primary/50 transition-colors"
          />
          {/* File attach */}
          <div
            onClick={() => bundleFileRef.current?.click()}
            className="flex items-center gap-2 px-3 py-2.5 rounded-lg border border-dashed border-white/10 hover:border-primary/50 cursor-pointer transition-colors"
          >
            <Upload size={13} className="text-muted" />
            <span className="text-xs text-muted flex-1 truncate">
              {bundle.file ? bundle.file.name : 'Attach a file (optional)'}
            </span>
            {bundle.file && (
              <button onClick={e => { e.stopPropagation(); setBundle(b => ({ ...b, file: null })) }}>
                <X size={12} className="text-muted hover:text-white" />
              </button>
            )}
          </div>
          <input ref={bundleFileRef} type="file" className="hidden"
            onChange={e => setBundle(b => ({ ...b, file: e.target.files[0] || null }))} />
          {/* Notes */}
          <textarea
            value={bundle.notes}
            onChange={e => setBundle(b => ({ ...b, notes: e.target.value }))}
            placeholder="Notes, thoughts, context..."
            className="w-full bg-white/5 text-white placeholder-muted text-sm resize-none outline-none rounded-lg px-3 py-2.5 border border-white/10 focus:border-primary/50 transition-colors min-h-[70px]"
          />
          {/* Links */}
          <div className="space-y-1.5">
            {bundle.links.map((link, i) => (
              <div key={i} className="flex gap-1.5">
                <input
                  value={link.url}
                  onChange={e => setBundle(b => { const links = [...b.links]; links[i] = { ...links[i], url: e.target.value }; return { ...b, links } })}
                  placeholder="URL"
                  className="flex-1 bg-white/5 text-white placeholder-muted text-xs outline-none rounded-lg px-3 py-2 border border-white/10 focus:border-primary/50 transition-colors"
                />
                <input
                  value={link.label}
                  onChange={e => setBundle(b => { const links = [...b.links]; links[i] = { ...links[i], label: e.target.value }; return { ...b, links } })}
                  placeholder="Label"
                  className="w-24 bg-white/5 text-white placeholder-muted text-xs outline-none rounded-lg px-3 py-2 border border-white/10 focus:border-primary/50 transition-colors"
                />
                {bundle.links.length > 1 && (
                  <button onClick={() => setBundle(b => ({ ...b, links: b.links.filter((_, j) => j !== i) }))}>
                    <X size={12} className="text-muted hover:text-error transition-colors" />
                  </button>
                )}
              </div>
            ))}
            <button
              onClick={() => setBundle(b => ({ ...b, links: [...b.links, { url: '', label: '' }] }))}
              className="flex items-center gap-1 text-xs text-muted hover:text-white transition-colors"
            >
              <Plus size={11} /> Add link
            </button>
          </div>
          <div className="flex justify-end pt-1">
            <button
              onClick={handleSubmitBundle}
              disabled={!bundle.title.trim() && !bundle.notes.trim() && !bundle.file && !bundle.links[0]?.url}
              className="flex items-center gap-2 bg-primary hover:bg-primary/80 disabled:opacity-40 text-white text-xs font-medium px-3 py-1.5 rounded-lg transition-all"
            >
              <Send size={12} /> Save Bundle
            </button>
          </div>
        </div>
      </Section>

      {/* Voice + Expiry row */}
      <div className="flex items-center gap-3 pt-1">
        <motion.button
          onClick={toggleRecording}
          whileTap={{ scale: 0.95 }}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
            isRecording
              ? 'bg-error/20 text-error border border-error/30 animate-pulse'
              : 'glass text-muted hover:text-white'
          }`}
        >
          {isRecording ? <MicOff size={14} /> : <Mic size={14} />}
          {isRecording ? 'Stop' : 'Record'}
        </motion.button>

        <div className="flex gap-1 ml-auto">
          {EXPIRY_OPTIONS.map(opt => (
            <button
              key={opt.value}
              onClick={() => setExpiry(opt.value)}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                expiry === opt.value ? 'bg-primary/20 text-primary border border-primary/30' : 'text-muted hover:text-white'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
