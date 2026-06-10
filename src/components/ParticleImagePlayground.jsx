import { useState, useCallback } from 'react'
import Editor from '@monaco-editor/react'
import ParticleImage from './ParticleImage'
import particleImageSource from './ParticleImage.jsx?raw'
import { handleEditorBeforeMount } from './monacoTheme'
import './Playground.css'

const TABS = ['Preview', 'Code']
const PROPS = [
  { name: 'src', type: 'string', default: 'wallpaper URL', desc: 'Image URL to render as particles' },
  { name: 'dotSize', type: 'number', default: '2', desc: 'Size of each particle dot' },
  { name: 'gap', type: 'number', default: '4', desc: 'Pixel sampling interval (lower = more particles)' },
  { name: 'explodeRadius', type: 'number', default: '80', desc: 'Radius from cursor that triggers explosion' },
  { name: 'explodeForce', type: 'number', default: '8', desc: 'Velocity multiplier for explosion' },
  { name: 'friction', type: 'number', default: '0.92', desc: 'Velocity damping per frame' },
  { name: 'returnSpeed', type: 'number', default: '0.08', desc: 'Spring return speed to original position' },
  { name: 'wobble', type: 'number', default: '0.5', desc: 'Idle jitter amplitude' },
  { name: 'width', type: 'number', default: '400', desc: 'Canvas width in pixels' },
  { name: 'height', type: 'number', default: '300', desc: 'Canvas height in pixels' },
]

function Section({ title, children }) {
  return (
    <div className="gp-section">
      <div className="gp-section-title">{title}</div>
      {children}
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

export default function ParticleImagePlayground() {
  const [tab, setTab] = useState('Preview')
  const [src, setSrc] = useState('https://images.unsplash.com/photo-1541701494587-cb58502866ab?fm=jpg&q=60&w=3000&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTh8fGFic3RyYWN0fGVufDB8fDB8fHww')
  const [dotSize, setDotSize] = useState(2)
  const [gap, setGap] = useState(4)
  const [explodeRadius, setExplodeRadius] = useState(80)
  const [explodeForce, setExplodeForce] = useState(8)
  const [friction, setFriction] = useState(0.92)
  const [returnSpeed, setReturnSpeed] = useState(0.08)
  const [wobble, setWobble] = useState(0.5)
  const [width, setWidth] = useState(400)
  const [height, setHeight] = useState(300)

  const handleUpload = useCallback((e) => {
    const file = e.target.files?.[0]
    if (file) setSrc(URL.createObjectURL(file))
  }, [])

  const reset = useCallback(() => {
    setSrc('https://images.unsplash.com/photo-1541701494587-cb58502866ab?fm=jpg&q=60&w=3000&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTh8fGFic3RyYWN0fGVufDB8fDB8fHww')
    setDotSize(2)
    setGap(4)
    setExplodeRadius(80)
    setExplodeForce(8)
    setFriction(0.92)
    setReturnSpeed(0.08)
    setWobble(0.5)
    setWidth(400)
    setHeight(300)
  }, [])

  return (
    <div className="gp-page">
      <div className="gp-hero">
        <h1 className="gp-title">Particle Image</h1>
        <p className="gp-desc">
          An image rendered as hundreds of particles that explode apart when the mouse moves nearby,
          then gracefully reassemble. Built with Canvas 2D.
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
                <ParticleImage
                  src={src}
                  dotSize={dotSize}
                  gap={gap}
                  explodeRadius={explodeRadius}
                  explodeForce={explodeForce}
                  friction={friction}
                  returnSpeed={returnSpeed}
                  wobble={wobble}
                  width={width}
                  height={height}
                />
              </div>
              <div className="gp-preview-bottom">
                <div className="gp-preview-controls">
                  <Section title="IMAGE">
                    <TextRow label="URL" value={src} onChange={setSrc} placeholder="Image URL" />
                    <div className="gp-row">
                      <span className="gp-label">Upload</span>
                      <label className="gp-file-label">
                        <input type="file" accept="image/*" onChange={handleUpload} className="gp-file" />
                        {src.startsWith('blob:') ? 'Replace' : 'Upload'}
                      </label>
                    </div>
                  </Section>
                  <Section title="PARTICLES">
                    <RangeRow label="Dot" value={dotSize} min={1} max={6} step={0.5} onChange={setDotSize} />
                    <RangeRow label="Gap" value={gap} min={2} max={10} step={1} onChange={setGap} />
                  </Section>
                  <Section title="EXPLOSION">
                    <RangeRow label="Radius" value={explodeRadius} min={30} max={200} step={5} onChange={setExplodeRadius} />
                    <RangeRow label="Force" value={explodeForce} min={2} max={20} step={0.5} onChange={setExplodeForce} />
                    <RangeRow label="Friction" value={friction} min={0.8} max={0.99} step={0.01} onChange={setFriction} />
                  </Section>
                  <Section title="RETURN">
                    <RangeRow label="Speed" value={returnSpeed} min={0.01} max={0.5} step={0.01} onChange={setReturnSpeed} />
                    <RangeRow label="Wobble" value={wobble} min={0} max={3} step={0.1} onChange={setWobble} />
                  </Section>
                  <Section title="SIZE">
                    <RangeRow label="W" value={width} min={200} max={600} step={10} onChange={setWidth} />
                    <RangeRow label="H" value={height} min={160} max={500} step={10} onChange={setHeight} />
                  </Section>
                </div>
                <div className="gp-usage-panel">
                  <div className="gp-doc-section">
                    <h2 className="gp-doc-h2">Usage</h2>
                    <pre className="gp-doc-code">{`import ParticleImage from './components/ParticleImage'

function Demo() {
  return (
    <ParticleImage
      src="https://...jpg"
      dotSize={2}
      gap={4}
      explodeRadius={80}
      explodeForce={8}
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
                value={particleImageSource}
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
          <p className="gp-doc-p">No external dependencies required. Copy <code className="gp-doc-inline">ParticleImage.jsx</code> and <code className="gp-doc-inline">ParticleImage.css</code> into your project.</p>
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
