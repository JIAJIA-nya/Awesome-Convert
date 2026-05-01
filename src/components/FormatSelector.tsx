import React from 'react'
import { motion } from 'framer-motion'

interface Format {
  id: string
  label: string
  ext: string
  icon?: string
}

interface FormatSelectorProps {
  formats: Format[]
  selected: string
  onSelect: (format: string) => void
  label?: string
}

export default function FormatSelector({ formats, selected, onSelect, label }: FormatSelectorProps) {
  return (
    <div className="space-y-3">
      {label && (
        <label className="text-sm font-medium text-text-secondary">{label}</label>
      )}
      <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-2">
        {formats.map((format, index) => (
          <motion.button
            key={format.id}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.03 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onSelect(format.id)}
            className={`
              format-card flex flex-col items-center gap-1.5 p-3 rounded-ac cursor-pointer
              ${selected === format.id ? 'selected' : 'bg-surface hover:bg-surface-hover'}
            `}
          >
            <div className={`
              w-10 h-10 rounded-lg flex items-center justify-center text-sm font-bold
              ${selected === format.id
                ? 'bg-primary/20 text-primary'
                : 'bg-white/5 text-text-muted'
              }
            `}>
              {format.icon || format.ext.toUpperCase().slice(0, 4)}
            </div>
            <span className={`text-xs font-medium ${selected === format.id ? 'text-primary-light' : 'text-text-secondary'}`}>
              {format.label}
            </span>
          </motion.button>
        ))}
      </div>
    </div>
  )
}
