export type BatteryOption = {
  id: string;
  name: string;
  usableKwh: number;
  continuousKw: number;
  blurb: string;
};

export const BATTERIES: BatteryOption[] = [
  {
    id: "pw3",
    name: "Powerwall 3",
    usableKwh: 13.5,
    continuousKw: 11.5,
    blurb: "Tesla’s whole-home backup battery with integrated inverter.",
  },
  {
    id: "ocean",
    name: "EcoFlow Ocean Pro",
    usableKwh: 12,
    continuousKw: 10,
    blurb: "Modular backup with fast install and app monitoring.",
  },
  {
    id: "enphase",
    name: "Enphase IQ Battery 5P",
    usableKwh: 5,
    continuousKw: 3.84,
    blurb: "Stackable AC battery that pairs with microinverters.",
  },
];

export function batteryById(id: string) {
  return BATTERIES.find((b) => b.id === id) ?? BATTERIES[0]!;
}

export type Appliance = {
  id: string;
  name: string;
  watts: number;
  surgeWatts: number;
  /** If set, this load cycles — minutes it typically runs each hour. */
  minutesPerHour?: number;
};

/** Typical running watts (EcoFlow-style household chart). Surge is motor start. */
export const APPLIANCES: Appliance[] = [
  { id: "central-ac", name: "Air Conditioner", watts: 3500, surgeWatts: 8000, minutesPerHour: 20 },
  { id: "lights", name: "LED Lights (Whole Home)", watts: 80, surgeWatts: 80 },
  { id: "tv", name: "Television", watts: 100, surgeWatts: 100 },
  { id: "fans", name: "Ceiling Fans", watts: 60, surgeWatts: 150 },
  { id: "fridge", name: "Refrigerator", watts: 150, surgeWatts: 1200 },
  { id: "wifi", name: "Wi-Fi And Modem", watts: 20, surgeWatts: 20 },
  { id: "cpap", name: "CPAP", watts: 60, surgeWatts: 90 },
  { id: "phones", name: "Phones And Laptops", watts: 80, surgeWatts: 80 },
  { id: "window-ac", name: "Window Air Conditioner", watts: 1000, surgeWatts: 2500, minutesPerHour: 20 },
  { id: "microwave", name: "Microwave", watts: 1200, surgeWatts: 1500, minutesPerHour: 10 },
  { id: "coffee", name: "Coffee Maker", watts: 1000, surgeWatts: 1000, minutesPerHour: 10 },
  { id: "washer", name: "Washing Machine", watts: 500, surgeWatts: 1200, minutesPerHour: 20 },
  { id: "dishwasher", name: "Dishwasher", watts: 1200, surgeWatts: 1500, minutesPerHour: 30 },
  { id: "range", name: "Electric Range", watts: 4000, surgeWatts: 4000, minutesPerHour: 20 },
  { id: "water", name: "Electric Water Heater", watts: 4500, surgeWatts: 4500, minutesPerHour: 15 },
  { id: "dryer", name: "Electric Clothes Dryer", watts: 5000, surgeWatts: 5500, minutesPerHour: 30 },
  { id: "heater", name: "Space Heater", watts: 1500, surgeWatts: 1500, minutesPerHour: 20 },
  { id: "sump", name: "Sump Pump", watts: 800, surgeWatts: 2100, minutesPerHour: 10 },
  { id: "well", name: "Well Pump", watts: 1000, surgeWatts: 2500, minutesPerHour: 10 },
];

export const DEFAULT_APPLIANCES = ["central-ac", "lights", "tv", "fans", "fridge", "wifi"] as const;

export const DUTY_MINUTES = [10, 15, 20, 30, 45, 60] as const;

export function minutesFor(a: Appliance, duty: Record<string, number>) {
  if (a.minutesPerHour == null) return 60;
  const n = duty[a.id] ?? a.minutesPerHour;
  return Math.min(60, Math.max(5, n));
}

export function avgWatts(a: Appliance, duty: Record<string, number>) {
  return a.watts * (minutesFor(a, duty) / 60);
}

export function peakWatts(continuousKw: number) {
  return continuousKw >= 8 ? continuousKw * 1000 * 4 : continuousKw * 1000 * 2;
}

export function formatRuntime(hours: number) {
  if (hours === Infinity || hours >= 200) return "∞";
  if (!Number.isFinite(hours) || hours <= 0) return "—";
  if (hours < 1) return `${Math.max(1, Math.round(hours * 60))} min`;
  if (hours < 24) return `${hours.toFixed(1)} hrs`;
  return `${(hours / 24).toFixed(1)} days`;
}

const SUNRISE = 6;
const SUNSET = 18;

/** Bell-shaped kWh for each clock hour. Sums to solarDay. Night hours are 0. */
export function hourlySolarKwh(solarDay: number): number[] {
  const out = Array.from({ length: 24 }, () => 0);
  if (!(solarDay > 0)) return out;
  let weight = 0;
  const w = out.map((_, h) => {
    if (h < SUNRISE || h >= SUNSET) return 0;
    const x = Math.sin(((h - SUNRISE + 0.5) / (SUNSET - SUNRISE)) * Math.PI);
    weight += x;
    return x;
  });
  return w.map((x) => (solarDay * x) / weight);
}

/**
 * Rolling outage: each hour, solar (if any) hits the load first and leftover
 * charges the battery; at night the battery covers the load. Starts full at
 * sunrise so the first night drains, then the next day tries to refill.
 */
export function simulateBackup(storageKwh: number, loadKw: number, solarDayKwh: number) {
  if (!(loadKw > 0)) return { hours: Infinity, sustainable: true };
  const storage = Math.max(0, storageKwh);
  const solar = hourlySolarKwh(solarDayKwh);
  const maxHours = 24 * 14;
  let soc = storage;
  for (let t = 0; t < maxHours; t++) {
    const h = (SUNRISE + t) % 24;
    soc = Math.min(storage, soc + (solar[h] ?? 0) - loadKw);
    if (soc <= 1e-6) return { hours: t + 1, sustainable: false };
  }
  return { hours: Infinity, sustainable: true };
}

