import { useState, useCallback } from 'react'
import Editor from '@monaco-editor/react'
import LiquidChrome from './LiquidChrome'
import liquidChromeSource from './LiquidChrome.jsx?raw'
import { handleEditorBeforeMount } from './monacoTheme'
import './Playground.css'

const TABS = ['Preview', 'Code']
const PROPS = [
  { name: 'color1', type: 'string', default: '#2a1a3a', desc: 'Dark chrome accent color' },
  { name: 'color2', type: 'string', default: '#6366f1', desc: 'Mid-tone chrome color' },
  { name: 'color3', type: 'string', default: '#06b6d4', desc: 'Highlight chrome color' },
  { name: 'speed', type: 'number', default: '0.15', desc: 'Flow animation speed' },
  { name: 'scale', type: 'number', default: '1.5', desc: 'Noise scale / zoom level' },
  { name: 'distortion', type: 'number', default: '1.5', desc: 'Domain warp strength' },
  { name: 'reflectivity', type: 'number', default: '0.6', desc: 'Edge reflection intensity' },
  { name: 'interactive', type: 'boolean', default: 'true', desc: 'Enable mouse/touch interaction' },
  { name: 'customCursor', type: 'boolean', default: 'true', desc: 'Replace system cursor with custom ring' },
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

export default function LiquidChromePlayground() {
  const [tab, setTab] = useState('Preview')
  const [color1, setColor1] = useState('#2a1a3a')
  const [color2, setColor2] = useState('#6366f1')
  const [color3, setColor3] = useState('#06b6d4')
  const [speed, setSpeed] = useState(0.15)
  const [scale, setScale] = useState(1.5)
  const [distortion, setDistortion] = useState(1.5)
  const [reflectivity, setReflectivity] = useState(0.6)
  const [interactive, setInteractive] = useState(true)
  const [customCursor, setCustomCursor] = useState(true)

  const reset = useCallback(() => {
    setColor1('#2a1a3a')
    setColor2('#6366f1')
    setColor3('#06b6d4')
    setSpeed(0.15)
    setScale(1.5)
    setDistortion(1.5)
    setReflectivity(0.6)
    setInteractive(true)
    setCustomCursor(true)
    setInteractive(true)
  }, [])

  return (
    <div className="gp-page">
      <div className="gp-hero">
        <h1 className="gp-title">Liquid Chrome</h1>
        <p className="gp-desc">
          A flowing metallic surface built with domain-warped fractal noise — organic chrome
          reflections ripple and shift with cursor interaction.
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
              <div className="gp-preview-scene">
                <LiquidChrome
                  color1={color1}
                  color2={color2}
                  color3={color3}
                  speed={speed}
                  scale={scale}
                  distortion={distortion}
                  reflectivity={reflectivity}
                  interactive={interactive}
                  customCursor={customCursor}
                />
              </div>
              <div className="gp-preview-bottom">
                <div className="gp-preview-controls">
                  <Section title="FLOW">
                    <RangeRow label="Speed" value={speed} min={0} max={0.8} step={0.01} onChange={setSpeed} />
                    <RangeRow label="Scale" value={scale} min={0.5} max={5} step={0.1} onChange={setScale} />
                    <RangeRow label="Distortion" value={distortion} min={0} max={4} step={0.1} onChange={setDistortion} />
                    <RangeRow label="Reflectivity" value={reflectivity} min={0} max={1.5} step={0.05} onChange={setReflectivity} />
                  </Section>
                  <Section title="COLORS">
                    <ColorRow label="Dark" value={color1} onChange={e => setColor1(e.target.value)} />
                    <ColorRow label="Mid" value={color2} onChange={e => setColor2(e.target.value)} />
                    <ColorRow label="Light" value={color3} onChange={e => setColor3(e.target.value)} />
                  </Section>
                  <Section title="INTERACTION">
                    <ToggleRow label="Interactive" value={interactive} onChange={setInteractive} />
                    <ToggleRow label="Custom Cursor" value={customCursor} onChange={setCustomCursor} />
                  </Section>
                </div>
                <div className="gp-usage-panel">
                  <div className="gp-doc-section">
                    <h2 className="gp-doc-h2">Usage</h2>
                    <pre className="gp-doc-code">{`import LiquidChrome from './components/LiquidChrome'

function Demo() {
  return <LiquidChrome speed={0.15} scale={1.5} />
}`}</pre>
                  </div>
                  <div className="gp-doc-section">
                    <h2 className="gp-doc-h2">Dependencies</h2>
                    <p className="gp-doc-p">Requires <code className="gp-doc-inline">three</code>.</p>
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
                value={liquidChromeSource}
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
          <p className="gp-doc-p">Requires <code className="gp-doc-inline">three</code>. Copy <code className="gp-doc-inline">LiquidChrome.jsx</code> and <code className="gp-doc-inline">LiquidChrome.css</code> into your project.</p>
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
