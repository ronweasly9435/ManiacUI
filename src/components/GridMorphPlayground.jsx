import { useState, useCallback } from 'react'
import Editor from '@monaco-editor/react'
import GridMorph from './GridMorph'
import gridMorphSource from './GridMorph.jsx?raw'
import { handleEditorBeforeMount } from './monacoTheme'
import './Playground.css'

const TABS = ['Preview', 'Code']
const PROPS = [
  { name: 'gridSize', type: 'number', default: '12', desc: 'Number of cells per row/column' },
  { name: 'cellGap', type: 'number', default: '2', desc: 'Gap between cells in pixels' },
  { name: 'cellRadius', type: 'number', default: '2', desc: 'Cell border radius in pixels' },
  { name: 'color', type: 'string', default: '#7ec8e3', desc: 'Base cell color' },
  { name: 'bgColor', type: 'string', default: '#0a0a0f', desc: 'Background color' },
  { name: 'hoverColor', type: 'string', default: '#ffffff', desc: 'Color when mouse is near' },
  { name: 'intensity', type: 'number', default: '1', desc: 'Effect intensity multiplier' },
  { name: 'responsive', type: 'boolean', default: 'true', desc: 'Reduce cells on mobile' },
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

export default function GridMorphPlayground() {
  const [tab, setTab] = useState('Preview')
  const [gridSize, setGridSize] = useState(12)
  const [cellGap, setCellGap] = useState(2)
  const [cellRadius, setCellRadius] = useState(2)
  const [color, setColor] = useState('#7ec8e3')
  const [bgColor, setBgColor] = useState('#0a0a0f')
  const [hoverColor, setHoverColor] = useState('#ffffff')
  const [intensity, setIntensity] = useState(1)

  const reset = useCallback(() => {
    setGridSize(12)
    setCellGap(2)
    setCellRadius(2)
    setColor('#7ec8e3')
    setBgColor('#0a0a0f')
    setHoverColor('#ffffff')
    setIntensity(1)
  }, [])

  return (
    <div className="gp-page">
      <div className="gp-hero">
        <h1 className="gp-title">GridMorph</h1>
        <p className="gp-desc">
          A living CSS grid that ripples with wave-like propagation as your mouse moves — each cell
          scales, brightens, and rotates based on proximity.
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
                <GridMorph
                  gridSize={gridSize}
                  cellGap={cellGap}
                  cellRadius={cellRadius}
                  color={color}
                  bgColor={bgColor}
                  hoverColor={hoverColor}
                  intensity={intensity}
                />
              </div>
              <div className="gp-preview-bottom">
                <div className="gp-preview-controls">
                  <Section title="GRID">
                    <RangeRow label="Size" value={gridSize} min={4} max={20} step={1} onChange={setGridSize} />
                    <RangeRow label="Gap" value={cellGap} min={0} max={8} step={1} onChange={setCellGap} />
                    <RangeRow label="Radius" value={cellRadius} min={0} max={12} step={1} onChange={setCellRadius} />
                  </Section>
                  <Section title="COLORS">
                    <ColorRow label="Base" value={color} onChange={e => setColor(e.target.value)} />
                    <ColorRow label="Hover" value={hoverColor} onChange={e => setHoverColor(e.target.value)} />
                    <ColorRow label="BG" value={bgColor} onChange={e => setBgColor(e.target.value)} />
                  </Section>
                  <Section title="EFFECTS">
                    <RangeRow label="Intensity" value={intensity} min={0.1} max={3} step={0.1} onChange={setIntensity} />
                  </Section>
                </div>
                <div className="gp-usage-panel">
                  <div className="gp-doc-section">
                    <h2 className="gp-doc-h2">Usage</h2>
                    <pre className="gp-doc-code">{`import GridMorph from './components/GridMorph'

function Demo() {
  return <GridMorph gridSize={12} intensity={1} />
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
                value={gridMorphSource}
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
          <p className="gp-doc-p">No external dependencies required. Copy <code className="gp-doc-inline">GridMorph.jsx</code> and <code className="gp-doc-inline">GridMorph.css</code> into your project.</p>
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
