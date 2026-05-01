import React, { useState, useCallback } from 'react'
import { Upload, X } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useTheme } from '../contexts/ThemeContext'

interface DropZoneProps {
  files: string[]
  onFilesChange: (files: string[]) => void
  accept?: { name: string; extensions: string[] }[]
  label?: string
}

export default function DropZone({ files, onFilesChange, accept, label }: DropZoneProps) {
  const [isDragging, setIsDragging] = useState(false)
  const preset = useTheme().getPreset()

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
  }, [])

  // BUG FIX: use functional update to avoid stale closure on `files`
  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
    try {
      const dropped = Array.from(e.dataTransfer.files)
        .map(f => window.api.getPathForFile(f))
        .filter(Boolean)
      if (dropped.length > 0) {
        onFilesChange([...files, ...dropped])
      }
    } catch (err) {
      console.error('Drop error:', err)
    }
  }, [files, onFilesChange])

  const handleClick = async () => {
    try {
      const selected = await window.api.openFiles(accept)
      if (selected.length > 0) {
        onFilesChange([...files, ...selected])
      }
    } catch (err) {
      console.error('File open error:', err)
    }
  }

  const removeFile = (index: number) => {
    onFilesChange(files.filter((_, i) => i !== index))
  }

  return (
    <div className="space-y-3">
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={handleClick}
        className={`
          drop-zone relative cursor-pointer rounded-ac border-2 border-dashed
          flex flex-col items-center justify-center gap-3 p-8
          transition-all duration-300
          ${isDragging
            ? 'dragging border-primary bg-primary/10 scale-[1.02]'
            : 'border-white/15 hover:border-white/30 hover:bg-white/3'
          }
        `}
      >
        <motion.div
          animate={isDragging ? { y: [-5, 5, -5], scale: 1.1 } : { y: 0, scale: 1 }}
          transition={isDragging ? { repeat: Infinity, duration: 1 } : {}}
        >
          <Upload size={36} className={isDragging ? 'text-primary' : 'text-text-muted'} />
        </motion.div>
        <div className="text-center">
          <p className="text-sm font-medium text-text-secondary">
            {label || '拖放文件到这里，或点击选择'}
          </p>
          <p className="text-xs text-text-muted mt-1">支持批量添加</p>
        </div>
      </div>

      <AnimatePresence>
        {files.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="space-y-1.5 max-h-40 overflow-y-auto"
          >
            {files.map((file, index) => (
              <motion.div
                key={file + index}
                initial={preset.pageEnter as any}
                animate={{ opacity: 1, x: 0, y: 0, scale: 1 }}
                exit={preset.pageExit as any}
                transition={{ delay: index * 0.04 }}
                className="flex items-center gap-3 px-3 py-2 rounded-lg bg-surface hover:bg-surface-hover group transition-colors"
              >
                <div className="w-8 h-8 rounded-md bg-primary/10 flex items-center justify-center shrink-0">
                  <span className="text-[10px] font-bold text-primary">
                    {(file.split('.').pop() || '').toUpperCase().slice(0, 4)}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm truncate text-text">{file.split(/[/\\]/).pop()}</p>
                  <p className="text-xs text-text-muted truncate">{file}</p>
                </div>
                <button
                  onClick={(e) => { e.stopPropagation(); removeFile(index) }}
                  className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-white/10 transition-all"
                >
                  <X size={14} className="text-text-muted" />
                </button>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
