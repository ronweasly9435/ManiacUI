import { useState, useCallback } from 'react'
import Editor from '@monaco-editor/react'
import WarpCard from './WarpCard'
import warpCardSource from './WarpCard.jsx?raw'
import { handleEditorBeforeMount } from './monacoTheme'
import './Playground.css'

const TABS = ['Preview', 'Code']
const PROPS = [
  { name: 'width', type: 'number', default: '320', desc: 'Card width in pixels' },
  { name: 'height', type: 'number', default: '420', desc: 'Card height in pixels' },
  { name: 'glowColor', type: 'string', default: '#7ec8e3', desc: 'Color of the magnetic border glow' },
  { name: 'intensity', type: 'number', default: '15', desc: 'Max warp skew angle in degrees' },
  { name: 'chromatic', type: 'boolean', default: 'true', desc: 'Enable chromatic aberration offset' },
  { name: 'text', type: 'string', default: 'Warp', desc: 'Main heading text' },
  { name: 'subtext', type: 'string', default: '...', desc: 'Subtitle or description text' },
  { name: 'bgColor', type: 'string', default: '#0a0a0f', desc: 'Card background color' },
  { name: 'borderRadius', type: 'number', default: '16', desc: 'Card corner radius' },
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

function TextRow({ label, value, onChange, placeholder }) {
  return (
    <div className="gp-row">
      <span className="gp-label">{label}</span>
      <input
        type="text"
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        className="gp-text-input"
      />
    </div>
  )
}

export default function WarpCardPlayground() {
  const [tab, setTab] = useState('Preview')
  const [width, setWidth] = useState(320)
  const [height, setHeight] = useState(420)
  const [glowColor, setGlowColor] = useState('#7ec8e3')
  const [intensity, setIntensity] = useState(15)
  const [chromatic, setChromatic] = useState(true)
  const [text, setText] = useState('Warp')
  const [subtext, setSubtext] = useState('Move your cursor to bend reality')
  const [bgColor, setBgColor] = useState('#0a0a0f')
  const [borderRadius, setBorderRadius] = useState(16)

  const reset = useCallback(() => {
    setWidth(320)
    setHeight(420)
    setGlowColor('#7ec8e3')
    setIntensity(15)
    setChromatic(true)
    setText('Warp')
    setSubtext('Move your cursor to bend reality')
    setBgColor('#0a0a0f')
    setBorderRadius(16)
  }, [])

  return (
    <div className="gp-page">
      <div className="gp-hero">
        <h1 className="gp-title">Warp Card</h1>
        <p className="gp-desc">
          A gravitational lensing card whose content distorts toward the cursor using skew transforms,
          with chromatic aberration, grid background, and a magnetic border glow.
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
              <div className="gp-preview-scene" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg)', position: 'relative' }}>
                <div style={{ position: 'relative', zIndex: 1 }}>
                  <WarpCard
                    width={width}
                    height={height}
                    glowColor={glowColor}
                    intensity={intensity}
                    chromatic={chromatic}
                    text={text}
                    subtext={subtext}
                    bgColor={bgColor}
                    borderRadius={borderRadius}
                  />
                </div>
              </div>
              <div className="gp-preview-bottom">
                <div className="gp-preview-controls">
                  <Section title="COLORS">
                    <ColorRow label="BG" value={bgColor} onChange={e => setBgColor(e.target.value)} />
                    <ColorRow label="Glow" value={glowColor} onChange={e => setGlowColor(e.target.value)} />
                  </Section>
                  <Section title="CONTENT">
                    <TextRow label="Text" value={text} onChange={setText} placeholder="Main text" />
                    <TextRow label="Sub" value={subtext} onChange={setSubtext} placeholder="Subtitle" />
                  </Section>
                  <Section title="WARP">
                    <ToggleRow label="Chromatic" value={chromatic} onChange={setChromatic} />
                    <RangeRow label="Intensity" value={intensity} min={0} max={30} step={1} onChange={setIntensity} />
                  </Section>
                  <Section title="SIZE">
                    <RangeRow label="W" value={width} min={160} max={500} step={10} onChange={setWidth} />
                    <RangeRow label="H" value={height} min={200} max={600} step={10} onChange={setHeight} />
                    <RangeRow label="Radius" value={borderRadius} min={0} max={40} step={2} onChange={setBorderRadius} />
                  </Section>
                </div>
                <div className="gp-usage-panel">
                  <div className="gp-doc-section">
                    <h2 className="gp-doc-h2">Usage</h2>
                    <pre className="gp-doc-code">{`import WarpCard from './components/WarpCard'

function Demo() {
  return (
    <WarpCard
      width={320}
      height={420}
      intensity={15}
      glowColor="#7ec8e3"
      text="Warp"
      subtext="Move your cursor to bend reality"
      chromatic
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
                value={warpCardSource}
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
          <p className="gp-doc-p">No external dependencies required. Simply copy <code className="gp-doc-inline">WarpCard.jsx</code> and <code className="gp-doc-inline">WarpCard.css</code> into your project.</p>
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
