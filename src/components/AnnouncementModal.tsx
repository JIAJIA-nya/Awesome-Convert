import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Bell } from 'lucide-react'

interface AnnouncementModalProps {
  show: boolean
  content: string
  title?: string
  onClose: () => void
  onDismiss: () => void
}

export default function AnnouncementModal({ show, content, title, onClose, onDismiss }: AnnouncementModalProps) {
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            onClick={e => e.stopPropagation()}
            className="glass rounded-2xl w-[520px] max-h-[70vh] flex flex-col shadow-2xl"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-white/5">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-indigo-500/20 flex items-center justify-center">
                  <Bell size={16} className="text-indigo-400" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-text">公告通知</h3>
                  {title && <p className="text-xs text-text-muted">{title}</p>}
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-1.5 rounded-lg hover:bg-white/10 transition-colors"
              >
                <X size={16} className="text-text-muted" />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto px-6 py-4">
              <div
                className="prose prose-invert prose-sm max-w-none
                  prose-headings:text-text prose-p:text-text-secondary prose-a:text-primary
                  prose-code:text-primary-light prose-pre:bg-surface prose-pre:border prose-pre:border-white/5
                  prose-li:text-text-secondary prose-strong:text-text"
                dangerouslySetInnerHTML={{ __html: content }}
              />
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between px-6 py-4 border-t border-white/5">
              <button
                onClick={onDismiss}
                className="text-xs text-text-muted hover:text-text-secondary transition-colors"
              >
                不再提示本次更新
              </button>
              <button
                onClick={onClose}
                className="px-4 py-2 rounded-lg bg-primary hover:bg-primary-dark text-white text-sm font-medium transition-colors"
              >
                关闭
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
