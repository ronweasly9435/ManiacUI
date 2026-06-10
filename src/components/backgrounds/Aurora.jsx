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
uniform vec3 uColor1;
uniform vec3 uColor2;
uniform float uSpeed;
uniform float uOpacity;

float hash(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
}

float smoothNoise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  f = f * f * (3.0 - 2.0 * f);
  return mix(
    mix(hash(i), hash(i + vec2(1.0, 0.0)), f.x),
    mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), f.x),
    f.y
  );
}

float fbm(vec2 p) {
  float v = 0.0;
  float a = 0.5;
  for (int i = 0; i < 5; i++) {
    v += a * smoothNoise(p);
    p *= 2.0;
    a *= 0.5;
  }
  return v;
}

void main() {
  vec2 uv = gl_FragCoord.xy / uResolution.xy;
  float aspect = uResolution.x / uResolution.y;
  vec2 p = uv;
  p.x *= aspect;

  float t = uTime * uSpeed;

  float aurora = 0.0;
  for (int i = 0; i < 4; i++) {
    float fi = float(i);
    vec2 pos = p * (1.5 + fi * 0.3);
    pos.y += t * (0.1 + fi * 0.05);
    pos.x += sin(t * 0.2 + fi) * 0.1;

    float layer = fbm(pos);
    layer = smoothstep(0.2 + fi * 0.05, 0.7, layer);
    layer *= 1.0 - abs(uv.y - 0.5) * 2.0;
    aurora += layer * (0.3 - fi * 0.05);
  }

  aurora = clamp(aurora, 0.0, 1.0);

  vec3 col = mix(uColor1, uColor2, aurora * 0.6 + sin(p.x * 2.0 + t * 0.1) * 0.2);

  float fadeV = 1.0 - abs(uv.y - 0.5) * 1.4;
  float fadeH = 1.0 - abs(uv.x - 0.5) * 0.6;
  float fade = clamp(fadeV * fadeH, 0.0, 1.0);

  float alpha = aurora * 0.35 * uOpacity * fade;

  gl_FragColor = vec4(col, alpha);
}
`

export default function Aurora({
  color1 = '#7ec8e3',
  color2 = '#6a5acd',
  speed = 0.3,
  opacity = 0.4,
  className,
  style,
}) {
  const containerRef = useRef(null)
  const canvasRef = useRef(null)

  useEffect(() => {
    const container = containerRef.current
    const canvas = canvasRef.current
    if (!container || !canvas) return

    const gl = canvas.getContext('webgl')
    if (!gl) return

    const compileShader = (src, type) => {
      const s = gl.createShader(type)
      gl.shaderSource(s, src)
      gl.compileShader(s)
      return s
    }

    const vs = compileShader(vertex, gl.VERTEX_SHADER)
    const fs = compileShader(fragment, gl.FRAGMENT_SHADER)

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
    const uColor1 = gl.getUniformLocation(program, 'uColor1')
    const uColor2 = gl.getUniformLocation(program, 'uColor2')
    const uSpeed = gl.getUniformLocation(program, 'uSpeed')
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

    const c1 = () => ({
      r: parseInt(color1.slice(1, 3), 16) / 255,
      g: parseInt(color1.slice(3, 5), 16) / 255,
      b: parseInt(color1.slice(5, 7), 16) / 255,
    })

    const c2 = () => ({
      r: parseInt(color2.slice(1, 3), 16) / 255,
      g: parseInt(color2.slice(3, 5), 16) / 255,
      b: parseInt(color2.slice(5, 7), 16) / 255,
    })

    const loop = () => {
      const t = (performance.now() - start) / 1000
      gl.uniform1f(uTime, t)
      gl.uniform1f(uSpeed, speed)
      gl.uniform1f(uOpacity, opacity)

      const ca = c1(), cb = c2()
      gl.uniform3f(uColor1, ca.r, ca.g, ca.b)
      gl.uniform3f(uColor2, cb.r, cb.g, cb.b)

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
  }, [color1, color2, speed, opacity])

  return (
    <div ref={containerRef} className={className} style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none', ...style }}>
      <canvas ref={canvasRef} style={{ width: '100%', height: '100%', display: 'block' }} />
    </div>
  )
}
