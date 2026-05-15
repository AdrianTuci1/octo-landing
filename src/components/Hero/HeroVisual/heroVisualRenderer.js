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
    label: "(*Group) .Go.func1",
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
    label: "(*Group) .Go.func1",
    labelOffset: [0, -22],
    frame: { x: 0.295, y: 0.735, w: 0.112, h: 0.31 },
    pivot: 1,
    nodes: [
      { x: 0.318, y: 0.93, r: 7.5, seed: 8.2 },
      { x: 0.385, y: 0.885, r: 8.2, seed: 9.1, pinned: true },
    ],
  },
  {
    label: 'golang.org/x/sync/errgrou',
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

const drawFrame = (ctx, frame, width, height, reveal, drift, label, labelOffset, time) => {
  const x = (frame.x + drift.x) * width;
  const y = (frame.y + drift.y) * height;
  const w = frame.w * width;
  const h = frame.h * height;
  const alpha = smoothstep(0.04, 1, reveal);
  const accentScale = lerp(0.82, 1, alpha);
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
  ctx.shadowBlur = 9;

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
  ctx.shadowBlur = 12;

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
  ctx.beginPath();
  ctx.moveTo(start.x, start.y);
  ctx.lineTo(lerp(start.x, end.x, progress), lerp(start.y, end.y, progress));
  ctx.stroke();
};

const getNodeOrder = (cluster, nodeIndex) => {
  if (nodeIndex === cluster.pivot) return 0;
  return 1 + cluster.nodes.filter((node, index) => index !== cluster.pivot && index < nodeIndex).length;
};

const getNodeReveal = (cluster, clusterIndex, nodeIndex, elapsed) => {
  const order = getNodeOrder(cluster, nodeIndex);
  const delay = 1.05 + clusterIndex * 0.72 + order * 0.42;
  return smoothstep(delay, delay + 0.95, elapsed);
};

const getLocalLineReveal = (cluster, clusterIndex, nodeIndex, elapsed) => {
  const order = getNodeOrder(cluster, nodeIndex);
  const delay = 3.25 + clusterIndex * 0.36 + order * 0.18;
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

const drawHud = (ctx, width, height, time, elapsed) => {
  const pointsByCluster = getClusterPoints(width, height, time);

  ctx.save();
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.setLineDash([7, 8]);
  ctx.lineDashOffset = -time * 9;
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.58)';
  ctx.lineWidth = Math.max(1.1, width / 1320);
  ctx.shadowColor = 'rgba(255, 255, 255, 0.35)';
  ctx.shadowBlur = 4;

  clusters.forEach((cluster, clusterIndex) => {
    const pivot = pointsByCluster[clusterIndex][cluster.pivot];
    cluster.nodes.forEach((node, nodeIndex) => {
      if (nodeIndex === cluster.pivot) return;
      const localProgress = getLocalLineReveal(cluster, clusterIndex, nodeIndex, elapsed);
      const target = pointsByCluster[clusterIndex][nodeIndex];
      ctx.globalAlpha = localProgress * 0.86;
      drawStraightLink(ctx, pivot, target, localProgress);
    });
  });

  longLinks.forEach((link, linkIndex) => {
    const start = pointsByCluster[link.from[0]][link.from[1]];
    const end = pointsByCluster[link.to[0]][link.to[1]];
    const delay = 4.55 + linkIndex * 0.22 + link.delay;
    const progress = smoothstep(delay, delay + 0.82, elapsed);

    ctx.globalAlpha = progress * 0.62;
    drawStraightLink(ctx, start, end, progress);
  });

  ctx.restore();

  clusters.forEach((cluster) => {
    const drift = getFrameDrift(cluster, time);
    const frameReveal = smoothstep(6.55, 7.85, elapsed);
    drawFrame(ctx, cluster.frame, width, height, frameReveal, drift, cluster.label, cluster.labelOffset, time);
  });

  pointsByCluster.forEach((clusterPoints, clusterIndex) => {
    clusterPoints.forEach((point, nodeIndex) => {
      const reveal = getNodeReveal(clusters[clusterIndex], clusterIndex, nodeIndex, elapsed);
      drawNode(ctx, point, point.r, reveal, point.filled);
    });
  });

  strayNodes.forEach((node, index) => {
    const p = {
      x: (node.x + Math.sin(time * 0.18 + node.seed) * 0.005) * width,
      y: (node.y + Math.cos(time * 0.16 + node.seed) * 0.006) * height,
    };
    drawNode(ctx, p, node.r * Math.min(width / 1280, 1), smoothstep(2.4 + index * 0.48, 3.35 + index * 0.48, elapsed) * 0.65);
  });
};

export const drawHeroVisualFrame = ({ ctx, buffer, width, height, elapsed, phase, reducedMotion }) => {
  const time = reducedMotion ? 0.6 : elapsed;
  ctx.clearRect(0, 0, width, height);
  drawClouds(ctx, buffer, width, height, time, reducedMotion);
  drawGlow(ctx, width, height, time);
  drawInterestAccents(ctx, width, height, time);
  drawFrostedGlassLayer(ctx, width, height, time);
  drawAtmosphereOverlay(ctx, width, height);

  if (phase === 'clouds') return;

  drawHud(ctx, width, height, time, elapsed);
};
