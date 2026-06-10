import { useState, useCallback } from 'react'
import Editor from '@monaco-editor/react'
import TiltCard from './TiltCard'
import tiltCardSource from './TiltCard.jsx?raw'
import { handleEditorBeforeMount } from './monacoTheme'
import './Playground.css'

const TABS = ['Preview', 'Code']
const PROPS = [
  { name: 'backgroundColor', type: 'string', default: '#1a1a2e', desc: 'Card base background color' },
  { name: 'foregroundColor', type: 'string', default: '#ffffff', desc: 'Text and accent color' },
  { name: 'text', type: 'string', default: 'Hover Me', desc: 'Main heading text' },
  { name: 'subtext', type: 'string', default: '...', desc: 'Subtitle or description text' },
  { name: 'image', type: 'string|null', default: 'wallpaper URL', desc: 'Background image URL' },
  { name: 'imageFit', type: 'string', default: 'cover', desc: 'Image fit mode (cover or contain)' },
  { name: 'glare', type: 'boolean', default: 'true', desc: 'Show glare overlay on hover' },
  { name: 'tiltDegree', type: 'number', default: '15', desc: 'Max tilt angle in degrees' },
  { name: 'borderRadius', type: 'number', default: '16', desc: 'Card corner radius' },
  { name: 'width', type: 'number', default: '300', desc: 'Card width in pixels' },
  { name: 'height', type: 'number', default: '400', desc: 'Card height in pixels' },
  { name: 'glowColor', type: 'string', default: '#7ec8e3', desc: 'Color of the magnetic border glow' },
  { name: 'parallax', type: 'boolean', default: 'true', desc: 'Enable 3D parallax depth layers' },
  { name: 'scale', type: 'number', default: '1.02', desc: 'Card scale factor on hover' },
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

export default function TiltCardPlayground() {
  const [tab, setTab] = useState('Preview')
  const [bgColor, setBgColor] = useState('#1a1a2e')
  const [fgColor, setFgColor] = useState('#ffffff')
  const [glowColor, setGlowColor] = useState('#7ec8e3')
  const [text, setText] = useState('Hover Me')
  const [subtext, setSubtext] = useState('Move your cursor over the card')
  const [glare, setGlare] = useState(true)
  const [parallax, setParallax] = useState(true)
  const [scaleVal, setScaleVal] = useState(1.02)
  const [tiltDegree, setTiltDegree] = useState(15)
  const [borderRadius, setBorderRadius] = useState(16)
  const [width, setWidth] = useState(300)
  const [height, setHeight] = useState(400)
  const [image, setImage] = useState('https://wallpapercave.com/wp/wp12409453.jpg')
  const [imageFit, setImageFit] = useState('cover')

  const reset = useCallback(() => {
    setBgColor('#1a1a2e')
    setFgColor('#ffffff')
    setGlowColor('#7ec8e3')
    setText('Hover Me')
    setSubtext('Move your cursor over the card')
    setGlare(true)
    setParallax(true)
    setScaleVal(1.02)
    setTiltDegree(15)
    setBorderRadius(16)
    setWidth(300)
    setHeight(400)
    if (image) URL.revokeObjectURL(image)
    setImage('https://wallpapercave.com/wp/wp12409453.jpg')
    setImageFit('cover')
  }, [image])

  return (
    <div className="gp-page">
      <div className="gp-hero">
        <h1 className="gp-title">Tilt Card</h1>
        <p className="gp-desc">
          A 3D perspective card with mouse-tracked tilt, magnetic border glow, parallax depth layers,
          dynamic glare, and shine effects. Pure CSS/JS — no canvas or WebGL required.
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
                  <TiltCard
                    backgroundColor={bgColor}
                    foregroundColor={fgColor}
                    glowColor={glowColor}
                    text={text}
                    subtext={subtext}
                    glare={glare}
                    parallax={parallax}
                    scale={scaleVal}
                    tiltDegree={tiltDegree}
                    borderRadius={borderRadius}
                    width={width}
                    height={height}
                    image={image}
                    imageFit={imageFit}
                  />
                </div>
              </div>
              <div className="gp-preview-bottom">
                <div className="gp-preview-controls">
                  <Section title="COLORS">
                    <ColorRow label="BG" value={bgColor} onChange={e => setBgColor(e.target.value)} />
                    <ColorRow label="Accent" value={fgColor} onChange={e => setFgColor(e.target.value)} />
                    <ColorRow label="Glow" value={glowColor} onChange={e => setGlowColor(e.target.value)} />
                  </Section>
                  <Section title="CONTENT">
                    <TextRow label="Text" value={text} onChange={setText} placeholder="Main text" />
                    <TextRow label="Sub" value={subtext} onChange={setSubtext} placeholder="Subtitle" />
                    <div className="gp-row">
                      <span className="gp-label">Image</span>
                      <label className="gp-file-label">
                        <input type="file" accept="image/*" onChange={e => { const f = e.target.files?.[0]; if (f) setImage(URL.createObjectURL(f)) }} className="gp-file" />
                        {image ? 'Replace' : 'Upload'}
                      </label>
                      {image && (
                        <button className="gp-file-remove" onClick={() => { URL.revokeObjectURL(image); setImage(null) }}>&times;</button>
                      )}
                      {image && (
                        <button
                          className="gp-toggle"
                          onClick={() => setImageFit(f => f === 'cover' ? 'contain' : 'cover')}
                        >{imageFit}</button>
                      )}
                    </div>
                  </Section>
                  <Section title="TILT & PARALLAX">
                    <ToggleRow label="Glare" value={glare} onChange={setGlare} />
                    <ToggleRow label="Parallax" value={parallax} onChange={setParallax} />
                    <RangeRow label="Angle" value={tiltDegree} min={1} max={30} step={1} onChange={setTiltDegree} />
                    <RangeRow label="Scale" value={scaleVal} min={1} max={1.1} step={0.01} onChange={setScaleVal} />
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
                    <pre className="gp-doc-code">{`import TiltCard from './components/TiltCard'

function Demo() {
  return (
    <TiltCard
      backgroundColor="#1a1a2e"
      foregroundColor="#ffffff"
      text="Hello"
      subtext="World"
      glare
      parallax
      tiltDegree={15}
      scale={1.02}
      glowColor="#7ec8e3"
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
                value={tiltCardSource}
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
          <p className="gp-doc-p">No external dependencies required. Simply copy <code className="gp-doc-inline">TiltCard.jsx</code> and <code className="gp-doc-inline">TiltCard.css</code> into your project.</p>
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
