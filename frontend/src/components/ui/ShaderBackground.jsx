import { useEffect, useRef } from "react";

const VERT = `
attribute vec2 a_position;
void main() {
  gl_Position = vec4(a_position, 0.0, 1.0);
}
`;

const FRAG = `
precision highp float;
uniform float u_time;
uniform vec2 u_resolution;

vec3 palette(float t) {
  vec3 a = vec3(0.08, 0.10, 0.20);
  vec3 b = vec3(0.06, 0.08, 0.18);
  vec3 c = vec3(0.10, 0.12, 0.22);
  vec3 d = vec3(0.38, 0.40, 0.62);
  return a + b * cos(6.28318 * (c * t + d));
}

float noise(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
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
  vec2 uv = gl_FragCoord.xy / u_resolution;
  uv.y = 1.0 - uv.y;
  float t = u_time * 0.18;

  // Orb 1 — indigo
  vec2 o1 = vec2(0.3 + sin(t * 0.7) * 0.25, 0.35 + cos(t * 0.5) * 0.2);
  float d1 = length(uv - o1);
  vec3 c1 = vec3(0.24, 0.25, 0.72) * (0.18 / (d1 * d1 + 0.04));

  // Orb 2 — teal
  vec2 o2 = vec2(0.7 + cos(t * 0.6) * 0.2, 0.6 + sin(t * 0.8) * 0.18);
  float d2 = length(uv - o2);
  vec3 c2 = vec3(0.08, 0.72, 0.65) * (0.12 / (d2 * d2 + 0.04));

  // Orb 3 — pink
  vec2 o3 = vec2(0.5 + sin(t * 0.4) * 0.3, 0.8 + cos(t * 0.9) * 0.15);
  float d3 = length(uv - o3);
  vec3 c3 = vec3(0.72, 0.18, 0.48) * (0.08 / (d3 * d3 + 0.05));

  // Orb 4 — deep blue
  vec2 o4 = vec2(0.15 + cos(t * 0.55) * 0.12, 0.7 + sin(t * 0.65) * 0.22);
  float d4 = length(uv - o4);
  vec3 c4 = vec3(0.08, 0.18, 0.60) * (0.10 / (d4 * d4 + 0.05));

  vec3 col = vec3(0.022, 0.030, 0.065);
  col += c1 + c2 + c3 + c4;

  // Subtle noise texture
  float n = fbm(uv * 4.0 + t * 0.2) * 0.04;
  col += n;

  col = clamp(col, 0.0, 1.0);
  gl_FragColor = vec4(col, 1.0);
}
`;

function createShader(gl, type, src) {
  const s = gl.createShader(type);
  gl.shaderSource(s, src);
  gl.compileShader(s);
  return s;
}

function createProgram(gl, vert, frag) {
  const p = gl.createProgram();
  gl.attachShader(p, createShader(gl, gl.VERTEX_SHADER, vert));
  gl.attachShader(p, createShader(gl, gl.FRAGMENT_SHADER, frag));
  gl.linkProgram(p);
  return p;
}

export default function ShaderBackground() {
  const canvasRef = useRef(null);
  const rafRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const gl = canvas.getContext("webgl", { antialias: false, alpha: false });
    if (!gl) return;

    const prog = createProgram(gl, VERT, FRAG);
    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1, 1,-1, -1,1, 1,1]), gl.STATIC_DRAW);

    const posLoc = gl.getAttribLocation(prog, "a_position");
    const timeLoc = gl.getUniformLocation(prog, "u_time");
    const resLoc = gl.getUniformLocation(prog, "u_resolution");

    let start = performance.now();

    function resize() {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      gl.viewport(0, 0, canvas.width, canvas.height);
    }
    resize();
    window.addEventListener("resize", resize);

    function render() {
      const t = (performance.now() - start) / 1000;
      gl.useProgram(prog);
      gl.bindBuffer(gl.ARRAY_BUFFER, buf);
      gl.enableVertexAttribArray(posLoc);
      gl.vertexAttribPointer(posLoc, 2, gl.FLOAT, false, 0, 0);
      gl.uniform1f(timeLoc, t);
      gl.uniform2f(resLoc, canvas.width, canvas.height);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
      rafRef.current = requestAnimationFrame(render);
    }
    render();

    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="shader-bg"
      style={{ position: "fixed", inset: 0, zIndex: 0, width: "100%", height: "100%" }}
    />
  );
}
