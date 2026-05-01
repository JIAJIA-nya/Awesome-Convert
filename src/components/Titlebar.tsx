import React, { useState, useEffect } from 'react'
import { Minus, Square, X, Maximize2 } from 'lucide-react'

export default function Titlebar() {
  const [isMaximized, setIsMaximized] = useState(false)

  useEffect(() => {
    window.api.isMaximized().then(setIsMaximized)
  }, [])

  return (
    <div className="titlebar-drag h-9 flex items-center justify-between bg-bg-secondary/80 backdrop-blur-xl shrink-0 select-none"
      style={{ borderBottom: '1px solid var(--border-color)' }}>
      <div className="flex items-center gap-2 pl-4">
        <div className="w-5 h-5 rounded-md bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
          <span className="text-[10px] font-bold text-white">AC</span>
        </div>
        <span className="text-sm font-medium text-text-secondary">Awesome-Convert</span>
      </div>

      <div className="titlebar-no-drag flex h-full">
        <button onClick={() => window.api.minimize()}
          className="w-12 h-full flex items-center justify-center hover:bg-black/5 dark:hover:bg-white/10 transition-colors">
          <Minus size={14} className="text-text-secondary" />
        </button>
        <button onClick={() => { window.api.maximize(); setIsMaximized(!isMaximized) }}
          className="w-12 h-full flex items-center justify-center hover:bg-black/5 dark:hover:bg-white/10 transition-colors">
          {isMaximized ? <Maximize2 size={12} className="text-text-secondary" /> : <Square size={12} className="text-text-secondary" />}
        </button>
        <button onClick={() => window.api.close()}
          className="w-12 h-full flex items-center justify-center hover:bg-red-500/80 transition-colors group">
          <X size={14} className="text-text-secondary group-hover:text-white" />
        </button>
      </div>
    </div>
  )
}
