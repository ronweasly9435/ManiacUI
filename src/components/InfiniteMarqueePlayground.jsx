import { useState, useCallback } from 'react'
import Editor from '@monaco-editor/react'
import InfiniteMarquee from './InfiniteMarquee'
import marqueeSource from './InfiniteMarquee.jsx?raw'
import { handleEditorBeforeMount } from './monacoTheme'
import './Playground.css'

const TABS = ['Preview', 'Code']
const PROPS = [
  { name: 'items', type: 'string[]', default: '20 tech brand names', desc: 'Array of strings to display' },
  { name: 'speed', type: 'number', default: '30', desc: 'Base animation duration (lower = faster)' },
  { name: 'rows', type: 'number', default: '3', desc: 'Number of rows at different depths' },
  { name: 'direction', type: 'string[]', default: "['left','right',...]", desc: 'Scroll direction per row' },
  { name: 'pauseOnHover', type: 'boolean', default: 'true', desc: 'Pause animation on hover' },
  { name: 'fontSize', type: 'number', default: '14', desc: 'Font size in pixels' },
  { name: 'color', type: 'string', default: 'rgba(255,255,255,0.4)', desc: 'Text color' },
  { name: 'gap', type: 'number', default: '60', desc: 'Gap between items in pixels' },
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

export default function InfiniteMarqueePlayground() {
  const [tab, setTab] = useState('Preview')
  const [speed, setSpeed] = useState(30)
  const [rows, setRows] = useState(3)
  const [fontSize, setFontSize] = useState(14)
  const [color, setColor] = useState('#7ec8e3')
  const [dir0, setDir0] = useState(true)
  const [dir1, setDir1] = useState(false)
  const [dir2, setDir2] = useState(true)
  const [pauseOnHover, setPauseOnHover] = useState(true)

  const reset = useCallback(() => {
    setSpeed(30)
    setRows(3)
    setFontSize(14)
    setColor('#7ec8e3')
    setDir0(true)
    setDir1(false)
    setDir2(true)
    setPauseOnHover(true)
  }, [])

  const direction = [dir0 ? 'left' : 'right', dir1 ? 'left' : 'right', dir2 ? 'left' : 'right']

  return (
    <div className="gp-page">
      <div className="gp-hero">
        <h1 className="gp-title">InfiniteMarquee</h1>
        <p className="gp-desc">
          An infinite horizontal scrolling marquee with 3D perspective depth — logos and text appear
          to orbit around the viewer with parallax rows.
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
                <InfiniteMarquee
                  speed={speed}
                  rows={rows}
                  direction={direction}
                  pauseOnHover={pauseOnHover}
                  fontSize={fontSize}
                  color={color}
                />
              </div>
              <div className="gp-preview-bottom">
                <div className="gp-preview-controls">
                  <Section title="ANIMATION">
                    <RangeRow label="Speed" value={speed} min={10} max={80} step={1} onChange={setSpeed} />
                    <ToggleRow label="Pause" value={pauseOnHover} onChange={setPauseOnHover} />
                  </Section>
                  <Section title="LAYOUT">
                    <RangeRow label="Rows" value={rows} min={1} max={5} step={1} onChange={setRows} />
                    <RangeRow label="Font" value={fontSize} min={10} max={40} step={1} onChange={setFontSize} />
                  </Section>
                  <Section title="COLOR">
                    <ColorRow label="Color" value={color} onChange={e => setColor(e.target.value)} />
                  </Section>
                  <Section title="DIRECTION">
                    <ToggleRow label="Row 1 Left" value={dir0} onChange={setDir0} />
                    <ToggleRow label="Row 2 Left" value={dir1} onChange={setDir1} />
                    <ToggleRow label="Row 3 Left" value={dir2} onChange={setDir2} />
                  </Section>
                </div>
                <div className="gp-usage-panel">
                  <div className="gp-doc-section">
                    <h2 className="gp-doc-h2">Usage</h2>
                    <pre className="gp-doc-code">{`import InfiniteMarquee from './components/InfiniteMarquee'

function Demo() {
  return <InfiniteMarquee speed={30} rows={3} pauseOnHover />
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
                value={marqueeSource}
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
          <p className="gp-doc-p">No external dependencies required. Copy <code className="gp-doc-inline">InfiniteMarquee.jsx</code> and <code className="gp-doc-inline">InfiniteMarquee.css</code> into your project.</p>
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
