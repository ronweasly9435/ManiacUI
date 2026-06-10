import { useState, useCallback } from 'react'
import Editor from '@monaco-editor/react'
import CursorTrail from './CursorTrail'
import trailSource from './CursorTrail.jsx?raw'
import { handleEditorBeforeMount } from './monacoTheme'
import './Playground.css'

const TABS = ['Preview', 'Code']
const PROPS = [
  { name: 'color', type: 'string', default: "'#7ec8e3'", desc: 'Primary trail color' },
  { name: 'secondaryColor', type: 'string', default: "'#6a5acd'", desc: 'Secondary trail color' },
  { name: 'size', type: 'number', default: '12', desc: 'Maximum circle radius' },
  { name: 'trailLength', type: 'number', default: '12', desc: 'Number of trail points' },
  { name: 'smoothing', type: 'number', default: '0.15', desc: 'Lerp factor for trail following' },
  { name: 'glow', type: 'number', default: '20', desc: 'Blur amount in pixels' },
  { name: 'fade', type: 'boolean', default: 'true', desc: 'Fading residue on the canvas' },
  { name: 'mixMode', type: 'string', default: "'screen'", desc: 'Canvas composite operation' },
  { name: 'interactive', type: 'boolean', default: 'true', desc: 'Pauses trail when mouse stops' },
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

function SelectRow({ label, value, onChange, options }) {
  return (
    <div className="gp-row">
      <span className="gp-label">{label}</span>
      <select value={value} onChange={e => onChange(e.target.value)} className="gp-text-input" style={{ width: 'auto', flex: '0 1 auto' }}>
        {options.map(o => (
          <option key={o} value={o}>{o}</option>
        ))}
      </select>
    </div>
  )
}

export default function CursorTrailPlayground() {
  const [tab, setTab] = useState('Preview')
  const [color, setColor] = useState('#7ec8e3')
  const [secondaryColor, setSecondaryColor] = useState('#6a5acd')
  const [size, setSize] = useState(12)
  const [trailLength, setTrailLength] = useState(12)
  const [smoothing, setSmoothing] = useState(0.15)
  const [glow, setGlow] = useState(20)
  const [fade, setFade] = useState(true)
  const [mixMode, setMixMode] = useState('screen')
  const [interactive, setInteractive] = useState(true)

  const reset = useCallback(() => {
    setColor('#7ec8e3')
    setSecondaryColor('#6a5acd')
    setSize(12)
    setTrailLength(12)
    setSmoothing(0.15)
    setGlow(20)
    setFade(true)
    setMixMode('screen')
    setInteractive(true)
  }, [])

  return (
    <div className="gp-page">
      <div className="gp-hero">
        <h1 className="gp-title">Cursor Trail</h1>
        <p className="gp-desc">
          A smooth gradient trail that follows your cursor with multiple trailing blobs,
          sparkles, click flare, and fading residue. Built with Canvas 2D.
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
              <div className="gp-preview-scene" style={{ position: 'relative', background: 'var(--bg)', overflow: 'hidden' }}>
                <div style={{
                  position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
                  flexDirection: 'column', gap: 8, pointerEvents: 'none', zIndex: 1,
                }}>
                  <span style={{ color: 'var(--text-faint)', fontSize: 13, fontFamily: 'var(--font-mono)' }}>Move your mouse here</span>
                  <span style={{ color: 'var(--text-dim)', fontSize: 11, opacity: 0.6 }}>Click for flare effect</span>
                </div>
                <CursorTrail
                  color={color}
                  secondaryColor={secondaryColor}
                  size={size}
                  trailLength={trailLength}
                  smoothing={smoothing}
                  glow={glow}
                  fade={fade}
                  mixMode={mixMode}
                  interactive={interactive}
                />
              </div>
              <div className="gp-preview-bottom">
                <div className="gp-preview-controls">
                  <Section title="COLORS">
                    <ColorRow label="Color" value={color} onChange={e => setColor(e.target.value)} />
                    <ColorRow label="Secondary" value={secondaryColor} onChange={e => setSecondaryColor(e.target.value)} />
                  </Section>
                  <Section title="TRAIL">
                    <RangeRow label="Size" value={size} min={4} max={30} step={1} onChange={setSize} />
                    <RangeRow label="Length" value={trailLength} min={4} max={30} step={1} onChange={setTrailLength} />
                    <RangeRow label="Smooth" value={smoothing} min={0.05} max={0.5} step={0.01} onChange={setSmoothing} />
                    <RangeRow label="Glow" value={glow} min={0} max={40} step={1} onChange={setGlow} />
                  </Section>
                  <Section title="BEHAVIOR">
                    <ToggleRow label="Fade" value={fade} onChange={setFade} />
                    <ToggleRow label="Idle" value={interactive} onChange={setInteractive} />
                    <SelectRow label="Mode" value={mixMode} onChange={setMixMode} options={['screen', 'lighter', 'source-over']} />
                  </Section>
                </div>
                <div className="gp-usage-panel">
                  <div className="gp-doc-section">
                    <h2 className="gp-doc-h2">Usage</h2>
                    <pre className="gp-doc-code">{`import CursorTrail from './components/CursorTrail'

function Demo() {
  return <CursorTrail color="#7ec8e3" size={12} trailLength={12} />
}`}</pre>
                  </div>
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
                value={trailSource}
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
          <p className="gp-doc-p">No external dependencies required. Copy <code className="gp-doc-inline">CursorTrail.jsx</code> and <code className="gp-doc-inline">CursorTrail.css</code> into your project.</p>
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
