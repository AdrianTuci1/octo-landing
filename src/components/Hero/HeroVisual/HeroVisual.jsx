import { useEffect, useRef } from 'react';
import { drawHeroVisualFrame } from './heroVisualRenderer';
import './HeroVisual.css';

const HeroVisual = ({ phase = 'hud' }) => {
  const canvasRef = useRef(null);
  const startRef = useRef(0);
  const bufferRef = useRef(null);
  const frameRef = useRef(null);
  const sizeRef = useRef({ width: 0, height: 0 });
  const visibleRef = useRef(true);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d', { alpha: false });
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    bufferRef.current = {
      canvas: document.createElement('canvas'),
      ctx: null,
      image: null,
      lastCloudTime: -Infinity,
      atmosphereCanvas: document.createElement('canvas'),
      atmosphereCtx: null,
      sceneCanvas: document.createElement('canvas'),
      sceneCtx: null,
      lastSceneTime: -Infinity,
    };
    bufferRef.current.ctx = bufferRef.current.canvas.getContext('2d');
    bufferRef.current.atmosphereCtx = bufferRef.current.atmosphereCanvas.getContext('2d');
    bufferRef.current.sceneCtx = bufferRef.current.sceneCanvas.getContext('2d', { alpha: false });

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 1.75);
      sizeRef.current = { width: rect.width, height: rect.height };
      canvas.width = Math.max(1, Math.floor(rect.width * dpr));
      canvas.height = Math.max(1, Math.floor(rect.height * dpr));
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const scheduleFrame = () => {
      if (!reducedMotion && visibleRef.current) {
        frameRef.current = window.requestAnimationFrame(render);
      }
    };

    const render = (now) => {
      if (!visibleRef.current) return;
      if (!startRef.current) startRef.current = now;

      const elapsed = (now - startRef.current) / 1000;
      const { width, height } = sizeRef.current;

      drawHeroVisualFrame({
        ctx,
        buffer: bufferRef.current,
        width,
        height,
        elapsed,
        phase,
        reducedMotion,
      });

      scheduleFrame();
    };

    const observer = new IntersectionObserver(([entry]) => {
      const wasVisible = visibleRef.current;
      visibleRef.current = entry.isIntersecting;

      if (!wasVisible && visibleRef.current) {
        frameRef.current = window.requestAnimationFrame(render);
      }
    });

    resize();
    observer.observe(canvas);
    render(performance.now());
    window.addEventListener('resize', resize);

    return () => {
      window.removeEventListener('resize', resize);
      observer.disconnect();
      window.cancelAnimationFrame(frameRef.current);
    };
  }, [phase]);

  return (
    <div className="hero-visual" aria-label="Animated coding network visualization">
      <canvas ref={canvasRef} className="hero-visual__canvas" />
    </div>
  );
};

export default HeroVisual;
