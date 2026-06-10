import { useState, useCallback, useMemo } from 'react'
import Editor from '@monaco-editor/react'
import ScrollProgress from './ScrollProgress'
import scrollSource from './ScrollProgress.jsx?raw'
import { handleEditorBeforeMount } from './monacoTheme'
import './Playground.css'

const TABS = ['Preview', 'Code']
const PROPS = [
  { name: 'color', type: 'string', default: "'#7ec8e3'", desc: 'Primary accent color' },
  { name: 'height', type: 'number', default: '3', desc: 'Bar height in pixels' },
  { name: 'glow', type: 'boolean', default: 'true', desc: 'Show shadow glow on the bar' },
  { name: 'particles', type: 'boolean', default: 'true', desc: 'Enable burst particles on section change' },
  { name: 'particleCount', type: 'number', default: '20', desc: 'Number of particles per burst' },
  { name: 'sections', type: 'array', default: '[]', desc: 'CSS selectors for section boundary tracking' },
  { name: 'zIndex', type: 'number', default: '9999', desc: 'z-index of the fixed bar' },
  { name: 'trailing', type: 'boolean', default: 'true', desc: 'Show a secondary fainter trailing bar' },
]

function Section({ title, children }) {
  return (
    <div className="gp-section">
      <div className="gp-section-title">{title}</div>
      {children}
    </div>
  )
}

function ColorRow({ label, value, onChange }) {
  return (
    <div className="gp-row">
      <span className="gp-label">{label}</span>
      <input type="color" value={value} onChange={onChange} className="gp-color" />
      <span className="gp-hex">{value}</span>
    </div>
  )
}

function ToggleRow({ label, value, onChange }) {
  return (
    <div className="gp-row">
      <span className="gp-label">{label}</span>
      <button className={`gp-toggle ${value ? 'active' : ''}`} onClick={() => onChange(!value)}>
        {value ? 'On' : 'Off'}
      </button>
    </div>
  )
}

function RangeRow({ label, value, min, max, step, onChange }) {
  return (
    <div className="gp-row">
      <span className="gp-label">{label}</span>
      <input type="range" min={min} max={max} step={step} value={value} onChange={e => onChange(Number(e.target.value))} className="gp-range" />
      <span className="gp-hex">{value}</span>
    </div>
  )
}

const SECTION_COLORS = ['#2a1a3a', '#1a2a3a', '#1a3a2a', '#3a2a1a', '#2a2a4a', '#1a3a3a']

export default function ScrollProgressPlayground() {
  const [tab, setTab] = useState('Preview')
  const [color, setColor] = useState('#7ec8e3')
  const [height, setHeight] = useState(3)
  const [glow, setGlow] = useState(true)
  const [particles, setParticles] = useState(true)
  const [particleCount, setParticleCount] = useState(20)
  const [trailing, setTrailing] = useState(true)
  const [zIndex, setZIndex] = useState(9999)

  const reset = useCallback(() => {
    setColor('#7ec8e3')
    setHeight(3)
    setGlow(true)
    setParticles(true)
    setParticleCount(20)
    setTrailing(true)
    setZIndex(9999)
  }, [])

  const sections = useMemo(() =>
    SECTION_COLORS.map((_, i) => `#sp-section-${i}`),
  [])

  return (
    <div className="gp-page">
      <ScrollProgress
        color={color}
        height={height}
        glow={glow}
        particles={particles}
        particleCount={particleCount}
        trailing={trailing}
        zIndex={zIndex}
      />

      <div className="gp-hero">
        <h1 className="gp-title">Scroll Progress</h1>
        <p className="gp-desc">
          A thin progress bar at the top of the page that tracks scroll progress with particle bursts
          at section boundaries. Scroll down to see it in action.
        </p>
      </div>

      <div className="gp-demo-tabs">
        {TABS.map(t => (
          <button key={t} className={`gp-demo-tab ${tab === t ? 'active' : ''}`} onClick={() => setTab(t)}>
            {t}
          </button>
        ))}
        <button className="gp-demo-reset" onClick={reset}>Reset</button>
      </div>

      <div className="gp-demo">
        {tab === 'Preview' ? (
          <div className="gp-demo-inner">
            <div className="gp-preview-col">
              <div className="gp-preview-scene" style={{ background: 'var(--bg)', overflow: 'auto', height: 'auto', minHeight: '480px' }}>
                <div style={{ padding: '40px 32px' }}>
                  <div style={{ display: 'flex', gap: '24px', marginBottom: '32px', flexWrap: 'wrap' }}>
                    <div className="gp-preview-controls" style={{ flex: '1', minWidth: '240px', borderRight: 'none', maxHeight: 'none', border: '1px solid var(--border)', borderRadius: 'var(--radius)' }}>
                      <Section title="APPEARANCE">
                        <ColorRow label="Color" value={color} onChange={e => setColor(e.target.value)} />
                        <RangeRow label="Height" value={height} min={1} max={8} step={1} onChange={setHeight} />
                        <ToggleRow label="Glow" value={glow} onChange={setGlow} />
                        <ToggleRow label="Trailing" value={trailing} onChange={setTrailing} />
                      </Section>
                      <Section title="PARTICLES">
                        <ToggleRow label="Particles" value={particles} onChange={setParticles} />
                        <RangeRow label="Count" value={particleCount} min={5} max={50} step={1} onChange={setParticleCount} />
                      </Section>
                      <Section title="LAYER">
                        <RangeRow label="zIndex" value={zIndex} min={1} max={99999} step={1} onChange={setZIndex} />
                      </Section>
                    </div>
                    <div className="gp-usage-panel" style={{ width: '280px', maxHeight: 'none', border: '1px solid var(--border)', borderRadius: 'var(--radius)' }}>
                      <div className="gp-doc-section">
                        <h2 className="gp-doc-h2">Usage</h2>
                        <pre className="gp-doc-code">{`import ScrollProgress from './components/ScrollProgress'

function Demo() {
  return (
    <ScrollProgress
      color="#7ec8e3"
      height={3}
      glow
      particles
    />
  )
}`}</pre>
                      </div>
                    </div>
                  </div>

                  <p className="gp-doc-p" style={{ marginBottom: '32px', color: 'var(--text-dim)', fontSize: '12px' }}>
                    Scroll down to see the progress bar advance and particles burst at section boundaries (every 20%).
                  </p>

                  {SECTION_COLORS.map((bg, i) => (
                    <div
                      key={i}
                      id={`sp-section-${i}`}
                      style={{
                        height: i === SECTION_COLORS.length - 1 ? '300px' : '360px',
                        background: bg,
                        borderRadius: 'var(--radius)',
                        marginBottom: '24px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        border: '1px solid var(--border)',
                      }}
                    >
                      <span style={{ color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)', fontSize: '13px', opacity: 0.6 }}>
                        Section {i + 1}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="gp-code-col">
            <div className="gp-code-editor">
              <Editor
                height="100%"
                language="javascript"
                theme="single-color"
                beforeMount={handleEditorBeforeMount}
                value={scrollSource}
                options={{
                  readOnly: true,
                  minimap: { enabled: false },
                  fontSize: 12,
                  lineNumbers: 'on',
                  scrollBeyondLastLine: false,
                  padding: { top: 12 },
                  renderWhitespace: 'selection',
                  fontFamily: "'SF Mono','Fira Code','Consolas',monospace",
                }}
              />
            </div>
          </div>
        )}
      </div>

      <div className="gp-docs">
        <section className="gp-doc-section">
          <h2 className="gp-doc-h2">Installation</h2>
          <p className="gp-doc-p">No external dependencies required. Copy <code className="gp-doc-inline">ScrollProgress.jsx</code> and <code className="gp-doc-inline">ScrollProgress.css</code> into your project.</p>
        </section>

        <section className="gp-doc-section">
          <h2 className="gp-doc-h2">Props</h2>
          <div className="gp-table-wrap">
            <table className="gp-props-table">
              <thead>
                <tr>
                  <th>Prop</th>
                  <th>Type</th>
                  <th>Default</th>
                  <th>Description</th>
                </tr>
              </thead>
              <tbody>
                {PROPS.map(p => (
                  <tr key={p.name}>
                    <td><code>{p.name}</code></td>
                    <td><code>{p.type}</code></td>
                    <td><code>{p.default}</code></td>
                    <td>{p.desc}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </div>
  )
}
