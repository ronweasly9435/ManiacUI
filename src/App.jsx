import { useState, useEffect } from 'react'
import Landing from './pages/Landing'
import Sidebar from './components/Sidebar'
import SearchDialog from './components/SearchDialog'
import CarouselPlayground from './components/CarouselPlayground'
import LanyardPlayground from './components/LanyardPlayground'
import BlobPlayground from './components/BlobPlayground'
import TiltCardPlayground from './components/TiltCardPlayground'
import FluidOrbPlayground from './components/FluidOrbPlayground'
import ShockButtonPlayground from './components/ShockButtonPlayground'
import ScrambleTextPlayground from './components/ScrambleTextPlayground'
import WarpCardPlayground from './components/WarpCardPlayground'
import InfiniteMarqueePlayground from './components/InfiniteMarqueePlayground'
import GridMorphPlayground from './components/GridMorphPlayground'
import ParticleImagePlayground from './components/ParticleImagePlayground'
import RippleRevealPlayground from './components/RippleRevealPlayground'
import MagneticStackPlayground from './components/MagneticStackPlayground'
import CursorTrailPlayground from './components/CursorTrailPlayground'
import KineticTextPlayground from './components/KineticTextPlayground'
import GradientMeshPlayground from './components/GradientMeshPlayground'
import NoiseBorderPlayground from './components/NoiseBorderPlayground'
import ScrollProgressPlayground from './components/ScrollProgressPlayground'
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
  const [searchOpen, setSearchOpen] = useState(false)
  const [theme, setTheme] = useState(() => {
    try { return localStorage.getItem('opencode-theme') || 'dark' } catch { return 'dark' }
  })

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    try { localStorage.setItem('opencode-theme', theme) } catch {}
  }, [theme])

  const toggleTheme = () => setTheme(t => t === 'dark' ? 'light' : 'dark')

  useEffect(() => {
    function handleKey(e) {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        if (page === 'library') setSearchOpen(o => !o)
      }
      if (e.key === 'Escape' && searchOpen) setSearchOpen(false)
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [page, searchOpen])

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
          <button className="app-search-btn" onClick={() => setSearchOpen(true)} title="Search (Cmd+K)">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="14" height="14">
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.35-4.35" />
            </svg>
            <span className="app-search-text">Search</span>
            <kbd className="app-search-kbd">
              <span className="app-search-kbd-key">{'\u2318'}K</span>
            </kbd>
          </button>
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
          {activeId === 'fluidorb' && <FluidOrbPlayground />}
          {activeId === 'shockbutton' && <ShockButtonPlayground />}
          {activeId === 'scrambletext' && <ScrambleTextPlayground />}
          {activeId === 'warpcard' && <WarpCardPlayground />}
          {activeId === 'infinitemarquee' && <InfiniteMarqueePlayground />}
          {activeId === 'gridmorph' && <GridMorphPlayground />}
          {activeId === 'particleimage' && <ParticleImagePlayground />}
          {activeId === 'ripplereveal' && <RippleRevealPlayground />}
          {activeId === 'magneticstack' && <MagneticStackPlayground />}
          {activeId === 'cursortrail' && <CursorTrailPlayground />}
          {activeId === 'kinetictext' && <KineticTextPlayground />}
          {activeId === 'gradientmesh' && <GradientMeshPlayground />}
          {activeId === 'noiseborder' && <NoiseBorderPlayground />}
          {activeId === 'scrollprogress' && <ScrollProgressPlayground />}
        </main>

        <SearchDialog
          open={searchOpen}
          onClose={() => setSearchOpen(false)}
          onNavigate={(id) => { setActiveId(id); setSidebarOpen(false) }}
          onGoHome={() => setPage('landing')}
          onToggleTheme={toggleTheme}
        />
      </div>
    </div>
  )
}
