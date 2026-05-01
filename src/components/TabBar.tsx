import React, { useRef, useEffect, useState } from 'react'
import { Archive, Video, Music, Image, FileText, Settings } from 'lucide-react'
import { motion } from 'framer-motion'
import { useTheme } from '../contexts/ThemeContext'

export type TabId = 'archive' | 'video' | 'audio' | 'image' | 'document' | 'settings'

const tabs: { id: TabId; label: string; icon: React.ReactNode }[] = [
  { id: 'archive', label: '压缩文件', icon: <Archive size={16} /> },
  { id: 'video', label: '视频文件', icon: <Video size={16} /> },
  { id: 'audio', label: '音频文件', icon: <Music size={16} /> },
  { id: 'image', label: '图片文件', icon: <Image size={16} /> },
  { id: 'document', label: '文档文件', icon: <FileText size={16} /> },
  { id: 'settings', label: '设置', icon: <Settings size={16} /> },
]

export default function TabBar({ activeTab, onTabChange }: { activeTab: TabId; onTabChange: (t: TabId) => void }) {
  const tabRefs = useRef<Map<string, HTMLButtonElement>>(new Map())
  const [indicator, setIndicator] = useState({ left: 0, width: 0 })
  const preset = useTheme().getPreset()

  useEffect(() => {
    const el = tabRefs.current.get(activeTab)
    if (el) setIndicator({ left: el.offsetLeft, width: el.offsetWidth })
  }, [activeTab])

  return (
    <div className="relative flex items-center gap-1 px-4 py-2 shrink-0 overflow-x-auto"
      style={{ background: 'color-mix(in srgb, var(--color-bg-secondary) 40%, transparent)', borderBottom: '1px solid var(--border-color)' }}>
      {tabs.map(tab => (
        <motion.button
          key={tab.id}
          ref={el => { if (el) tabRefs.current.set(tab.id, el) }}
          onClick={() => onTabChange(tab.id)}
          whileHover={preset.buttonHover as any}
          whileTap={preset.buttonTap as any}
          className={`relative flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200
            ${activeTab === tab.id ? 'text-text' : 'text-text-muted hover:text-text-secondary hover:bg-surface'}`}
        >
          {tab.icon}
          <span>{tab.label}</span>
        </motion.button>
      ))}

      <motion.div
        className="absolute bottom-0 h-0.5 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full"
        animate={{ left: indicator.left, width: indicator.width }}
        transition={preset.pageTransition}
      />
    </div>
  )
}
