// share.js — draws a branded, og:image-style "highlights" card onto a canvas
// so users can download / share / copy their estimate as an image.

const CARD_W = 1200;
const CARD_H = 630;

// Brand palette (mirrors css/styles.css :root).
const COL = {
  bgTop: "#f5fbff",
  bgBottom: "#e6f2fb",
  glow: "rgba(20, 187, 166, 0.16)",
  accent: "#14BBA6",
  accentDark: "#0e8f80",
  text: "#0a2a45",
  secondary: "#446683",
  tertiary: "#6e8ca8",
  hairline: "rgba(10, 42, 69, 0.10)",
};

// Loads an image, resolving to null (not rejecting) if it fails — the card
// falls back to a drawn wordmark so generation never blocks on a missing asset.
function loadImage(src) {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = () => resolve(null);
    img.src = src;
  });
}

// Wraps text to a max width, returning an array of lines (capped at maxLines).
// Adds an ellipsis to the final line if any words did not fit.
function wrapText(ctx, text, maxWidth, maxLines) {
  const words = String(text || "").split(/\s+/).filter(Boolean);
  const lines = [];
  let line = "";
  let i = 0;
  for (; i < words.length; i++) {
    const test = line ? line + " " + words[i] : words[i];
    if (ctx.measureText(test).width > maxWidth && line) {
      lines.push(line);
      line = words[i];
      if (lines.length === maxLines) { line = ""; break; }
    } else {
      line = test;
    }
  }
  if (line && lines.length < maxLines) { lines.push(line); i = words.length; }

  const truncated = i < words.length;
  if (truncated && lines.length) {
    let last = lines[lines.length - 1];
    while (ctx.measureText(last + " …").width > maxWidth && last.includes(" ")) {
      last = last.replace(/\s+\S*$/, "");
    }
    lines[lines.length - 1] = last + " …";
  }
  return lines;
}

// Draws a rounded rectangle path.
function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

const FONT = '"Geist", system-ui, -apple-system, sans-serif';

/**
 * Builds the share card.
 * @param {object} d - presentation data (all pre-formatted strings)
 *   { label, date, team, project, monthlyLabel, monthly, annual,
 *     projectLabel, projectRange, insight, footer, logoSrc }
 * @returns {Promise<HTMLCanvasElement>}
 */
export async function buildShareCard(d) {
  const scale = 2; // render at 2× for crisp output on retina / when scaled up
  const canvas = document.createElement("canvas");
  canvas.width = CARD_W * scale;
  canvas.height = CARD_H * scale;
  const ctx = canvas.getContext("2d");
  ctx.scale(scale, scale);
  ctx.textBaseline = "alphabetic";

  // Make sure Geist is ready so measurements/rendering match the site.
  if (document.fonts?.ready) { try { await document.fonts.ready; } catch { /* ignore */ } }

  // --- Background ---------------------------------------------------------
  const bg = ctx.createLinearGradient(0, 0, 0, CARD_H);
  bg.addColorStop(0, COL.bgTop);
  bg.addColorStop(1, COL.bgBottom);
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, CARD_W, CARD_H);

  const glow = ctx.createRadialGradient(CARD_W * 0.5, -160, 0, CARD_W * 0.5, -160, 720);
  glow.addColorStop(0, COL.glow);
  glow.addColorStop(1, "rgba(20,187,166,0)");
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, CARD_W, CARD_H);

  // Accent edge on the left.
  ctx.fillStyle = COL.accent;
  ctx.fillRect(0, 0, 10, CARD_H);

  const padX = 72;

  // --- Header row ---------------------------------------------------------
  const logo = await loadImage(d.logoSrc);
  const logoY = 56;
  if (logo && logo.width) {
    const h = 46;
    const w = (logo.width / logo.height) * h;
    ctx.drawImage(logo, padX, logoY, w, h);
  } else {
    ctx.fillStyle = COL.text;
    ctx.font = `700 40px ${FONT}`;
    ctx.fillText("🧅 cebula", padX, logoY + 38);
  }

  // Top-right label + date.
  ctx.textAlign = "right";
  ctx.fillStyle = COL.accent;
  ctx.font = `600 20px ${FONT}`;
  ctx.fillText(String(d.label || "").toUpperCase(), CARD_W - padX, logoY + 20);
  ctx.fillStyle = COL.tertiary;
  ctx.font = `400 18px ${FONT}`;
  ctx.fillText(d.date || "", CARD_W - padX, logoY + 46);
  ctx.textAlign = "left";

  // Hairline under header.
  ctx.strokeStyle = COL.hairline;
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(padX, 140);
  ctx.lineTo(CARD_W - padX, 140);
  ctx.stroke();

  // --- Hero: monthly figure ----------------------------------------------
  let y = 210;
  ctx.fillStyle = COL.secondary;
  ctx.font = `500 24px ${FONT}`;
  ctx.fillText(d.monthlyLabel, padX, y);

  y += 96;
  ctx.fillStyle = COL.accent;
  ctx.font = `700 116px ${FONT}`;
  ctx.fillText(d.monthly, padX, y);
  const monthlyW = ctx.measureText(d.monthly).width;
  ctx.fillStyle = COL.secondary;
  ctx.font = `500 30px ${FONT}`;
  ctx.fillText("/mo", padX + monthlyW + 16, y);

  y += 44;
  ctx.fillStyle = COL.secondary;
  ctx.font = `400 24px ${FONT}`;
  ctx.fillText(d.annual, padX, y);

  // --- Project estimate chip ---------------------------------------------
  const chipY = 396;
  const chipH = 96;
  const chipW = CARD_W - padX * 2;
  ctx.fillStyle = "rgba(255,255,255,0.72)";
  roundRect(ctx, padX, chipY, chipW, chipH, 20);
  ctx.fill();
  ctx.strokeStyle = COL.hairline;
  ctx.stroke();

  ctx.fillStyle = COL.tertiary;
  ctx.font = `600 18px ${FONT}`;
  ctx.fillText(String(d.projectLabel || "").toUpperCase(), padX + 28, chipY + 36);
  ctx.fillStyle = COL.text;
  ctx.font = `700 40px ${FONT}`;
  ctx.fillText(d.projectRange, padX + 28, chipY + 74);

  // --- Insight ------------------------------------------------------------
  if (d.insight) {
    const insY = 528;
    ctx.fillStyle = COL.accent;
    roundRect(ctx, padX, insY - 22, 5, 44, 2.5);
    ctx.fill();
    ctx.fillStyle = COL.secondary;
    ctx.font = `400 21px ${FONT}`;
    const lines = wrapText(ctx, d.insight, chipW - 40, 2);
    lines.forEach((ln, i) => ctx.fillText(ln, padX + 20, insY - 2 + i * 28));
  }

  // --- Footer -------------------------------------------------------------
  ctx.fillStyle = COL.tertiary;
  ctx.font = `500 18px ${FONT}`;
  ctx.fillText(d.footer, padX, CARD_H - 28);

  if (d.team) {
    ctx.textAlign = "right";
    ctx.fillStyle = COL.secondary;
    ctx.font = `500 18px ${FONT}`;
    const who = d.project ? `${d.team} · ${d.project}` : d.team;
    ctx.fillText(who, CARD_W - padX, CARD_H - 28);
    ctx.textAlign = "left";
  }

  return canvas;
}

// Converts a canvas to a PNG Blob.
export function canvasToBlob(canvas) {
  return new Promise((resolve) => canvas.toBlob(resolve, "image/png"));
}
