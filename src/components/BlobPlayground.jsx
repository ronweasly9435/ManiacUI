import { useState, useCallback } from 'react'
import Editor from '@monaco-editor/react'
import Blob from './Blob'
import blobSource from './Blob.jsx?raw'
import { handleEditorBeforeMount } from './monacoTheme'
import './Playground.css'

const TABS = ['Preview', 'Code']
const PROPS = [
  { name: 'color', type: 'string', default: '#7ec8e3', desc: 'Base color of the blob surface' },
  { name: 'texture', type: 'string|null', default: 'wallpaper URL', desc: 'Image URL to map onto the blob surface' },
  { name: 'backgroundColor', type: 'string', default: '#000000', desc: 'Scene background color' },
  { name: 'speed', type: 'number', default: '1', desc: 'Morphing animation speed multiplier' },
  { name: 'complexity', type: 'number', default: '3', desc: 'Icosahedron subdivision (0-5, higher = smoother)' },
  { name: 'size', type: 'number', default: '1.5', desc: 'Overall scale of the blob' },
  { name: 'metallic', type: 'boolean', default: 'true', desc: 'Enable metallic reflection' },
  { name: 'noiseScale', type: 'number', default: '2', desc: 'Frequency of the noise displacement' },
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

export default function BlobPlayground() {
  const [tab, setTab] = useState('Preview')
  const [color, setColor] = useState('#7ec8e3')
  const [bgColor, setBgColor] = useState('#000000')
  const [speed, setSpeed] = useState(1)
  const [complexity, setComplexity] = useState(3)
  const [size, setSize] = useState(1.5)
  const [metallic, setMetallic] = useState(true)
  const [noiseScale, setNoiseScale] = useState(2)
  const [texture, setTexture] = useState('https://wallpapercave.com/wp/wp12409453.jpg')

  const handleTexture = useCallback((e) => {
    const file = e.target.files?.[0]
    if (file) setTexture(URL.createObjectURL(file))
  }, [])

  const reset = useCallback(() => {
    setColor('#7ec8e3')
    setBgColor('#000000')
    setSpeed(1)
    setComplexity(3)
    setSize(1.5)
    setMetallic(true)
    setNoiseScale(2)
    if (texture) URL.revokeObjectURL(texture)
    setTexture('https://wallpapercave.com/wp/wp12409453.jpg')
  }, [texture])

  return (
    <div className="gp-page">
      <div className="gp-hero">
        <h1 className="gp-title">Blob</h1>
        <p className="gp-desc">
          An organic morphing 3D blob with vertex displacement, metallic reflections, and HDR environment lighting.
          Built with React Three Fiber.
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
                <Blob
                  color={color}
                  backgroundColor={bgColor}
                  speed={speed}
                  complexity={complexity}
                  size={size}
                  metallic={metallic}
                  noiseScale={noiseScale}
                  texture={texture}
                />
              </div>
              <div className="gp-preview-bottom">
                <div className="gp-preview-controls">
                  <Section title="SURFACE">
                    <ColorRow label="Color" value={color} onChange={e => setColor(e.target.value)} />
                    <ToggleRow label="Metallic" value={metallic} onChange={setMetallic} />
                  </Section>
                  <Section title="TEXTURE">
                    <div className="gp-row">
                      <span className="gp-label">Image</span>
                      <label className="gp-file-label">
                        <input type="file" accept="image/*" onChange={handleTexture} className="gp-file" />
                        {texture ? 'Replace' : 'Upload'}
                      </label>
                      {texture && (
                        <button className="gp-file-remove" onClick={() => { URL.revokeObjectURL(texture); setTexture(null) }}>&times;</button>
                      )}
                    </div>
                  </Section>
                  <Section title="MORPH">
                    <RangeRow label="Speed" value={speed} min={0.1} max={5} step={0.1} onChange={setSpeed} />
                    <RangeRow label="Noise" value={noiseScale} min={0.5} max={5} step={0.1} onChange={setNoiseScale} />
                  </Section>
                  <Section title="SHAPE">
                    <RangeRow label="Size" value={size} min={0.5} max={3} step={0.1} onChange={setSize} />
                    <RangeRow label="Detail" value={complexity} min={1} max={5} step={1} onChange={setComplexity} />
                  </Section>
                  <Section title="BACKGROUND">
                    <ColorRow label="BG" value={bgColor} onChange={e => setBgColor(e.target.value)} />
                  </Section>
                </div>
                <div className="gp-usage-panel">
                  <div className="gp-doc-section">
                    <h2 className="gp-doc-h2">Usage</h2>
                    <pre className="gp-doc-code">{`import Blob from './components/Blob'

function Demo() {
  return <Blob color="#7ec8e3" speed={1} size={1.5} metallic />
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
                value={blobSource}
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
          <p className="gp-doc-p">Install the required dependencies:</p>
          <pre className="gp-doc-code">npm install @react-three/fiber @react-three/drei three</pre>
          <p className="gp-doc-p">Copy <code className="gp-doc-inline">Blob.jsx</code> into your project.</p>
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
