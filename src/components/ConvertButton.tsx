import React, { useRef } from 'react'
import { motion } from 'framer-motion'
import { Zap, X, RotateCcw, FolderOpen } from 'lucide-react'

interface ConvertButtonProps {
  converting: boolean
  progress: number
  message: string
  canConvert: boolean
  result?: { success: boolean; outputPath?: string; error?: string } | null
  onStart: () => void
  onCancel: () => void
  onRetry: () => void
  onOpenFolder?: (path: string) => void
}

export default function ConvertButton({
  converting, progress, message, canConvert, result,
  onStart, onCancel, onRetry, onOpenFolder,
}: ConvertButtonProps) {
  const btnRef = useRef<HTMLButtonElement>(null)

  const handleRipple = (e: React.MouseEvent) => {
    const btn = btnRef.current
    if (!btn) return
    const rect = btn.getBoundingClientRect()
    const ripple = document.createElement('span')
    ripple.className = 'ripple'
    ripple.style.left = `${e.clientX - rect.left}px`
    ripple.style.top = `${e.clientY - rect.top}px`
    btn.appendChild(ripple)
    setTimeout(() => ripple.remove(), 600)
  }

  return (
    <div className="space-y-3">
      {/* Progress bar */}
      {converting && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="space-y-2"
        >
          <div className="flex items-center justify-between text-sm">
            <span className="text-text-secondary">{message}</span>
            <span className="text-primary font-mono">{Math.round(progress)}%</span>
          </div>
          <div className="h-2 rounded-full bg-white/5 overflow-hidden">
            <motion.div
              className="h-full rounded-full progress-bar-gradient"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
        </motion.div>
      )}

      {/* Result */}
      {result && !converting && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className={`p-4 rounded-ac ${result.success ? 'bg-emerald-500/10 border border-emerald-500/20' : 'bg-red-500/10 border border-red-500/20'}`}
        >
          {result.success ? (
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-emerald-400">转换成功</p>
                <p className="text-xs text-text-muted mt-1 truncate max-w-xs">{result.outputPath}</p>
              </div>
              <button
                onClick={() => result.outputPath && onOpenFolder?.(result.outputPath)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 text-sm transition-colors"
              >
                <FolderOpen size={14} />
                打开文件夹
              </button>
            </div>
          ) : (
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-red-400">转换失败</p>
                <p className="text-xs text-text-muted mt-1">{result.error}</p>
              </div>
              <button
                onClick={onRetry}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-red-500/20 hover:bg-red-500/30 text-red-400 text-sm transition-colors"
              >
                <RotateCcw size={14} />
                重试
              </button>
            </div>
          )}
        </motion.div>
      )}

      {/* Action buttons */}
      <div className="flex gap-3">
        {converting ? (
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
            onClick={onCancel}
            className="flex-1 flex items-center justify-center gap-2 py-3 rounded-ac bg-red-500/20 hover:bg-red-500/30 text-red-400 font-medium transition-colors"
          >
            <X size={18} />
            取消转换
          </motion.button>
        ) : (
          <motion.button
            ref={btnRef}
            whileHover={{ scale: canConvert ? 1.02 : 1 }}
            whileTap={{ scale: canConvert ? 0.97 : 1 }}
            onClick={(e) => { if (canConvert) { handleRipple(e); onStart() } }}
            disabled={!canConvert}
            className={`
              ripple-container flex-1 flex items-center justify-center gap-2 py-3 rounded-ac font-medium transition-all
              ${canConvert
                ? 'bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-400 hover:to-purple-500 text-white shadow-lg shadow-indigo-500/25'
                : 'bg-white/5 text-text-muted cursor-not-allowed'
              }
            `}
          >
            <Zap size={18} />
            开始转换
          </motion.button>
        )}
      </div>
    </div>
  )
}
