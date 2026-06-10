import { useEffect, useRef } from 'react'

const vertex = `
attribute vec2 position;
void main(){gl_Position=vec4(position,0.0,1.0);}
`

const fragment = `
#ifdef GL_ES
precision highp float;
#endif
uniform vec2 uResolution;
uniform float uTime;
uniform float uSpeed;
uniform float uScale;
uniform vec3 uColor;
uniform float uOpacity;

float noise(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
}

float smoothNoise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  f = f * f * (3.0 - 2.0 * f);
  float a = noise(i);
  float b = noise(i + vec2(1.0, 0.0));
  float c = noise(i + vec2(0.0, 1.0));
  float d = noise(i + vec2(1.0, 1.0));
  return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
}

void main() {
  vec2 uv = gl_FragCoord.xy / uResolution.xy;
  float aspect = uResolution.x / uResolution.y;
  vec2 p = uv * uScale;
  p.x *= aspect;

  float t = uTime * uSpeed;

  float n1 = smoothNoise(p + t * 0.3);
  float n2 = smoothNoise(p * 2.0 - t * 0.2 + 10.0);
  float n3 = smoothNoise(p * 0.5 + t * 0.15 + 20.0);

  float pattern = n1 * 0.6 + n2 * 0.3 + n3 * 0.1;
  pattern = smoothstep(0.2, 0.8, pattern);

  float wave = sin(p.x * 4.0 + p.y * 3.0 + t) * 0.5 + 0.5;
  float wave2 = cos(p.y * 5.0 - p.x * 2.0 + t * 0.7) * 0.5 + 0.5;

  float alpha = pattern * 0.15 + wave * 0.08 + wave2 * 0.06;
  alpha *= uOpacity;

  gl_FragColor = vec4(uColor, alpha);
}
`

export default function Silk({
  color = '#7ec8e3',
  speed = 0.4,
  scale = 2.0,
  opacity = 0.5,
  className,
  style,
}) {
  const containerRef = useRef(null)
  const canvasRef = useRef(null)

  useEffect(() => {
    const container = containerRef.current
    const canvas = canvasRef.current
    if (!container || !canvas) return

    let gl = canvas.getContext('webgl')
    if (!gl) return

    const vsSource = vertex
    const fsSource = fragment

    const compileShader = (src, type) => {
      const s = gl.createShader(type)
      gl.shaderSource(s, src)
      gl.compileShader(s)
      return s
    }

    const vs = compileShader(vsSource, gl.VERTEX_SHADER)
    const fs = compileShader(fsSource, gl.FRAGMENT_SHADER)

    const program = gl.createProgram()
    gl.attachShader(program, vs)
    gl.attachShader(program, fs)
    gl.linkProgram(program)
    gl.useProgram(program)

    const vertices = new Float32Array([-1, -1, 3, -1, -1, 3])
    const buf = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, buf)
    gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW)

    const pos = gl.getAttribLocation(program, 'position')
    gl.enableVertexAttribArray(pos)
    gl.vertexAttribPointer(pos, 2, gl.FLOAT, false, 0, 0)

    const uRes = gl.getUniformLocation(program, 'uResolution')
    const uTime = gl.getUniformLocation(program, 'uTime')
    const uSpeed = gl.getUniformLocation(program, 'uSpeed')
    const uScale = gl.getUniformLocation(program, 'uScale')
    const uColor = gl.getUniformLocation(program, 'uColor')
    const uOpacity = gl.getUniformLocation(program, 'uOpacity')

    let animId
    const start = performance.now()

    const resize = () => {
      const w = container.clientWidth
      const h = container.clientHeight
      canvas.width = w
      canvas.height = h
      gl.viewport(0, 0, w, h)
      gl.uniform2f(uRes, w, h)
    }

    const loop = () => {
      const t = (performance.now() - start) / 1000
      gl.uniform1f(uTime, t)
      gl.uniform1f(uSpeed, speed)
      gl.uniform1f(uScale, scale)
      gl.uniform3f(uColor,
        parseInt(color.slice(1, 3), 16) / 255,
        parseInt(color.slice(3, 5), 16) / 255,
        parseInt(color.slice(5, 7), 16) / 255
      )
      gl.uniform1f(uOpacity, opacity)
      gl.drawArrays(gl.TRIANGLES, 0, 3)
      animId = requestAnimationFrame(loop)
    }

    resize()
    loop()

    const ro = new ResizeObserver(resize)
    ro.observe(container)

    return () => {
      cancelAnimationFrame(animId)
      ro.disconnect()
      const ext = gl.getExtension('WEBGL_lose_context')
      if (ext) ext.loseContext()
    }
  }, [color, speed, scale, opacity])

  return (
    <div ref={containerRef} className={className} style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none', ...style }}>
      <canvas ref={canvasRef} style={{ width: '100%', height: '100%', display: 'block' }} />
    </div>
  )
}
