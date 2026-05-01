import React, { useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { Terminal } from 'lucide-react'

interface LogEntry {
  time: string
  message: string
  type: 'info' | 'success' | 'error'
}

interface ConversionLogProps {
  logs: LogEntry[]
}

export default function ConversionLog({ logs }: ConversionLogProps) {
  const logEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    logEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [logs])

  if (logs.length === 0) return null

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      className="rounded-ac bg-surface border border-white/5 overflow-hidden"
    >
      <div className="flex items-center gap-2 px-4 py-2 border-b border-white/5">
        <Terminal size={14} className="text-text-muted" />
        <span className="text-xs font-medium text-text-muted">转换日志</span>
      </div>
      <div className="log-area p-4 max-h-40 overflow-y-auto">
        {logs.map((log, i) => (
          <div key={i} className="flex gap-2">
            <span className="text-text-muted shrink-0">{log.time}</span>
            <span className={
              log.type === 'error' ? 'text-red-400' :
              log.type === 'success' ? 'text-emerald-400' :
              'text-text-secondary'
            }>
              {log.message}
            </span>
          </div>
        ))}
        <div ref={logEndRef} />
      </div>
    </motion.div>
  )
}
