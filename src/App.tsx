import React, { useState, useEffect } from 'react'
import { AnimatePresence } from 'framer-motion'
import { marked } from 'marked'
import Titlebar from './components/Titlebar'
import TabBar, { TabId } from './components/TabBar'
import AnnouncementModal from './components/AnnouncementModal'
import ArchivePage from './pages/ArchivePage'
import VideoPage from './pages/VideoPage'
import AudioPage from './pages/AudioPage'
import ImagePage from './pages/ImagePage'
import DocumentPage from './pages/DocumentPage'
import SettingsPage from './pages/SettingsPage'
import { useTheme } from './contexts/ThemeContext'

export default function App() {
  const [activeTab, setActiveTab] = useState<TabId>('archive')
  const theme = useTheme()
  const preset = theme.getPreset()
  const [announcement, setAnnouncement] = useState<{ show: boolean; content: string; title?: string }>({
    show: false, content: '',
  })

  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission()
    }
    window.api.onAnnouncement((data) => {
      const html = marked(data.content) as string
      setAnnouncement({ show: true, content: html, title: data.title })
    })
    window.api.onUpdateAvailable(() => {})
  }, [])

  const renderPage = () => {
    switch (activeTab) {
      case 'archive': return <ArchivePage key="archive" />
      case 'video': return <VideoPage key="video" />
      case 'audio': return <AudioPage key="audio" />
      case 'image': return <ImagePage key="image" />
      case 'document': return <DocumentPage key="document" />
      case 'settings': return <SettingsPage key="settings" />
    }
  }

  return (
    <div className="flex flex-col h-full bg-bg">
      {/* Background gradient — driven by theme */}
      <div
        className="fixed inset-0 pointer-events-none transition-all duration-700"
        style={{ background: 'var(--bg-gradient)' }}
      />

      <div className="relative flex flex-col h-full">
        <Titlebar />
        <TabBar activeTab={activeTab} onTabChange={setActiveTab} />

        <AnimatePresence mode="wait">
          {renderPage()}
        </AnimatePresence>
      </div>

      <AnnouncementModal
        show={announcement.show}
        content={announcement.content}
        title={announcement.title}
        onClose={() => setAnnouncement(p => ({ ...p, show: false }))}
        onDismiss={() => { setAnnouncement(p => ({ ...p, show: false })); window.api.setStore('announcementDismissed', true) }}
      />
    </div>
  )
}
