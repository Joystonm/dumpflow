import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowRight, Zap } from 'lucide-react'

const DROPS = [
  { type: 'Screenshot', title: 'Figma component idea', meta: 'Design Inspiration · 2m ago' },
  { type: 'Prompt', title: 'Write a landing page that doesn\'t suck', meta: 'AI Prompts · 14m ago' },
  { type: 'GitHub', title: 'shadcn/ui', meta: 'Code & Dev · 1h ago' },
  { type: 'Link', title: "Linear's approach to product", meta: 'Research · 3h ago' },
  { type: 'Voice', title: 'Startup idea — B2B clipboard tool', meta: 'Startup Ideas · yesterday' },
]

const fade = (delay = 0) => ({
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.45, delay, ease: [0.25, 0.1, 0.25, 1] },
})

export default function Landing() {
  return (
    <div className="min-h-screen bg-bg text-white">
      {/* Nav */}
      <nav className="flex items-center justify-between px-8 py-6 max-w-5xl mx-auto">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg flex items-center justify-center bg-primary">
            <Zap size={14} className="text-white" />
          </div>
          <span className="font-semibold tracking-tight">DumpFlow</span>
        </div>
        <div className="flex items-center gap-6">
          <Link to="/login" className="text-sm text-muted hover:text-white transition-colors">Sign in</Link>
          <Link to="/signup" className="text-sm font-medium text-white bg-white/10 hover:bg-white/15 px-4 py-2 rounded-lg transition-colors">
            Get started
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-5xl mx-auto px-8 pt-20 pb-28">
        <motion.p {...fade(0)} className="text-sm text-primary font-medium mb-5 tracking-wide uppercase">
          AI-powered capture
        </motion.p>
        <motion.h1 {...fade(0.08)} className="text-6xl sm:text-7xl font-black leading-[1.05] tracking-tight mb-8 max-w-3xl">
          Your brain dump,<br />finally organized.
        </motion.h1>
        <motion.p {...fade(0.16)} className="text-lg text-muted max-w-lg leading-relaxed mb-10">
          Paste anything — screenshots, links, prompts, voice notes.
          DumpFlow reads it, tags it, and puts it where it belongs.
        </motion.p>
        <motion.div {...fade(0.22)} className="flex items-center gap-4">
          <Link to="/app"
            className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-white font-semibold px-6 py-3 rounded-xl transition-colors">
            Open app <ArrowRight size={15} />
          </Link>
          <Link to="/signup" className="text-sm text-muted hover:text-white transition-colors">
            Free to use →
          </Link>
        </motion.div>
      </section>

      {/* Mock feed */}
      <section className="max-w-5xl mx-auto px-8 pb-28">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="border border-white/8 rounded-2xl overflow-hidden"
        >
          {/* Fake toolbar */}
          <div className="flex items-center gap-3 px-5 py-3.5 border-b border-white/8 bg-white/[0.02]">
            <div className="flex gap-1.5">
              <div className="w-3 h-3 rounded-full bg-white/10" />
              <div className="w-3 h-3 rounded-full bg-white/10" />
              <div className="w-3 h-3 rounded-full bg-white/10" />
            </div>
            <div className="flex-1 bg-white/5 rounded-md h-6 max-w-xs" />
          </div>
          {/* Drop list */}
          <div className="divide-y divide-white/5">
            {DROPS.map((drop, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 + i * 0.07, duration: 0.35 }}
                className="flex items-center gap-4 px-5 py-4 hover:bg-white/[0.02] transition-colors"
              >
                <span className="text-xs font-medium px-2 py-0.5 rounded-md bg-white/8 text-muted w-20 text-center flex-shrink-0">
                  {drop.type}
                </span>
                <span className="text-sm text-white font-medium flex-1 truncate">{drop.title}</span>
                <span className="text-xs text-muted/60 hidden sm:block flex-shrink-0">{drop.meta}</span>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* How it works */}
      <section className="max-w-5xl mx-auto px-8 pb-28 grid sm:grid-cols-3 gap-10">
        {[
          { n: '01', title: 'Dump it', desc: 'Paste, drag, record, or type. Any format, any time.' },
          { n: '02', title: 'AI reads it', desc: 'MiniMax analyzes content and generates title, tags, and category.' },
          { n: '03', title: 'Find it later', desc: 'Search by keyword or ask AI to surface what you need.' },
        ].map((step, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1, duration: 0.4 }}
          >
            <p className="text-4xl font-black text-white/8 mb-4">{step.n}</p>
            <h3 className="text-base font-semibold text-white mb-2">{step.title}</h3>
            <p className="text-sm text-muted leading-relaxed">{step.desc}</p>
          </motion.div>
        ))}
      </section>

      {/* Footer CTA */}
      <section className="border-t border-white/8">
        <div className="max-w-5xl mx-auto px-8 py-16 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div>
            <p className="text-xl font-bold text-white mb-1">Ready to stop losing things?</p>
            <p className="text-sm text-muted">Takes 30 seconds to set up.</p>
          </div>
          <Link to="/signup"
            className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-white font-semibold px-6 py-3 rounded-xl transition-colors flex-shrink-0">
            Start for free <ArrowRight size={15} />
          </Link>
        </div>
      </section>
    </div>
  )
}
