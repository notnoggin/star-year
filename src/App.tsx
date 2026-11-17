import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Star, Plus, Settings, Moon, Sun, Camera, Mic, Image as ImageIcon, X, Lock, Sparkles } from 'lucide-react'
import { cn } from './lib/utils'

type Theme = 'night' | 'day' | 'cosmic' | 'amber'
type View = 'garden' | 'entry' | 'add' | 'settings' | 'plans' | 'aod'

interface Memory {
  id: string
  date: string
  text: string
  mood?: string
  hasStar: boolean
}

const mockMemories: Memory[] = [
  { id: '1', date: '2026-11-14', text: "I notice that I've been trying really hard and focusing on just building a good life...", hasStar: true, mood: 'reflective' },
  { id: '2', date: '2026-11-13', text: "Took the long way home today. The light on the river was the kind you want to keep.", hasStar: true, mood: 'calm' },
]

function generateYearDays(year: number) {
  const days = []
  const start = new Date(year, 0, 1)
  for (let i = 0; i < 365; i++) {
    const d = new Date(start)
    d.setDate(start.getDate() + i)
    days.push(d)
  }
  return days
}

export default function App() {
  const [theme, setTheme] = useState<Theme>('night')
  const [view, setView] = useState<View>('garden')
  const [year, setYear] = useState(2026)
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [memories, setMemories] = useState<Memory[]>(mockMemories)
  const [showIsland, setShowIsland] = useState(false)
  const [islandMessage, setIslandMessage] = useState('')

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
  }, [theme])

  const days = generateYearDays(year)
  const today = new Date()

  const getMemoryForDate = (date: Date) => {
    const key = date.toISOString().split('T')[0]
    return memories.find(m => m.date === key)
  }

  const plantStar = (date: Date, text: string) => {
    const key = date.toISOString().split('T')[0]
    const newMem: Memory = { id: Date.now().toString(), date: key, text, hasStar: true, mood: 'grateful' }
    setMemories(prev => [...prev.filter(m => m.date !== key), newMem])
    setIslandMessage('Star planted ✦')
    setShowIsland(true)
    setTimeout(() => setShowIsland(false), 2500)
    setView('garden')
  }

  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--fg)] relative">
      <AnimatePresence>
        {showIsland && (
          <motion.div
            initial={{ y: -60, opacity: 0, scale: 0.9 }}
            animate={{ y: 12, opacity: 1, scale: 1 }}
            exit={{ y: -60, opacity: 0, scale: 0.9 }}
            className="fixed top-0 left-1/2 -translate-x-1/2 z-50 bg-black text-white px-5 py-2.5 rounded-full flex items-center gap-2 shadow-2xl text-sm font-medium"
          >
            <Sparkles className="w-4 h-4 text-yellow-400" />
            {islandMessage}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex justify-between items-center px-6 py-3 text-sm font-medium opacity-70">
        <span>{today.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
        <span>97%</span>
      </div>

      <AnimatePresence mode="wait">
        {view === 'garden' && (
          <GardenView
            days={days}
            year={year}
            setYear={setYear}
            getMemory={getMemoryForDate}
            onSelectDate={(d) => { setSelectedDate(d); setView('entry') }}
            onAdd={() => { setSelectedDate(today); setView('add') }}
            onSettings={() => setView('settings')}
            memories={memories}
          />
        )}
        {view === 'entry' && selectedDate && (
          <EntryView date={selectedDate} memory={getMemoryForDate(selectedDate)} onBack={() => setView('garden')} onEdit={() => setView('add')} />
        )}
        {view === 'add' && (
          <AddMemoryView date={selectedDate || today} onSave={plantStar} onBack={() => setView('garden')} />
        )}
        {view === 'settings' && (
          <SettingsView theme={theme} setTheme={setTheme} onBack={() => setView('garden')} onPlans={() => setView('plans')} />
        )}
        {view === 'plans' && (
          <PlansView onBack={() => setView('settings')} onClose={() => setView('garden')} />
        )}
        {view === 'aod' && (
          <AODView onExit={() => setView('garden')} />
        )}
      </AnimatePresence>

      {view === 'garden' && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 flex gap-3 bg-[var(--card)]/80 backdrop-blur-xl border border-[var(--border)] rounded-2xl p-1.5 shadow-2xl">
          <button className="p-3 rounded-xl bg-[var(--accent)]/20 text-[var(--accent)]"><Star className="w-5 h-5" /></button>
          <button onClick={() => setView('aod')} className="p-3 rounded-xl hover:bg-white/5"><Moon className="w-5 h-5" /></button>
        </div>
      )}
    </div>
  )
}

function GardenView({ days, year, setYear, getMemory, onSelectDate, onAdd, onSettings, memories }: any) {
  const months = Array.from({ length: 12 }, (_, i) => new Date(year, i, 1))
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="px-4 pb-32">
      <div className="flex items-center justify-between mb-6">
        <button onClick={onSettings} className="p-2 rounded-full hover:bg-white/5"><Settings className="w-5 h-5" /></button>
        <div className="flex items-center gap-3">
          <button onClick={() => setYear((y: number) => y - 1)} className="text-sm opacity-60">←</button>
          <h1 className="text-2xl font-semibold doodle">{year}</h1>
          <button onClick={() => setYear((y: number) => y + 1)} className="text-sm opacity-60">→</button>
        </div>
        <button onClick={onAdd} className="p-2 rounded-full bg-[var(--accent)] text-white"><Plus className="w-5 h-5" /></button>
      </div>
      <div className="grid grid-cols-3 gap-3 mb-6">
        <div className="bg-[var(--card)] rounded-2xl p-4 border border-[var(--border)]"><div className="text-2xl font-bold">{memories.length}</div><div className="text-xs opacity-60">stars planted</div></div>
        <div className="bg-[var(--card)] rounded-2xl p-4 border border-[var(--border)]"><div className="text-2xl font-bold">{Math.round((memories.length / 365) * 100)}%</div><div className="text-xs opacity-60">of the year</div></div>
        <div className="bg-[var(--card)] rounded-2xl p-4 border border-[var(--border)]"><div className="text-2xl font-bold">✦</div><div className="text-xs opacity-60">keep going</div></div>
      </div>
      <div className="space-y-8">
        {months.map((monthStart, mi) => {
          const monthDays = days.filter((d: Date) => d.getMonth() === mi)
          return (
            <div key={mi}>
              <div className="text-sm font-medium opacity-50 mb-3 doodle">{monthStart.toLocaleString('default', { month: 'long' })}</div>
              <div className="grid grid-cols-7 gap-2">
                {monthDays.map((day: Date, di: number) => {
                  const mem = getMemory(day)
                  const isToday = day.toDateString() === new Date().toDateString()
                  return (
                    <button key={di} onClick={() => onSelectDate(day)} className={cn("aspect-square rounded-xl flex items-center justify-center text-xs relative transition-all", mem ? "bg-[var(--accent)]/20" : "bg-[var(--card)]/40", isToday && "ring-2 ring-[var(--accent)]")}>
                      {mem ? <Star className="w-4 h-4 text-yellow-400 fill-yellow-400 star-glow" /> : <span className="opacity-30">{day.getDate()}</span>}
                    </button>
                  )
                })}
              </div>
            </div>
          )
        })}
      </div>
    </motion.div>
  )
}

function EntryView({ date, memory, onBack, onEdit }: any) {
  return (
    <motion.div initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} className="px-5 pt-4">
      <button onClick={onBack} className="mb-6 text-sm opacity-60">← Back</button>
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 rounded-2xl bg-yellow-400/20 flex items-center justify-center"><Star className="w-6 h-6 text-yellow-400 fill-yellow-400" /></div>
        <div><div className="text-sm opacity-50">Memory</div><div className="font-medium">{date.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}</div></div>
      </div>
      <div className="bg-[var(--card)] rounded-3xl p-6 border border-[var(--border)] min-h-[300px]"><p className="leading-relaxed text-lg">{memory?.text || "No memory planted yet."}</p></div>
      <button onClick={onEdit} className="mt-6 w-full py-4 bg-[var(--accent)] text-white rounded-2xl font-medium">Edit memory</button>
    </motion.div>
  )
}

function AddMemoryView({ date, onSave, onBack }: any) {
  const [text, setText] = useState('')
  return (
    <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="px-5 pt-4 pb-20">
      <div className="flex justify-between items-center mb-6"><button onClick={onBack}><X className="w-6 h-6" /></button><div className="text-sm opacity-60">{date.toLocaleDateString()}</div><div className="w-6" /></div>
      <textarea value={text} onChange={e => setText(e.target.value)} placeholder="What did you notice today?" className="w-full bg-transparent text-lg placeholder:opacity-40 resize-none outline-none min-h-[200px] doodle" autoFocus />
      <div className="fixed bottom-6 left-0 right-0 px-5 flex gap-3">
        <button className="p-4 rounded-2xl bg-[var(--card)] border border-[var(--border)]"><ImageIcon className="w-5 h-5" /></button>
        <button className="p-4 rounded-2xl bg-[var(--card)] border border-[var(--border)]"><Camera className="w-5 h-5" /></button>
        <button className="p-4 rounded-2xl bg-[var(--card)] border border-[var(--border)]"><Mic className="w-5 h-5" /></button>
        <button onClick={() => text.trim() && onSave(date, text)} className="flex-1 py-4 bg-[var(--accent)] text-white rounded-2xl font-medium">Plant Star</button>
      </div>
    </motion.div>
  )
}

function SettingsView({ theme, setTheme, onBack, onPlans }: any) {
  const themes = [
    { id: 'night', name: 'Night', icon: Moon },
    { id: 'day', name: 'Day', icon: Sun },
    { id: 'cosmic', name: 'Cosmic', icon: Sparkles },
    { id: 'amber', name: 'Amber', icon: Star },
  ]
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="px-5 pt-4 pb-20">
      <button onClick={onBack} className="mb-6 text-sm opacity-60">← Back</button>
      <h2 className="text-2xl font-semibold mb-6 doodle">Settings</h2>
      <div className="space-y-4">
        <div className="bg-[var(--card)] rounded-2xl p-4 border border-[var(--border)]">
          <div className="font-medium mb-3">Appearance</div>
          <div className="grid grid-cols-4 gap-2">
            {themes.map(t => (
              <button key={t.id} onClick={() => setTheme(t.id)} className={cn("flex flex-col items-center gap-1 p-3 rounded-xl border", theme === t.id ? "border-[var(--accent)] bg-[var(--accent)]/10" : "border-[var(--border)]")}>
                <t.icon className="w-5 h-5" /><span className="text-xs">{t.name}</span>
              </button>
            ))}
          </div>
        </div>
        <button onClick={onPlans} className="w-full bg-[var(--card)] rounded-2xl p-4 border border-[var(--border)] flex items-center justify-between">
          <div><div className="font-medium">Get Full Access</div><div className="text-sm opacity-60">Unlock photos, voice, doodles</div></div>
          <Lock className="w-5 h-5" />
        </button>
      </div>
    </motion.div>
  )
}

function PlansView({ onBack }: any) {
  return (
    <motion.div initial={{ y: 40, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="px-5 pt-4 pb-10">
      <button onClick={onBack} className="mb-4"><X className="w-6 h-6" /></button>
      <h2 className="text-3xl doodle text-center mb-2">Doodle your own stars</h2>
      <p className="text-center text-sm opacity-60 mb-8">Add photos, voice notes, and custom doodles to every memory</p>
      <div className="space-y-3 mb-8">
        <div className="border-2 border-[var(--accent)] rounded-2xl p-4 relative">
          <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[var(--accent)] text-white text-xs px-3 py-1 rounded-full">Save 49%</div>
          <div className="flex justify-between items-center"><div><div className="font-medium doodle text-xl">Yearly</div><div className="text-sm opacity-60">₦43,500.00 / Year</div></div><div className="text-right text-sm">₦834.24 / Week</div></div>
        </div>
        <div className="border border-[var(--border)] rounded-2xl p-4"><div className="flex justify-between items-center"><div><div className="font-medium doodle text-xl">Monthly</div><div className="text-sm opacity-60">₦7,210.00 / Month</div></div><div className="text-right text-sm">₦1,659.28 / Week</div></div></div>
      </div>
      <button className="w-full py-4 bg-[var(--accent)] text-white rounded-2xl font-medium text-lg mb-4">Try 1 week for free</button>
      <p className="text-center text-xs opacity-50 mb-6">1 week free, then ₦43,500.00/Year. Cancel anytime.</p>
    </motion.div>
  )
}

function AODView({ onExit }: any) {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="fixed inset-0 bg-black flex items-center justify-center" onClick={onExit}>
      <div className="relative w-full h-full overflow-hidden">
        {Array.from({ length: 40 }).map((_, i) => (
          <Star key={i} className="absolute text-purple-400/40" style={{ left: `${Math.random() * 100}%`, top: `${Math.random() * 100}%`, width: `${16 + Math.random() * 32}px`, transform: `rotate(${Math.random() * 360}deg)` }} />
        ))}
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 text-sm opacity-40">Tap to exit</div>
      </div>
    </motion.div>
  )
}
