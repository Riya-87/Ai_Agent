import * as THREE from 'three';

/**
 * Generates a high-resolution procedural Diamond/Triangular Parametric Lattice texture
 * matching the catwalk surface in the reference image.
 */
export function createProceduralGridTexture(width = 1024, height = 1024) {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');

  // Deep obsidian black base
  ctx.fillStyle = '#07070c';
  ctx.fillRect(0, 0, width, height);

  const cols = 32;
  const rows = 32;
  const cellW = width / cols;
  const cellH = height / rows;

  // Draw triangular / diamond tessellated grid
  ctx.lineWidth = 2;
  ctx.strokeStyle = '#222233';

  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      const px = x * cellW;
      const py = y * cellH;

      // Draw diamond / triangle sub-divisions
      ctx.beginPath();
      ctx.rect(px, py, cellW, cellH);
      ctx.stroke();

      // Diagonal cross lines to form triangles
      ctx.beginPath();
      ctx.moveTo(px, py);
      ctx.lineTo(px + cellW, py + cellH);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(px + cellW, py);
      ctx.lineTo(px, py + cellH);
      ctx.stroke();

      // Subtle metallic highlight in center of selected cells
      if ((x + y) % 3 === 0) {
        ctx.fillStyle = '#141422';
        ctx.beginPath();
        ctx.arc(px + cellW / 2, py + cellH / 2, cellW * 0.15, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  }

  // Edge neon/specular accents
  ctx.strokeStyle = '#3b2064';
  ctx.lineWidth = 1;
  for (let i = 0; i < width; i += cellW * 2) {
    ctx.beginPath();
    ctx.moveTo(i, 0);
    ctx.lineTo(i, height);
    ctx.stroke();
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(4, 1);
  return texture;
}
