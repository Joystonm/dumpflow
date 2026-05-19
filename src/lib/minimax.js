const MINIMAX_API_URL = 'https://api.minimax.io/v1/text/chatcompletion_v2'
const API_KEY = import.meta.env.VITE_MINIMAX_API_KEY

async function callMiniMax(messages, system) {
  const res = await fetch(MINIMAX_API_URL, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'MiniMax-M1',
      messages: [{ role: 'system', content: system }, ...messages],
    }),
  })
  if (!res.ok) throw new Error(`MiniMax API error: ${res.status}`)
  const data = await res.json()
  return data.choices?.[0]?.message?.content || ''
}

function parseJSON(text) {
  try {
    const match = text.match(/\{[\s\S]*\}/)
    return match ? JSON.parse(match[0]) : null
  } catch { return null }
}

const SYSTEM_PROMPT = `You are DumpFlow's AI engine. Analyze content and return ONLY valid JSON with these fields:
{"title":"string","tags":["tag1","tag2","tag3"],"category":"string","summary":"string","space":"string"}
Categories: Design Inspiration, Code & Dev, AI Prompts, Content Ideas, Research, Entertainment, Productivity, Startup Ideas, Learning, Other
Spaces: UI Inspiration, AI Prompts, Hackathon Ideas, Startup Concepts, Content Hooks, Dev Resources, Learning, Personal, Other`

export async function analyzeText(text) {
  const raw = await callMiniMax([{ role: 'user', content: `Analyze this content:\n\n${text.slice(0, 2000)}` }], SYSTEM_PROMPT)
  return parseJSON(raw) || { title: text.slice(0, 60), tags: ['Text'], category: 'Other', summary: text.slice(0, 120), space: 'Personal' }
}

export async function analyzeImage(base64Image, mimeType = 'image/jpeg') {
  const raw = await callMiniMax([{
    role: 'user',
    content: [
      { type: 'image_url', image_url: { url: `data:${mimeType};base64,${base64Image}` } },
      { type: 'text', text: 'Analyze this image and return structured JSON metadata.' }
    ]
  }], SYSTEM_PROMPT)
  return parseJSON(raw) || { title: 'Image', tags: ['Image'], category: 'Design Inspiration', summary: 'Uploaded image', space: 'UI Inspiration' }
}

export async function analyzeLink(url) {
  const prompt = url.includes('github.com')
    ? `Analyze this GitHub repo URL and infer its purpose: ${url}`
    : `Analyze this URL and describe what it likely contains: ${url}`
  const raw = await callMiniMax([{ role: 'user', content: prompt }], SYSTEM_PROMPT)
  return parseJSON(raw) || { title: url, tags: ['Link'], category: 'Research', summary: url, space: 'Dev Resources' }
}

export async function analyzePrompt(text) {
  const raw = await callMiniMax([{
    role: 'user',
    content: `This is an AI/writing/coding prompt. Categorize it:\n\n${text.slice(0, 1000)}`
  }], SYSTEM_PROMPT)
  return parseJSON(raw) || { title: text.slice(0, 60), tags: ['Prompt'], category: 'AI Prompts', summary: text.slice(0, 120), space: 'AI Prompts' }
}

export async function transcribeAndAnalyze(transcript) {
  const raw = await callMiniMax([{
    role: 'user',
    content: `This is a voice note transcript. Summarize and categorize:\n\n${transcript}`
  }], SYSTEM_PROMPT)
  return parseJSON(raw) || { title: 'Voice Note', tags: ['Voice'], category: 'Personal', summary: transcript.slice(0, 120), space: 'Personal' }
}

export async function semanticSearch(query, drops) {
  const context = drops.map(d => `ID:${d.id} Title:${d.title} Tags:${d.tags?.join(',')} Summary:${d.ai_summary}`).join('\n')
  const raw = await callMiniMax([{
    role: 'user',
    content: `Query: "${query}"\n\nContent:\n${context.slice(0, 3000)}\n\nReturn JSON array of matching IDs: {"ids":["id1","id2"]}`
  }], 'You are a semantic search engine. Return ONLY JSON with matching IDs.')
  const result = parseJSON(raw)
  return result?.ids || []
}
