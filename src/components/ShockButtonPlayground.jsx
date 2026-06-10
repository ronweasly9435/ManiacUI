import { useState, useCallback } from 'react'
import Editor from '@monaco-editor/react'
import ShockButton from './ShockButton'
import shockButtonSource from './ShockButton.jsx?raw'
import { handleEditorBeforeMount } from './monacoTheme'
import './Playground.css'

const TABS = ['Preview', 'Code']
const PROPS = [
  { name: 'label', type: 'string', default: 'Click Me', desc: 'Button text' },
  { name: 'color', type: 'string', default: '#7ec8e3', desc: 'Accent color for gradient and rings' },
  { name: 'size', type: "'sm'|'md'|'lg'", default: 'md', desc: 'Button size preset' },
  { name: 'variant', type: "'primary'|'outline'|'ghost'", default: 'primary', desc: 'Visual style variant' },
  { name: 'glow', type: 'boolean', default: 'true', desc: 'Show outer glow effect' },
  { name: 'onClick', type: 'function', default: '—', desc: 'Click handler' },
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

function SelectRow({ label, value, options, onChange }) {
  return (
    <div className="gp-row">
      <span className="gp-label">{label}</span>
      <select className="gp-text-input" value={value} onChange={e => onChange(e.target.value)} style={{ width: 'auto', minWidth: 100 }}>
        {options.map(o => (
          <option key={o} value={o}>{o}</option>
        ))}
      </select>
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

export default function ShockButtonPlayground() {
  const [tab, setTab] = useState('Preview')
  const [color, setColor] = useState('#7ec8e3')
  const [label, setLabel] = useState('Click Me')
  const [size, setSize] = useState('md')
  const [variant, setVariant] = useState('primary')
  const [glow, setGlow] = useState(true)

  const reset = useCallback(() => {
    setColor('#7ec8e3')
    setLabel('Click Me')
    setSize('md')
    setVariant('primary')
    setGlow(true)
  }, [])

  return (
    <div className="gp-page">
      <div className="gp-hero">
        <h1 className="gp-title">Shock Button</h1>
        <p className="gp-desc">
          A gradient button that emits expanding concentric shockwave rings on click.
          Supports primary, outline, and ghost variants with a shimmer hover effect.
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
                <ShockButton
                  label={label}
                  color={color}
                  size={size}
                  variant={variant}
                  glow={glow}
                />
              </div>
              <div className="gp-preview-bottom">
                <div className="gp-preview-controls">
                  <Section title="STYLE">
                    <ColorRow label="Color" value={color} onChange={e => setColor(e.target.value)} />
                    <SelectRow label="Variant" value={variant} options={['primary', 'outline', 'ghost']} onChange={setVariant} />
                    <SelectRow label="Size" value={size} options={['sm', 'md', 'lg']} onChange={setSize} />
                    <ToggleRow label="Glow" value={glow} onChange={setGlow} />
                  </Section>
                  <Section title="CONTENT">
                    <TextRow label="Label" value={label} onChange={setLabel} placeholder="Button text" />
                  </Section>
                </div>
                <div className="gp-usage-panel">
                  <div className="gp-doc-section">
                    <h2 className="gp-doc-h2">Usage</h2>
                    <pre className="gp-doc-code">{`import ShockButton from './components/ShockButton'

function Demo() {
  return (
    <ShockButton
      label="Click Me"
      color="#7ec8e3"
      size="md"
      variant="primary"
      glow
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
                value={shockButtonSource}
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
          <p className="gp-doc-p">No external dependencies required. Copy <code className="gp-doc-inline">ShockButton.jsx</code> and <code className="gp-doc-inline">ShockButton.css</code> into your project.</p>
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
