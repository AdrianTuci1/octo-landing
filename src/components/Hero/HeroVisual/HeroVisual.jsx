import { useEffect, useRef } from 'react';
import { drawHeroVisualFrame } from './heroVisualRenderer';
import './HeroVisual.css';

const HeroVisual = ({ phase = 'hud' }) => {
  const canvasRef = useRef(null);
  const startRef = useRef(0);
  const bufferRef = useRef(null);
  const frameRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d', { alpha: false });
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    bufferRef.current = {
      canvas: document.createElement('canvas'),
      ctx: null,
      image: null,
      lastCloudTime: -Infinity,
    };
    bufferRef.current.ctx = bufferRef.current.canvas.getContext('2d');

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 1.75);
      canvas.width = Math.max(1, Math.floor(rect.width * dpr));
      canvas.height = Math.max(1, Math.floor(rect.height * dpr));
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const render = (now) => {
      if (!startRef.current) startRef.current = now;

      const rect = canvas.getBoundingClientRect();
      const elapsed = (now - startRef.current) / 1000;

      drawHeroVisualFrame({
        ctx,
        buffer: bufferRef.current,
        width: rect.width,
        height: rect.height,
        elapsed,
        phase,
        reducedMotion,
      });

      if (!reducedMotion) {
        frameRef.current = window.requestAnimationFrame(render);
      }
    };

    resize();
    render(performance.now());
    window.addEventListener('resize', resize);

    return () => {
      window.removeEventListener('resize', resize);
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
