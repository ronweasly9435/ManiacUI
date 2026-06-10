import { useState, useCallback } from 'react'
import Editor from '@monaco-editor/react'
import RippleReveal from './RippleReveal'
import rippleRevealSource from './RippleReveal.jsx?raw'
import { handleEditorBeforeMount } from './monacoTheme'
import './Playground.css'

const TABS = ['Preview', 'Code']
const BG_PRESETS = [
  { label: 'Ocean', value: 'linear-gradient(135deg, #7ec8e3, #6a5acd)' },
  { label: 'Sunset', value: 'linear-gradient(135deg, #ff6b6b, #feca57)' },
  { label: 'Forest', value: 'linear-gradient(135deg, #2ecc71, #1abc9c)' },
  { label: 'Midnight', value: 'linear-gradient(135deg, #2c3e50, #3498db)' },
  { label: 'Lavender', value: 'linear-gradient(135deg, #c084fc, #7c3aed)' },
  { label: 'Gold', value: 'linear-gradient(135deg, #fbbf24, #f59e0b)' },
]

const PROPS = [
  { name: 'surfaceColor', type: 'string', default: '#0a0a0f', desc: 'Water surface background color' },
  { name: 'revealGradient', type: 'string', default: 'linear-gradient...', desc: 'Gradient revealed beneath the ripples' },
  { name: 'color', type: 'string', default: '#7ec8e3', desc: 'Ripple ring color' },
  { name: 'rippleCount', type: 'number', default: '3', desc: 'Number of concentric rings per ripple' },
  { name: 'rippleDuration', type: 'number', default: '2000', desc: 'Ripple animation duration in ms' },
  { name: 'text', type: 'string', default: 'Click anywhere', desc: 'Prompt text on the surface' },
  { name: 'textReveal', type: 'string', default: 'You found it!', desc: 'Text revealed underneath' },
  { name: 'fontSize', type: 'number', default: '32', desc: 'Font size in pixels' },
  { name: 'height', type: 'number', default: '400', desc: 'Container height in pixels' },
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

function RangeRow({ label, value, min, max, step, onChange }) {
  return (
    <div className="gp-row">
      <span className="gp-label">{label}</span>
      <input type="range" min={min} max={max} step={step} value={value} onChange={e => onChange(Number(e.target.value))} className="gp-range" />
      <span className="gp-hex">{value}</span>
    </div>
  )
}

function TextRow({ label, value, onChange, placeholder }) {
  return (
    <div className="gp-row">
      <span className="gp-label">{label}</span>
      <input type="text" value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} className="gp-text-input" />
    </div>
  )
}

export default function RippleRevealPlayground() {
  const [tab, setTab] = useState('Preview')
  const [surfaceColor, setSurfaceColor] = useState('#0a0a0f')
  const [rippleColor, setRippleColor] = useState('#7ec8e3')
  const [bgGradient, setBgGradient] = useState('linear-gradient(135deg, #7ec8e3, #6a5acd)')
  const [rippleCount, setRippleCount] = useState(3)
  const [rippleDuration, setRippleDuration] = useState(2000)
  const [text, setText] = useState('Click anywhere')
  const [textReveal, setTextReveal] = useState('You found it!')
  const [fontSize, setFontSize] = useState(32)
  const [height, setHeight] = useState(400)

  const reset = useCallback(() => {
    setSurfaceColor('#0a0a0f')
    setRippleColor('#7ec8e3')
    setBgGradient('linear-gradient(135deg, #7ec8e3, #6a5acd)')
    setRippleCount(3)
    setRippleDuration(2000)
    setText('Click anywhere')
    setTextReveal('You found it!')
    setFontSize(32)
    setHeight(400)
  }, [])

  return (
    <div className="gp-page">
      <div className="gp-hero">
        <h1 className="gp-title">Ripple Reveal</h1>
        <p className="gp-desc">
          A full-width section where clicking sends out water-like sine-wave ripples from the cursor
          point, revealing gradient content beneath the surface. Built with Canvas 2D.
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
              <div className="gp-preview-scene" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg)', padding: '0' }}>
                <RippleReveal
                  surfaceColor={surfaceColor}
                  revealGradient={bgGradient}
                  color={rippleColor}
                  rippleCount={rippleCount}
                  duration={rippleDuration}
                  text={text}
                  textReveal={textReveal}
                  fontSize={fontSize}
                  height={height}
                />
              </div>
              <div className="gp-preview-bottom">
                <div className="gp-preview-controls">
                  <Section title="SURFACE">
                    <ColorRow label="Water" value={surfaceColor} onChange={e => setSurfaceColor(e.target.value)} />
                    <ColorRow label="Ripple" value={rippleColor} onChange={e => setRippleColor(e.target.value)} />
                  </Section>
                  <Section title="REVEAL">
                    <div className="gp-row">
                      <span className="gp-label">BG</span>
                      <select
                        className="gp-text-input"
                        value={bgGradient}
                        onChange={e => setBgGradient(e.target.value)}
                        style={{ fontSize: 11 }}
                      >
                        {BG_PRESETS.map(p => (
                          <option key={p.label} value={p.value}>{p.label}</option>
                        ))}
                      </select>
                    </div>
                    <TextRow label="Text" value={textReveal} onChange={setTextReveal} placeholder="Revealed text" />
                  </Section>
                  <Section title="RIPPLES">
                    <RangeRow label="Count" value={rippleCount} min={1} max={8} step={1} onChange={setRippleCount} />
                    <RangeRow label="Duration" value={rippleDuration} min={500} max={5000} step={100} onChange={setRippleDuration} />
                  </Section>
                  <Section title="PROMPT">
                    <TextRow label="Text" value={text} onChange={setText} placeholder="Surface text" />
                    <RangeRow label="Size" value={fontSize} min={14} max={72} step={2} onChange={setFontSize} />
                  </Section>
                  <Section title="SIZE">
                    <RangeRow label="H" value={height} min={200} max={600} step={20} onChange={setHeight} />
                  </Section>
                </div>
                <div className="gp-usage-panel">
                  <div className="gp-doc-section">
                    <h2 className="gp-doc-h2">Usage</h2>
                    <pre className="gp-doc-code">{`import RippleReveal from './components/RippleReveal'

function Demo() {
  return (
    <RippleReveal
      surfaceColor="#0a0a0f"
      color="#7ec8e3"
      rippleCount={3}
      duration={2000}
      text="Click anywhere"
      textReveal="You found it!"
    />
  )
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
                value={rippleRevealSource}
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
          <p className="gp-doc-p">No external dependencies required. Copy <code className="gp-doc-inline">RippleReveal.jsx</code> and <code className="gp-doc-inline">RippleReveal.css</code> into your project.</p>
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
