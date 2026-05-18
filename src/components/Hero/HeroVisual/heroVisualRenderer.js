const palette = {
  ink: [102, 110, 206],
  violet: [129, 127, 232],
  cyan: [190, 235, 226],
  mint: [160, 222, 215],
  pink: [235, 105, 184],
  peach: [240, 171, 160],
  haze: [207, 203, 230],
};

const clusters = [
  {
    label: "(*Agent) Input processing",
    labelOffset: [-2, -26],
    frame: { x: 0.055, y: 0.29, w: 0.185, h: 0.47 },
    pivot: 1,
    nodes: [
      { x: 0.12, y: 0.425, r: 9, seed: 0.8 },
      { x: 0.168, y: 0.54, r: 9.5, seed: 1.9, pinned: true },
      { x: 0.09, y: 0.72, r: 9, seed: 3.1 },
      { x: 0.18, y: 0.34, r: 5.5, seed: 4.3, filled: true },
      { x: 0.12, y: 0.92, r: 8.5, seed: 5.4 },
    ],
  },
  {
    label: "(*Agent) Data ingestion",
    labelOffset: [0, -22],
    frame: { x: 0.295, y: 0.735, w: 0.112, h: 0.31 },
    pivot: 1,
    nodes: [
      { x: 0.318, y: 0.93, r: 7.5, seed: 8.2 },
      { x: 0.385, y: 0.885, r: 8.2, seed: 9.1, pinned: true },
    ],
  },
  {
    label: "(*Agent) Plan generation",
    labelOffset: [0, -24],
    frame: { x: 0.75, y: 0.055, w: 0.205, h: 0.53 },
    pivot: 2,
    nodes: [
      { x: 0.812, y: 0.15, r: 9.2, seed: 12.5 },
      { x: 0.89, y: 0.14, r: 9.4, seed: 13.4 },
      { x: 0.878, y: 0.35, r: 9.6, seed: 14.2, pinned: true },
      { x: 0.8, y: 0.52, r: 8.3, seed: 15.1 },
      { x: 0.925, y: 0.45, r: 8.5, seed: 16.2 },
    ],
  },
];

const strayNodes = [
  { x: 0.632, y: 0.106, r: 6.5, seed: 21 },
  { x: 0.526, y: 0.298, r: 6, seed: 22 },
  { x: 1.012, y: 0.785, r: 6, seed: 23 },
  { x: 0.93, y: 0.985, r: 6.2, seed: 24 },
];

const longLinks = [
  { from: [0, 1], to: [2, 0], delay: 0.03 },
  { from: [0, 0], to: [2, 2], delay: 0.14 },
  { from: [0, 1], to: [2, 1], delay: 0.22 },
  { from: [0, 1], to: [2, 2], delay: 0.32 },
  { from: [1, 1], to: [2, 2], delay: 0.45 },
  { from: [0, 1], to: [1, 1], delay: 0.54 },
];

const matterBlobs = [
  { x: 0.13, y: 0.58, rx: 0.13, ry: 0.38, seed: 0.2, strength: 1.15 },
  { x: 0.19, y: 0.42, rx: 0.08, ry: 0.18, seed: 1.6, strength: 0.78 },
  { x: 0.36, y: 0.9, rx: 0.11, ry: 0.18, seed: 2.9, strength: 0.72 },
  { x: 0.51, y: 0.48, rx: 0.19, ry: 0.2, seed: 4.1, strength: 0.58 },
  { x: 0.82, y: 0.3, rx: 0.15, ry: 0.31, seed: 7.35, strength: 1.34 },
  { x: 0.885, y: 0.64, rx: 0.12, ry: 0.35, seed: 9.7, strength: 0.84 },
];

const CLOUD_FRAME_INTERVAL = 1 / 12;
const CLOUD_RESOLUTION_DIVISOR = 6;
const SCENE_FRAME_INTERVAL = 1 / 12;
const INSTALL_COMMAND = 'brew install --cask octomus';
const AGENTS_START = 14.4;
const CLOUD_ONLY_START = 18.1;
const COMPOSER_BOX_START = 18.45;
const COMPOSER_BOX_END = 20.7;
const ZOOM_IN_START = 21.0;
const RUNNING_TEXT_START = 22.05;
const RUNNING_TEXT_END = 24.0;
const FINISHED_TEXT_START = 24.25;
const FINISHED_TEXT_END = 27.15;
const ZOOM_OUT_START = 27.0;
const ZOOM_OUT_END = 29.25;
export const HERO_VISUAL_LOOP_DURATION = 30.4;
let frostedNoisePattern = null;

const clamp = (value, min = 0, max = 1) => Math.min(max, Math.max(min, value));
const lerp = (a, b, t) => a + (b - a) * t;

const smoothstep = (edge0, edge1, value) => {
  const t = clamp((value - edge0) / (edge1 - edge0));
  return t * t * (3 - 2 * t);
};

const mixColor = (a, b, t) => [
  lerp(a[0], b[0], t),
  lerp(a[1], b[1], t),
  lerp(a[2], b[2], t),
];

const ellipticalFalloff = (x, y, blob, time) => {
  const cx = blob.x + Math.sin(time * 0.11 + blob.seed) * 0.034;
  const cy = blob.y + Math.cos(time * 0.095 + blob.seed * 1.7) * 0.04;
  const edgeWarp = valueNoise(x * 6.4 + blob.seed + time * 0.08, y * 5.6 - blob.seed * 0.4 - time * 0.065) - 0.5;
  const tangentWarp = valueNoise(x * 10.5 - time * 0.12, y * 9.2 + blob.seed + time * 0.095) - 0.5;
  const rx = blob.rx * (1 + edgeWarp * 0.34 + Math.sin(time * 0.18 + blob.seed) * 0.08);
  const ry = blob.ry * (1 - edgeWarp * 0.28 + Math.cos(time * 0.16 + blob.seed * 1.4) * 0.08);
  const dx = (x - cx + tangentWarp * 0.026) / rx;
  const dy = (y - cy - edgeWarp * 0.03) / ry;

  return Math.exp(-(dx * dx + dy * dy) * 1.72) * blob.strength;
};

const hash = (x, y) => {
  const n = Math.sin(x * 127.1 + y * 311.7) * 43758.5453123;
  return n - Math.floor(n);
};

const valueNoise = (x, y) => {
  const ix = Math.floor(x);
  const iy = Math.floor(y);
  const fx = x - ix;
  const fy = y - iy;
  const ux = fx * fx * (3 - 2 * fx);
  const uy = fy * fy * (3 - 2 * fy);

  const a = hash(ix, iy);
  const b = hash(ix + 1, iy);
  const c = hash(ix, iy + 1);
  const d = hash(ix + 1, iy + 1);

  return lerp(lerp(a, b, ux), lerp(c, d, ux), uy);
};

const fbm = (x, y, octaves = 4) => {
  let total = 0;
  let amplitude = 0.58;
  let frequency = 1;
  let max = 0;

  for (let i = 0; i < octaves; i += 1) {
    total += valueNoise(x * frequency, y * frequency) * amplitude;
    max += amplitude;
    amplitude *= 0.5;
    frequency *= 2.05;
  }

  return total / max;
};

const getFrameDrift = (cluster, time) => ({
  x: Math.sin(time * 0.42 + cluster.frame.x * 18) * 0.023,
  y: Math.cos(time * 0.36 + cluster.frame.y * 22) * 0.024,
});

const getNodePosition = (cluster, node, time) => {
  const drift = getFrameDrift(cluster, time);

  if (node.pinned) {
    return { x: node.x, y: node.y };
  }

  const pivot = cluster.nodes[cluster.pivot];
  const orbitPhase = time * (0.62 + node.seed * 0.015) + node.seed;
  const localX = (node.x - pivot.x) * 0.06 * Math.sin(orbitPhase);
  const localY = (node.y - pivot.y) * 0.06 * Math.cos(orbitPhase * 0.9);

  return {
    x: node.x + drift.x + localX + Math.sin(time * 0.72 + node.seed) * 0.014,
    y: node.y + drift.y + localY + Math.cos(time * 0.64 + node.seed * 1.7) * 0.017,
  };
};

const drawClouds = (ctx, buffer, width, height, time, reducedMotion) => {
  const lowWidth = Math.max(180, Math.round(width / CLOUD_RESOLUTION_DIVISOR));
  const lowHeight = Math.max(90, Math.round(height / CLOUD_RESOLUTION_DIVISOR));
  const motion = reducedMotion ? 0.35 : time;
  const shouldRender =
    buffer.canvas.width !== lowWidth ||
    buffer.canvas.height !== lowHeight ||
    !buffer.image ||
    motion < buffer.lastCloudTime ||
    motion - buffer.lastCloudTime >= CLOUD_FRAME_INTERVAL;

  if (buffer.canvas.width !== lowWidth || buffer.canvas.height !== lowHeight) {
    buffer.canvas.width = lowWidth;
    buffer.canvas.height = lowHeight;
    buffer.image = buffer.ctx.createImageData(lowWidth, lowHeight);
    buffer.lastCloudTime = -Infinity;
  }

  if (shouldRender) {
    const { data } = buffer.image;
    const aspect = lowWidth / lowHeight;

    for (let y = 0; y < lowHeight; y += 1) {
      for (let x = 0; x < lowWidth; x += 1) {
        const nx = x / lowWidth;
        const ny = y / lowHeight;
        const px = nx * aspect;
        const py = ny;
        const flow = fbm(px * 1.3 + motion * 0.012, py * 1.45 - motion * 0.01, 3);
        const curl = fbm(px * 3.1 - motion * 0.018 + flow * 0.5, py * 2.6 + motion * 0.012, 3);
        const detail = fbm(px * 6.2 + 4.5, py * 5.4 - motion * 0.018, 3);
        const diagonalVein = Math.sin((px * 1.55 + py * 3.2 + flow * 1.65 - motion * 0.035) * Math.PI);

        let matter = 0;
        for (let blobIndex = 0; blobIndex < matterBlobs.length; blobIndex += 1) {
          matter += ellipticalFalloff(nx, ny, matterBlobs[blobIndex], motion);
        }

        const vein = smoothstep(0.42, 0.86, diagonalVein * 0.35 + curl * 0.78);
        const density = clamp(matter * (0.88 + flow * 0.48) + vein * 0.18);
        const core = smoothstep(0.4, 0.82, density + detail * 0.13);
        const rim = smoothstep(0.14, 0.48, density + curl * 0.16) * (1 - smoothstep(0.5, 0.92, density));
        const warmCore = smoothstep(0.48, 0.95, core + Math.sin(px * 7.4 - py * 3.1 + motion * 0.015) * 0.08);

        let color = mixColor(palette.ink, palette.violet, 0.26 + flow * 0.22);
        color = mixColor(color, palette.mint, rim * 0.96);
        color = mixColor(color, palette.cyan, smoothstep(0.2, 0.58, rim + vein * 0.18) * 0.5);
        color = mixColor(color, palette.pink, core * 0.86);
        color = mixColor(color, palette.peach, warmCore * 0.26);
        color = mixColor(color, palette.haze, smoothstep(0.34, 0.78, density + detail * 0.08) * 0.18);

        const blueDepth = (1 - smoothstep(0.18, 0.66, density)) * 38;
        const texture = (detail - 0.5) * 5.5 + (hash(x + Math.floor(motion * 4), y) - 0.5) * 2.4;
        const vignette = Math.hypot(nx - 0.48, ny - 0.48) * 24;
        const index = (y * lowWidth + x) * 4;

        data[index] = clamp(color[0] + texture - vignette - blueDepth * 0.35, 0, 255);
        data[index + 1] = clamp(color[1] + texture - vignette * 0.45 - blueDepth * 0.25, 0, 255);
        data[index + 2] = clamp(color[2] + texture + 8 - vignette * 0.15, 0, 255);
        data[index + 3] = 255;
      }
    }

    buffer.ctx.putImageData(buffer.image, 0, 0);
    buffer.lastCloudTime = motion;
  }

  ctx.save();
  ctx.imageSmoothingEnabled = true;
  ctx.drawImage(buffer.canvas, 0, 0, width, height);
  ctx.globalCompositeOperation = 'screen';
  ctx.globalAlpha = 0.13;
  ctx.fillStyle = 'rgba(196, 248, 232, 0.35)';
  ctx.fillRect(0, 0, width, height);
  ctx.restore();
};

const drawGlow = (ctx, width, height, time) => {
  const blobs = [
    [0.18, 0.6, 0.26, 'rgba(255, 99, 184, 0.24)', 0.1],
    [0.86, 0.32, 0.25, 'rgba(255, 106, 190, 0.25)', 1.9],
    [0.47, 0.55, 0.28, 'rgba(182, 244, 226, 0.22)', 3.1],
    [0.27, 0.18, 0.2, 'rgba(195, 250, 225, 0.18)', 4.4],
  ];

  ctx.save();
  ctx.globalCompositeOperation = 'screen';
  blobs.forEach(([x, y, radius, color, seed]) => {
    const cx = (x + Math.sin(time * 0.09 + seed) * 0.025) * width;
    const cy = (y + Math.cos(time * 0.08 + seed) * 0.028) * height;
    const gradient = ctx.createRadialGradient(cx, cy, 0, cx, cy, radius * width);
    gradient.addColorStop(0, color);
    gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);
  });
  ctx.restore();
};

const getFrostedNoisePattern = (ctx) => {
  if (frostedNoisePattern) return frostedNoisePattern;

  const noiseCanvas = document.createElement('canvas');
  const size = 180;
  noiseCanvas.width = size;
  noiseCanvas.height = size;
  const noiseCtx = noiseCanvas.getContext('2d');
  const image = noiseCtx.createImageData(size, size);

  for (let i = 0; i < image.data.length; i += 4) {
    const value = hash(i * 0.41, i * 0.17) > 0.52 ? 255 : 0;
    image.data[i] = value;
    image.data[i + 1] = value;
    image.data[i + 2] = value;
    image.data[i + 3] = 118;
  }

  noiseCtx.putImageData(image, 0, 0);
  frostedNoisePattern = ctx.createPattern(noiseCanvas, 'repeat');
  return frostedNoisePattern;
};

const drawFrostedGlassLayer = (ctx, width, height, time) => {
  ctx.save();
  ctx.globalCompositeOperation = 'screen';
  ctx.globalAlpha = 0.08;
  ctx.fillStyle = 'rgba(235, 248, 255, 0.42)';
  ctx.fillRect(0, 0, width, height);
  ctx.restore();

  ctx.save();
  ctx.globalCompositeOperation = 'overlay';
  ctx.globalAlpha = 0.24;
  ctx.translate(Math.sin(time * 0.42) * 0.5, Math.cos(time * 0.36) * 0.5);
  ctx.scale(0.5, 0.5);
  ctx.fillStyle = getFrostedNoisePattern(ctx);
  ctx.fillRect(0, 0, width * 2, height * 2);
  ctx.restore();
};

const drawInterestAccents = (ctx, width, height, time) => {
  const accents = [
    { x: 0.168, y: 0.54, r: 0.18, color: 'rgba(255, 64, 180, 0.24)', seed: 1.9 },
    { x: 0.145, y: 0.61, r: 0.16, color: 'rgba(255, 132, 34, 0.3)', seed: 2.35 },
    { x: 0.385, y: 0.885, r: 0.13, color: 'rgba(255, 84, 190, 0.2)', seed: 9.1 },
    { x: 0.36, y: 0.91, r: 0.12, color: 'rgba(255, 146, 42, 0.26)', seed: 9.8 },
    { x: 0.878, y: 0.35, r: 0.17, color: 'rgba(255, 74, 186, 0.24)', seed: 14.2 },
    { x: 0.855, y: 0.39, r: 0.16, color: 'rgba(255, 124, 30, 0.32)', seed: 14.85 },
    { x: 0.12, y: 0.425, r: 0.12, color: 'rgba(173, 255, 231, 0.18)', seed: 0.8 },
    { x: 0.17, y: 0.49, r: 0.1, color: 'rgba(255, 170, 58, 0.22)', seed: 4.6 },
    { x: 0.8, y: 0.52, r: 0.12, color: 'rgba(174, 255, 231, 0.18)', seed: 15.1 },
    { x: 0.9, y: 0.28, r: 0.1, color: 'rgba(255, 158, 50, 0.2)', seed: 17.2 },
  ];

  ctx.save();
  ctx.globalCompositeOperation = 'screen';
  accents.forEach((accent) => {
    const cx = (accent.x + Math.sin(time * 0.18 + accent.seed) * 0.01) * width;
    const cy = (accent.y + Math.cos(time * 0.16 + accent.seed) * 0.012) * height;
    const gradient = ctx.createRadialGradient(cx, cy, 0, cx, cy, accent.r * width);
    gradient.addColorStop(0, accent.color);
    gradient.addColorStop(0.52, accent.color.replace(/0\.\d+\)/, '0.08)'));
    gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);
  });
  ctx.restore();
};

const drawAtmosphereOverlay = (ctx, width, height) => {
  ctx.save();
  ctx.globalCompositeOperation = 'screen';

  const sideLight = ctx.createLinearGradient(0, 0, width, 0);
  sideLight.addColorStop(0, 'rgba(255, 255, 255, 0.12)');
  sideLight.addColorStop(0.18, 'rgba(255, 255, 255, 0)');
  sideLight.addColorStop(0.82, 'rgba(255, 255, 255, 0)');
  sideLight.addColorStop(1, 'rgba(255, 255, 255, 0.1)');
  ctx.fillStyle = sideLight;
  ctx.fillRect(0, 0, width, height);

  const leftBloom = ctx.createRadialGradient(width * 0.22, height * 0.75, 0, width * 0.22, height * 0.75, width * 0.3);
  leftBloom.addColorStop(0, 'rgba(255, 118, 190, 0.22)');
  leftBloom.addColorStop(1, 'rgba(255, 118, 190, 0)');
  ctx.fillStyle = leftBloom;
  ctx.fillRect(0, 0, width, height);

  const rightBloom = ctx.createRadialGradient(width * 0.88, height * 0.28, 0, width * 0.88, height * 0.28, width * 0.28);
  rightBloom.addColorStop(0, 'rgba(255, 120, 194, 0.2)');
  rightBloom.addColorStop(1, 'rgba(255, 120, 194, 0)');
  ctx.fillStyle = rightBloom;
  ctx.fillRect(0, 0, width, height);

  ctx.globalCompositeOperation = 'source-over';
  const shade = ctx.createLinearGradient(0, 0, 0, height);
  shade.addColorStop(0, 'rgba(10, 12, 20, 0.05)');
  shade.addColorStop(1, 'rgba(10, 12, 20, 0.14)');
  ctx.fillStyle = shade;
  ctx.fillRect(0, 0, width, height);

  ctx.restore();
};

const drawCachedAtmosphereOverlay = (ctx, buffer, width, height) => {
  const canvas = buffer.atmosphereCanvas;

  if (canvas.width !== Math.round(width) || canvas.height !== Math.round(height)) {
    canvas.width = Math.max(1, Math.round(width));
    canvas.height = Math.max(1, Math.round(height));
    drawAtmosphereOverlay(buffer.atmosphereCtx, canvas.width, canvas.height);
  }

  ctx.drawImage(canvas, 0, 0, width, height);
};

const renderBackgroundSceneCache = (buffer, width, height, time, reducedMotion) => {
  const canvasWidth = Math.max(1, Math.round(width));
  const canvasHeight = Math.max(1, Math.round(height));
  const sceneCanvas = buffer.sceneCanvas;
  const cleanSceneCanvas = buffer.cleanSceneCanvas;
  const shouldRender =
    sceneCanvas.width !== canvasWidth ||
    sceneCanvas.height !== canvasHeight ||
    time < buffer.lastSceneTime ||
    time - buffer.lastSceneTime >= SCENE_FRAME_INTERVAL;

  if (sceneCanvas.width !== canvasWidth || sceneCanvas.height !== canvasHeight) {
    sceneCanvas.width = canvasWidth;
    sceneCanvas.height = canvasHeight;
    cleanSceneCanvas.width = canvasWidth;
    cleanSceneCanvas.height = canvasHeight;
    buffer.lastSceneTime = -Infinity;
  }

  if (shouldRender) {
    const sceneCtx = buffer.sceneCtx;
    const cleanSceneCtx = buffer.cleanSceneCtx;

    cleanSceneCtx.clearRect(0, 0, width, height);
    drawClouds(cleanSceneCtx, buffer, width, height, time, reducedMotion);
    drawGlow(cleanSceneCtx, width, height, time);
    drawInterestAccents(cleanSceneCtx, width, height, time);
    drawCachedAtmosphereOverlay(cleanSceneCtx, buffer, width, height);

    sceneCtx.clearRect(0, 0, width, height);
    sceneCtx.drawImage(cleanSceneCanvas, 0, 0, width, height);
    drawFrostedGlassLayer(sceneCtx, width, height, time);
    buffer.lastSceneTime = time;
  }
};

const drawBackgroundSceneView = (ctx, buffer, width, height, time, reducedMotion, zoom) => {
  renderBackgroundSceneCache(buffer, width, height, time, reducedMotion);

  const sceneCanvas = zoom > 1.001 ? buffer.cleanSceneCanvas : buffer.sceneCanvas;
  if (zoom <= 1.001) {
    ctx.drawImage(sceneCanvas, 0, 0, width, height);
    return;
  }

  const focusX = width * 0.68;
  const focusY = height * 0.68;
  const sourceWidth = width / zoom;
  const sourceHeight = height / zoom;
  const sourceX = clamp(focusX - sourceWidth / 2, 0, width - sourceWidth);
  const sourceY = clamp(focusY - sourceHeight / 2, 0, height - sourceHeight);
  ctx.save();
  ctx.imageSmoothingEnabled = false;
  ctx.drawImage(sceneCanvas, sourceX, sourceY, sourceWidth, sourceHeight, 0, 0, width, height);
  ctx.restore();
  drawFrostedGlassLayer(ctx, width, height, time);
};

const getZoomScale = (elapsed) => {
  if (elapsed < ZOOM_IN_START) return 1;

  const zoomOut = smoothstep(ZOOM_OUT_START, ZOOM_OUT_END, elapsed);
  return lerp(4.8, 1, zoomOut);
};

const drawLabel = (ctx, text, x, y, scale, alpha) => {
  const paddingX = 8 * scale;
  const height = 22 * scale;

  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.font = `${12 * scale}px ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace`;
  ctx.textBaseline = 'middle';
  const width = ctx.measureText(text).width + paddingX * 2;

  ctx.fillStyle = 'rgba(255, 255, 255, 0.93)';
  ctx.fillRect(x, y, width, height);
  ctx.fillStyle = 'rgba(26, 30, 44, 0.88)';
  ctx.fillText(text, x + paddingX, y + height / 2 + scale);
  ctx.restore();
};

const drawInstallCommand = (ctx, width, height, elapsed, time) => {
  const appear = smoothstep(2.15, 2.75, elapsed);
  const exit = smoothstep(5.05, 5.55, elapsed);
  const alpha = appear * (1 - exit);

  if (alpha <= 0) return;

  const typeProgress = smoothstep(2.85, 4.35, elapsed);
  const visibleChars = Math.floor(INSTALL_COMMAND.length * typeProgress);
  const visibleText = INSTALL_COMMAND.slice(0, visibleChars);
  const showCursor = elapsed < 4.8 && Math.floor(elapsed * 5) % 2 === 0;
  const scaleIn = lerp(0.18, 1, appear);
  const scale = lerp(scaleIn, 0.9, exit);
  const fontSize = Math.max(13, Math.min(18, width * 0.014));
  const boxWidth = Math.min(width * 0.5, 410);
  const boxHeight = fontSize * 2.7;
  const x = width * 0.5 - (boxWidth * scale) / 2;
  const y = height * 0.49 - (boxHeight * scale) / 2;
  const w = boxWidth * scale;
  const h = boxHeight * scale;

  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.fillStyle = 'rgba(255, 255, 255, 0.92)';
  ctx.fillRect(x, y, w, h);
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.82)';
  ctx.lineWidth = Math.max(1.2, width / 1100);
  ctx.strokeRect(x, y, w, h);
  ctx.restore();

  ctx.save();
  ctx.globalAlpha = alpha * smoothstep(2.45, 2.85, elapsed);
  ctx.font = `${fontSize * scale}px ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace`;
  ctx.textBaseline = 'middle';
  ctx.fillStyle = 'rgba(12, 14, 20, 0.92)';
  const textX = x + 18 * scale;
  const textY = y + h / 2 + Math.sin(time * 2.1) * 0.4;
  ctx.fillText(visibleText, textX, textY);

  if (showCursor) {
    const cursorX = textX + ctx.measureText(visibleText).width + 2 * scale;
    const cursorSize = fontSize * scale;
    ctx.fillRect(cursorX, textY - cursorSize / 2, cursorSize * 0.62, cursorSize);
  }

  ctx.restore();
};

const drawComposerBox = (ctx, width, height, elapsed) => {
  const appear = smoothstep(COMPOSER_BOX_START, COMPOSER_BOX_START + 0.45, elapsed);
  const exit = smoothstep(COMPOSER_BOX_END - 0.55, COMPOSER_BOX_END, elapsed);
  const alpha = appear * (1 - exit);

  if (alpha <= 0) return;

  const boxWidth = Math.min(width * 0.58, 560);
  const boxHeight = Math.min(height * 0.34, 190);
  const scale = lerp(0.96, 1, appear) * lerp(1, 0.96, exit);
  const x = width / 2 - (boxWidth * scale) / 2;
  const y = height / 2 - (boxHeight * scale) / 2;
  const w = boxWidth * scale;
  const h = boxHeight * scale;

  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.fillStyle = 'rgba(255, 255, 255, 0.94)';
  ctx.fillRect(x, y, w, h);
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.9)';
  ctx.lineWidth = 1.2;
  ctx.strokeRect(x, y, w, h);
  ctx.fillStyle = 'rgba(18, 20, 28, 0.25)';
  ctx.fillRect(x + 18 * scale, y + 20 * scale, w - 36 * scale, 1);
  ctx.restore();
};

const drawCenteredText = (ctx, width, height, lines, alpha) => {
  if (alpha <= 0) return;

  const fontSize = Math.round(Math.max(22, Math.min(40, width * 0.029)));
  const lineHeight = Math.round(fontSize * 1.35);
  const startY = Math.round(height * 0.5 - ((lines.length - 1) * lineHeight) / 2);

  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.globalCompositeOperation = 'source-over';
  ctx.filter = 'none';
  ctx.shadowColor = 'transparent';
  ctx.shadowBlur = 0;
  ctx.font = `400 ${fontSize}px Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = '#ffffff';
  lines.forEach((line, index) => {
    ctx.fillText(line, Math.round(width / 2), startY + index * lineHeight);
  });
  ctx.restore();
};

const drawAsciiCodeField = (ctx, width, height, elapsed, alpha) => {
  if (alpha <= 0) return;

  const cell = Math.max(7, Math.min(10, width / 170));
  const lineHeight = cell * 2.35;
  const cols = Math.ceil(width / cell);
  const rows = Math.ceil(height / lineHeight);
  const phase = elapsed * 1.4;
  const codeBands = [
    { x: 0.02, y: 0.03, w: 0.28, h: 0.28, seed: 1.2 },
    { x: 0.45, y: 0.02, w: 0.47, h: 0.25, seed: 3.7 },
    { x: 0.73, y: 0.42, w: 0.27, h: 0.22, seed: 5.4 },
    { x: 0.0, y: 0.78, w: 0.4, h: 0.2, seed: 7.1 },
    { x: 0.53, y: 0.66, w: 0.4, h: 0.28, seed: 9.6 },
    { x: 0.23, y: 0.61, w: 0.13, h: 0.17, seed: 11.3 },
  ];

  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.font = `${cell}px ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = 'rgba(255, 255, 255, 0.82)';
  ctx.shadowBlur = 0;

  codeBands.forEach((band) => {
    const startCol = Math.floor((band.x * width) / cell);
    const endCol = Math.min(cols, Math.ceil(((band.x + band.w) * width) / cell));
    const startRow = Math.floor((band.y * height) / lineHeight);
    const endRow = Math.min(rows, Math.ceil(((band.y + band.h) * height) / lineHeight));
    const rowOffset = Math.floor(phase + band.seed) % 4;

    for (let row = startRow; row < endRow; row += 1) {
      if ((row + rowOffset) % 3 === 1) continue;

      const rowNoise = hash(row, band.seed);
      const rowStart = startCol + Math.floor(rowNoise * 12);
      const rowEnd = endCol - Math.floor(hash(row + 17, band.seed) * 14);

      for (let col = rowStart; col < rowEnd; col += 1) {
        const gate = hash(col + Math.floor(phase * 2), row + band.seed);
        const pulse = Math.sin(phase + col * 0.17 + row * 0.41 + band.seed) * 0.5 + 0.5;

        if (gate < 0.18 || pulse < 0.18) continue;

        ctx.globalAlpha = alpha * (0.34 + pulse * 0.58);
        ctx.fillText('.', col * cell + cell / 2, row * lineHeight + lineHeight / 2);
      }
    }
  });

  ctx.restore();
};

const drawCloudOnlyTimeline = (ctx, width, height, elapsed) => {
  drawComposerBox(ctx, width, height, elapsed);

  const runningAlpha =
    smoothstep(RUNNING_TEXT_START, RUNNING_TEXT_START + 0.55, elapsed) *
    (1 - smoothstep(RUNNING_TEXT_END - 0.45, RUNNING_TEXT_END, elapsed));
  drawAsciiCodeField(ctx, width, height, elapsed, runningAlpha);
  drawCenteredText(ctx, width, height, ['Agents running...'], runningAlpha);

  const finishedAlpha =
    smoothstep(FINISHED_TEXT_START, FINISHED_TEXT_START + 0.55, elapsed) *
    (1 - smoothstep(FINISHED_TEXT_END - 0.65, FINISHED_TEXT_END, elapsed));
  drawCenteredText(ctx, width, height, ['Task finished', 'Your code is ready for preview'], finishedAlpha);
};

const drawFrame = (ctx, frame, width, height, reveal, drift, label, labelOffset, time, elapsed) => {
  if (reveal <= 0) return;

  const x = (frame.x + drift.x) * width;
  const y = (frame.y + drift.y) * height;
  const w = frame.w * width;
  const h = frame.h * height;
  const alpha = smoothstep(0.04, 1, reveal);
  const internalShrink = smoothstep(13.25, AGENTS_START, elapsed);
  const accentScale = lerp(lerp(0.82, 1, alpha), 0.62, internalShrink);
  const hudScale = lerp(1.12, 1, alpha);
  const centerX = x + w / 2;
  const centerY = y + h / 2;
  const accentW = w * accentScale;
  const accentH = h * accentScale;
  const accentX = centerX - accentW / 2;
  const accentY = centerY - accentH / 2;
  const frameW = w * hudScale;
  const frameH = h * hudScale;
  const frameX = centerX - frameW / 2;
  const frameY = centerY - frameH / 2;
  const corner = Math.min(frameW, frameH) * 0.15;

  // Experiment here with frame treatments: color-burn, overlay, or clipped blur.
  ctx.save();
  ctx.globalAlpha = alpha * 0.46;
  ctx.globalCompositeOperation = 'overlay';
  const colorLift = ctx.createLinearGradient(accentX, accentY, accentX + accentW, accentY + accentH);
  colorLift.addColorStop(0, 'rgba(255, 118, 34, 0.38)');
  colorLift.addColorStop(0.45, 'rgba(255, 54, 174, 0.42)');
  colorLift.addColorStop(1, 'rgba(150, 255, 226, 0.22)');
  ctx.fillStyle = colorLift;
  ctx.fillRect(accentX, accentY, accentW, accentH);

  ctx.globalCompositeOperation = 'screen';
  ctx.globalAlpha = alpha * 0.24;
  const warmTint = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, Math.max(accentW, accentH) * 0.72);
  warmTint.addColorStop(0, 'rgba(255, 124, 36, 0.34)');
  warmTint.addColorStop(0.55, 'rgba(230, 42, 150, 0.16)');
  warmTint.addColorStop(1, 'rgba(255, 255, 255, 0)');
  ctx.fillStyle = warmTint;
  ctx.fillRect(accentX, accentY, accentW, accentH);
  ctx.restore();

  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.78)';
  ctx.lineWidth = Math.max(1.2, width / 1000);
  ctx.shadowColor = 'rgba(255, 255, 255, 0.48)';
  ctx.shadowBlur = 0;

  const drawCorner = (sx, sy, mx, my) => {
    ctx.beginPath();
    ctx.moveTo(sx, sy + my * corner);
    ctx.lineTo(sx, sy);
    ctx.lineTo(sx + mx * corner, sy);
    ctx.stroke();
  };

  drawCorner(frameX, frameY, 1, 1);
  drawCorner(frameX + frameW, frameY, -1, 1);
  drawCorner(frameX, frameY + frameH, 1, -1);
  drawCorner(frameX + frameW, frameY + frameH, -1, -1);

  ctx.globalAlpha = alpha * 0.16;
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.35)';
  ctx.strokeRect(frameX, frameY, frameW, frameH);
  ctx.restore();

  const labelScale = Math.max(0.8, Math.min(1, width / 1160)) * lerp(1.08, 1, alpha);
  drawLabel(
    ctx,
    label,
    frameX + labelOffset[0],
    frameY + labelOffset[1] + Math.sin(time * 0.7) * 1.5,
    labelScale,
    alpha,
  );
};

const drawNode = (ctx, point, radius, reveal, filled = false) => {
  if (reveal <= 0) return;

  ctx.save();
  ctx.globalAlpha = smoothstep(0, 1, reveal);
  ctx.shadowColor = 'rgba(255, 255, 255, 0.75)';
  ctx.shadowBlur = 0;

  ctx.beginPath();
  ctx.arc(point.x, point.y, radius + 4, 0, Math.PI * 2);
  ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
  ctx.fill();

  ctx.beginPath();
  ctx.arc(point.x, point.y, radius, 0, Math.PI * 2);
  ctx.fillStyle = filled ? 'rgba(255, 255, 255, 0.96)' : 'rgba(255, 255, 255, 0.5)';
  ctx.fill();

  if (!filled) {
    ctx.shadowBlur = 0;
    ctx.lineWidth = 2.2;
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.95)';
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(point.x, point.y, Math.max(2.4, radius - 4.2), 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
    ctx.fill();
  }

  ctx.restore();
};

const drawStraightLink = (ctx, start, end, progress) => {
  if (progress <= 0) return;

  ctx.beginPath();
  ctx.moveTo(start.x, start.y);
  ctx.lineTo(lerp(start.x, end.x, progress), lerp(start.y, end.y, progress));
  ctx.stroke();
};

const getNodeOrder = (cluster, nodeIndex) => {
  if (nodeIndex === cluster.pivot) return 0;

  let order = 1;
  for (let index = 0; index < nodeIndex; index += 1) {
    if (index !== cluster.pivot) order += 1;
  }

  return order;
};

const getNodeReveal = (cluster, clusterIndex, nodeIndex, elapsed) => {
  const order = getNodeOrder(cluster, nodeIndex);
  const delay = 1.05 + clusterIndex * 0.72 + order * 0.42;
  return smoothstep(delay, delay + 0.95, elapsed);
};

const getLocalLineReveal = (cluster, clusterIndex, nodeIndex, elapsed) => {
  const order = getNodeOrder(cluster, nodeIndex);
  const delay = 5.75 + clusterIndex * 0.36 + order * 0.18;
  return smoothstep(delay, delay + 0.58, elapsed);
};

const getClusterPoints = (width, height, time) =>
  clusters.map((cluster) =>
    cluster.nodes.map((node) => {
      const p = getNodePosition(cluster, node, time);
      return {
        x: p.x * width,
        y: p.y * height,
        r: Math.max(4.5, node.r * Math.min(width / 1280, 1.12)),
        filled: node.filled,
        seed: node.seed,
      };
    }),
  );

const drawHud = (ctx, width, height, time, elapsed, isInitialCycle) => {
  const pointsByCluster = getClusterPoints(width, height, time);

  ctx.save();
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.setLineDash([7, 8]);
  ctx.lineDashOffset = -time * 9;
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.58)';
  ctx.lineWidth = Math.max(1.1, width / 1320);
  ctx.shadowBlur = 0;

  clusters.forEach((cluster, clusterIndex) => {
    const pivot = pointsByCluster[clusterIndex][cluster.pivot];
    cluster.nodes.forEach((node, nodeIndex) => {
      if (nodeIndex === cluster.pivot) return;
      const localProgress = getLocalLineReveal(cluster, clusterIndex, nodeIndex, elapsed);
      if (localProgress <= 0) return;

      const target = pointsByCluster[clusterIndex][nodeIndex];
      ctx.globalAlpha = localProgress * 0.86;
      drawStraightLink(ctx, pivot, target, localProgress);
    });
  });

  longLinks.forEach((link, linkIndex) => {
    const start = pointsByCluster[link.from[0]][link.from[1]];
    const end = pointsByCluster[link.to[0]][link.to[1]];
    const delay = 6.8 + linkIndex * 0.22 + link.delay;
    const progress = smoothstep(delay, delay + 0.82, elapsed);
    if (progress <= 0) return;

    ctx.globalAlpha = progress * 0.62;
    drawStraightLink(ctx, start, end, progress);
  });

  ctx.restore();

  clusters.forEach((cluster) => {
    const drift = getFrameDrift(cluster, time);
    const frameReveal = smoothstep(9.35, 10.65, elapsed);
    drawFrame(ctx, cluster.frame, width, height, frameReveal, drift, cluster.label, cluster.labelOffset, time, elapsed);
  });

  pointsByCluster.forEach((clusterPoints, clusterIndex) => {
    clusterPoints.forEach((point, nodeIndex) => {
      const reveal = isInitialCycle ? 1 : getNodeReveal(clusters[clusterIndex], clusterIndex, nodeIndex, elapsed);
      drawNode(ctx, point, point.r, reveal, point.filled);
    });
  });

  strayNodes.forEach((node, index) => {
    const reveal = isInitialCycle ? 0.65 : smoothstep(2.4 + index * 0.48, 3.35 + index * 0.48, elapsed) * 0.65;
    if (reveal <= 0) return;

    const p = {
      x: (node.x + Math.sin(time * 0.18 + node.seed) * 0.005) * width,
      y: (node.y + Math.cos(time * 0.16 + node.seed) * 0.006) * height,
    };
    drawNode(ctx, p, node.r * Math.min(width / 1280, 1), reveal);
  });

  drawInstallCommand(ctx, width, height, elapsed, time);
};

export const drawHeroVisualFrame = ({ ctx, buffer, width, height, elapsed, backgroundElapsed, isInitialCycle, phase, reducedMotion }) => {
  const time = reducedMotion ? 0.6 : elapsed;
  const backgroundTime = reducedMotion ? 0.6 : 0.6 + backgroundElapsed;
  const zoom = elapsed >= CLOUD_ONLY_START ? getZoomScale(elapsed) : 1;

  ctx.clearRect(0, 0, width, height);
  drawBackgroundSceneView(ctx, buffer, width, height, backgroundTime, reducedMotion, zoom);

  if (phase === 'clouds') return;

  if (elapsed >= AGENTS_START) {
    drawCloudOnlyTimeline(ctx, width, height, elapsed);
    return;
  }

  if (!isInitialCycle && elapsed < 1.05) return;

  drawHud(ctx, width, height, time, elapsed, isInitialCycle);
};
