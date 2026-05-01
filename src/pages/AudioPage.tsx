import React from 'react'
import { Music } from 'lucide-react'
import ConversionPage from '../components/ConversionPage'

const formats = [
  { id: 'mp3', label: 'MP3', ext: 'mp3' },
  { id: 'wav', label: 'WAV', ext: 'wav' },
  { id: 'flac', label: 'FLAC', ext: 'flac' },
  { id: 'aac', label: 'AAC', ext: 'aac' },
  { id: 'ogg', label: 'OGG', ext: 'ogg' },
  { id: 'wma', label: 'WMA', ext: 'wma' },
  { id: 'm4a', label: 'M4A', ext: 'm4a' },
]

const accept = [
  { name: '音频文件', extensions: ['mp3', 'wav', 'flac', 'aac', 'ogg', 'wma', 'm4a', 'opus'] },
]

export default function AudioPage() {
  return (
    <ConversionPage
      title="音频文件转换"
      description="支持 MP3、WAV、FLAC、AAC 等格式互相转换"
      formats={formats}
      accept={accept}
      icon={<Music size={20} className="text-primary" />}
    />
  )
}
