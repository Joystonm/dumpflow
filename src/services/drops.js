import { supabase, BUCKETS } from '../lib/supabase'
import { analyzeText, analyzeImage, analyzeLink, analyzePrompt } from '../lib/minimax'
import { useDropsStore } from '../store'

function detectType(content, file) {
  if (file) {
    if (file.type.startsWith('image/')) return 'screenshot'
    if (file.type.startsWith('video/')) return 'video'
    if (file.type === 'application/pdf') return 'pdf'
    if (file.type.startsWith('audio/')) return 'voice'
    return 'file'
  }
  if (!content) return 'text'
  if (/^https?:\/\/github\.com/i.test(content)) return 'github'
  if (/^https?:\/\//i.test(content)) return 'link'
  if (content.length > 50 && /\n/.test(content)) return 'prompt'
  return 'text'
}

async function uploadFile(file, userId) {
  const bucket = file.type.startsWith('image/') ? BUCKETS.screenshots
    : file.type.startsWith('video/') ? BUCKETS.videos
    : file.type === 'application/pdf' ? BUCKETS.pdfs
    : file.type.startsWith('audio/') ? BUCKETS.voiceNotes
    : BUCKETS.images

  const ext = file.name.split('.').pop()
  const path = `${userId}/${Date.now()}.${ext}`
  const { data, error } = await supabase.storage.from(bucket).upload(path, file)
  if (error) throw error
  const { data: { publicUrl } } = supabase.storage.from(bucket).getPublicUrl(path)
  return { url: publicUrl, bucket, path }
}

async function getAIMeta(type, content, file) {
  try {
    if (type === 'screenshot' || type === 'image') {
      if (file) {
        const base64 = await fileToBase64(file)
        return await analyzeImage(base64, file.type)
      }
    }
    if (type === 'link' || type === 'github') return await analyzeLink(content)
    if (type === 'prompt') return await analyzePrompt(content)
    if (content) return await analyzeText(content)
    return { title: file?.name || 'Untitled', tags: [], category: 'Other', summary: '', space: 'Personal' }
  } catch {
    return { title: content?.slice(0, 60) || file?.name || 'Untitled', tags: [], category: 'Other', summary: '', space: 'Personal' }
  }
}

function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result.split(',')[1])
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

export async function createDrop({ content, file, userId, expiresIn, title: titleOverride }) {
  const { setUploading, setUploadProgress, addDrop } = useDropsStore.getState()
  setUploading(true)
  setUploadProgress({ stage: 'uploading', percent: 10 })

  try {
    const type = detectType(content, file)
    let fileUrl = null, fileName = null, fileSize = null

    if (file) {
      setUploadProgress({ stage: 'uploading', percent: 30 })
      const uploaded = await uploadFile(file, userId)
      fileUrl = uploaded.url
      fileName = file.name
      fileSize = file.size
    }

    setUploadProgress({ stage: 'analyzing', percent: 60 })
    const aiMeta = await getAIMeta(type, content, file)

    setUploadProgress({ stage: 'saving', percent: 85 })

    let expiresAt = null
    if (expiresIn === '24h') expiresAt = new Date(Date.now() + 86400000).toISOString()
    else if (expiresIn === '7d') expiresAt = new Date(Date.now() + 604800000).toISOString()
    else if (expiresIn === '30d') expiresAt = new Date(Date.now() + 2592000000).toISOString()

    const drop = {
      user_id: userId,
      type,
      title: titleOverride || aiMeta.title || content?.slice(0, 60) || fileName || 'Untitled',
      content: content || null,
      file_url: fileUrl,
      file_name: fileName,
      file_size: fileSize,
      ai_summary: aiMeta.summary || '',
      ai_category: aiMeta.category || 'Other',
      ai_space: aiMeta.space || 'Personal',
      ai_metadata: aiMeta,
      tags: aiMeta.tags || [],
      expires_at: expiresAt,
    }

    const { data, error } = await supabase.from('drops').insert(drop).select().single()
    if (error) throw error

    addDrop(data)
    setUploadProgress({ stage: 'done', percent: 100 })
    return data
  } finally {
    setTimeout(() => { setUploading(false); setUploadProgress(null) }, 800)
  }
}

export async function createBundleDrop({ title, notes, file, links, userId, expiresIn }) {
  const { setUploading, setUploadProgress, addDrop } = useDropsStore.getState()
  setUploading(true)
  setUploadProgress({ stage: 'uploading', percent: 10 })

  try {
    let fileUrl = null, fileName = null, fileSize = null
    if (file) {
      setUploadProgress({ stage: 'uploading', percent: 30 })
      const uploaded = await uploadFile(file, userId)
      fileUrl = uploaded.url
      fileName = file.name
      fileSize = file.size
    }

    setUploadProgress({ stage: 'analyzing', percent: 60 })
    let aiMeta = { title: title || 'Bundle', tags: [], category: 'Other', summary: '', space: 'Personal' }
    try {
      if (notes) aiMeta = await analyzeText(notes)
    } catch {}

    setUploadProgress({ stage: 'saving', percent: 85 })

    let expiresAt = null
    if (expiresIn === '24h') expiresAt = new Date(Date.now() + 86400000).toISOString()
    else if (expiresIn === '7d') expiresAt = new Date(Date.now() + 604800000).toISOString()
    else if (expiresIn === '30d') expiresAt = new Date(Date.now() + 2592000000).toISOString()

    const drop = {
      user_id: userId,
      type: 'text',
      title: title || aiMeta.title || 'Bundle',
      content: notes || null,
      file_url: fileUrl,
      file_name: fileName,
      file_size: fileSize,
      ai_summary: aiMeta.summary || '',
      ai_category: aiMeta.category || 'Other',
      ai_space: aiMeta.space || 'Personal',
      ai_metadata: { ...aiMeta, bundle: true, links: links.filter(l => l.url) },
      tags: aiMeta.tags || [],
      expires_at: expiresAt,
    }

    const { data, error } = await supabase.from('drops').insert(drop).select().single()
    if (error) throw error

    addDrop(data)
    setUploadProgress({ stage: 'done', percent: 100 })
    return data
  } finally {
    setTimeout(() => { setUploading(false); setUploadProgress(null) }, 800)
  }
}

export async function fetchDrops(userId) {
  const { data, error } = await supabase
    .from('drops')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
  if (error) throw error
  return data || []
}

export async function fetchSpaces(userId) {
  const { data, error } = await supabase
    .from('spaces')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
  if (error) throw error
  return data || []
}

export async function toggleFavorite(dropId, current) {
  const { data, error } = await supabase
    .from('drops').update({ is_favorite: !current }).eq('id', dropId).select().single()
  if (error) throw error
  return data
}

export async function archiveDrop(dropId) {
  const { data, error } = await supabase
    .from('drops').update({ is_archived: true }).eq('id', dropId).select().single()
  if (error) throw error
  return data
}

export async function deleteDrop(dropId) {
  const { error } = await supabase.from('drops').delete().eq('id', dropId)
  if (error) throw error
}

export async function updateDropSpace(dropId, spaceId) {
  const { data, error } = await supabase
    .from('drops').update({ space_id: spaceId }).eq('id', dropId).select().single()
  if (error) throw error
  return data
}
