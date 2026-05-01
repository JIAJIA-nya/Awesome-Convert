import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Bell } from 'lucide-react'

interface Props {
  show: boolean
  content: string
  title?: string
  onClose: () => void
  onDismiss?: () => void
  showDismiss?: boolean
}

export default function AnnouncementModal({ show, content, title, onClose, onDismiss, showDismiss = true }: Props) {
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center"
          style={{ background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(6px)' }}
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 24 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 24 }}
            transition={{ type: 'spring', damping: 26, stiffness: 320 }}
            onClick={e => e.stopPropagation()}
            className="rounded-2xl w-[540px] max-h-[75vh] flex flex-col overflow-hidden"
            style={{
              background: 'var(--color-bg-secondary)',
              border: '1px solid var(--border-color)',
              boxShadow: '0 25px 60px rgba(0,0,0,0.45)',
            }}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4"
              style={{ borderBottom: '1px solid var(--border-color)' }}>
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center"
                  style={{ background: 'color-mix(in srgb, var(--color-primary) 15%, transparent)' }}>
                  <Bell size={18} style={{ color: 'var(--color-primary)' }} />
                </div>
                <div>
                  <h3 className="text-base font-semibold" style={{ color: 'var(--color-text)' }}>公告通知</h3>
                  {title && <p className="text-xs mt-0.5" style={{ color: 'var(--color-text-muted)' }}>{title}</p>}
                </div>
              </div>
              <button onClick={onClose}
                className="p-2 rounded-lg transition-colors hover:opacity-80"
                style={{ background: 'var(--color-surface)' }}>
                <X size={16} style={{ color: 'var(--color-text-muted)' }} />
              </button>
            </div>

            {/* Content — 用内联样式确保亮色/暗色都清晰 */}
            <div className="flex-1 overflow-y-auto px-6 py-5">
              <div
                className="announcement-content text-sm leading-relaxed"
                style={{ color: 'var(--color-text)' }}
                dangerouslySetInnerHTML={{ __html: content }}
              />
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between px-6 py-4"
              style={{ borderTop: '1px solid var(--border-color)' }}>
              {showDismiss && onDismiss ? (
                <button onClick={onDismiss}
                  className="text-xs transition-colors hover:opacity-80"
                  style={{ color: 'var(--color-text-muted)' }}>
                  不再提示本次更新
                </button>
              ) : <div />}
              <button onClick={onClose}
                className="px-5 py-2 rounded-lg text-white text-sm font-medium transition-all hover:brightness-110"
                style={{ background: 'var(--color-primary)' }}>
                关闭
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
