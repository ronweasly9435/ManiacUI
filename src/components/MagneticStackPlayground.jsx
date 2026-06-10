import { useState, useCallback } from 'react'
import Editor from '@monaco-editor/react'
import MagneticStack from './MagneticStack'
import magneticStackSource from './MagneticStack.jsx?raw'
import { handleEditorBeforeMount } from './monacoTheme'
import './Playground.css'

const TABS = ['Preview', 'Code']
const PROPS = [
  { name: 'count', type: 'number', default: '5', desc: 'Number of stacked cards (3-8)' },
  { name: 'colors', type: 'string[]', default: 'Accent→Purple gradient', desc: 'Array of background colors per card' },
  { name: 'width', type: 'number', default: '280', desc: 'Card width in pixels' },
  { name: 'height', type: 'number', default: '180', desc: 'Card height in pixels' },
  { name: 'borderRadius', type: 'number', default: '16', desc: 'Card corner radius' },
  { name: 'intensity', type: 'number', default: '20', desc: 'Max mouse-follow offset in pixels' },
  { name: 'fanRadius', type: 'number', default: '120', desc: 'Radial fan-out distance in pixels' },
  { name: 'glare', type: 'boolean', default: 'true', desc: 'Show mouse-tracked glare on cards' },
  { name: 'accent', type: 'string', default: '#7ec8e3', desc: 'Accent color for glow and borders' },
  { name: 'stagger', type: 'number', default: '0.15', desc: 'Base lerp factor for card tracking speed' },
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

export default function MagneticStackPlayground() {
  const [tab, setTab] = useState('Preview')
  const [accent, setAccent] = useState('#7ec8e3')
  const [count, setCount] = useState(5)
  const [width, setWidth] = useState(280)
  const [height, setHeight] = useState(180)
  const [borderRadius, setBorderRadius] = useState(16)
  const [intensity, setIntensity] = useState(20)
  const [fanRadius, setFanRadius] = useState(120)
  const [glare, setGlare] = useState(true)
  const [stagger, setStagger] = useState(0.15)

  const reset = useCallback(() => {
    setAccent('#7ec8e3')
    setCount(5)
    setWidth(280)
    setHeight(180)
    setBorderRadius(16)
    setIntensity(20)
    setFanRadius(120)
    setGlare(true)
    setStagger(0.15)
  }, [])

  return (
    <div className="gp-page">
      <div className="gp-hero">
        <h1 className="gp-title">Magnetic Stack</h1>
        <p className="gp-desc">
          A stack of glass-morphism cards that follow your mouse with staggered magnetic attraction.
          Click to fan out radially. Each layer has different translateZ and tracking speed.
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
                <div style={{ position: 'relative', zIndex: 1, width: '100%', height: '100%' }}>
                  <MagneticStack
                    key={count}
                    count={count}
                    width={width}
                    height={height}
                    borderRadius={borderRadius}
                    intensity={intensity}
                    fanRadius={fanRadius}
                    glare={glare}
                    accent={accent}
                    stagger={stagger}
                  />
                </div>
              </div>
              <div className="gp-preview-bottom">
                <div className="gp-preview-controls">
                  <Section title="COLORS">
                    <ColorRow label="Accent" value={accent} onChange={e => setAccent(e.target.value)} />
                  </Section>
                  <Section title="STACK">
                    <RangeRow label="Count" value={count} min={3} max={8} step={1} onChange={setCount} />
                    <RangeRow label="Width" value={width} min={160} max={400} step={10} onChange={setWidth} />
                    <RangeRow label="Height" value={height} min={120} max={300} step={10} onChange={setHeight} />
                    <RangeRow label="Radius" value={borderRadius} min={0} max={40} step={2} onChange={setBorderRadius} />
                  </Section>
                  <Section title="MOTION">
                    <RangeRow label="Intensity" value={intensity} min={5} max={50} step={2} onChange={setIntensity} />
                    <RangeRow label="Stagger" value={stagger} min={0.05} max={0.4} step={0.01} onChange={setStagger} />
                    <RangeRow label="Fan Radius" value={fanRadius} min={60} max={250} step={10} onChange={setFanRadius} />
                  </Section>
                  <Section title="EFFECTS">
                    <ToggleRow label="Glare" value={glare} onChange={setGlare} />
                  </Section>
                </div>
                <div className="gp-usage-panel">
                  <div className="gp-doc-section">
                    <h2 className="gp-doc-h2">Usage</h2>
                    <pre className="gp-doc-code">{`import MagneticStack from './components/MagneticStack'
import './components/MagneticStack.css'

function Demo() {
  return (
    <MagneticStack
      count={5}
      accent="#7ec8e3"
      glare
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
                value={magneticStackSource}
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
          <p className="gp-doc-p">No external dependencies required. Simply copy <code className="gp-doc-inline">MagneticStack.jsx</code> and <code className="gp-doc-inline">MagneticStack.css</code> into your project.</p>
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
