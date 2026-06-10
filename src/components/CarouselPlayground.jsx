import { useState, useCallback } from 'react'
import Editor from '@monaco-editor/react'
import Carousel from './Carousel'
import carouselSource from './Carousel.jsx?raw'
import { handleEditorBeforeMount } from './monacoTheme'
import './Playground.css'

const TABS = ['Preview', 'Code']
const PROPS = [
  { name: 'images', type: 'string[]', default: '8 Unsplash URLs', desc: 'Array of image URLs for each card' },
  { name: 'labels', type: 'string[]', default: 'Label defaults', desc: 'Custom labels per card. Cycles if fewer than images.' },
  { name: 'cardWidth', type: 'number', default: '220', desc: 'Card width in pixels' },
  { name: 'cardHeight', type: 'number', default: '300', desc: 'Card height in pixels' },
  { name: 'radius', type: 'number', default: '380', desc: '3D circle radius in pixels' },
  { name: 'perspective', type: 'number', default: '1200', desc: 'Perspective depth value' },
  { name: 'autoRotate', type: 'boolean', default: 'true', desc: 'Enable auto rotation' },
  { name: 'autoRotateSpeed', type: 'number', default: '0.8', desc: 'Auto rotation speed' },
  { name: 'glare', type: 'boolean', default: 'true', desc: 'Show glare on hovered card' },
  { name: 'reflection', type: 'boolean', default: 'true', desc: 'Show card reflections' },
  { name: 'backgroundColor', type: 'string', default: '#0a0a0f', desc: 'Scene background color' },
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

export default function CarouselPlayground() {
  const [tab, setTab] = useState('Preview')
  const [bgColor, setBgColor] = useState('#0a0a0f')
  const [cardWidth, setCardWidth] = useState(220)
  const [cardHeight, setCardHeight] = useState(300)
  const [radius, setRadius] = useState(380)
  const [perspective, setPerspective] = useState(1200)
  const [autoRotate, setAutoRotate] = useState(true)
  const [autoRotateSpeed, setAutoRotateSpeed] = useState(0.8)
  const [glare, setGlare] = useState(true)
  const [reflection, setReflection] = useState(true)
  const [borderRadius, setBorderRadius] = useState(16)

  const reset = useCallback(() => {
    setBgColor('#0a0a0f')
    setCardWidth(220)
    setCardHeight(300)
    setRadius(380)
    setPerspective(1200)
    setAutoRotate(true)
    setAutoRotateSpeed(0.8)
    setGlare(true)
    setReflection(true)
    setBorderRadius(16)
  }, [])

  return (
    <div className="gp-page">
      <div className="gp-hero">
        <h1 className="gp-title">3D Carousel</h1>
        <p className="gp-desc">
          A stunning 3D carousel with drag physics, momentum scrolling, reflections, and ambient glow.
          Pure CSS 3D — no canvas or WebGL required.
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
              <div className="gp-preview-scene" style={{ overflow: 'hidden' }}>
                <Carousel
                  cardWidth={cardWidth}
                  cardHeight={cardHeight}
                  radius={radius}
                  perspective={perspective}
                  autoRotate={autoRotate}
                  autoRotateSpeed={autoRotateSpeed}
                  glare={glare}
                  reflection={reflection}
                  backgroundColor={bgColor}
                  borderRadius={borderRadius}
                />
              </div>
              <div className="gp-preview-bottom">
                <div className="gp-preview-controls">
                  <Section title="LAYOUT">
                    <RangeRow label="Width" value={cardWidth} min={140} max={320} step={10} onChange={setCardWidth} />
                    <RangeRow label="Height" value={cardHeight} min={200} max={400} step={10} onChange={setCardHeight} />
                    <RangeRow label="Radius" value={radius} min={200} max={600} step={10} onChange={setRadius} />
                    <RangeRow label="Perspective" value={perspective} min={600} max={2000} step={50} onChange={setPerspective} />
                  </Section>
                  <Section title="MOTION">
                    <ToggleRow label="Auto-spin" value={autoRotate} onChange={setAutoRotate} />
                    <RangeRow label="Speed" value={autoRotateSpeed} min={0.1} max={3} step={0.1} onChange={setAutoRotateSpeed} />
                  </Section>
                  <Section title="EFFECTS">
                    <ToggleRow label="Glare" value={glare} onChange={setGlare} />
                    <ToggleRow label="Reflection" value={reflection} onChange={setReflection} />
                    <RangeRow label="Rounding" value={borderRadius} min={0} max={30} step={2} onChange={setBorderRadius} />
                  </Section>
                  <Section title="BACKGROUND">
                    <ColorRow label="BG" value={bgColor} onChange={e => setBgColor(e.target.value)} />
                  </Section>
                </div>
                <div className="gp-usage-panel">
                  <div className="gp-doc-section">
                    <h2 className="gp-doc-h2">Usage</h2>
                    <pre className="gp-doc-code">{`import Carousel from './components/Carousel'

function Demo() {
  return <Carousel autoRotate glare reflection />
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
                value={carouselSource}
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
          <p className="gp-doc-p">No external dependencies required. Simply copy <code className="gp-doc-inline">Carousel.jsx</code> into your project.</p>
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
