import * as THREE from 'three';

/**
 * Generates a photorealistic procedural White Marble texture map using HTML5 Canvas.
 * Creates elegant grey and subtle bluish veining resembling Carrara / Calacatta marble.
 */
export function createProceduralMarbleTexture(width = 1024, height = 1024) {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');

  // Base off-white marble background with subtle gradient
  const baseGrad = ctx.createLinearGradient(0, 0, width, height);
  baseGrad.addColorStop(0, '#f8fafc');
  baseGrad.addColorStop(0.3, '#f1f5f9');
  baseGrad.addColorStop(0.7, '#e2e8f0');
  baseGrad.addColorStop(1, '#f8fafc');
  ctx.fillStyle = baseGrad;
  ctx.fillRect(0, 0, width, height);

  // Perlin/Noise-like soft cloudy shading
  const imgData = ctx.getImageData(0, 0, width, height);
  const data = imgData.data;

  // Simple multi-octave turbulence for marble veining
  function noise(x, y) {
    const n = Math.sin(x * 12.9898 + y * 78.233) * 43758.5453;
    return n - Math.floor(n);
  }

  function smoothNoise(x, y) {
    const i = Math.floor(x);
    const j = Math.floor(y);
    const fx = x - i;
    const fy = y - j;
    const sfx = fx * fx * (3 - 2 * fx);
    const sfy = fy * fy * (3 - 2 * fy);

    const n00 = noise(i, j);
    const n10 = noise(i + 1, j);
    const n01 = noise(i, j + 1);
    const n11 = noise(i + 1, j + 1);

    const x0 = n00 * (1 - sfx) + n10 * sfx;
    const x1 = n01 * (1 - sfx) + n11 * sfx;
    return x0 * (1 - sfy) + x1 * sfy;
  }

  function turbulence(x, y, octaves = 4) {
    let t = 0;
    let scale = 1;
    let amp = 1;
    let maxAmp = 0;
    for (let o = 0; o < octaves; o++) {
      t += smoothNoise(x * scale, y * scale) * amp;
      maxAmp += amp;
      scale *= 2.0;
      amp *= 0.5;
    }
    return t / maxAmp;
  }

  // Draw soft cloud undertones
  for (let y = 0; y < height; y += 4) {
    for (let x = 0; x < width; x += 4) {
      const nx = x / 160;
      const ny = y / 160;
      const turb = turbulence(nx, ny, 3);
      const veinVal = Math.sin((nx * 1.5 + ny * 1.2 + turb * 4.0) * Math.PI);
      const veinIntensity = Math.pow(Math.abs(veinVal), 8) * 0.35;

      const idx = (y * width + x) * 4;
      const shade = Math.floor((1 - veinIntensity * 0.4) * 255);

      for (let dy = 0; dy < 4 && y + dy < height; dy++) {
        for (let dx = 0; dx < 4 && x + dx < width; dx++) {
          const pixelIdx = ((y + dy) * width + (x + dx)) * 4;
          data[pixelIdx] = Math.min(255, Math.floor(data[pixelIdx] * (shade / 255)));
          data[pixelIdx + 1] = Math.min(255, Math.floor(data[pixelIdx + 1] * (shade / 255) * 1.01));
          data[pixelIdx + 2] = Math.min(255, Math.floor(data[pixelIdx + 2] * (shade / 255) * 1.04));
        }
      }
    }
  }
  ctx.putImageData(imgData, 0, 0);

  // Draw crisp primary and secondary veins with smooth bezier paths
  function drawVein(points, strokeWidth, color, opacity) {
    ctx.beginPath();
    ctx.moveTo(points[0].x, points[0].y);
    for (let i = 1; i < points.length - 1; i++) {
      const xc = (points[i].x + points[i + 1].x) / 2;
      const yc = (points[i].y + points[i + 1].y) / 2;
      ctx.quadraticCurveTo(points[i].x, points[i].y, xc, yc);
    }
    ctx.strokeStyle = color;
    ctx.lineWidth = strokeWidth;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.globalAlpha = opacity;
    ctx.stroke();
    ctx.globalAlpha = 1.0;
  }

  // Major sweeping veins across the marble
  const majorVeins = [
    [
      { x: 0, y: height * 0.2 },
      { x: width * 0.25, y: height * 0.28 },
      { x: width * 0.5, y: height * 0.45 },
      { x: width * 0.75, y: height * 0.65 },
      { x: width, y: height * 0.8 }
    ],
    [
      { x: width * 0.1, y: 0 },
      { x: width * 0.35, y: height * 0.3 },
      { x: width * 0.6, y: height * 0.5 },
      { x: width * 0.85, y: height * 0.85 },
      { x: width * 0.95, y: height }
    ],
    [
      { x: width * 0.4, y: 0 },
      { x: width * 0.55, y: height * 0.25 },
      { x: width * 0.45, y: height * 0.6 },
      { x: width * 0.7, y: height * 0.9 },
      { x: width * 0.8, y: height }
    ],
    [
      { x: 0, y: height * 0.75 },
      { x: width * 0.3, y: height * 0.68 },
      { x: width * 0.55, y: height * 0.78 },
      { x: width * 0.85, y: height * 0.72 },
      { x: width, y: height * 0.88 }
    ]
  ];

  majorVeins.forEach(pts => {
    // Soft blur halo vein
    drawVein(pts, 14, '#94a3b8', 0.18);
    // Medium vein
    drawVein(pts, 5, '#64748b', 0.25);
    // Crisp thin vein
    drawVein(pts, 1.8, '#475569', 0.45);
  });

  // Minor tributary veins
  for (let i = 0; i < 8; i++) {
    const sx = Math.random() * width;
    const sy = Math.random() * height;
    const pts = [
      { x: sx, y: sy },
      { x: sx + (Math.random() - 0.5) * 180, y: sy + (Math.random() - 0.5) * 180 },
      { x: sx + (Math.random() - 0.5) * 320, y: sy + (Math.random() - 0.5) * 320 }
    ];
    drawVein(pts, 2, '#64748b', 0.15 + Math.random() * 0.15);
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.generateMipmaps = true;
  texture.minFilter = THREE.LinearMipmapLinearFilter;
  return texture;
}
