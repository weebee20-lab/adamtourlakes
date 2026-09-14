import { SAMPLE_PANEL_GAP, SAMPLE_PANEL_H, SAMPLE_PANEL_W } from "./panels";
import type { Cardinal, FaceId, HouseSize, RoofKind, RoofSpec, Rotation } from "./types";

export const PANEL_SETBACK_M = 0.92;
export const HIP_SETBACK_M = 0.305;

export const CARDINAL_LABEL: Record<Cardinal, string> = {
  N: "North",
  E: "East",
  S: "South",
  W: "West",
};

export function roofSpec(house: HouseSize, kind: RoofKind): RoofSpec {
  const base =
    house === "estate"
      ? { width: 18.29, depth: 15.24, wallH: 3.55, sqft: 3000 }
      : { width: 16.2, depth: 15.0, wallH: 3.2, sqft: 1600 };
  const pitch = 22;
  if (kind === "hip") {
    return {
      ...base,
      cols: house === "estate" ? 10 : 7,
      rows: house === "estate" ? 4 : 3,
      sideCols: house === "estate" ? 5 : 3,
      sideRows: house === "estate" ? 4 : 3,
      defaultPitch: pitch,
      faces: ["front", "back", "left", "right"],
    };
  }
  if (kind === "shed") {
    return {
      ...base,
      cols: house === "estate" ? 12 : 8,
      rows: house === "estate" ? 8 : 6,
      sideCols: 0,
      sideRows: 0,
      defaultPitch: 12,
      faces: ["front"],
    };
  }
  return {
    ...base,
    cols: house === "estate" ? 12 : 8,
    rows: house === "estate" ? 5 : 3,
    sideCols: 0,
    sideRows: 0,
    defaultPitch: pitch,
    faces: ["front", "back"],
  };
}

export function cellKey(face: FaceId, col: number, row: number) {
  return `${face}:${col}:${row}`;
}

export function parseCellKey(key: string): { face: FaceId; col: number; row: number } | null {
  const [face, c, r] = key.split(":");
  if (face !== "front" && face !== "back" && face !== "left" && face !== "right") return null;
  const col = Number(c);
  const row = Number(r);
  if (!Number.isFinite(col) || !Number.isFinite(row)) return null;
  return { face, col, row };
}

export type HipSlot = {
  key: string;
  face: FaceId;
  col: number;
  row: number;
  x0: number;
  y0: number;
  x1: number;
  y1: number;
};

const hipSlotCache = new Map<string, HipSlot[]>();
const rectCache = new Map<string, Array<{ key: string; x0: number; y0: number; x1: number; y1: number }>>();

function specCacheKey(spec: RoofSpec, extra: string) {
  return `${spec.width}|${spec.depth}|${spec.cols}|${spec.rows}|${spec.sideCols}|${spec.sideRows}|${spec.defaultPitch}|${spec.faces.join(",")}|${extra}`;
}

export function hipSlots(spec: RoofSpec): HipSlot[] {
  const cacheKey = specCacheKey(spec, "hip");
  const cached = hipSlotCache.get(cacheKey);
  if (cached) return cached;
  const W = spec.width;
  const D = spec.depth;
  const ridgeY = D / 2;
  const hipInset = Math.min(W, D) / 2;
  const sb = HIP_SETBACK_M;
  const hipClear = HIP_SETBACK_M;
  const panW = SAMPLE_PANEL_W;
  const panD = SAMPLE_PANEL_H * Math.cos((spec.defaultPitch * Math.PI) / 180);
  const gap = SAMPLE_PANEL_GAP;
  const out: HipSlot[] = [];

  const hipX = (y: number, fromSouth: boolean) => {
    const t = fromSouth ? (D - y) / Math.max(ridgeY, 0.01) : y / Math.max(ridgeY, 0.01);
    return hipInset * Math.max(0, Math.min(1, t));
  };

  const packX = (face: FaceId, yInner: number, yOuter: number, row: number, fromSouth: boolean) => {
    const left = Math.max(hipX(yInner, fromSouth), hipX(yOuter, fromSouth)) + hipClear;
    const right = W - Math.max(hipX(yInner, fromSouth), hipX(yOuter, fromSouth)) - hipClear;
    const n = Math.floor((right - left + gap) / (panW + gap));
    if (n <= 0) return false;
    const used = n * panW + (n - 1) * gap;
    let x = left + (right - left - used) / 2;
    const y0 = Math.min(yInner, yOuter);
    const y1 = Math.max(yInner, yOuter);
    for (let col = 0; col < n; col++) {
      out.push({
        key: cellKey(face, col, row),
        face,
        col,
        row,
        x0: x,
        y0,
        x1: x + panW,
        y1,
      });
      x += panW + gap;
    }
    return true;
  };

  let row = 0;
  for (let yOuter = D - sb, inner = yOuter - panD; inner >= ridgeY + sb; yOuter = inner - gap, inner = yOuter - panD, row++) {
    if (!packX("front", inner, yOuter, row, true)) break;
  }

  row = 0;
  for (let yInner = sb, outer = yInner + panD; outer <= ridgeY - sb; yInner = outer + gap, outer = yInner + panD, row++) {
    if (!packX("back", yInner, outer, row, false)) break;
  }

  const packY = (face: "left" | "right", xInner: number, xOuter: number, row: number) => {
    const dist = face === "left" ? Math.max(xInner, xOuter) : Math.max(W - xInner, W - xOuter);
    const yHalf = ridgeY * (1 - dist / Math.max(hipInset, 0.01));
    const yLo = ridgeY - yHalf + hipClear;
    const yHi = ridgeY + yHalf - hipClear;
    const n = Math.floor((yHi - yLo + gap) / (panW + gap));
    if (n <= 0) return false;
    const used = n * panW + (n - 1) * gap;
    let y = yLo + (yHi - yLo - used) / 2;
    const x0 = Math.min(xInner, xOuter);
    const x1 = Math.max(xInner, xOuter);
    for (let col = 0; col < n; col++) {
      out.push({
        key: cellKey(face, col, row),
        face,
        col,
        row,
        x0,
        y0: y,
        x1,
        y1: y + panW,
      });
      y += panW + gap;
    }
    return true;
  };

  row = 0;
  for (let xOuter = sb, inner = xOuter + panD; inner <= hipInset - sb; xOuter = inner + gap, inner = xOuter + panD, row++) {
    if (!packY("left", inner, xOuter, row)) break;
  }
  row = 0;
  for (let xOuter = W - sb, inner = xOuter - panD; inner >= W - hipInset + sb; xOuter = inner - gap, inner = xOuter - panD, row++) {
    if (!packY("right", inner, xOuter, row)) break;
  }

  hipSlotCache.set(cacheKey, out);
  return out;
}

function planeSlots(spec: RoofSpec, kind: Exclude<RoofKind, "hip">): HipSlot[] {
  const W = spec.width;
  const D = spec.depth;
  const sb = PANEL_SETBACK_M;
  const panW = SAMPLE_PANEL_W;
  const panD = SAMPLE_PANEL_H * Math.cos((spec.defaultPitch * Math.PI) / 180);
  const gap = SAMPLE_PANEL_GAP;
  const ridgeY = kind === "shed" ? 0 : D / 2;
  const out: HipSlot[] = [];

  const packFace = (face: FaceId, yOuterStart: number, yLimit: number, towardRidge: number) => {
    let row = 0;
    let yOuter = yOuterStart;
    while (row < 12) {
      const yInner = yOuter + towardRidge * panD;
      const past = towardRidge < 0 ? yInner < yLimit : yInner > yLimit;
      if (past) break;
      const left = sb;
      const right = W - sb;
      const n = Math.floor((right - left + gap) / (panW + gap));
      if (n <= 0) break;
      const used = n * panW + (n - 1) * gap;
      let x = left + (right - left - used) / 2;
      const y0 = Math.min(yInner, yOuter);
      const y1 = Math.max(yInner, yOuter);
      for (let col = 0; col < n; col++) {
        out.push({
          key: cellKey(face, col, row),
          face,
          col,
          row,
          x0: x,
          y0,
          x1: x + panW,
          y1,
        });
        x += panW + gap;
      }
      yOuter = yInner + towardRidge * gap;
      row += 1;
    }
  };

  if (kind === "shed") packFace("front", D - sb, sb, -1);
  else {
    packFace("front", D - sb, ridgeY + sb, -1);
    packFace("back", sb, ridgeY - sb, 1);
  }
  return out;
}

export function planeSlotsFor(spec: RoofSpec, kind: RoofKind): HipSlot[] {
  return kind === "hip" ? hipSlots(spec) : planeSlots(spec, kind);
}

export function chimneyFootprint(spec: RoofSpec, kind: RoofKind) {
  const W = spec.width;
  const D = spec.depth;
  const ridgeY = kind === "shed" ? 0 : D / 2;
  if (kind === "shed") return { x: W * 0.72, y: 0.55, w: 0.55, d: 0.55 };
  return { x: W * 0.72, y: Math.max(0.18, ridgeY - 1.35), w: 0.75, d: 0.9 };
}

function gridRects(spec: RoofSpec, kind: RoofKind): Array<{ key: string; x0: number; y0: number; x1: number; y1: number }> {
  const cacheKey = specCacheKey(spec, kind);
  const cached = rectCache.get(cacheKey);
  if (cached) return cached;
  const mapped = planeSlotsFor(spec, kind).map((s) => ({ key: s.key, x0: s.x0, y0: s.y0, x1: s.x1, y1: s.y1 }));
  rectCache.set(cacheKey, mapped);
  return mapped;
}

export function obstacleKeys(spec: RoofSpec, kind: RoofKind, chimneyOn = true): Set<string> {
  const blocked = new Set<string>();
  if (!chimneyOn) return blocked;
  const ch = chimneyFootprint(spec, kind);
  const pad = 0.1;
  const x = ch.x - pad;
  const y = ch.y - pad;
  const x2 = ch.x + ch.w + pad;
  const y2 = ch.y + ch.d + pad;
  for (const slot of gridRects(spec, kind)) {
    if (slot.x0 < x2 && slot.x1 > x && slot.y0 < y2 && slot.y1 > y) blocked.add(slot.key);
  }
  return blocked;
}

export function canPlacePanel(
  key: string,
  cells: Record<string, boolean>,
  spec: RoofSpec,
  kind: RoofKind,
): boolean {
  const placed = Object.keys(cells).filter((k) => cells[k]);
  if (!placed.length) return true;
  const parsed = parseCellKey(key);
  if (!parsed) return false;
  const prefix = `${parsed.face}:`;
  const faceHas = placed.some((k) => k.startsWith(prefix));
  if (!faceHas) return true;
  const rects = gridRects(spec, kind);
  const me = rects.find((r) => r.key === key);
  if (!me) return false;
  const pad = SAMPLE_PANEL_GAP * 2.8;
  return rects.some((r) => {
    if (!cells[r.key] || r.key === key || !r.key.startsWith(prefix)) return false;
    const xTouch = Math.abs(r.x1 - me.x0) <= pad || Math.abs(me.x1 - r.x0) <= pad;
    const yTouch = Math.abs(r.y1 - me.y0) <= pad || Math.abs(me.y1 - r.y0) <= pad;
    const xOver = r.x0 < me.x1 + pad && r.x1 > me.x0 - pad;
    const yOver = r.y0 < me.y1 + pad && r.y1 > me.y0 - pad;
    return (xTouch && yOver) || (yTouch && xOver);
  });
}

export function allCellKeys(spec: RoofSpec): string[] {
  const kind: RoofKind = spec.faces.includes("left") ? "hip" : spec.faces.length === 1 ? "shed" : "gable";
  return gridRects(spec, kind).map((s) => s.key);
}

export function faceCardinal(face: FaceId, rotation: Rotation): Cardinal {
  const order: Cardinal[] = ["S", "W", "N", "E"];
  const steps = rotation / 90;
  const at = (n: number) => order[((steps + n) % 4 + 4) % 4]!;
  if (face === "front") return at(0);
  if (face === "left") return at(1);
  if (face === "back") return at(2);
  return at(3);
}

export function seedCells(house: HouseSize, kind: RoofKind): Record<string, boolean> {
  const spec = roofSpec(house, kind);
  const blocked = obstacleKeys(spec, kind, true);
  const keys = allCellKeys(spec).filter((k) => k.startsWith("front:") && !blocked.has(k));
  const take = Math.min(house === "estate" ? 16 : 10, keys.length);
  const out: Record<string, boolean> = {};
  for (const k of keys.slice(0, take)) out[k] = true;
  return out;
}
