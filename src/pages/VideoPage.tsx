import React from 'react'
import { Video } from 'lucide-react'
import ConversionPage from '../components/ConversionPage'

const formats = [
  { id: 'mp4', label: 'MP4', ext: 'mp4' },
  { id: 'mkv', label: 'MKV', ext: 'mkv' },
  { id: 'avi', label: 'AVI', ext: 'avi' },
  { id: 'mov', label: 'MOV', ext: 'mov' },
  { id: 'wmv', label: 'WMV', ext: 'wmv' },
  { id: 'flv', label: 'FLV', ext: 'flv' },
  { id: 'webm', label: 'WebM', ext: 'webm' },
]

const accept = [
  { name: '视频文件', extensions: ['mp4', 'mkv', 'avi', 'mov', 'wmv', 'flv', 'webm', 'ts', 'm4v'] },
]

export default function VideoPage() {
  return (
    <ConversionPage
      title="视频文件转换"
      description="支持 MP4、MKV、AVI、MOV 等格式互相转换"
      formats={formats}
      accept={accept}
      icon={<Video size={20} className="text-primary" />}
    />
  )
}
