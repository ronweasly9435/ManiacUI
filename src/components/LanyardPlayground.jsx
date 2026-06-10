import { useState, useCallback } from 'react'
import Editor from '@monaco-editor/react'
import Lanyard from './Lanyard'
import lanyardSource from './Lanyard.jsx?raw'
import appSource from '../App.jsx?raw'
import { handleEditorBeforeMount } from './monacoTheme'
import './LanyardPlayground.css'

function ColorRow({ label, value, onChange }) {
  return (
    <div className="pg-row">
      <span className="pg-label">{label}</span>
      <input type="color" value={value} onChange={onChange} className="pg-color" />
      <span className="pg-hex">{value}</span>
    </div>
  )
}

function FileRow({ label, value, onChange, onRemove }) {
  return (
    <div className="pg-row">
      <span className="pg-label">{label}</span>
      <label className="pg-file-label">
        <input type="file" accept="image/*" onChange={onChange} className="pg-file" />
        {value ? 'Replace' : 'Upload'}
      </label>
      {value && (
        <button className="pg-file-remove" onClick={onRemove}>&times;</button>
      )}
    </div>
  )
}

const TABS = ['Preview', 'Code']
const EDITOR_FILES = ['Lanyard.jsx', 'App.jsx']

const PROPS_DATA = [
  { name: 'bandColor', type: 'string', default: '#ffffff', desc: 'Color of the lanyard strap' },
  { name: 'cardColor', type: 'string', default: '#ffffff', desc: 'Background color of the ID card' },
  { name: 'backgroundColor', type: 'string', default: '#000000', desc: 'Scene background color' },
  { name: 'cardText', type: 'string', default: 'CLOBE', desc: 'Main text displayed on the card front' },
  { name: 'cardSubtext', type: 'string', default: 'EMPLOYEE', desc: 'Secondary text on the card front' },
  { name: 'cardImage', type: 'string | null', default: 'wallpaper URL', desc: 'URL for an image on the card front' },
  { name: 'cardImageBack', type: 'string | null', default: 'null', desc: 'URL for an image on the card back' },
  { name: 'cardImageFit', type: '"cover" | "contain"', default: '"contain"', desc: 'How the image fits the card area' },
]

export default function LanyardPlayground() {
  const [tab, setTab] = useState('Preview')
  const [editorFile, setEditorFile] = useState('Lanyard.jsx')
  const [bandColor, setBandColor] = useState('#ffffff')
  const [cardColor, setCardColor] = useState('#ffffff')
  const [bgColor, setBgColor] = useState('#000000')
  const [cardText, setCardText] = useState('CLOBE')
  const [cardSubtext, setCardSubtext] = useState('EMPLOYEE')
  const [cardImage, setCardImage] = useState('https://wallpapercave.com/wp/wp12409453.jpg')
  const [cardImageBack, setCardImageBack] = useState(null)
  const [cardImageFit, setCardImageFit] = useState('contain')
  const [copied, setCopied] = useState(false)

  const handleImageFront = useCallback((e) => {
    const file = e.target.files?.[0]
    if (file) setCardImage(URL.createObjectURL(file))
  }, [])

  const handleImageBack = useCallback((e) => {
    const file = e.target.files?.[0]
    if (file) setCardImageBack(URL.createObjectURL(file))
  }, [])

  const reset = useCallback(() => {
    setBandColor('#ffffff')
    setCardColor('#ffffff')
    setBgColor('#000000')
    setCardText('CLOBE')
    setCardSubtext('EMPLOYEE')
    if (cardImage) URL.revokeObjectURL(cardImage)
    if (cardImageBack) URL.revokeObjectURL(cardImageBack)
    setCardImage('https://wallpapercave.com/wp/wp12409453.jpg')
    setCardImageBack(null)
    setCardImageFit('contain')
    if (cardImage) URL.revokeObjectURL(cardImage)
    if (cardImageBack) URL.revokeObjectURL(cardImageBack)
    setCardImage(null)
    setCardImageBack(null)
  }, [cardImage, cardImageBack])

  const imgSuffix = cardImage ? '\n  cardImage={/* uploaded front */}' : ''
  const imgBackSuffix = cardImageBack ? '\n  cardImageBack={/* uploaded back */}' : ''
  const usageSnippet = `<Lanyard
  bandColor="${bandColor}"
  cardColor="${cardColor}"
  backgroundColor="${bgColor}"
  cardText="${cardText}"
  cardSubtext="${cardSubtext}"
  cardImageFit="${cardImageFit}"${imgSuffix}${imgBackSuffix}
/>`

  const copyCode = async () => {
    try {
      await navigator.clipboard.writeText(usageSnippet)
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    } catch {}
  }

  return (
    <div className="pg-page">
      <div className="pg-hero">
        <h1 className="pg-title">Lanyard</h1>
        <p className="pg-desc">
          A physics-driven 3D lanyard component with a customizable ID card, woven strap,
          and clip. Built with Rapier physics and React Three Fiber.
        </p>
      </div>

      <div className="pg-demo-tabs">
        {TABS.map(t => (
          <button key={t} className={`pg-demo-tab ${tab === t ? 'active' : ''}`} onClick={() => setTab(t)}>
            {t}
          </button>
        ))}
        <button className="pg-demo-reset" onClick={reset}>Reset</button>
      </div>

      <div className="pg-demo">
        {tab === 'Preview' ? (
          <div className="pg-demo-inner">
            <div className="pg-preview-col">
              <div className="pg-preview-scene">
                <Lanyard
                  bandColor={bandColor}
                  cardColor={cardColor}
                  cardText={cardText}
                  cardSubtext={cardSubtext}
                  cardImage={cardImage}
                  cardImageBack={cardImageBack}
                  cardImageFit={cardImageFit}
                  backgroundColor={bgColor}
                />
              </div>
              <div className="pg-preview-bottom">
                <div className="pg-preview-controls">
                  <div className="pg-section">
                    <div className="pg-section-title">Card</div>
                    <FileRow label="Front" value={cardImage} onChange={handleImageFront} onRemove={() => { URL.revokeObjectURL(cardImage); setCardImage(null) }} />
                    <FileRow label="Back" value={cardImageBack} onChange={handleImageBack} onRemove={() => { URL.revokeObjectURL(cardImageBack); setCardImageBack(null) }} />
                    <div className="pg-row">
                      <span className="pg-label">Fit</span>
                      <div className="pg-toggle-group">
                        <button className={`pg-toggle ${cardImageFit === 'cover' ? 'active' : ''}`} onClick={() => setCardImageFit('cover')}>Cover</button>
                        <button className={`pg-toggle ${cardImageFit === 'contain' ? 'active' : ''}`} onClick={() => setCardImageFit('contain')}>Contain</button>
                      </div>
                    </div>
                    <div className="pg-row">
                      <span className="pg-label">Text</span>
                      <input type="text" value={cardText} onChange={e => setCardText(e.target.value.toUpperCase())} className="pg-input" maxLength={12} />
                    </div>
                    <div className="pg-row">
                      <span className="pg-label">Sub</span>
                      <input type="text" value={cardSubtext} onChange={e => setCardSubtext(e.target.value.toUpperCase())} className="pg-input" maxLength={16} />
                    </div>
                    <ColorRow label="Color" value={cardColor} onChange={e => setCardColor(e.target.value)} />
                  </div>
                  <div className="pg-section">
                    <div className="pg-section-title">Band</div>
                    <ColorRow label="Strap" value={bandColor} onChange={e => setBandColor(e.target.value)} />
                    <ColorRow label="BG" value={bgColor} onChange={e => setBgColor(e.target.value)} />
                  </div>
                  <button className="pg-reset-btn" onClick={reset}>Reset defaults</button>
                </div>
                <div className="pg-usage-panel">
                  <div className="pg-doc-section">
                    <h2 className="pg-doc-h2">Usage</h2>
                    <pre className="pg-doc-code">{`import Lanyard from './components/Lanyard'

function Demo() {
  return (
    <Lanyard
      bandColor="#ffffff"
      cardColor="#ffffff"
      backgroundColor="#000000"
      cardText="CLOBE"
      cardSubtext="EMPLOYEE"
      cardImageFit="contain"
    />
  )
}`}</pre>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="pg-code-col">
            <div className="pg-code-tabs">
              {EDITOR_FILES.map(f => (
                <span key={f} className={`pg-code-tab ${editorFile === f ? 'active' : ''}`} onClick={() => setEditorFile(f)}>
                  {f}
                </span>
              ))}
            </div>
            <div className="pg-code-editor">
              <Editor
                height="100%"
                language="javascript"
                theme="single-color"
                beforeMount={handleEditorBeforeMount}
                value={editorFile === 'Lanyard.jsx' ? lanyardSource : appSource}
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

      <div className="pg-docs">
        <section className="pg-doc-section">
          <h2 className="pg-doc-h2">Installation</h2>
          <p className="pg-doc-p">Install the required dependencies:</p>
          <pre className="pg-doc-code">npm install @react-three/fiber @react-three/drei @react-three/rapier three meshline</pre>
          <p className="pg-doc-p">Copy <code className="pg-doc-inline">Lanyard.jsx</code> into your project.</p>
        </section>

        <section className="pg-doc-section">
          <h2 className="pg-doc-h2">Interactive Demo</h2>
          <p className="pg-doc-p">
            Use the controls on the left to customize the lanyard in real time.
            The strap swings with physics &mdash; drag the card to see it in action.
          </p>
        </section>

        <section className="pg-doc-section">
          <h2 className="pg-doc-h2">Props</h2>
          <div className="pg-table-wrap">
            <table className="pg-props-table">
              <thead>
                <tr>
                  <th>Prop</th>
                  <th>Type</th>
                  <th>Default</th>
                  <th>Description</th>
                </tr>
              </thead>
              <tbody>
                {PROPS_DATA.map(p => (
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
