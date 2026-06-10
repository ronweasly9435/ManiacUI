import { useState, useEffect } from 'react'
import Landing from './pages/Landing'
import Sidebar from './components/Sidebar'
import CarouselPlayground from './components/CarouselPlayground'
import LanyardPlayground from './components/LanyardPlayground'
import BlobPlayground from './components/BlobPlayground'
import TiltCardPlayground from './components/TiltCardPlayground'
import './App.css'

function ThemeBtn({ theme, toggle }) {
  return (
    <button className="app-theme-btn" onClick={toggle} title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}>
      {theme === 'dark' ? '\u2600' : '\uD83C\uDF19'}
    </button>
  )
}

export default function App() {
  const [page, setPage] = useState('landing')
  const [activeId, setActiveId] = useState('lanyard')
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [theme, setTheme] = useState(() => {
    try { return localStorage.getItem('opencode-theme') || 'dark' } catch { return 'dark' }
  })

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    try { localStorage.setItem('opencode-theme', theme) } catch {}
  }, [theme])

  const toggleTheme = () => setTheme(t => t === 'dark' ? 'light' : 'dark')

  if (page === 'landing') {
    return <Landing theme={theme} onToggleTheme={toggleTheme} onEnter={() => setPage('library')} />
  }

  return (
    <div className="app-layout">
      <header className="app-header">
        <div className="app-header-left">
          <button className="app-hamburger" onClick={() => setSidebarOpen(!sidebarOpen)}>
            {sidebarOpen ? '\u2715' : '\u2630'}
          </button>
          <span className="app-logo">{'\u25A0'} opencode</span>
        </div>
        <div className="app-header-right">
          <button className="app-header-btn" onClick={() => setPage('landing')}>Home</button>
          <a className="app-header-link" href="https://opencode.ai" target="_blank" rel="noopener noreferrer">Docs</a>
          <a className="app-header-link" href="https://github.com/anomalyco/opencode" target="_blank" rel="noopener noreferrer">GitHub</a>
          <ThemeBtn theme={theme} toggle={toggleTheme} />
        </div>
      </header>
      <div className="app-body">
        <div className={`app-sidebar-overlay ${sidebarOpen ? 'open' : ''}`} onClick={() => setSidebarOpen(false)} />
        <Sidebar activeId={activeId} onSelect={(id) => { setActiveId(id); setSidebarOpen(false) }} open={sidebarOpen} />
        <main className="app-content">
          {activeId === 'carousel' && <CarouselPlayground />}
          {activeId === 'lanyard' && <LanyardPlayground />}
          {activeId === 'blob' && <BlobPlayground />}
          {activeId === 'tiltcard' && <TiltCardPlayground />}
        </main>
      </div>
    </div>
  )
}
