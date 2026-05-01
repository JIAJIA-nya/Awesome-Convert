import React from 'react'
import { FileText } from 'lucide-react'
import ConversionPage from '../components/ConversionPage'

const formats = [
  { id: 'pdf', label: 'PDF', ext: 'pdf' },
  { id: 'docx', label: 'DOCX', ext: 'docx' },
  { id: 'txt', label: 'TXT', ext: 'txt' },
  { id: 'html', label: 'HTML', ext: 'html' },
  { id: 'md', label: 'Markdown', ext: 'md' },
  { id: 'csv', label: 'CSV', ext: 'csv' },
  { id: 'xlsx', label: 'XLSX', ext: 'xlsx' },
  { id: 'json', label: 'JSON', ext: 'json' },
]

const accept = [
  { name: '文档文件', extensions: ['pdf', 'docx', 'doc', 'txt', 'html', 'htm', 'md', 'csv', 'xlsx', 'json', 'rtf'] },
]

export default function DocumentPage() {
  return (
    <ConversionPage
      title="文档文件转换"
      description="支持 PDF、DOCX、TXT、CSV、XLSX 等格式互相转换"
      formats={formats}
      accept={accept}
      icon={<FileText size={20} className="text-primary" />}
    />
  )
}
