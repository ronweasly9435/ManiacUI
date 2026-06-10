import { useState, useCallback } from 'react'
import Editor from '@monaco-editor/react'
import KineticText from './KineticText'
import kineticSource from './KineticText.jsx?raw'
import { handleEditorBeforeMount } from './monacoTheme'
import './Playground.css'

const TABS = ['Preview', 'Code']
const PROPS = [
  { name: 'text', type: 'string', default: "'Kinetic'", desc: 'Text to display as particles' },
  { name: 'fontSize', type: 'number', default: '36', desc: 'Font size in pixels' },
  { name: 'color', type: 'string', default: "'#ffffff'", desc: 'Base text color' },
  { name: 'accent', type: 'string', default: "'#7ec8e3'", desc: 'Accent glow color when scattered' },
  { name: 'repulsion', type: 'number', default: '120', desc: 'Radius of mouse repulsion in pixels' },
  { name: 'force', type: 'number', default: '8', desc: 'Repulsion strength' },
  { name: 'spring', type: 'number', default: '0.08', desc: 'Spring constant toward target' },
  { name: 'damping', type: 'number', default: '0.92', desc: 'Velocity damping per frame' },
  { name: 'wobble', type: 'number', default: '0.3', desc: 'Random micro-wobble strength' },
  { name: 'width', type: 'number', default: '600', desc: 'Canvas width in pixels' },
  { name: 'height', type: 'number', default: '200', desc: 'Canvas height in pixels' },
  { name: 'bgColor', type: 'string', default: "'transparent'", desc: 'Canvas background color' },
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
      <input type="text" value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} className="gp-text-input" />
    </div>
  )
}

export default function KineticTextPlayground() {
  const [tab, setTab] = useState('Preview')
  const [text, setText] = useState('Kinetic')
  const [fontSize, setFontSize] = useState(36)
  const [color, setColor] = useState('#ffffff')
  const [accent, setAccent] = useState('#7ec8e3')
  const [repulsion, setRepulsion] = useState(120)
  const [force, setForce] = useState(8)
  const [spring, setSpring] = useState(0.08)
  const [damping, setDamping] = useState(0.92)
  const [wobble, setWobble] = useState(0.3)
  const [width, setWidth] = useState(600)
  const [height, setHeight] = useState(200)
  const [bgColor, setBgColor] = useState('#000000')
  const [explode, setExplode] = useState(false)
  const [explodeKey, setExplodeKey] = useState(0)

  const reset = useCallback(() => {
    setText('Kinetic')
    setFontSize(36)
    setColor('#ffffff')
    setAccent('#7ec8e3')
    setRepulsion(120)
    setForce(8)
    setSpring(0.08)
    setDamping(0.92)
    setWobble(0.3)
    setWidth(600)
    setHeight(200)
    setBgColor('#000000')
  }, [])

  const handleExplode = useCallback(() => {
    setExplode(true)
    setExplodeKey(k => k + 1)
    setTimeout(() => setExplode(false), 300)
  }, [])

  return (
    <div className="gp-page">
      <div className="gp-hero">
        <h1 className="gp-title">Kinetic Text</h1>
        <p className="gp-desc">
          Text where each letter is a physics particle with gravity, spring forces, and mouse repulsion.
          Letters scatter when the cursor moves through them and settle back into place.
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
                <KineticText
                  key={explodeKey}
                  text={text}
                  fontSize={fontSize}
                  color={color}
                  accent={accent}
                  repulsion={repulsion}
                  force={force}
                  spring={spring}
                  damping={damping}
                  wobble={wobble}
                  width={width}
                  height={height}
                  bgColor={bgColor}
                />
              </div>
              <div className="gp-preview-bottom">
                <div className="gp-preview-controls">
                  <Section title="CONTENT">
                    <TextRow label="Text" value={text} onChange={setText} placeholder="Enter text" />
                    <ColorRow label="Color" value={color} onChange={e => setColor(e.target.value)} />
                    <ColorRow label="Accent" value={accent} onChange={e => setAccent(e.target.value)} />
                  </Section>
                  <Section title="PHYSICS">
                    <RangeRow label="Spring" value={spring} min={0.01} max={0.3} step={0.01} onChange={setSpring} />
                    <RangeRow label="Damping" value={damping} min={0.5} max={0.99} step={0.01} onChange={setDamping} />
                    <RangeRow label="Wobble" value={wobble} min={0} max={2} step={0.1} onChange={setWobble} />
                  </Section>
                  <Section title="MOUSE">
                    <RangeRow label="Repulsion" value={repulsion} min={40} max={300} step={5} onChange={setRepulsion} />
                    <RangeRow label="Force" value={force} min={1} max={25} step={0.5} onChange={setForce} />
                  </Section>
                  <Section title="STYLE">
                    <RangeRow label="Size" value={fontSize} min={20} max={80} step={2} onChange={setFontSize} />
                    <RangeRow label="Width" value={width} min={200} max={1000} step={20} onChange={setWidth} />
                    <RangeRow label="Height" value={height} min={100} max={500} step={10} onChange={setHeight} />
                    <ColorRow label="BG" value={bgColor} onChange={e => setBgColor(e.target.value)} />
                  </Section>
                  <Section title="ACTION">
                    <div className="gp-row">
                      <span className="gp-label">Explode</span>
                      <button className="gp-toggle active" onClick={handleExplode} style={{ background: 'var(--accent)', color: '#000' }}>
                        Click to Burst
                      </button>
                    </div>
                  </Section>
                </div>
                <div className="gp-usage-panel">
                  <div className="gp-doc-section">
                    <h2 className="gp-doc-h2">Usage</h2>
                    <pre className="gp-doc-code">{`import KineticText from './components/KineticText'

function Demo() {
  return (
    <KineticText
      text="Kinetic"
      color="#ffffff"
      accent="#7ec8e3"
      repulsion={120}
      spring={0.08}
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
                value={kineticSource}
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
          <p className="gp-doc-p">No external dependencies required. Copy <code className="gp-doc-inline">KineticText.jsx</code> and <code className="gp-doc-inline">KineticText.css</code> into your project.</p>
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
