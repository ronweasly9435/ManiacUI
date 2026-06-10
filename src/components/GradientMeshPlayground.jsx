import { useState, useCallback } from 'react'
import Editor from '@monaco-editor/react'
import GradientMesh from './GradientMesh'
import gradientMeshSource from './GradientMesh.jsx?raw'
import { handleEditorBeforeMount } from './monacoTheme'
import './Playground.css'

const TABS = ['Preview', 'Code']
const PROPS = [
  { name: 'rows', type: 'number', default: '8', desc: 'Number of rows in the mesh grid' },
  { name: 'cols', type: 'number', default: '12', desc: 'Number of columns in the mesh grid' },
  { name: 'cellSize', type: 'number', default: '60', desc: 'Pixel size of each grid cell' },
  { name: 'speed', type: 'number', default: '1', desc: 'Animation speed multiplier' },
  { name: 'amplitude', type: 'number', default: '20', desc: 'Maximum vertex displacement in pixels' },
  { name: 'color1', type: 'string', default: '#7ec8e3', desc: 'Primary gradient color (left)' },
  { name: 'color2', type: 'string', default: '#6a5acd', desc: 'Secondary gradient color (right)' },
  { name: 'color3', type: 'string', default: '#ff6b6b', desc: 'Tertiary accent color (blends over time)' },
  { name: 'bgColor', type: 'string', default: '#0a0a0f', desc: 'Background color' },
  { name: 'glowPoints', type: 'boolean', default: 'true', desc: 'Show glowing vertex dots' },
  { name: 'strokeWidth', type: 'number', default: '0.5', desc: 'Wireframe stroke thickness' },
  { name: 'fill', type: 'boolean', default: 'true', desc: 'Fill quads with gradient color' },
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

export default function GradientMeshPlayground() {
  const [tab, setTab] = useState('Preview')
  const [rows, setRows] = useState(8)
  const [cols, setCols] = useState(12)
  const [cellSize, setCellSize] = useState(60)
  const [speed, setSpeed] = useState(1)
  const [amplitude, setAmplitude] = useState(20)
  const [color1, setColor1] = useState('#7ec8e3')
  const [color2, setColor2] = useState('#6a5acd')
  const [color3, setColor3] = useState('#ff6b6b')
  const [bgColor, setBgColor] = useState('#0a0a0f')
  const [glowPoints, setGlowPoints] = useState(true)
  const [strokeWidth, setStrokeWidth] = useState(0.5)
  const [fill, setFill] = useState(true)

  const reset = useCallback(() => {
    setRows(8)
    setCols(12)
    setCellSize(60)
    setSpeed(1)
    setAmplitude(20)
    setColor1('#7ec8e3')
    setColor2('#6a5acd')
    setColor3('#ff6b6b')
    setBgColor('#0a0a0f')
    setGlowPoints(true)
    setStrokeWidth(0.5)
    setFill(true)
  }, [])

  return (
    <div className="gp-page">
      <div className="gp-hero">
        <h1 className="gp-title">GradientMesh</h1>
        <p className="gp-desc">
          A full-size SVG mesh grid where vertices drift using simplex noise, creating an organic
          wavy gradient surface. Hover to distort the mesh locally.
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
                <GradientMesh
                  rows={rows}
                  cols={cols}
                  cellSize={cellSize}
                  speed={speed}
                  amplitude={amplitude}
                  color1={color1}
                  color2={color2}
                  color3={color3}
                  bgColor={bgColor}
                  glowPoints={glowPoints}
                  strokeWidth={strokeWidth}
                  fill={fill}
                />
              </div>
              <div className="gp-preview-bottom">
                <div className="gp-preview-controls">
                  <Section title="GRID">
                    <RangeRow label="Rows" value={rows} min={4} max={16} step={1} onChange={setRows} />
                    <RangeRow label="Cols" value={cols} min={6} max={24} step={1} onChange={setCols} />
                    <RangeRow label="Cell" value={cellSize} min={30} max={120} step={5} onChange={setCellSize} />
                  </Section>
                  <Section title="ANIMATION">
                    <RangeRow label="Speed" value={speed} min={0.1} max={5} step={0.1} onChange={setSpeed} />
                    <RangeRow label="Amp" value={amplitude} min={5} max={60} step={1} onChange={setAmplitude} />
                  </Section>
                  <Section title="COLORS">
                    <ColorRow label="C1" value={color1} onChange={e => setColor1(e.target.value)} />
                    <ColorRow label="C2" value={color2} onChange={e => setColor2(e.target.value)} />
                    <ColorRow label="C3" value={color3} onChange={e => setColor3(e.target.value)} />
                    <ColorRow label="BG" value={bgColor} onChange={e => setBgColor(e.target.value)} />
                  </Section>
                  <Section title="DISPLAY">
                    <ToggleRow label="Glow" value={glowPoints} onChange={setGlowPoints} />
                    <ToggleRow label="Fill" value={fill} onChange={setFill} />
                    <RangeRow label="Stroke" value={strokeWidth} min={0} max={3} step={0.1} onChange={setStrokeWidth} />
                  </Section>
                </div>
                <div className="gp-usage-panel">
                  <div className="gp-doc-section">
                    <h2 className="gp-doc-h2">Usage</h2>
                    <pre className="gp-doc-code">{`import GradientMesh from './components/GradientMesh'

function Demo() {
  return (
    <GradientMesh
      rows={8}
      cols={12}
      speed={1}
      amplitude={20}
      color1="#7ec8e3"
      color2="#6a5acd"
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
                value={gradientMeshSource}
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
          <p className="gp-doc-p">No external dependencies required. Copy <code className="gp-doc-inline">GradientMesh.jsx</code> and <code className="gp-doc-inline">GradientMesh.css</code> into your project.</p>
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
