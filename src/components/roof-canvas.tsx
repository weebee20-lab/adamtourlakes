import { Eraser, RotateCcw, RotateCw } from "lucide-react";
import { useCallback, useEffect, useId, useMemo, useRef, useState, type ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { PANEL_EFFICIENCY, PANEL_TEMP_COEFF, WATTAGE_MAX, WATTAGE_MIN } from "@/lib/solar/panels";
import {
  CARDINAL_LABEL,
  canPlacePanel,
  chimneyFootprint,
  faceCardinal,
  planeSlotsFor,
  obstacleKeys,
  roofSpec,
} from "@/lib/solar/roof";
import type { FaceId, HouseSize, RoofKind, Rotation } from "@/lib/solar/types";
import { cn, formatKwh, formatNumber } from "@/lib/utils";
import { useDesigner, useSavings } from "@/store/designer";

const TW = 40;
const TH = 20;
const VIEW_W = 860;
const VIEW_H = 560;

type Pt = { x: number; y: number };

function iso(x: number, y: number, z: number): Pt {
  return { x: (x - y) * (TW / 2), y: (x + y) * (TH / 2) - z * TH };
}
function poly(points: Pt[]) {
  return points.map((p) => `${p.x.toFixed(2)},${p.y.toFixed(2)}`).join(" ");
}
function lerp(a: Pt, b: Pt, t: number): Pt {
  return { x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t };
}
function closedCurve(pts: Pt[]): string {
  const n = pts.length;
  if (n < 3) return "";
  const at = (i: number) => pts[(i + n) % n]!;
  let d = `M ${at(0).x.toFixed(2)} ${at(0).y.toFixed(2)}`;
  for (let i = 0; i < n; i++) {
    const p0 = at(i - 1);
    const p1 = at(i);
    const p2 = at(i + 1);
    const p3 = at(i + 2);
    d += ` C ${(p1.x + (p2.x - p0.x) / 6).toFixed(2)} ${(p1.y + (p2.y - p0.y) / 6).toFixed(2)} ${(p2.x - (p3.x - p1.x) / 6).toFixed(2)} ${(p2.y - (p3.y - p1.y) / 6).toFixed(2)} ${p2.x.toFixed(2)} ${p2.y.toFixed(2)}`;
  }
  return `${d} Z`;
}

const HOUSE_SIZES: { id: HouseSize; label: string }[] = [
  { id: "family", label: "Family" },
  { id: "estate", label: "Estate" },
];
const ROOF_KINDS: { id: RoofKind; label: string }[] = [
  { id: "gable", label: "Gable" },
  { id: "hip", label: "Hip" },
  { id: "shed", label: "Shed" },
];

const GRASS_TUFTS = Array.from({ length: 28 }, (_, i) => ({
  x: 40 + ((i * 97) % 780),
  y: 50 + ((i * 53) % 470),
  s: 14 + (i % 5) * 3,
  seed: i,
}));

function grassSquiggle(t: { x: number; y: number; s: number; seed: number }) {
  const waves = 3 + (t.seed % 2);
  const amp = 2.4 + (t.seed % 4) * 0.55;
  const w = t.s * 1.55;
  const parts: string[] = [`M ${t.x.toFixed(1)} ${t.y.toFixed(1)}`];
  for (let k = 1; k <= waves * 2; k++) {
    const px = t.x + (w * k) / (waves * 2);
    const lift = k % 2 === 0 ? amp : -amp;
    const cx = t.x + (w * (k - 0.5)) / (waves * 2);
    parts.push(`Q ${cx.toFixed(1)} ${(t.y + lift).toFixed(1)} ${px.toFixed(1)} ${t.y.toFixed(1)}`);
  }
  return parts.join(" ");
}

function Seg({ children }: { children: ReactNode }) {
  return <div className="flex rounded-lg bg-surface-2 p-0.5 ring-1 ring-border">{children}</div>;
}
function SegBtn({ on, onClick, children }: { on: boolean; onClick: () => void; children: ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "rounded-md px-3 py-1.5 text-xs font-semibold transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        on ? "bg-gold text-gold-fg" : "text-muted hover:text-fg",
      )}
      aria-pressed={on}
    >
      {children}
    </button>
  );
}

export function RoofCanvas() {
  const house = useDesigner((s) => s.house);
  const setHouse = useDesigner((s) => s.setHouse);
  const roof = useDesigner((s) => s.roof);
  const setRoof = useDesigner((s) => s.setRoof);
  const rotation = useDesigner((s) => s.rotation);
  const rotate = useDesigner((s) => s.rotate);
  const pitch = useDesigner((s) => s.pitch);
  const cells = useDesigner((s) => s.cells);
  const setCell = useDesigner((s) => s.setCell);
  const hoverKey = useDesigner((s) => s.hoverKey);
  const setHover = useDesigner((s) => s.setHover);
  const wattage = useDesigner((s) => s.wattage);
  const setWattage = useDesigner((s) => s.setWattage);
  const clearRoof = useDesigner((s) => s.clearRoof);
  const chimneyOn = useDesigner((s) => s.chimney);
  const setChimney = useDesigner((s) => s.setChimney);
  const savings = useSavings();
  const spec = useMemo(() => roofSpec(house, roof), [house, roof]);
  const blocked = useMemo(() => obstacleKeys(spec, roof, chimneyOn), [spec, roof, chimneyOn]);
  const paintRef = useRef<boolean | null>(null);
  const pointerIdRef = useRef<number | null>(null);
  const wattageLabelId = useId();

  useEffect(() => {
    const endPaint = () => {
      paintRef.current = null;
      const id = pointerIdRef.current;
      const svg = svgRef.current;
      if (id != null && svg) {
        try {
          if (svg.hasPointerCapture(id)) svg.releasePointerCapture(id);
        } catch {
          /* already released */
        }
      }
      pointerIdRef.current = null;
    };
    window.addEventListener("pointerup", endPaint);
    window.addEventListener("pointercancel", endPaint);
    window.addEventListener("blur", endPaint);
    return () => {
      window.removeEventListener("pointerup", endPaint);
      window.removeEventListener("pointercancel", endPaint);
      window.removeEventListener("blur", endPaint);
    };
  }, []);
  const svgRef = useRef<SVGSVGElement>(null);
  const [hint, setHint] = useState<{ x: number; y: number } | null>(null);
  const hintTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(
    () => () => {
      if (hintTimer.current) clearTimeout(hintTimer.current);
    },
    [],
  );

  const model = useMemo(() => {
    const W = spec.width;
    const D = spec.depth;
    const wallH = spec.wallH;
    const ridgeY = roof === "shed" ? 0 : D / 2;
    const hipInset = Math.min(W, D) / 2;
    const rise = Math.tan((pitch * Math.PI) / 180) * (roof === "shed" ? D : D / 2);
    const zAt = (x: number, y: number) => {
      if (roof === "shed") return wallH + rise * (1 - y / D);
      if (roof === "hip") {
        const t = Math.min(x, W - x, y, D - y) / Math.max(hipInset, 0.01);
        return wallH + rise * Math.min(1, Math.max(0, t));
      }
      if (y <= ridgeY) return wallH + (rise * y) / ridgeY;
      return wallH + rise * (1 - (y - ridgeY) / (D - ridgeY));
    };

    const eastWall =
      roof === "shed"
        ? [iso(W, 0, 0), iso(W, D, 0), iso(W, D, wallH), iso(W, 0, wallH + rise)]
        : [iso(W, 0, 0), iso(W, D, 0), iso(W, D, wallH), iso(W, 0, wallH)];
    const southWall = [iso(0, D, 0), iso(W, D, 0), iso(W, D, wallH), iso(0, D, wallH)];
    const westWall =
      roof === "shed"
        ? [iso(0, 0, 0), iso(0, D, 0), iso(0, D, wallH), iso(0, 0, wallH + rise)]
        : [iso(0, 0, 0), iso(0, D, 0), iso(0, D, wallH), iso(0, 0, wallH)];
    const eastGable =
      roof === "gable"
        ? [iso(W, 0, wallH), iso(W, D, wallH), iso(W, ridgeY, wallH + rise)]
        : roof === "shed"
          ? [iso(W, D, wallH), iso(W, 0, wallH), iso(W, 0, wallH + rise)]
          : [];
    const westGable =
      roof === "gable"
        ? [iso(0, 0, wallH), iso(0, D, wallH), iso(0, ridgeY, wallH + rise)]
        : roof === "shed"
          ? [iso(0, D, wallH), iso(0, 0, wallH), iso(0, 0, wallH + rise)]
          : [];
    const roofFront =
      roof === "hip"
        ? [iso(0, D, wallH), iso(W, D, wallH), iso(W - hipInset, ridgeY, wallH + rise), iso(hipInset, ridgeY, wallH + rise)]
        : roof === "shed"
          ? [iso(0, D, wallH), iso(W, D, wallH), iso(W, 0, wallH + rise), iso(0, 0, wallH + rise)]
          : [iso(0, D, wallH), iso(W, D, wallH), iso(W, ridgeY, wallH + rise), iso(0, ridgeY, wallH + rise)];
    const roofBack =
      roof === "shed"
        ? []
        : roof === "hip"
          ? [iso(0, 0, wallH), iso(W, 0, wallH), iso(W - hipInset, ridgeY, wallH + rise), iso(hipInset, ridgeY, wallH + rise)]
          : [iso(0, 0, wallH), iso(W, 0, wallH), iso(W, ridgeY, wallH + rise), iso(0, ridgeY, wallH + rise)];
    const roofLeft =
      roof === "hip" ? [iso(0, 0, wallH), iso(0, D, wallH), iso(hipInset, ridgeY, wallH + rise)] : [];
    const roofRight =
      roof === "hip" ? [iso(W, 0, wallH), iso(W, D, wallH), iso(W - hipInset, ridgeY, wallH + rise)] : [];

    const lawn: Pt[] = [];
    const n = 32;
    const padX = W * 0.58 + 2.4;
    const padY = D * 0.58 + 2.8;
    for (let i = 0; i < n; i++) {
      const a = (i / n) * Math.PI * 2;
      const wobble = 1 + 0.1 * Math.sin(a * 2.2 + 0.4) + 0.06 * Math.cos(a * 3.7);
      lawn.push(
        iso(
          W / 2 + Math.cos(a) * padX * wobble,
          D / 2 + 0.35 + Math.sin(a) * padY * wobble,
          0,
        ),
      );
    }
    const lawnPath = closedCurve(lawn);
    const ground = [iso(-0.35, -0.35, 0), iso(W + 0.55, -0.35, 0), iso(W + 0.55, D + 0.7, 0), iso(-0.35, D + 0.7, 0)];

    type CellDraw = {
      key: string;
      face: FaceId;
      pts: Pt[];
      wx: number;
      wy: number;
      x0: number;
      y0: number;
      x1: number;
      y1: number;
      blocked: boolean;
      order: number;
    };
    const cellDraws: CellDraw[] = [];
    for (const slot of planeSlotsFor(spec, roof)) {
      const z0 = zAt(slot.x0, slot.y0);
      const z1 = zAt(slot.x1, slot.y1);
      cellDraws.push({
        key: slot.key,
        face: slot.face,
        pts: [
          iso(slot.x0, slot.y0, zAt(slot.x0, slot.y0) + 0.04),
          iso(slot.x1, slot.y0, zAt(slot.x1, slot.y0) + 0.04),
          iso(slot.x1, slot.y1, zAt(slot.x1, slot.y1) + 0.04),
          iso(slot.x0, slot.y1, zAt(slot.x0, slot.y1) + 0.04),
        ],
        wx: (slot.x0 + slot.x1) / 2,
        wy: (slot.y0 + slot.y1) / 2,
        x0: slot.x0,
        y0: slot.y0,
        x1: slot.x1,
        y1: slot.y1,
        blocked: blocked.has(slot.key),
        order: z0 + z1,
      });
    }

    const doorW = 1.15;
    const doorH = 2.15;
    const doorX = W / 2 - doorW / 2;
    const door = [
      iso(doorX, D, 0.08),
      iso(doorX + doorW, D, 0.08),
      iso(doorX + doorW, D, doorH),
      iso(doorX, D, doorH),
    ];
    const doorInset = [
      iso(doorX + 0.12, D + 0.01, 0.28),
      iso(doorX + doorW - 0.12, D + 0.01, 0.28),
      iso(doorX + doorW - 0.12, D + 0.01, doorH - 0.18),
      iso(doorX + 0.12, D + 0.01, doorH - 0.18),
    ];
    const doorHandle = [
      iso(doorX + doorW - 0.22, D + 0.04, 1.08),
      iso(doorX + doorW - 0.12, D + 0.04, 1.08),
      iso(doorX + doorW - 0.12, D + 0.04, 1.2),
      iso(doorX + doorW - 0.22, D + 0.04, 1.2),
    ];
    const transom = [
      iso(doorX, D, doorH + 0.06),
      iso(doorX + doorW, D, doorH + 0.06),
      iso(doorX + doorW, D, doorH + 0.38),
      iso(doorX, D, doorH + 0.38),
    ];
    const windowAt = (x: number, y = D, z = 1.18, w = 0.9, h = 1.0) => {
      const frame = [iso(x, y, z), iso(x + w, y, z), iso(x + w, y, z + h), iso(x, y, z + h)];
      const glass = [
        iso(x + 0.06, y + 0.01, z + 0.08),
        iso(x + w - 0.06, y + 0.01, z + 0.08),
        iso(x + w - 0.06, y + 0.01, z + h - 0.08),
        iso(x + 0.06, y + 0.01, z + h - 0.08),
      ];
      const vbar = [
        iso(x + w / 2 - 0.03, y + 0.02, z + 0.08),
        iso(x + w / 2 + 0.03, y + 0.02, z + 0.08),
        iso(x + w / 2 + 0.03, y + 0.02, z + h - 0.08),
        iso(x + w / 2 - 0.03, y + 0.02, z + h - 0.08),
      ];
      const hbar = [
        iso(x + 0.06, y + 0.02, z + h / 2 - 0.03),
        iso(x + w - 0.06, y + 0.02, z + h / 2 - 0.03),
        iso(x + w - 0.06, y + 0.02, z + h / 2 + 0.03),
        iso(x + 0.06, y + 0.02, z + h / 2 + 0.03),
      ];
      const sill = [
        iso(x - 0.06, y + 0.05, z - 0.06),
        iso(x + w + 0.06, y + 0.05, z - 0.06),
        iso(x + w + 0.04, y + 0.05, z + 0.05),
        iso(x - 0.04, y + 0.05, z + 0.05),
      ];
      const shutter = (side: -1 | 1) => {
        const sx = side < 0 ? x - 0.28 : x + w + 0.04;
        return [iso(sx, y + 0.02, z), iso(sx + 0.24, y + 0.02, z), iso(sx + 0.24, y + 0.02, z + h), iso(sx, y + 0.02, z + h)];
      };
      return { frame, glass, vbar, hbar, sill, shutters: [shutter(-1), shutter(1)] };
    };
    const frontWindows = [windowAt(doorX - 1.45), windowAt(doorX + doorW + 0.55)];
    const eastWindow = (() => {
      const y0 = D * 0.38;
      const y1 = D * 0.38 + 0.9;
      const z = 1.15;
      const h = 0.95;
      const x = W;
      return {
        frame: [iso(x, y0, z), iso(x, y1, z), iso(x, y1, z + h), iso(x, y0, z + h)],
        glass: [
          iso(x + 0.02, y0 + 0.08, z + 0.08),
          iso(x + 0.02, y1 - 0.08, z + 0.08),
          iso(x + 0.02, y1 - 0.08, z + h - 0.08),
          iso(x + 0.02, y0 + 0.08, z + h - 0.08),
        ],
        vbar: [
          iso(x + 0.03, (y0 + y1) / 2 - 0.03, z + 0.08),
          iso(x + 0.03, (y0 + y1) / 2 + 0.03, z + 0.08),
          iso(x + 0.03, (y0 + y1) / 2 + 0.03, z + h - 0.08),
          iso(x + 0.03, (y0 + y1) / 2 - 0.03, z + h - 0.08),
        ],
      };
    })();

    const siding: Array<[Pt, Pt]> = [];
    for (let z = 0.42; z < wallH - 0.15; z += 0.38) {
      siding.push([iso(0.12, D, z), iso(W - 0.12, D, z)]);
    }
    const stoop = [
      iso(doorX - 0.35, D + 0.08, 0),
      iso(doorX + doorW + 0.35, D + 0.08, 0),
      iso(doorX + doorW + 0.28, D + 0.72, 0.08),
      iso(doorX - 0.28, D + 0.72, 0.08),
    ];
    const step = [
      iso(doorX - 0.22, D + 0.72, 0),
      iso(doorX + doorW + 0.22, D + 0.72, 0),
      iso(doorX + doorW + 0.16, D + 1.15, 0.04),
      iso(doorX - 0.16, D + 1.15, 0.04),
    ];
    const walk = [
      iso(doorX - 0.12, D + 1.12, 0.01),
      iso(doorX + doorW + 0.12, D + 1.12, 0.01),
      iso(doorX + doorW + 0.22, D + 2.4, 0.01),
      iso(doorX - 0.22, D + 2.4, 0.01),
    ];
    const gutter = [iso(0, D, wallH + 0.02), iso(W, D, wallH + 0.02)];
    const downspout: Pt[] = [
      iso(W - 0.08, D, wallH),
      iso(W - 0.08, D, 0.12),
      iso(W + 0.06, D, 0.12),
    ];
    const porchLight = [
      iso(doorX + doorW / 2 - 0.08, D + 0.04, doorH + 0.48),
      iso(doorX + doorW / 2 + 0.08, D + 0.04, doorH + 0.48),
      iso(doorX + doorW / 2 + 0.1, D + 0.04, doorH + 0.68),
      iso(doorX + doorW / 2 - 0.1, D + 0.04, doorH + 0.68),
    ];
    const gableVent =
      roof === "gable"
        ? [
            iso(W, ridgeY - 0.28, wallH + rise * 0.42),
            iso(W, ridgeY + 0.28, wallH + rise * 0.42),
            iso(W, ridgeY, wallH + rise * 0.62),
          ]
        : [];
    const fascia = roof === "shed" ? [iso(0, D, wallH), iso(W, D, wallH)] : [iso(0, D, wallH), iso(W, D, wallH)];

    const bushLobe = (x: number, y: number, rx: number, ry: number, z: number): Pt[] =>
      Array.from({ length: 10 }, (_, i) => {
        const a = (i / 10) * Math.PI * 2;
        return iso(x + Math.cos(a) * rx, y + Math.sin(a) * ry, z + Math.sin(a) * 0.04);
      });
    const bushes: { pts: Pt[]; fill: string }[] = [];
    const plant = (x: number, y: number, s: number) => {
      bushes.push({ pts: bushLobe(x, y + 0.04, 0.72 * s, 0.5 * s, 0.12), fill: "#163214" });
      bushes.push({ pts: bushLobe(x - 0.28 * s, y, 0.55 * s, 0.4 * s, 0.42 * s), fill: "#1f3f1a" });
      bushes.push({ pts: bushLobe(x + 0.3 * s, y + 0.08, 0.5 * s, 0.38 * s, 0.5 * s), fill: "#274b1e" });
    };
    plant(1.15, D + 0.55, 1.15);
    plant(W * 0.28, D + 0.42, 0.78);

    const mx = W + 0.04;
    const my = D * 0.71;
    const mw = 0.22;
    const md = 0.42;
    const mz = 0.78;
    const mh = 0.7;
    const cym = my + md / 2;
    const czm = mz + mh * 0.52;
    const faceX = mx + mw;
    const faceCircle = (x: number, ry: number, rz: number, n = 20): Pt[] =>
      Array.from({ length: n }, (_, i) => {
        const a = (i / n) * Math.PI * 2;
        return iso(x, cym + Math.cos(a) * ry, czm + Math.sin(a) * rz);
      });
    const meter = {
      south: [iso(mx, my + md, mz), iso(mx + mw, my + md, mz), iso(mx + mw, my + md, mz + mh), iso(mx, my + md, mz + mh)],
      east: [iso(mx + mw, my, mz), iso(mx + mw, my + md, mz), iso(mx + mw, my + md, mz + mh), iso(mx + mw, my, mz + mh)],
      top: [iso(mx, my, mz + mh), iso(mx + mw, my, mz + mh), iso(mx + mw, my + md, mz + mh), iso(mx, my + md, mz + mh)],
      glassBack: faceCircle(faceX + 0.02, 0.2, 0.2),
      glassFront: faceCircle(faceX + 0.18, 0.2, 0.2),
      dial: faceCircle(faceX + 0.19, 0.155, 0.155),
      lcd: [
        iso(faceX + 0.2, cym - 0.09, czm + 0.04),
        iso(faceX + 0.2, cym + 0.09, czm + 0.04),
        iso(faceX + 0.2, cym + 0.09, czm + 0.1),
        iso(faceX + 0.2, cym - 0.09, czm + 0.1),
      ],
      seal: [iso(faceX + 0.03, cym - 0.04, mz + 0.08), iso(faceX + 0.03, cym + 0.04, mz + 0.08), iso(faceX + 0.03, cym, mz + 0.02)],
      conduit: [iso(mx + mw * 0.3, cym - 0.07, 0), iso(mx + mw * 0.3, cym + 0.07, 0), iso(mx + mw * 0.3, cym + 0.07, mz), iso(mx + mw * 0.3, cym - 0.07, mz)],
    };

    const chimneyBase = chimneyOn ? chimneyFootprint(spec, roof) : { x: 0, y: 0, w: 0, d: 0 };
    const cz = zAt(chimneyBase.x + chimneyBase.w / 2, chimneyBase.y + chimneyBase.d / 2) + 0.15;
    const ch = roof === "shed" ? 0.9 : 1.35;
    const chimney = {
      top: [
        iso(chimneyBase.x, chimneyBase.y, cz + ch),
        iso(chimneyBase.x + chimneyBase.w, chimneyBase.y, cz + ch),
        iso(chimneyBase.x + chimneyBase.w, chimneyBase.y + chimneyBase.d, cz + ch),
        iso(chimneyBase.x, chimneyBase.y + chimneyBase.d, cz + ch),
      ],
      south: [
        iso(chimneyBase.x, chimneyBase.y + chimneyBase.d, cz),
        iso(chimneyBase.x + chimneyBase.w, chimneyBase.y + chimneyBase.d, cz),
        iso(chimneyBase.x + chimneyBase.w, chimneyBase.y + chimneyBase.d, cz + ch),
        iso(chimneyBase.x, chimneyBase.y + chimneyBase.d, cz + ch),
      ],
      east: [
        iso(chimneyBase.x + chimneyBase.w, chimneyBase.y, cz),
        iso(chimneyBase.x + chimneyBase.w, chimneyBase.y + chimneyBase.d, cz),
        iso(chimneyBase.x + chimneyBase.w, chimneyBase.y + chimneyBase.d, cz + ch),
        iso(chimneyBase.x + chimneyBase.w, chimneyBase.y, cz + ch),
      ],
      crown: [
        iso(chimneyBase.x - 0.06, chimneyBase.y - 0.06, cz + ch),
        iso(chimneyBase.x + chimneyBase.w + 0.06, chimneyBase.y - 0.06, cz + ch),
        iso(chimneyBase.x + chimneyBase.w + 0.06, chimneyBase.y + chimneyBase.d + 0.06, cz + ch),
        iso(chimneyBase.x - 0.06, chimneyBase.y + chimneyBase.d + 0.06, cz + ch),
      ],
    };
    const ridge: Pt[] =
      roof === "shed"
        ? [iso(0, 0, zAt(0, 0)), iso(W, 0, zAt(W, 0))]
        : roof === "hip"
          ? [iso(hipInset, ridgeY, zAt(hipInset, ridgeY)), iso(W - hipInset, ridgeY, zAt(W - hipInset, ridgeY))]
          : [iso(0, ridgeY, zAt(0, ridgeY)), iso(W, ridgeY, zAt(W, ridgeY))];

    const allPts = [
      ...eastWall,
      ...westWall,
      ...southWall,
      ...eastGable,
      ...westGable,
      ...roofFront,
      ...roofBack,
      ...roofLeft,
      ...roofRight,
      ...meter.east,
      ...meter.south,
      ...meter.top,
    ];
    const xs = allPts.map((p) => p.x);
    const ys = allPts.map((p) => p.y);
    const minX = Math.min(...xs);
    const maxX = Math.max(...xs);
    const minY = Math.min(...ys);
    const maxY = Math.max(...ys);
    const pad = 36;
    const scale = Math.min((VIEW_W - pad * 2) / (maxX - minX), (VIEW_H - pad * 2) / (maxY - minY)) * 0.96;
    const ox = VIEW_W / 2 - ((minX + maxX) / 2) * scale;
    const oy = VIEW_H / 2 - ((minY + maxY) / 2) * scale + 18;

    return {
      cellDraws: [...cellDraws].sort((a, b) => a.order - b.order),
      eastWall,
      eastGable,
      westGable,
      southWall,
      westWall,
      roofBack,
      roofFront,
      roofLeft,
      roofRight,
      lawnPath,
      ground,
      bushes,
      door,
      doorInset,
      doorHandle,
      transom,
      frontWindows,
      eastWindow,
      siding,
      stoop,
      step,
      walk,
      gutter,
      downspout,
      porchLight,
      gableVent,
      fascia,
      chimney,
      meter,
      layout: { W, D, wallH, ridgeY, hipInset, rise, roof, meterX: W + 0.14, meterY: cym, meterZ: mz + mh },
      ridge,
      scale,
      ox,
      oy,
    };
  }, [spec, roof, pitch, blocked, chimneyOn]);

  const wiring = useMemo(() => {
    const { W, D, wallH, ridgeY, hipInset, rise, roof: kind, meterX, meterY, meterZ } = model.layout;
    const zAt = (x: number, y: number) => {
      if (kind === "shed") return wallH + rise * (1 - y / D);
      if (kind === "hip") {
        const t = Math.min(x, W - x, y, D - y) / Math.max(hipInset, 0.01);
        return wallH + rise * Math.min(1, Math.max(0, t));
      }
      if (y <= ridgeY) return wallH + (rise * y) / ridgeY;
      return wallH + rise * (1 - (y - ridgeY) / (D - ridgeY));
    };
    const placed = model.cellDraws.filter((c) => cells[c.key] && !c.blocked);
    if (!placed.length) return { feedPath: "", linkPaths: [] as string[] };
    const toIsoPath = (world: Array<{ x: number; y: number }>) => {
      const pts: Pt[] = [];
      for (const p of world) {
        const q = iso(p.x, p.y, zAt(p.x, p.y) + 0.08);
        const prev = pts[pts.length - 1];
        if (prev && Math.hypot(prev.x - q.x, prev.y - q.y) < 0.04) continue;
        pts.push(q);
      }
      if (pts.length < 2) return "";
      return pts.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x.toFixed(2)} ${p.y.toFixed(2)}`).join(" ");
    };
    const edgeOf = (
      c: { wx: number; wy: number; x0: number; y0: number; x1: number; y1: number },
      tx: number,
      ty: number,
    ) => {
      const dx = tx - c.wx;
      const dy = ty - c.wy;
      const hw = (c.x1 - c.x0) / 2;
      const hh = (c.y1 - c.y0) / 2;
      if (Math.abs(dx) < 1e-6 && Math.abs(dy) < 1e-6) return { x: c.wx, y: c.wy };
      const sx = dx === 0 ? Number.POSITIVE_INFINITY : hw / Math.abs(dx);
      const sy = dy === 0 ? Number.POSITIVE_INFINITY : hh / Math.abs(dy);
      const t = Math.min(sx, sy) * 1.04;
      return { x: c.wx + dx * t, y: c.wy + dy * t };
    };
    const byFace = new Map<FaceId, typeof placed>();
    for (const c of placed) {
      const list = byFace.get(c.face) ?? [];
      list.push(c);
      byFace.set(c.face, list);
    }
    const distMeter = (x: number, y: number) => (x - meterX) ** 2 + (y - meterY) ** 2;
    const faceDist = (face: FaceId) => {
      let best = Number.POSITIVE_INFINITY;
      for (const c of byFace.get(face) ?? []) best = Math.min(best, distMeter(c.wx, c.wy));
      return best;
    };
    const ranked = [...byFace.keys()].sort((a, b) => faceDist(b) - faceDist(a));
    const linkPaths: string[] = [];
    for (let i = 0; i < ranked.length - 1; i++) {
      const farFace = ranked[i]!;
      const nearFace = ranked[i + 1]!;
      const farGroup = byFace.get(farFace)!;
      const nearGroup = byFace.get(nearFace)!;
      let best = Number.POSITIVE_INFINITY;
      let farCell = farGroup[0]!;
      let nearCell = nearGroup[0]!;
      for (const a of farGroup) {
        for (const b of nearGroup) {
          const dist = (a.wx - b.wx) ** 2 + (a.wy - b.wy) ** 2;
          if (dist < best) {
            best = dist;
            farCell = a;
            nearCell = b;
          }
        }
      }
      const d = toIsoPath([edgeOf(farCell, nearCell.wx, nearCell.wy), edgeOf(nearCell, farCell.wx, farCell.wy)]);
      if (d) linkPaths.push(d);
    }
    let hub = placed[0]!;
    let nearest = Number.POSITIVE_INFINITY;
    for (const c of placed) {
      const dist = (c.wx - meterX) ** 2 + (c.wy - meterY) ** 2;
      if (dist < nearest) {
        nearest = dist;
        hub = c;
      }
    }
    const start = edgeOf(hub, meterX, meterY);
    const feedPath = [
      iso(start.x, start.y, zAt(start.x, start.y) + 0.08),
      iso(meterX, start.y, zAt(meterX, start.y) + 0.08),
      iso(meterX, start.y, wallH + 0.08),
      iso(meterX, meterY, wallH + 0.06),
      iso(meterX, meterY, meterZ + 0.02),
    ]
      .map((p, i) => `${i === 0 ? "M" : "L"} ${p.x.toFixed(2)} ${p.y.toFixed(2)}`)
      .join(" ");
    return { feedPath, linkPaths };
  }, [model, cells]);

  const showAdjacencyHint = useCallback(
    (key: string) => {
      const cell = model.cellDraws.find((c) => c.key === key);
      if (!cell?.pts.length) return;
      const cx = cell.pts.reduce((sum, p) => sum + p.x, 0) / cell.pts.length;
      const cy = cell.pts.reduce((sum, p) => sum + p.y, 0) / cell.pts.length;
      setHint({
        x: Math.min(88, Math.max(12, ((model.ox + cx * model.scale) / VIEW_W) * 100)),
        y: Math.min(82, Math.max(10, ((model.oy + cy * model.scale) / VIEW_H) * 100)),
      });
      if (hintTimer.current) clearTimeout(hintTimer.current);
      hintTimer.current = setTimeout(() => setHint(null), 2000);
    },
    [model],
  );

  const applyAtPoint = useCallback(
    (clientX: number, clientY: number) => {
      if (paintRef.current === null) return;
      const el = document.elementFromPoint(clientX, clientY);
      const node = el?.closest("[data-cell]") as SVGElement | null;
      const key = node?.dataset.cell;
      if (!key || blocked.has(key)) return;
      if (paintRef.current && !cells[key] && !canPlacePanel(key, cells, spec, roof)) {
        showAdjacencyHint(key);
        return;
      }
      setCell(key, paintRef.current);
    },
    [blocked, cells, spec, roof, setCell, showAdjacencyHint],
  );

  const frontDir = CARDINAL_LABEL[faceCardinal("front", rotation)];

  const onPointerDown = (key: string, e: React.PointerEvent) => {
    if (blocked.has(key)) return;
    e.stopPropagation();
    const next = !cells[key];
    if (next && !canPlacePanel(key, cells, spec, roof)) {
      showAdjacencyHint(key);
      return;
    }
    paintRef.current = next;
    setCell(key, next);
  };

  const onPointerUp = () => {
    paintRef.current = null;
  };

  const panelFill = "#1b2430";
  const panelHi = "#dfe7f0";

  return (
    <div className="flex h-full min-w-0 flex-col overflow-hidden rounded-xl border border-border bg-card shadow-border">
      <div className="flex flex-wrap items-center gap-2 border-b border-border px-3 py-2 sm:px-4">
        <Seg>
          {HOUSE_SIZES.map((item) => (
            <SegBtn key={item.id} on={house === item.id} onClick={() => setHouse(item.id)}>
              {item.label}
            </SegBtn>
          ))}
        </Seg>
        <Seg>
          {ROOF_KINDS.map((item) => (
            <SegBtn key={item.id} on={roof === item.id} onClick={() => setRoof(item.id)}>
              {item.label}
            </SegBtn>
          ))}
        </Seg>
        <Seg>
          <SegBtn on={chimneyOn} onClick={() => setChimney(true)}>
            Chimney
          </SegBtn>
          <SegBtn on={!chimneyOn} onClick={() => setChimney(false)}>
            No Chimney
          </SegBtn>
        </Seg>
        <p className="max-w-md text-xs leading-snug text-muted-foreground">
          Choose the roof style that most closely resembles your home. Change between Family and Estate based on your home size.
        </p>
        <div className="flex items-center gap-1 sm:ml-auto">
          <Button variant="ghost" size="icon-sm" onClick={() => rotate(-1)} aria-label="Rotate left">
            <RotateCcw aria-hidden />
          </Button>
          <span className="min-w-28 text-center text-xs font-medium text-muted-foreground">Front faces {frontDir}</span>
          <Button variant="ghost" size="icon-sm" onClick={() => rotate(1)} aria-label="Rotate right">
            <RotateCw aria-hidden />
          </Button>
        </div>
      </div>

      <div className="relative bg-[#2c3d26]">
        <svg
          ref={svgRef}
          viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
          className="relative z-0 h-[280px] w-full max-w-full min-w-0 overflow-hidden select-none sm:h-[340px] lg:h-[390px]"
          role="img"
          aria-label="Interactive house roof. Click tiles to place or remove solar panels."
          style={{ touchAction: "manipulation" }}
          onPointerMove={(e) => applyAtPoint(e.clientX, e.clientY)}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerUp}
          onPointerLeave={onPointerUp}
        >
          <defs>
            <linearGradient id="roofTanFront" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#d4b07a" />
              <stop offset="100%" stopColor="#c19a62" />
            </linearGradient>
            <linearGradient id="roofTanBack" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#b89562" />
              <stop offset="100%" stopColor="#a07d4e" />
            </linearGradient>
          </defs>
          <rect width={VIEW_W} height={VIEW_H} fill="#2c3d26" pointerEvents="none" />
          {GRASS_TUFTS.map((t, i) => (
            <path
              key={i}
              d={grassSquiggle(t)}
              fill="none"
              stroke="#1f2e1b"
              strokeWidth={1.8}
              strokeLinecap="round"
              strokeLinejoin="round"
              opacity="0.55"
              pointerEvents="none"
            />
          ))}
          <g transform={`translate(${model.ox} ${model.oy}) scale(${model.scale})`} pointerEvents="none">
            {model.lawnPath ? <path d={model.lawnPath} fill="#33462c" opacity="0.85" /> : null}
            <polygon points={poly(model.walk)} fill="#c5b79a" />
            <polygon points={poly(model.step)} fill="#d2c6ad" />
            <polygon points={poly(model.stoop)} fill="#ddd3bf" />
            <polygon points={poly(model.westWall)} fill="#d8cbb8" />
            <polygon points={poly(model.eastWall)} fill="#cbb9a2" />
            <polygon points={poly(model.southWall)} fill="#e4d7c4" />
            {model.siding.map((seg, i) => (
              <polyline key={i} points={poly(seg)} fill="none" stroke="#c9b9a4" strokeWidth={0.035} />
            ))}
            {model.westGable.length ? <polygon points={poly(model.westGable)} fill="#d2c4ae" /> : null}
            {model.eastGable.length ? <polygon points={poly(model.eastGable)} fill="#c4b196" /> : null}
            {model.gableVent.length ? <polygon points={poly(model.gableVent)} fill="#b7a48c" stroke="#9a8872" strokeWidth={0.04} /> : null}
            <polygon points={poly(model.eastWindow.frame)} fill="#efe8dc" />
            <polygon points={poly(model.eastWindow.glass)} fill="#7eb8bc" />
            <polygon points={poly(model.eastWindow.vbar)} fill="#efe8dc" />
            {model.frontWindows.map((win, i) => (
              <g key={i}>
                {win.shutters.map((sh, si) => (
                  <polygon key={si} points={poly(sh)} fill="#3a4d32" />
                ))}
                <polygon points={poly(win.sill)} fill="#cfc3af" />
                <polygon points={poly(win.frame)} fill="#f3ece1" />
                <polygon points={poly(win.glass)} fill="#8ec4c0" />
                <polygon points={poly(win.vbar)} fill="#f3ece1" />
                <polygon points={poly(win.hbar)} fill="#f3ece1" />
              </g>
            ))}
            <polygon points={poly(model.door)} fill="#6d5344" />
            <polygon points={poly(model.doorInset)} fill="#5c4538" />
            <polygon points={poly(model.transom)} fill="#8ec4c0" />
            <polygon points={poly(model.doorHandle)} fill="#c4a15a" />
            <polygon points={poly(model.porchLight)} fill="#f3e0a8" />
            <polyline points={poly(model.fascia)} fill="none" stroke="#a88858" strokeWidth={0.07} />
            <polyline points={poly(model.gutter)} fill="none" stroke="#b9b3a8" strokeWidth={0.09} strokeLinecap="round" />
            <polyline points={poly(model.downspout)} fill="none" stroke="#b9b3a8" strokeWidth={0.07} strokeLinecap="round" />
            {model.roofLeft.length ? <polygon points={poly(model.roofLeft)} fill="#b89562" stroke="#a07d4e" strokeWidth={0.9 / model.scale} /> : null}
            {model.roofBack.length ? <polygon points={poly(model.roofBack)} fill="url(#roofTanBack)" stroke="#a88858" strokeWidth={0.9 / model.scale} /> : null}
            <polygon points={poly(model.roofFront)} fill="url(#roofTanFront)" stroke="#b89560" strokeWidth={0.9 / model.scale} />
            {model.roofRight.length ? <polygon points={poly(model.roofRight)} fill="#c9a570" stroke="#b08a55" strokeWidth={0.9 / model.scale} /> : null}
            {wiring.linkPaths.map((d, i) => (
              <PowerFlowPath key={`link-${i}`} d={d} />
            ))}
            <PowerFlowPath d={wiring.feedPath} />
            {model.cellDraws.map((cell) => {
              const placed = !!cells[cell.key];
              const hover = hoverKey === cell.key;
              const isObstacle = cell.blocked;
              const [p0, p1, p2, p3] = cell.pts;
              const inset = [
                lerp(lerp(p0, p1, 0.08), lerp(p3, p2, 0.08), 0.08),
                lerp(lerp(p1, p0, 0.08), lerp(p2, p3, 0.08), 0.08),
                lerp(lerp(p2, p3, 0.08), lerp(p1, p0, 0.08), 0.08),
                lerp(lerp(p3, p2, 0.08), lerp(p0, p1, 0.08), 0.08),
              ];
              return (
                <g key={cell.key}>
                  <polygon
                    data-cell={isObstacle ? undefined : cell.key}
                    points={poly(cell.pts)}
                    fill={isObstacle ? "#8a6a48" : placed ? panelFill : hover ? "rgba(201,164,74,0.28)" : "rgba(255,248,235,0.08)"}
                    stroke={hover && !isObstacle ? "#c9a44a" : placed ? "#11161c" : "rgba(120,90,50,0.28)"}
                    strokeWidth={hover && !isObstacle ? 1.6 / model.scale : 0.55 / model.scale}
                    className={isObstacle ? "cursor-not-allowed" : "cursor-pointer"}
                    pointerEvents={isObstacle ? "none" : "auto"}
                    onPointerDown={(e) => onPointerDown(cell.key, e)}
                    onPointerEnter={() => setHover(cell.key)}
                    opacity={isObstacle ? 0.7 : 1}
                  />
                  {placed && !isObstacle ? <polygon points={poly(inset)} fill={panelHi} opacity="0.35" pointerEvents="none" /> : null}
                </g>
              );
            })}
            {chimneyOn ? (
              <>
                <polygon points={poly(model.chimney.south)} fill="#6b4638" />
                <polygon points={poly(model.chimney.east)} fill="#56372c" />
                <polygon points={poly(model.chimney.top)} fill="#7a5242" />
                <polygon points={poly(model.chimney.crown)} fill="#8a5e4a" />
              </>
            ) : null}
            {model.bushes.map((b, i) => (
              <polygon key={i} points={poly(b.pts)} fill={b.fill} />
            ))}
            <polygon points={poly(model.meter.conduit)} fill="#c9c6bf" />
            <polygon points={poly(model.meter.east)} fill="#8d8b86" />
            <polygon points={poly(model.meter.south)} fill="#b4b1ab" />
            <polygon points={poly(model.meter.top)} fill="#d8d5cf" />
            <polygon points={poly(model.meter.glassBack)} fill="#9aa3a8" />
            <polygon points={poly(model.meter.glassFront)} fill="#d9e4ea" stroke="#8a9398" strokeWidth={0.035} />
            <polygon points={poly(model.meter.dial)} fill="#f4f1ea" stroke="#6f777c" strokeWidth={0.03} />
            <polygon points={poly(model.meter.lcd)} fill="#2a3a32" />
            <polygon points={poly(model.meter.seal)} fill="#2f7a3a" />
            <polyline points={poly(model.ridge)} fill="none" stroke="#8d6d42" strokeWidth={2.2 / model.scale} strokeLinecap="round" />
          </g>
        </svg>
        <div className="pointer-events-none absolute top-3 left-3 rounded-md bg-ink/80 px-2.5 py-1.5 text-[11px] text-primary-foreground">
          Click or drag to place panels
        </div>
        {hint ? (
          <div
            className="pointer-events-none absolute z-10 w-max max-w-[14rem] -translate-x-1/2 -translate-y-[120%] rounded-md bg-ink px-2.5 py-1.5 text-center text-[11px] leading-snug text-primary-foreground shadow-md"
            style={{ left: `${hint.x}%`, top: `${hint.y}%` }}
            role="status"
          >
            Place panels next to each other
          </div>
        ) : null}
        <Compass rotation={rotation} />
      </div>

      <div className="grid grid-cols-2 gap-2 border-t border-border px-3 py-2 sm:px-4">
        <div className="rounded-md bg-surface-2 px-3 py-2">
          <p className="text-[10px] font-medium tracking-wide text-muted uppercase">kW Size</p>
          <p className="font-num text-lg font-semibold tracking-tight">
            {savings.panelCount ? `${formatNumber(savings.systemKw, 2)} kW` : "—"}
          </p>
        </div>
        <div className="rounded-md bg-surface-2 px-3 py-2">
          <p className="text-[10px] font-medium tracking-wide text-muted uppercase">Yearly Production</p>
          <p className="font-num text-lg font-semibold tracking-tight">
            {savings.panelCount && savings.annualKwh > 0 ? formatKwh(savings.annualKwh) : "—"}
          </p>
        </div>
      </div>
      <div className="flex flex-wrap items-center gap-3 border-t border-border px-3 py-2 sm:px-4">
        <div className="min-w-0 flex-1">
          <p id={wattageLabelId} className="text-[10px] font-semibold tracking-wide text-muted-foreground uppercase">Panel Wattage</p>
          <Slider
            className="mt-1"
            min={WATTAGE_MIN}
            max={WATTAGE_MAX}
            step={5}
            value={[wattage]}
            onValueChange={(v) => setWattage(v[0] ?? wattage)}
            aria-labelledby={wattageLabelId}
          />
          <p className="mt-1 text-[10px] text-muted-foreground">
            {WATTAGE_MIN}–{WATTAGE_MAX} W
          </p>
        </div>
        <p className="font-num text-right text-sm font-semibold">
          {wattage} W
          <span className="block text-[10px] font-normal text-muted-foreground">
            {Math.round(PANEL_EFFICIENCY * 1000) / 10}% eff · {PANEL_TEMP_COEFF * 100}% /°C
          </span>
        </p>
        <Button size="sm" variant="outline" onClick={clearRoof}>
          <Eraser aria-hidden /> Clear
        </Button>
      </div>
    </div>
  );
}

function PowerFlowPath({ d }: { d: string }) {
  if (!d) return null;
  return (
    <g>
      <path d={d} fill="none" stroke="#5c5955" strokeWidth={4.5} strokeLinecap="round" strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
      <path d={d} fill="none" stroke="#c9a44a" strokeWidth={2.8} strokeLinecap="round" strokeLinejoin="round" opacity="0.5" vectorEffect="non-scaling-stroke" />
      <path d={d} fill="none" stroke="#d4b45c" strokeWidth={10} strokeLinecap="round" strokeLinejoin="round" strokeDasharray="52 38" opacity="0.22" vectorEffect="non-scaling-stroke">
        <animate attributeName="stroke-dashoffset" from="0" to="-90" dur="3.4s" repeatCount="indefinite" />
      </path>
      <path d={d} fill="none" stroke="#c9a44a" strokeWidth={3.6} strokeLinecap="round" strokeLinejoin="round" strokeDasharray="52 38" vectorEffect="non-scaling-stroke">
        <animate attributeName="stroke-dashoffset" from="0" to="-90" dur="3.4s" repeatCount="indefinite" />
      </path>
      <path d={d} fill="none" stroke="#f3e0a8" strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round" strokeDasharray="52 38" vectorEffect="non-scaling-stroke">
        <animate attributeName="stroke-dashoffset" from="0" to="-90" dur="3.4s" repeatCount="indefinite" />
      </path>
    </g>
  );
}

function Compass({ rotation }: { rotation: Rotation }) {
  const order: Array<"N" | "E" | "S" | "W"> = ["S", "W", "N", "E"];
  const steps = rotation / 90;
  const at = (n: number) => order[((steps + n) % 4 + 4) % 4]!;
  // Iso house: front is down-left, east wall down-right. S follows the front.
  const slots = [
    { n: 0, x: 28, y: 80 },
    { n: 3, x: 80, y: 80 },
    { n: 2, x: 72, y: 20 },
    { n: 1, x: 20, y: 20 },
  ];
  const north = slots.find((s) => at(s.n) === "N") ?? slots[2]!;
  const angle = Math.round((Math.atan2(north.y - 50, north.x - 50) * 180) / Math.PI + 90);
  return (
    <div className="pointer-events-none absolute right-3 bottom-3 size-[4.4rem] rounded-full border border-white/70 bg-card/92 text-[9px] font-bold tracking-wide text-muted-foreground shadow-sm">
      <svg viewBox="0 0 64 64" className="absolute inset-0 size-full" aria-hidden>
        <g transform={`rotate(${angle} 32 32)`}>
          <polygon points="32,8 36,32 32,28 28,32" fill="#c9a44a" />
          <polygon points="32,56 36,32 32,36 28,32" fill="#c9c2b6" />
        </g>
      </svg>
      {slots.map((s) => (
        <span
          key={s.n}
          className={`absolute -translate-x-1/2 -translate-y-1/2 ${at(s.n) === "N" ? "text-primary" : ""}`}
          style={{ left: `${s.x}%`, top: `${s.y}%` }}
        >
          {at(s.n)}
        </span>
      ))}
    </div>
  );
}
