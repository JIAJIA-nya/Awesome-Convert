import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { X, CheckCircle2, AlertCircle } from 'lucide-react'

export default function ProgressApp() {
  const [progress, setProgress] = useState(0)
  const [message, setMessage] = useState('准备中...')
  const [done, setDone] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    window.api.onStartCliConversion(async (args) => {
      const { input, to } = args
      if (!input || !to) {
        setError('缺少参数')
        setDone(true)
        return
      }

      setMessage(`正在转换为 .${to}...`)

      const result = await window.api.startConvert({
        inputPath: input,
        outputFormat: to,
      })

      if (result.success) {
        setProgress(100)
        setMessage('转换完成')
        // Auto close after 2s
        setTimeout(() => window.close(), 2000)
      } else {
        setError(result.error || '转换失败')
      }
      setDone(true)
    })

    window.api.onConvertProgress((data) => {
      setProgress(data.progress)
      setMessage(data.message)
    })
  }, [])

  return (
    <div className="w-full h-full bg-bg-secondary/90 backdrop-blur-xl rounded-2xl border border-white/10 shadow-2xl overflow-hidden">
      <div className="flex items-center justify-between px-4 py-2 border-b border-white/5">
        <span className="text-xs font-medium text-text-secondary">Awesome-Convert</span>
        <button onClick={() => window.close()} className="p-1 rounded hover:bg-white/10">
          <X size={12} className="text-text-muted" />
        </button>
      </div>

      <div className="px-4 py-3 space-y-3">
        <div className="flex items-center gap-3">
          {done && !error ? (
            <CheckCircle2 size={18} className="text-emerald-400" />
          ) : error ? (
            <AlertCircle size={18} className="text-red-400" />
          ) : (
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
              className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full"
            />
          )}
          <span className="text-sm text-text-secondary truncate">{error || message}</span>
        </div>

        {!error && (
          <div className="h-1.5 rounded-full bg-white/5 overflow-hidden">
            <motion.div
              className="h-full rounded-full progress-bar-gradient"
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
        )}
      </div>
    </div>
  )
}
