import { useEffect, useRef, useState } from 'react';
import { HERO_VISUAL_LOOP_DURATION, drawHeroVisualFrame } from './heroVisualRenderer';
import { AgentsView } from './agents/AgentsView';
import './HeroVisual.css';

const getAgentsStage = (elapsed) => {
  if (elapsed >= 14.4 && elapsed < 18.1) {
    return elapsed >= 16.2 ? 'selecting' : 'visible';
  }

  return 'hidden';
};

const HeroVisual = ({ phase = 'hud' }) => {
  const canvasRef = useRef(null);
  const startRef = useRef(0);
  const bufferRef = useRef(null);
  const frameRef = useRef(null);
  const sizeRef = useRef({ width: 0, height: 0 });
  const visibleRef = useRef(true);
  const agentsStageRef = useRef('hidden');
  const [agentsStage, setAgentsStage] = useState('hidden');

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
      cleanSceneCanvas: document.createElement('canvas'),
      cleanSceneCtx: null,
      lastSceneTime: -Infinity,
    };
    bufferRef.current.ctx = bufferRef.current.canvas.getContext('2d');
    bufferRef.current.atmosphereCtx = bufferRef.current.atmosphereCanvas.getContext('2d');
    bufferRef.current.sceneCtx = bufferRef.current.sceneCanvas.getContext('2d', { alpha: false });
    bufferRef.current.cleanSceneCtx = bufferRef.current.cleanSceneCanvas.getContext('2d', { alpha: false });

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

      const absoluteElapsed = (now - startRef.current) / 1000;
      const elapsed = absoluteElapsed % HERO_VISUAL_LOOP_DURATION;
      const isInitialCycle = absoluteElapsed < HERO_VISUAL_LOOP_DURATION;
      const { width, height } = sizeRef.current;
      const nextAgentsStage = getAgentsStage(elapsed);

      if (nextAgentsStage !== agentsStageRef.current) {
        agentsStageRef.current = nextAgentsStage;
        setAgentsStage(nextAgentsStage);
      }

      drawHeroVisualFrame({
        ctx,
        buffer: bufferRef.current,
        width,
        height,
        elapsed,
        backgroundElapsed: absoluteElapsed,
        isInitialCycle,
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
      <div className={`hero-visual__agents-layer hero-visual__agents-layer--${agentsStage}`}>
        <AgentsView selectedRunId={agentsStage === 'selecting' ? '1' : undefined} />
      </div>
    </div>
  );
};

export default HeroVisual;
