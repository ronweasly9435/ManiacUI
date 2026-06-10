import './Sidebar.css'

const COMPONENTS = [
  { id: 'carousel', name: '3D Carousel', desc: '3D spinning carousel with drag physics' },
  { id: 'lanyard', name: 'Lanyard', desc: '3D ID badge with physics strap' },
  { id: 'blob', name: 'Blob', desc: 'Organic morphing 3D shape' },
  { id: 'tiltcard', name: 'Tilt Card', desc: '3D perspective tilt card' },
  { id: 'fluidorb', name: 'Fluid Orb', desc: 'Liquid gradient blob tracking cursor' },
  { id: 'shockbutton', name: 'Shock Button', desc: 'Ripple shockwave on click' },
  { id: 'scrambletext', name: 'Scramble Text', desc: 'Character scramble with glitch' },
  { id: 'warpcard', name: 'Warp Card', desc: 'Gravitational lensing card' },
  { id: 'infinitemarquee', name: 'Infinite Marquee', desc: '3D perspective scroll tunnel' },
  { id: 'gridmorph', name: 'Grid Morph', desc: 'Proximity wave grid cells' },
  { id: 'particleimage', name: 'Particle Image', desc: 'Image as interactive particles' },
  { id: 'ripplereveal', name: 'Ripple Reveal', desc: 'Click ripples reveal content' },
  { id: 'magneticstack', name: 'Magnetic Stack', desc: 'Cards with staggered magnetic mouse tracking' },
  { id: 'cursortrail', name: 'Cursor Trail', desc: 'Glowing gradient trail following cursor' },
  { id: 'kinetictext', name: 'Kinetic Text', desc: 'Physics-based letter particles' },
  { id: 'gradientmesh', name: 'Gradient Mesh', desc: 'Living SVG mesh with drifting vertices' },
  { id: 'noiseborder', name: 'Noise Border', desc: 'SVG feTurbulence crawling border' },
  { id: 'scrollprogress', name: 'Scroll Progress', desc: 'Progress bar with particle bursts' },
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
