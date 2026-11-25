// Dapur Kilat — all food art is drawn with canvas paths, no image files.
// Each ingredient gets one small `drawX(ctx, x, y, r)` function that
// paints it inside a circle of radius r centred on (x, y).

function circle(ctx, x, y, r, fill) {
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fillStyle = fill;
  ctx.fill();
}

function ellipse(ctx, x, y, rx, ry, fill) {
  ctx.beginPath();
  ctx.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2);
  ctx.fillStyle = fill;
  ctx.fill();
}

export function drawNasi(ctx, x, y, r) {
  ellipse(ctx, x, y + r * 0.25, r * 0.95, r * 0.6, '#fff6dd');
  ellipse(ctx, x, y + r * 0.05, r * 0.7, r * 0.5, '#fffdf2');
  ctx.fillStyle = '#e3d3a4';
  for (let i = 0; i < 7; i++) {
    const a = -0.4 + i * 0.28;
    ctx.beginPath();
    ctx.arc(x + Math.sin(a * 3) * r * 0.45, y - r * 0.15 + Math.cos(a * 2) * r * 0.2, r * 0.07, 0, Math.PI * 2);
    ctx.fill();
  }
}

export function drawMie(ctx, x, y, r) {
  ctx.strokeStyle = '#e8b92a';
  ctx.lineWidth = Math.max(2, r * 0.16);
  ctx.lineCap = 'round';
  for (let i = 0; i < 4; i++) {
    const yy = y - r * 0.45 + i * r * 0.32;
    ctx.beginPath();
    for (let px = -r * 0.8; px <= r * 0.8; px += r * 0.2) {
      const py = yy + Math.sin(px * 0.09 + i * 1.7) * r * 0.14;
      if (px === -r * 0.8) ctx.moveTo(x + px, py);
      else ctx.lineTo(x + px, py);
    }
    ctx.stroke();
  }
}

export function drawTelur(ctx, x, y, r) {
  ellipse(ctx, x, y, r * 0.95, r * 0.75, '#fffdf5');
  circle(ctx, x + r * 0.1, y - r * 0.05, r * 0.42, '#ffb52e');
  circle(ctx, x + r * 0.02, y - r * 0.12, r * 0.16, '#ffd97a');
}

export function drawAyam(ctx, x, y, r) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(-0.6);
  ellipse(ctx, 0, 0, r * 0.55, r * 0.85, '#e8a06a');
  ellipse(ctx, -r * 0.15, -r * 0.1, r * 0.3, r * 0.55, '#f2bc8d');
  ctx.strokeStyle = '#fff3e0';
  ctx.lineWidth = Math.max(2, r * 0.14);
  ctx.beginPath();
  ctx.moveTo(r * 0.3, r * 0.75);
  ctx.lineTo(r * 0.7, r * 1.05);
  ctx.moveTo(r * 0.3, r * 0.75);
  ctx.lineTo(r * 0.15, r * 1.1);
  ctx.stroke();
  ctx.restore();
}

export function drawSayur(ctx, x, y, r) {
  ctx.fillStyle = '#4e9b3d';
  for (let i = 0; i < 3; i++) {
    const a = -0.9 + i * 0.9;
    ctx.save();
    ctx.translate(x, y + r * 0.2);
    ctx.rotate(a);
    ellipse(ctx, 0, -r * 0.55, r * 0.34, r * 0.62, i === 1 ? '#5cb34a' : '#4e9b3d');
    ctx.restore();
  }
  ctx.strokeStyle = '#2f6b24';
  ctx.lineWidth = Math.max(1.5, r * 0.08);
  ctx.beginPath();
  ctx.moveTo(x, y + r * 0.7);
  ctx.lineTo(x, y - r * 0.1);
  ctx.stroke();
}

export function drawKecap(ctx, x, y, r) {
  ctx.fillStyle = '#3a2110';
  ctx.fillRect(x - r * 0.42, y - r * 0.5, r * 0.84, r * 1.0);
  ctx.fillStyle = '#6b3d1c';
  ctx.fillRect(x - r * 0.2, y - r * 0.95, r * 0.4, r * 0.5);
  ctx.fillStyle = '#f5e6c8';
  ctx.font = `bold ${Math.round(r * 0.55)}px sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('K', x, y + r * 0.15);
}

export function drawKacang(ctx, x, y, r) {
  ellipse(ctx, x, y + r * 0.2, r * 0.95, r * 0.6, '#c98d3d');
  ellipse(ctx, x, y + r * 0.05, r * 0.75, r * 0.45, '#b5772e');
  ctx.fillStyle = '#8a5a1d';
  for (let i = 0; i < 5; i++) {
    circle(ctx, x - r * 0.4 + i * r * 0.2, y - r * 0.05 + (i % 2) * r * 0.14, r * 0.09, '#8a5a1d');
  }
}

export function drawCabai(ctx, x, y, r) {
  ctx.strokeStyle = '#e23b2e';
  ctx.lineWidth = Math.max(3, r * 0.28);
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.arc(x, y + r * 0.35, r * 0.85, Math.PI * 1.15, Math.PI * 1.85);
  ctx.stroke();
  ctx.strokeStyle = '#3e7d33';
  ctx.lineWidth = Math.max(2, r * 0.16);
  ctx.beginPath();
  ctx.moveTo(x + r * 0.72, y - r * 0.45);
  ctx.quadraticCurveTo(x + r * 0.95, y - r * 0.8, x + r * 0.6, y - r * 0.85);
  ctx.stroke();
}

export const INGREDIENT_DRAW = {
  nasi: drawNasi,
  mie: drawMie,
  telur: drawTelur,
  ayam: drawAyam,
  sayur: drawSayur,
  kecap: drawKecap,
  kacang: drawKacang,
  cabai: drawCabai,
};

// A finished dish on its plate: a white plate, the dish's colour as
// the food, and a sprinkle of its ingredients on top.
export function drawDish(ctx, x, y, r, dish, needs) {
  circle(ctx, x, y, r, '#f4f1e8');
  ctx.strokeStyle = '#cfc8b4';
  ctx.lineWidth = Math.max(1.5, r * 0.06);
  ctx.beginPath();
  ctx.arc(x, y, r * 0.96, 0, Math.PI * 2);
  ctx.stroke();
  circle(ctx, x, y, r * 0.68, dish.plate);
  const draw = INGREDIENT_DRAW[needs[0]];
  if (draw) {
    ctx.save();
    ctx.beginPath();
    ctx.arc(x, y, r * 0.68, 0, Math.PI * 2);
    ctx.clip();
    draw(ctx, x - r * 0.2, y - r * 0.1, r * 0.5);
    draw(ctx, x + r * 0.25, y + r * 0.15, r * 0.42);
    ctx.restore();
  }
}

// A burnt, failed dish: a blackened lump with a wisp of smoke.
export function drawBurnt(ctx, x, y, r) {
  circle(ctx, x, y, r, '#f4f1e8');
  circle(ctx, x, y, r * 0.62, '#2b2b2b');
  ctx.strokeStyle = '#9aa0a6';
  ctx.lineWidth = Math.max(2, r * 0.1);
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(x - r * 0.2, y - r * 0.7);
  ctx.quadraticCurveTo(x - r * 0.45, y - r * 1.1, x - r * 0.15, y - r * 1.4);
  ctx.moveTo(x + r * 0.25, y - r * 0.7);
  ctx.quadraticCurveTo(x + r * 0.5, y - r * 1.05, x + r * 0.3, y - r * 1.35);
  ctx.stroke();
}
