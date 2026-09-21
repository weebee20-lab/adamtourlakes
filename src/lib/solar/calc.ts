import {
  DEGRADATION,
  LIFETIME,
  PPW_HIGH,
  PPW_LOW,
  UTILITY_INFLATION,
} from "./panels";
import { allCellKeys, faceCardinal, obstacleKeys, parseCellKey, roofSpec } from "./roof";
import type { Cardinal, Climate, FaceId, HouseSize, LocationInfo, RoofKind, Rotation } from "./types";
import { seasonalKwhShape } from "./zip";
import { billForKwh, usageKwhFromBill } from "./utility";

export const AZIMUTH_FACTOR: Record<Cardinal, number> = {
  S: 1,
  E: 0.89,
  W: 0.89,
  N: 0.72,
};

const FACE_ORDER: Record<Cardinal, number> = { S: 0, E: 1, W: 2, N: 3 };

export type CalcInput = {
  cells: Record<string, boolean>;
  house: HouseSize;
  roof: RoofKind;
  rotation: Rotation;
  pitch: number;
  brandId: string;
  wattage: number;
  monthlyBill: number;
  monthlyUsageKwh?: number[];
  chimney?: boolean;
  location: LocationInfo | null;
};

export type SavingsResult = {
  panelCount: number;
  systemKw: number;
  annualKwh: number;
  offsetPct: number;
  yearOneSavings: number;
  lifetimeGross: number;
  lifetimeNet: number;
  costLow: number;
  costHigh: number;
  costMid: number;
  paybackLow: number;
  paybackHigh: number;
  monthlyKwh: number[];
  currentBills: number[];
  solarBills: number[];
  withoutSolar25: number;
};

function poaFactor(pitch: number, lat: number) {
  const opt = Math.max(15, Math.min(28, Math.abs(lat) - 4));
  const delta = Math.abs(Math.min(40, Math.max(8, pitch)) - opt);
  return Math.max(1.04, 1.11 - delta * 0.007);
}

function performanceRatio(climate: Climate) {
  if (climate === "hot") return 0.8;
  if (climate === "cold") return 0.85;
  return 0.82;
}

function yearKwhFromFactors(watts: number, ghi: number, climate: Climate, poa: number, azF: number) {
  if (!(ghi > 0.5)) return 0;
  return (watts / 1000) * ghi * 365 * performanceRatio(climate) * poa * azF;
}
function yearsToPayback(cost: number, yearOneSavings: number) {
  if (!(yearOneSavings > 0) || !(cost > 0)) return Infinity;
  let cum = 0;
  for (let y = 0; y < LIFETIME; y++) {
    const yearSave = yearOneSavings * (1 - DEGRADATION) ** y * (1 + UTILITY_INFLATION) ** y;
    if (cum + yearSave >= cost) return y + (cost - cum) / yearSave;
    cum += yearSave;
  }
  return Infinity;
}

export function completeMonthlyKwh(
  input: Array<number | null>,
  lat: number,
  climate: Climate,
  monthlyAvgFromBill?: number,
): number[] {
  const shape = seasonalKwhShape(lat, climate);
  const known = input
    .map((v, i) => (v != null && v > 0 ? { i, v } : null))
    .filter(Boolean) as Array<{ i: number; v: number }>;
  if (!known.length) {
    const avg = monthlyAvgFromBill && monthlyAvgFromBill > 0 ? monthlyAvgFromBill : 0;
    return shape.map((s) => s * avg);
  }
  const scale =
    known.reduce((a, k) => a + k.v / Math.max(shape[k.i] ?? 1, 0.01), 0) / known.length;
  return shape.map((s, i) => (input[i] != null && input[i]! >= 0 ? input[i]! : s * scale));
}

export function billFromKwh(months: Array<number | null>, location: LocationInfo | null) {
  const rate = location?.rate ?? 0.15;
  const charge = location?.customerCharge ?? 0;
  const filled = completeMonthlyKwh(months, location?.lat ?? 28, location?.climate ?? "hot", 0);
  const entered = months.filter((v) => v != null && v > 0) as number[];
  if (!entered.length) return 0;
  const avg = filled.reduce((a, b) => a + b, 0) / 12;
  return Math.round(billForKwh(avg, rate, charge));
}

function productionShape(lat: number, ghiMonthly?: number[]) {
  if (ghiMonthly && ghiMonthly.length === 12 && ghiMonthly.every((v) => v > 0)) {
    return ghiMonthly;
  }
  // Northern-hemisphere irradiance: high in May–Jul, low in Dec–Jan.
  return [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map((m) => {
    const summer = Math.cos(((m - 6) / 12) * Math.PI * 2);
    const amp = lat < 28 ? 0.16 : lat > 40 ? 0.36 : 0.24;
    return 1 + amp * summer;
  });
}

function finishSavings(opts: {
  panelCount: number;
  annualKwh: number;
  watts: number;
  location: LocationInfo | null;
  monthlyBill: number;
  monthlyUsageKwh?: number[];
  monthlyKwh?: number[];
}): SavingsResult {
  const rate = opts.location?.rate ?? 0.15;
  const charge = opts.location?.customerCharge ?? 0;
  const lat = opts.location?.lat ?? 28;
  const climate = opts.location?.climate ?? "temperate";
  const avgKwh = usageKwhFromBill(opts.monthlyBill, rate, charge);
  const usage =
    opts.monthlyUsageKwh && opts.monthlyUsageKwh.length === 12
      ? opts.monthlyUsageKwh
      : seasonalKwhShape(lat, climate).map((s) => avgKwh * s);
  const annualUse = usage.reduce((a, b) => a + b, 0);
  const monthlyKwh =
    opts.monthlyKwh && opts.monthlyKwh.length === 12
      ? opts.monthlyKwh
      : productionShape(lat, opts.location?.ghiMonthly).map((s, _, arr) => {
          const sum = arr.reduce((a, b) => a + b, 0) || 1;
          return (opts.annualKwh * s) / sum;
        });
  const currentBills = usage.map((k) => billForKwh(k, rate, charge));
  const solarBills = usage.map((k, i) => billForKwh(Math.max(0, k - monthlyKwh[i]!), rate, charge));
  const yearOneSavings = currentBills.reduce((a, b, i) => a + (b - solarBills[i]!), 0);
  const systemKw = (opts.panelCount * opts.watts) / 1000;
  const costLow = systemKw * 1000 * PPW_LOW;
  const costHigh = systemKw * 1000 * PPW_HIGH;
  const costMid = (costLow + costHigh) / 2;

  let lifetimeGross = 0;
  let withoutSolar25 = 0;
  for (let y = 0; y < LIFETIME; y++) {
    const prod = yearOneSavings * (1 - DEGRADATION) ** y * (1 + UTILITY_INFLATION) ** y;
    lifetimeGross += prod;
    withoutSolar25 += opts.monthlyBill * 12 * (1 + UTILITY_INFLATION) ** y;
  }
  const lifetimeNet = lifetimeGross - costMid;
  const offsetPct = annualUse > 0 ? Math.min(1.2, opts.annualKwh / annualUse) : 0;
  const paybackLow = yearsToPayback(costLow, yearOneSavings);
  const paybackHigh = yearsToPayback(costHigh, yearOneSavings);

  return {
    panelCount: opts.panelCount,
    systemKw,
    annualKwh: opts.annualKwh,
    offsetPct,
    yearOneSavings,
    lifetimeGross,
    lifetimeNet,
    costLow,
    costHigh,
    costMid,
    paybackLow,
    paybackHigh,
    monthlyKwh,
    currentBills,
    solarBills,
    withoutSolar25,
  };
}

export function savingsAtOffset(opts: {
  location: LocationInfo;
  monthlyBill: number;
  offsetPct: number;
  watts?: number;
}): SavingsResult {
  const watts = opts.watts ?? 430;
  const loc = opts.location;
  const avgKwh = usageKwhFromBill(opts.monthlyBill, loc.rate, loc.customerCharge);
  const usage = seasonalKwhShape(loc.lat, loc.climate).map((s) => avgKwh * s);
  const annualUse = usage.reduce((a, b) => a + b, 0);
  const annualKwh = annualUse * opts.offsetPct;
  const kwhPerPanel = yearKwhFromFactors(watts, loc.ghi || loc.zipGhi, loc.climate, poaFactor(22, loc.lat), AZIMUTH_FACTOR.S);
  const panelCount = Math.max(1, Math.round(annualKwh / Math.max(1, kwhPerPanel)));
  return finishSavings({
    panelCount,
    annualKwh,
    watts,
    location: loc,
    monthlyBill: opts.monthlyBill,
  });
}

export function calculateSavings(input: CalcInput): SavingsResult {
  const watts = input.wattage;
  const climate = input.location?.climate ?? "hot";
  const ghi = input.location?.ghi || input.location?.zipGhi || 0;
  const spec = roofSpec(input.house, input.roof);
  const blocked = obstacleKeys(spec, input.roof, input.chimney !== false);
  const valid = allCellKeys(spec);
  const usable = valid.filter((k) => !blocked.has(k));
  const placed = usable.filter((k) => input.cells[k]);
  const poa = poaFactor(input.pitch, input.location?.lat ?? 27);

  const counts: Record<FaceId, number> = { front: 0, back: 0, left: 0, right: 0 };
  for (const key of placed) {
    const parsed = parseCellKey(key);
    if (parsed) counts[parsed.face] += 1;
  }

  const monthly = Array.from({ length: 12 }, () => 0);
  const ghiMonths = input.location?.ghiMonthly;
  let annualKwh = 0;
  (["front", "back", "left", "right"] as FaceId[]).forEach((face) => {
    if (!counts[face]) return;
    const cardinal = faceCardinal(face, input.rotation);
    const az = AZIMUTH_FACTOR[cardinal];
    annualKwh += counts[face] * yearKwhFromFactors(watts, ghi, climate, poa, az);
  });
  const lat = input.location?.lat ?? 27;
  const shape = productionShape(lat, ghiMonths);
  const shapeSum = shape.reduce((a, b) => a + b, 0) || 1;
  for (let i = 0; i < 12; i++) monthly[i] = (annualKwh * (shape[i] ?? 0)) / shapeSum;

  return finishSavings({
    panelCount: placed.length,
    annualKwh,
    watts,
    location: input.location,
    monthlyBill: input.monthlyBill,
    monthlyUsageKwh: input.monthlyUsageKwh,
    monthlyKwh: monthly,
  });
}

function rankedCells(spec: ReturnType<typeof roofSpec>, kind: RoofKind, rotation: Rotation, chimneyOn: boolean) {
  const blocked = obstacleKeys(spec, kind, chimneyOn);
  const keys = allCellKeys(spec).filter((k) => !blocked.has(k));
  const parsed = keys
    .map((key) => {
      const p = parseCellKey(key)!;
      return { key, ...p, cardinal: faceCardinal(p.face, rotation) };
    })
    .sort(
      (a, b) =>
        FACE_ORDER[a.cardinal] - FACE_ORDER[b.cardinal] || a.row - b.row || a.col - b.col,
    );
  return parsed.map((p) => p.key);
}

export function cellsForBillOffset(input: CalcInput): Record<string, boolean> {
  const spec = roofSpec(input.house, input.roof);
  const ranked = rankedCells(spec, input.roof, input.rotation, input.chimney !== false);
  const rate = input.location?.rate ?? 0.15;
  const charge = input.location?.customerCharge ?? 0;
  const annualUse =
    input.monthlyUsageKwh && input.monthlyUsageKwh.length === 12
      ? input.monthlyUsageKwh.reduce((a, b) => a + b, 0)
      : usageKwhFromBill(Math.max(input.monthlyBill, 1), rate, charge) * 12;
  const ghi = input.location?.ghi || input.location?.zipGhi || 0;
  const climate = input.location?.climate ?? "hot";
  const poa = poaFactor(input.pitch, input.location?.lat ?? 27);
  const cells: Record<string, boolean> = {};
  if (!(ghi > 0.5) || annualUse <= 0) return cells;
  let annual = 0;
  let last = 0;
  for (const key of ranked) {
    const parsed = parseCellKey(key);
    if (!parsed) continue;
    const add = yearKwhFromFactors(
      input.wattage,
      ghi,
      climate,
      poa,
      AZIMUTH_FACTOR[faceCardinal(parsed.face, input.rotation)],
    );
    if (annual >= annualUse && Math.abs(annual + add - annualUse) >= Math.abs(annual - annualUse)) break;
    cells[key] = true;
    last = annual;
    annual += add;
    if (last >= annualUse && annual > annualUse * 1.08) {
      delete cells[key];
      break;
    }
  }
  return cells;
}
