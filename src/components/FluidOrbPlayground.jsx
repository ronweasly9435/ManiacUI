import { useState, useCallback } from 'react'
import Editor from '@monaco-editor/react'
import FluidOrb from './FluidOrb'
import fluidOrbSource from './FluidOrb.jsx?raw'
import { handleEditorBeforeMount } from './monacoTheme'
import './Playground.css'

const TABS = ['Preview', 'Code']
const PROPS = [
  { name: 'color', type: 'string', default: '#7ec8e3', desc: 'Primary gradient color' },
  { name: 'secondaryColor', type: 'string', default: '#6a5acd', desc: 'Secondary gradient color' },
  { name: 'size', type: 'number', default: '300', desc: 'Diameter in pixels' },
  { name: 'speed', type: 'number', default: '1', desc: 'Animation speed multiplier' },
  { name: 'intensity', type: 'number', default: '1', desc: 'Cursor tracking sensitivity' },
  { name: 'blur', type: 'number', default: '40', desc: 'Blur radius for liquid effect' },
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

export default function FluidOrbPlayground() {
  const [tab, setTab] = useState('Preview')
  const [color, setColor] = useState('#7ec8e3')
  const [secondaryColor, setSecondaryColor] = useState('#6a5acd')
  const [size, setSize] = useState(300)
  const [speed, setSpeed] = useState(1)
  const [intensity, setIntensity] = useState(1)
  const [blur, setBlur] = useState(40)

  const reset = useCallback(() => {
    setColor('#7ec8e3')
    setSecondaryColor('#6a5acd')
    setSize(300)
    setSpeed(1)
    setIntensity(1)
    setBlur(40)
  }, [])

  return (
    <div className="gp-page">
      <div className="gp-hero">
        <h1 className="gp-title">Fluid Orb</h1>
        <p className="gp-desc">
          A mesmerizing liquid gradient orb that morphs and follows the cursor. Uses the CSS
          blur–contrast sandwich technique for organic gooey motion.
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
              <div className="gp-preview-scene" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg)' }}>
                <FluidOrb
                  color={color}
                  secondaryColor={secondaryColor}
                  size={size}
                  speed={speed}
                  intensity={intensity}
                  blur={blur}
                />
              </div>
              <div className="gp-preview-bottom">
                <div className="gp-preview-controls">
                  <Section title="COLORS">
                    <ColorRow label="Primary" value={color} onChange={e => setColor(e.target.value)} />
                    <ColorRow label="Secondary" value={secondaryColor} onChange={e => setSecondaryColor(e.target.value)} />
                  </Section>
                  <Section title="LIQUID">
                    <RangeRow label="Blur" value={blur} min={10} max={80} step={1} onChange={setBlur} />
                    <RangeRow label="Speed" value={speed} min={0.1} max={3} step={0.1} onChange={setSpeed} />
                    <RangeRow label="Intensity" value={intensity} min={0.1} max={2} step={0.1} onChange={setIntensity} />
                  </Section>
                  <Section title="SIZE">
                    <RangeRow label="Size" value={size} min={100} max={500} step={10} onChange={setSize} />
                  </Section>
                </div>
                <div className="gp-usage-panel">
                  <div className="gp-doc-section">
                    <h2 className="gp-doc-h2">Usage</h2>
                    <pre className="gp-doc-code">{`import FluidOrb from './components/FluidOrb'

function Demo() {
  return (
    <FluidOrb
      color="#7ec8e3"
      secondaryColor="#6a5acd"
      size={300}
      speed={1}
      intensity={1}
      blur={40}
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
                value={fluidOrbSource}
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
          <p className="gp-doc-p">No external dependencies required. Copy <code className="gp-doc-inline">FluidOrb.jsx</code> and <code className="gp-doc-inline">FluidOrb.css</code> into your project.</p>
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
