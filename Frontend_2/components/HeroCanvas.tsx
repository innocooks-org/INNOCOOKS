"use client";

import { useEffect, useRef } from "react";
import type * as THREE from "three";

/* ════════════════════════════════════════════════════════════════════════
   HERO KINETIC BACKGROUND
   Layer 1 - a raw-WebGL fragment shader: an "ember in the void" fluid that
             warms toward the cursor (no dependency, ~cheap).
   Layer 2 - a Three.js cloud of flat-shaded cubes drifting with parallax,
             loaded dynamically so it never touches first paint / SSR.
   Both bail out gracefully: reduced-motion or no-WebGL → the static CSS
   ember-field behind them carries the mood.
   ════════════════════════════════════════════════════════════════════════ */

const FRAG = `precision highp float;
uniform float u_time;
uniform vec2 u_resolution;
uniform vec2 u_mouse;
varying vec2 v_uv;

void main() {
  vec2 uv = v_uv;
  vec2 mouse = u_mouse / u_resolution;

  float noise = sin(uv.x * 10.0 + u_time * 0.5) * cos(uv.y * 8.0 - u_time * 0.3);
  noise += sin(uv.y * 15.0 + u_time * 0.8) * 0.5;

  vec3 brand = vec3(0.768, 0.356, 0.207); // #c45b35 kinetic-orange
  vec3 onyx  = vec3(0.05, 0.05, 0.05);
  vec3 ember = vec3(0.20, 0.10, 0.05);

  float intensity = smoothstep(-1.0, 1.0, noise + length(uv - mouse) * 0.5);
  vec3 col = mix(onyx, mix(ember, brand, intensity), intensity * 0.4);

  float grain = fract(sin(dot(uv, vec2(12.9898, 78.233))) * 43758.5453) * 0.05;
  col += grain;

  gl_FragColor = vec4(col, 1.0);
}`;

const VERT = `attribute vec2 a_position;
varying vec2 v_uv;
void main() {
  v_uv = a_position * 0.5 + 0.5;
  gl_Position = vec4(a_position, 0.0, 1.0);
}`;

export default function HeroCanvas() {
  const shaderRef = useRef<HTMLCanvasElement>(null);
  const sculptRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) return;

    const cleanups: Array<() => void> = [];
    // loops only run while the hero is on-screen AND the tab is visible - this
    // stops a full-screen fragment shader burning the GPU/battery (notably on
    // mobile) once you've scrolled past or switched tabs.
    let heroVisible = true;
    const resumers: Array<() => void> = [];
    const shouldRun = () => heroVisible && !document.hidden;

    // resume any paused loop when the tab returns or the hero re-enters view
    const onVisibility = () => resumers.forEach((r) => r());
    document.addEventListener("visibilitychange", onVisibility);
    let io: IntersectionObserver | null = null;
    if (shaderRef.current && "IntersectionObserver" in window) {
      io = new IntersectionObserver(
        ([entry]) => {
          heroVisible = entry.isIntersecting;
          if (heroVisible) resumers.forEach((r) => r());
        },
        { threshold: 0 }
      );
      io.observe(shaderRef.current);
    }
    cleanups.push(() => {
      document.removeEventListener("visibilitychange", onVisibility);
      io?.disconnect();
    });

    /* ── Layer 1 - shader ─────────────────────────────────────── */
    const canvas = shaderRef.current;
    const gl = canvas?.getContext("webgl", {
      alpha: false,
      antialias: false,
      depth: false,
      stencil: false,
      powerPreference: "low-power",
    }) as WebGLRenderingContext | null;
    if (canvas && gl) {
      const mouse = { x: 0, y: 0 };
      const sync = () => {
        const w = canvas.clientWidth || 1;
        const h = canvas.clientHeight || 1;
        if (canvas.width !== w || canvas.height !== h) {
          canvas.width = w;
          canvas.height = h;
        }
      };
      sync();
      mouse.x = canvas.width / 2;
      mouse.y = canvas.height / 2;

      const compile = (type: number, src: string) => {
        const s = gl.createShader(type);
        if (!s) return null;
        gl.shaderSource(s, src);
        gl.compileShader(s);
        if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
          gl.deleteShader(s);
          return null;
        }
        return s;
      };

      // if any stage fails to compile/link, bail quietly - the CSS ember-field
      // behind the canvas carries the hero on that driver
      const vs = compile(gl.VERTEX_SHADER, VERT);
      const fs = compile(gl.FRAGMENT_SHADER, FRAG);
      const prog = gl.createProgram();
      if (vs && fs && prog) {
        gl.attachShader(prog, vs);
        gl.attachShader(prog, fs);
        gl.linkProgram(prog);
        if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
          gl.deleteProgram(prog);
        } else {
          gl.useProgram(prog);

          const buf = gl.createBuffer();
          gl.bindBuffer(gl.ARRAY_BUFFER, buf);
          gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
          const pos = gl.getAttribLocation(prog, "a_position");
          gl.enableVertexAttribArray(pos);
          gl.vertexAttribPointer(pos, 2, gl.FLOAT, false, 0, 0);

          const uTime = gl.getUniformLocation(prog, "u_time");
          const uRes = gl.getUniformLocation(prog, "u_resolution");
          const uMouse = gl.getUniformLocation(prog, "u_mouse");

          const onMove = (e: MouseEvent) => {
            const r = canvas.getBoundingClientRect();
            if (!r.width || !r.height) return;
            mouse.x = ((e.clientX - r.left) / r.width) * canvas.width;
            mouse.y = (1 - (e.clientY - r.top) / r.height) * canvas.height;
          };
          window.addEventListener("mousemove", onMove);

          let raf = 0;
          let looping = false;
          const render = (t: number) => {
            if (!shouldRun()) {
              looping = false; // pause; resumed by observer / visibilitychange
              return;
            }
            sync();
            gl.viewport(0, 0, canvas.width, canvas.height);
            gl.uniform1f(uTime, t * 0.001);
            gl.uniform2f(uRes, canvas.width, canvas.height);
            gl.uniform2f(uMouse, mouse.x, mouse.y);
            gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
            raf = requestAnimationFrame(render);
          };
          const startShader = () => {
            if (!looping && shouldRun()) {
              looping = true;
              raf = requestAnimationFrame(render);
            }
          };
          startShader();
          resumers.push(startShader);

          cleanups.push(() => {
            cancelAnimationFrame(raf);
            window.removeEventListener("mousemove", onMove);
          });
        }
      }
    }

    /* ── Layer 2 - Three.js sculpture (desktop pointers only) ─── */
    const fine = window.matchMedia("(pointer: fine)").matches;
    let disposed = false;
    if (fine && sculptRef.current) {
      import("three")
        .then((THREE) => {
          const host = sculptRef.current;
          if (disposed || !host) return;

          const w = host.clientWidth || 1;
          const h = host.clientHeight || 1;
          const scene = new THREE.Scene();
          const camera = new THREE.PerspectiveCamera(75, w / h, 0.1, 1000);
          camera.position.z = 8;

          const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
          renderer.setSize(w, h);
          renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
          host.appendChild(renderer.domElement);

          const group = new THREE.Group();
          scene.add(group);
          const geo = new THREE.BoxGeometry(1, 1, 1);
          // brand-cohesive wireframe shards: mostly kinetic-orange, a few white
          const matKinetic = new THREE.MeshBasicMaterial({
            color: 0xc45b35,
            wireframe: true,
            transparent: true,
            opacity: 0.9,
          });
          const matWhite = new THREE.MeshBasicMaterial({
            color: 0xffffff,
            wireframe: true,
            transparent: true,
            opacity: 0.45,
          });

          const boxes: THREE.Mesh[] = [];
          for (let i = 0; i < 36; i++) {
            const m = new THREE.Mesh(geo, i % 4 === 0 ? matWhite : matKinetic);
            m.position.set(
              (Math.random() - 0.5) * 6,
              (Math.random() - 0.5) * 6,
              (Math.random() - 0.5) * 6
            );
            m.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, 0);
            const s = Math.random() * 0.5 + 0.1;
            m.scale.set(s, s, s);
            m.userData.rot = Math.random() * 0.02;
            group.add(m);
            boxes.push(m);
          }

          let mx = 0;
          let my = 0;
          const onMove = (e: MouseEvent) => {
            mx = e.clientX / window.innerWidth - 0.5;
            my = e.clientY / window.innerHeight - 0.5;
          };
          window.addEventListener("mousemove", onMove);

          const onResize = () => {
            const nw = host.clientWidth || 1;
            const nh = host.clientHeight || 1;
            renderer.setSize(nw, nh);
            camera.aspect = nw / nh;
            camera.updateProjectionMatrix();
          };
          window.addEventListener("resize", onResize);

          let raf = 0;
          let looping = false;
          const animate = () => {
            if (!shouldRun()) {
              looping = false; // pause when hero is off-screen / tab hidden
              return;
            }
            group.rotation.y += 0.002;
            group.rotation.x += 0.001;
            group.position.x += (mx * 2 - group.position.x) * 0.05;
            group.position.y += (-my * 2 - group.position.y) * 0.05;
            for (const b of boxes) {
              b.rotation.x += b.userData.rot;
              b.rotation.y += b.userData.rot;
            }
            renderer.render(scene, camera);
            raf = requestAnimationFrame(animate);
          };
          const startSculpt = () => {
            if (!looping && shouldRun()) {
              looping = true;
              raf = requestAnimationFrame(animate);
            }
          };
          startSculpt();
          resumers.push(startSculpt);

          cleanups.push(() => {
            cancelAnimationFrame(raf);
            window.removeEventListener("mousemove", onMove);
            window.removeEventListener("resize", onResize);
            geo.dispose();
            matKinetic.dispose();
            matWhite.dispose();
            renderer.dispose();
            if (renderer.domElement.parentNode === host) host.removeChild(renderer.domElement);
          });
        })
        .catch(() => {
          /* three unavailable - shader + CSS field carry the hero */
        });
    }

    return () => {
      disposed = true;
      cleanups.forEach((fn) => fn());
    };
  }, []);

  return (
    <>
      <canvas
        ref={shaderRef}
        aria-hidden="true"
        className="absolute inset-0 z-0 h-full w-full opacity-40"
      />
      <div
        ref={sculptRef}
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-0 mx-auto flex max-w-[700px] items-center justify-center opacity-70 mix-blend-screen"
      />
    </>
  );
}
