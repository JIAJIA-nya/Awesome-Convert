import React, { useState, useEffect } from 'react'
import { FolderOpen, ChevronDown } from 'lucide-react'

interface OutputDirSelectorProps {
  value: string
  mode: 'source' | 'custom' | 'subdir'
  onChange: (dir: string) => void
  onModeChange: (mode: 'source' | 'custom' | 'subdir') => void
}

export default function OutputDirSelector({ value, mode, onChange, onModeChange }: OutputDirSelectorProps) {
  const [showModeSelect, setShowModeSelect] = useState(false)

  const handleBrowse = async () => {
    const dir = await window.api.openDirectory()
    if (dir) onChange(dir)
  }

  const modeLabels = {
    source: '输出到源文件目录',
    custom: '自定义输出目录',
    subdir: '在源目录下创建子目录',
  }

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-text-secondary">输出目录</label>
      <div className="flex gap-2">
        <div className="relative flex-1">
          <button
            onClick={() => setShowModeSelect(!showModeSelect)}
            className="w-full flex items-center justify-between px-3 py-2 rounded-lg bg-surface hover:bg-surface-hover text-sm text-text-secondary transition-colors"
          >
            <span>{modeLabels[mode]}</span>
            <ChevronDown size={14} className={`transition-transform ${showModeSelect ? 'rotate-180' : ''}`} />
          </button>
          {showModeSelect && (
            <div className="absolute top-full left-0 right-0 mt-1 rounded-lg bg-bg-secondary border border-white/10 shadow-xl z-50 overflow-hidden">
              {(Object.keys(modeLabels) as Array<keyof typeof modeLabels>).map(m => (
                <button
                  key={m}
                  onClick={() => { onModeChange(m); setShowModeSelect(false) }}
                  className={`w-full px-3 py-2 text-left text-sm hover:bg-white/5 transition-colors ${mode === m ? 'text-primary' : 'text-text-secondary'}`}
                >
                  {modeLabels[m]}
                </button>
              ))}
            </div>
          )}
        </div>
        {mode === 'custom' && (
          <button
            onClick={handleBrowse}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-surface hover:bg-surface-hover text-sm text-text-secondary transition-colors"
          >
            <FolderOpen size={16} />
            浏览
          </button>
        )}
      </div>
      {mode === 'custom' && value && (
        <p className="text-xs text-text-muted truncate">{value}</p>
      )}
    </div>
  )
}
