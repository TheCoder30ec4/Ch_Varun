import React, { useEffect, useRef, useCallback, useImperativeHandle, forwardRef } from 'react';
import * as THREE from 'three';
import gsap from 'gsap';

// ---------------------------------------------------------------------------
// Public handle — parent calls overlayRef.current.play() directly
// ---------------------------------------------------------------------------
export interface GlassWaveHandle {
  play: () => void;
}

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------
interface GlassWaveProps {
  /** CSS selector for the source canvas to capture (defaults to the gradient canvas) */
  sourceSelector?: string;
  /** Animation duration in seconds (default 1.6) */
  duration?: number;
  /** Called when the full animation (expand + fade) finishes */
  onComplete?: () => void;
  /** CSS class forwarded to the wrapper div */
  className?: string;
}

// ---------------------------------------------------------------------------
// Shaders
// ---------------------------------------------------------------------------
const VERTEX = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

/**
 * Fragment shader — glass-circle distortion overlay.
 *
 * At uProgress ≈ 0 the output is fully transparent so the live gradient
 * behind is visible.  As the circle expands, refraction, chromatic
 * aberration, liquid wobble and an edge glow are applied to a frozen
 * snapshot of the gradient (uTexture).  Alpha = mask so the overlay
 * composites cleanly over the background.
 */
const FRAGMENT = /* glsl */ `
  uniform sampler2D uTexture;
  uniform float     uProgress;
  uniform vec2      uResolution;
  uniform vec2      uTextureSize;
  varying vec2      vUv;

  vec2 coverUV(vec2 uv, vec2 texSize) {
    vec2 s      = uResolution / texSize;
    float scale = max(s.x, s.y);
    vec2 scaled = texSize * scale;
    vec2 offset = (uResolution - scaled) * 0.5;
    return (uv * uResolution - offset) / scaled;
  }

  void main() {
    /* Fully transparent when idle */
    if (uProgress < 0.001) {
      gl_FragColor = vec4(0.0);
      return;
    }

    vec2 uv = coverUV(vUv, uTextureSize);

    /* Expanding circle */
    float maxR   = length(uResolution) * 0.85;
    float radius = uProgress * maxR;

    vec2  pixel  = vUv * uResolution;
    vec2  centre = uResolution * 0.5;
    float dist   = length(pixel - centre);
    float nd     = dist / max(radius, 0.001);

    /* Anti-aliased circular mask */
    float mask = smoothstep(radius + 3.0, radius - 3.0, dist);

    if (mask < 0.001) {
      gl_FragColor = vec4(0.0);
      return;
    }

    /* ---- Glass refraction inside the circle ---- */
    float refract = 0.08 * pow(smoothstep(0.3, 1.0, nd), 1.5);
    vec2  dir     = (dist > 0.0) ? (pixel - centre) / dist : vec2(0.0);
    vec2  dUV     = uv - dir * refract;

    /* Liquid wobble */
    float time = uProgress * 5.0;
    dUV += vec2(
      sin(time + nd * 10.0),
      cos(time * 0.8 + nd * 8.0)
    ) * 0.015 * nd * mask;

    /* Chromatic aberration */
    float ca = 0.02 * pow(smoothstep(0.3, 1.0, nd), 1.2);
    vec3 color = vec3(
      texture2D(uTexture, dUV + dir * ca * 1.2).r,
      texture2D(uTexture, dUV + dir * ca * 0.2).g,
      texture2D(uTexture, dUV - dir * ca * 0.8).b
    );

    /* Edge glow (rim light at the circle boundary) */
    float rim = smoothstep(0.92, 1.0, nd) * (1.0 - smoothstep(1.0, 1.02, nd));
    color += rim * 0.12;

    /* Near-end: settle to un-distorted snapshot */
    if (uProgress > 0.95) {
      vec3 clean = texture2D(uTexture, uv).rgb;
      color = mix(color, clean, (uProgress - 0.95) / 0.05);
    }

    gl_FragColor = vec4(color, mask);
  }
`;

// ---------------------------------------------------------------------------
// Component (forwardRef so parent can call .play() directly — no delay)
// ---------------------------------------------------------------------------
const GlassWaveOverlay = forwardRef(function GlassWaveOverlay(
  {
    sourceSelector = '.liquid-canvas-wrapper canvas',
    duration = 1.6,
    onComplete,
    className = '',
  }: GlassWaveProps,
  ref: React.ForwardedRef<GlassWaveHandle>,
) {
  const wrapperRef     = useRef<HTMLDivElement>(null);
  const rendererRef    = useRef<THREE.WebGLRenderer | null>(null);
  const materialRef    = useRef<THREE.ShaderMaterial | null>(null);
  const sceneRef       = useRef<THREE.Scene | null>(null);
  const cameraRef      = useRef<THREE.OrthographicCamera | null>(null);
  const rafRef         = useRef<number>(0);
  const tweenRef       = useRef<gsap.core.Tween | gsap.core.Timeline | null>(null);
  const onCompleteRef  = useRef(onComplete);
  const animatingRef   = useRef(false);
  const liveTexRef     = useRef<THREE.CanvasTexture | null>(null);

  // Keep the callback ref fresh
  useEffect(() => { onCompleteRef.current = onComplete; }, [onComplete]);

  // --- Initialise transparent Three.js scene (once) ---
  useEffect(() => {
    const el = wrapperRef.current;
    if (!el) return;

    const w = el.clientWidth  || window.innerWidth;
    const h = el.clientHeight || window.innerHeight;

    // Transparent renderer — composites over the gradient behind
    const renderer = new THREE.WebGLRenderer({
      antialias: false,
      alpha: true,
      premultipliedAlpha: false,
    });
    renderer.setClearColor(0x000000, 0);
    renderer.setSize(w, h);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    el.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    const scene  = new THREE.Scene();
    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
    sceneRef.current  = scene;
    cameraRef.current = camera;

    const material = new THREE.ShaderMaterial({
      uniforms: {
        uTexture:     { value: null },
        uProgress:    { value: 0 },
        uResolution:  { value: new THREE.Vector2(w, h) },
        uTextureSize: { value: new THREE.Vector2(1, 1) },
      },
      vertexShader:   VERTEX,
      fragmentShader: FRAGMENT,
      transparent:    true,
      depthTest:      false,
    });
    materialRef.current = material;
    scene.add(new THREE.Mesh(new THREE.PlaneGeometry(2, 2), material));

    // Render loop — continuously update the live texture so the
    // gradient animation keeps flowing inside the glass circle
    const tick = () => {
      if (liveTexRef.current) {
        liveTexRef.current.needsUpdate = true;
      }
      renderer.render(scene, camera);
      rafRef.current = requestAnimationFrame(tick);
    };
    tick();

    // Resize
    const onResize = () => {
      const nw = el.clientWidth  || window.innerWidth;
      const nh = el.clientHeight || window.innerHeight;
      renderer.setSize(nw, nh);
      material.uniforms.uResolution.value.set(nw, nh);
    };
    window.addEventListener('resize', onResize);

    return () => {
      window.removeEventListener('resize', onResize);
      cancelAnimationFrame(rafRef.current);
      renderer.dispose();
      if (el.contains(renderer.domElement)) el.removeChild(renderer.domElement);
    };
  }, []);

  // --- Play the glass-wave effect ---
  const play = useCallback(() => {
    const mat = materialRef.current;
    const el  = wrapperRef.current;
    if (!mat || !el || animatingRef.current) return;

    // Get the live gradient canvas — we'll keep reading from it every frame
    const srcCanvas = document.querySelector(sourceSelector) as HTMLCanvasElement;
    if (!srcCanvas) {
      console.warn('GlassWaveOverlay: source canvas not found at', sourceSelector);
      return;
    }

    // Create a CanvasTexture pointing at the live canvas.
    // The render loop sets needsUpdate = true every frame so the
    // gradient animation continues to flow inside the glass circle.
    const tex = new THREE.CanvasTexture(srcCanvas);
    tex.minFilter = THREE.LinearFilter;
    tex.magFilter = THREE.LinearFilter;
    liveTexRef.current = tex;

    mat.uniforms.uTexture.value     = tex;
    mat.uniforms.uTextureSize.value.set(srcCanvas.width, srcCanvas.height);
    mat.uniforms.uProgress.value    = 0;

    animatingRef.current = true;

    // Kill any in-flight animation
    if (tweenRef.current) {
      if ('kill' in tweenRef.current) tweenRef.current.kill();
    }

    // Make sure the overlay is visible
    el.style.opacity = '1';

    // Timeline: expand circle → fade overlay out → reset
    const tl = gsap.timeline({
      onComplete: () => {
        mat.uniforms.uProgress.value = 0;
        mat.uniforms.uTexture.value  = null;
        el.style.opacity = '1';
        liveTexRef.current = null;
        tex.dispose();
        animatingRef.current = false;
        onCompleteRef.current?.();
      },
    });

    tl.to(mat.uniforms.uProgress, {
      value: 1,
      duration,
      ease: 'power2.inOut',
    });

    tl.to(el, {
      opacity: 0,
      duration: 0.4,
      ease: 'power2.out',
    });

    tweenRef.current = tl;
  }, [duration, sourceSelector]);

  // Expose play() to parent via ref — zero-delay invocation
  useImperativeHandle(ref, () => ({ play }), [play]);

  return (
    <div
      ref={wrapperRef}
      className={className}
      style={{
        width: '100%',
        height: '100%',
        overflow: 'hidden',
        pointerEvents: 'none',
      }}
    />
  );
});

export default GlassWaveOverlay;
export { GlassWaveOverlay };
// Note: `GlassWaveHandle` is exported where it's declared as `export interface GlassWaveHandle` above.
