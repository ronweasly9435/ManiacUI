import { useState, useCallback } from 'react'
import Editor from '@monaco-editor/react'
import NoiseBorder from './NoiseBorder'
import noiseSource from './NoiseBorder.jsx?raw'
import { handleEditorBeforeMount } from './monacoTheme'
import './Playground.css'

const TABS = ['Preview', 'Code']
const PROPS = [
  { name: 'color', type: 'string', default: "'#7ec8e3'", desc: 'Border stroke color' },
  { name: 'width', type: 'number', default: '2', desc: 'Border thickness in pixels' },
  { name: 'noise', type: 'number', default: '0.03', desc: 'Base frequency of the noise' },
  { name: 'speed', type: 'number', default: '1', desc: 'Animation speed multiplier' },
  { name: 'intensity', type: 'number', default: '15', desc: 'Displacement map scale' },
  { name: 'borderRadius', type: 'number', default: '12', desc: 'Border radius in pixels' },
  { name: 'padding', type: 'number', default: '20', desc: 'Inner padding in pixels' },
  { name: 'glow', type: 'boolean', default: 'true', desc: 'Enable border glow' },
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

export default function NoiseBorderPlayground() {
  const [tab, setTab] = useState('Preview')
  const [color, setColor] = useState('#7ec8e3')
  const [width, setWidth] = useState(2)
  const [noise, setNoise] = useState(0.03)
  const [speed, setSpeed] = useState(1)
  const [intensity, setIntensity] = useState(15)
  const [borderRadius, setBorderRadius] = useState(12)
  const [padding, setPadding] = useState(20)
  const [glow, setGlow] = useState(true)

  const reset = useCallback(() => {
    setColor('#7ec8e3')
    setWidth(2)
    setNoise(0.03)
    setSpeed(1)
    setIntensity(15)
    setBorderRadius(12)
    setPadding(20)
    setGlow(true)
  }, [])

  return (
    <div className="gp-page">
      <div className="gp-hero">
        <h1 className="gp-title">Noise Border</h1>
        <p className="gp-desc">
          A living SVG noise border that wraps any element. The border crawls and shimmers
          using feTurbulence displacement like static electricity.
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
              <div className="gp-preview-scene" style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: 'var(--bg)', padding: 40,
              }}>
                <NoiseBorder
                  color={color}
                  width={width}
                  noise={noise}
                  speed={speed}
                  intensity={intensity}
                  borderRadius={borderRadius}
                  padding={padding}
                  glow={glow}
                >
                  <div style={{
                    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                    gap: 12, padding: '32px 48px', textAlign: 'center',
                  }}>
                    <span style={{ fontSize: 28, fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-0.5px' }}>
                      Noise Border
                    </span>
                    <span style={{ fontSize: 13, color: 'var(--text-faint)', maxWidth: 320, lineHeight: 1.6 }}>
                      This box has a living SVG noise border. Try adjusting the controls to see the border change.
                    </span>
                  </div>
                </NoiseBorder>
              </div>
              <div className="gp-preview-bottom">
                <div className="gp-preview-controls">
                  <Section title="STYLE">
                    <ColorRow label="Color" value={color} onChange={e => setColor(e.target.value)} />
                    <ToggleRow label="Glow" value={glow} onChange={setGlow} />
                  </Section>
                  <Section title="BORDER">
                    <RangeRow label="Width" value={width} min={1} max={8} step={1} onChange={setWidth} />
                    <RangeRow label="Radius" value={borderRadius} min={0} max={30} step={1} onChange={setBorderRadius} />
                    <RangeRow label="Padding" value={padding} min={4} max={48} step={2} onChange={setPadding} />
                  </Section>
                  <Section title="NOISE">
                    <RangeRow label="Noise" value={noise} min={0.01} max={0.2} step={0.01} onChange={setNoise} />
                    <RangeRow label="Speed" value={speed} min={0.1} max={5} step={0.1} onChange={setSpeed} />
                    <RangeRow label="Intensity" value={intensity} min={5} max={50} step={1} onChange={setIntensity} />
                  </Section>
                </div>
                <div className="gp-usage-panel">
                  <div className="gp-doc-section">
                    <h2 className="gp-doc-h2">Usage</h2>
                    <pre className="gp-doc-code">{`import NoiseBorder from './components/NoiseBorder'

function Demo() {
  return (
    <NoiseBorder color="#7ec8e3" width={2}>
      <div>Your content here</div>
    </NoiseBorder>
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
                value={noiseSource}
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
          <p className="gp-doc-p">No external dependencies required. Copy <code className="gp-doc-inline">NoiseBorder.jsx</code> and <code className="gp-doc-inline">NoiseBorder.css</code> into your project.</p>
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
