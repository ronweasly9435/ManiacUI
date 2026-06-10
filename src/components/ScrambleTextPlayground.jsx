import { useState, useCallback } from 'react'
import Editor from '@monaco-editor/react'
import ScrambleText from './ScrambleText'
import scrambleSource from './ScrambleText.jsx?raw'
import { handleEditorBeforeMount } from './monacoTheme'
import './Playground.css'

const TABS = ['Preview', 'Code']
const PROPS = [
  { name: 'text', type: 'string', default: "'Hello World'", desc: 'The text to display and scramble' },
  { name: 'glitch', type: 'boolean', default: 'true', desc: 'Enable glitch effects during scrambling' },
  { name: 'speed', type: 'number', default: '50', desc: 'Milliseconds between character changes' },
  { name: 'scrambleChars', type: 'string', default: 'A-Z, 0-9, symbols', desc: 'Characters used during scrambling' },
  { name: 'hover', type: 'boolean', default: 'true', desc: 'Triggers on hover; auto-scrambles if false' },
  { name: 'as', type: 'string', default: "'h1'", desc: 'HTML tag to render the text as' },
  { name: 'fontSize', type: 'number', default: '48', desc: 'Font size in pixels' },
  { name: 'color', type: 'string', default: "'#ffffff'", desc: 'Text color' },
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

function SelectRow({ label, value, onChange, options }) {
  return (
    <div className="gp-row">
      <span className="gp-label">{label}</span>
      <select value={value} onChange={e => onChange(e.target.value)} className="gp-text-input" style={{ width: 'auto', flex: '0 1 auto' }}>
        {options.map(o => (
          <option key={o} value={o}>{o}</option>
        ))}
      </select>
    </div>
  )
}

export default function ScrambleTextPlayground() {
  const [tab, setTab] = useState('Preview')
  const [text, setText] = useState('Hello World')
  const [color, setColor] = useState('#ffffff')
  const [speed, setSpeed] = useState(50)
  const [fontSize, setFontSize] = useState(48)
  const [glitch, setGlitch] = useState(true)
  const [hoverMode, setHoverMode] = useState(true)
  const [tag, setTag] = useState('h1')

  const reset = useCallback(() => {
    setText('Hello World')
    setColor('#ffffff')
    setSpeed(50)
    setFontSize(48)
    setGlitch(true)
    setHoverMode(true)
    setTag('h1')
  }, [])

  return (
    <div className="gp-page">
      <div className="gp-hero">
        <h1 className="gp-title">Scramble Text</h1>
        <p className="gp-desc">
          Text that scrambles its characters on hover with a glitch effect.
          Each character cycles randomly before settling into place with
          staggered timing and chromatic aberration.
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
                <ScrambleText
                  text={text}
                  color={color}
                  speed={speed}
                  fontSize={fontSize}
                  glitch={glitch}
                  hover={hoverMode}
                  as={tag}
                />
              </div>
              <div className="gp-preview-bottom">
                <div className="gp-preview-controls">
                  <Section title="CONTENT">
                    <TextRow label="Text" value={text} onChange={setText} placeholder="Enter text" />
                    <ColorRow label="Color" value={color} onChange={e => setColor(e.target.value)} />
                  </Section>
                  <Section title="BEHAVIOR">
                    <ToggleRow label="Glitch" value={glitch} onChange={setGlitch} />
                    <ToggleRow label="Hover" value={hoverMode} onChange={setHoverMode} />
                    <RangeRow label="Speed" value={speed} min={20} max={200} step={10} onChange={setSpeed} />
                  </Section>
                  <Section title="STYLE">
                    <RangeRow label="Size" value={fontSize} min={20} max={80} step={2} onChange={setFontSize} />
                    <SelectRow label="Tag" value={tag} onChange={setTag} options={['h1', 'h2', 'h3', 'h4', 'div', 'p', 'span']} />
                  </Section>
                </div>
                <div className="gp-usage-panel">
                  <div className="gp-doc-section">
                    <h2 className="gp-doc-h2">Usage</h2>
                    <pre className="gp-doc-code">{`import ScrambleText from './components/ScrambleText'

function Demo() {
  return (
    <ScrambleText
      text="Hello World"
      color="#ffffff"
      glitch
      speed={50}
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
                value={scrambleSource}
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
          <p className="gp-doc-p">No external dependencies required. Copy <code className="gp-doc-inline">ScrambleText.jsx</code> and <code className="gp-doc-inline">ScrambleText.css</code> into your project.</p>
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
