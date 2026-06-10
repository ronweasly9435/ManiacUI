import './Sidebar.css'

const COMPONENTS = [
  { id: 'carousel', name: '3D Carousel', desc: '3D spinning carousel with drag physics' },
  { id: 'lanyard', name: 'Lanyard', desc: '3D ID badge with physics strap' },
  { id: 'blob', name: 'Blob', desc: 'Organic morphing 3D shape' },
  { id: 'tiltcard', name: 'Tilt Card', desc: '3D perspective tilt card' },
]

export default function Sidebar({ activeId, onSelect, open }) {
  return (
    <aside className={`sb-root ${open ? 'open' : ''}`}>
      <div className="sb-header">Components</div>
      <div className="sb-list">
        {COMPONENTS.map(c => (
          <button
            key={c.id}
            className={`sb-item ${activeId === c.id ? 'active' : ''} ${c.disabled ? 'disabled' : ''}`}
            onClick={() => !c.disabled && onSelect(c.id)}
          >
            <div className="sb-item-name">{c.name}</div>
            <div className="sb-item-desc">{c.desc}</div>
          </button>
        ))}
      </div>
    </aside>
  )
}
