import type { Climate } from "./types";
import { utilityFor as utilityForZip } from "./utility";

type ZipRow = {
  zip: string;
  city: string;
  state: string;
  county: string;
  lat: number;
  lng: number;
  ghi: number;
  climate: Climate;
  rate: number;
  utility: string;
};

const ROWS: ZipRow[] = [
  { zip: "33914", city: "Cape Coral", state: "FL", county: "Lee", lat: 26.562, lng: -82.014, ghi: 5.42, climate: "hot", rate: 0.147, utility: "Lee County Electric Cooperative" },
  { zip: "33904", city: "Cape Coral", state: "FL", county: "Lee", lat: 26.564, lng: -81.949, ghi: 5.41, climate: "hot", rate: 0.147, utility: "Lee County Electric Cooperative" },
  { zip: "33909", city: "Cape Coral", state: "FL", county: "Lee", lat: 26.68, lng: -81.94, ghi: 5.4, climate: "hot", rate: 0.147, utility: "Lee County Electric Cooperative" },
  { zip: "33990", city: "Cape Coral", state: "FL", county: "Lee", lat: 26.641, lng: -81.94, ghi: 5.4, climate: "hot", rate: 0.147, utility: "Lee County Electric Cooperative" },
  { zip: "33919", city: "Fort Myers", state: "FL", county: "Lee", lat: 26.553, lng: -81.872, ghi: 5.41, climate: "hot", rate: 0.163, utility: "Florida Power & Light" },
  { zip: "33991", city: "Cape Coral", state: "FL", county: "Lee", lat: 26.64, lng: -82.02, ghi: 5.41, climate: "hot", rate: 0.147, utility: "Lee County Electric Cooperative" },
  { zip: "33993", city: "Cape Coral", state: "FL", county: "Lee", lat: 26.72, lng: -82.05, ghi: 5.4, climate: "hot", rate: 0.147, utility: "Lee County Electric Cooperative" },
  { zip: "34102", city: "Naples", state: "FL", county: "Collier", lat: 26.142, lng: -81.795, ghi: 5.48, climate: "hot", rate: 0.163, utility: "Florida Power & Light" },
  { zip: "34109", city: "Naples", state: "FL", county: "Collier", lat: 26.215, lng: -81.77, ghi: 5.47, climate: "hot", rate: 0.163, utility: "Florida Power & Light" },
  { zip: "33952", city: "Port Charlotte", state: "FL", county: "Charlotte", lat: 26.984, lng: -82.091, ghi: 5.38, climate: "hot", rate: 0.163, utility: "Florida Power & Light" },
  { zip: "33948", city: "Port Charlotte", state: "FL", county: "Charlotte", lat: 27.0, lng: -82.15, ghi: 5.38, climate: "hot", rate: 0.163, utility: "Florida Power & Light" },
  { zip: "33950", city: "Punta Gorda", state: "FL", county: "Charlotte", lat: 26.93, lng: -82.045, ghi: 5.39, climate: "hot", rate: 0.163, utility: "Florida Power & Light" },
  { zip: "34231", city: "Sarasota", state: "FL", county: "Sarasota", lat: 27.267, lng: -82.514, ghi: 5.28, climate: "hot", rate: 0.163, utility: "Florida Power & Light" },
  { zip: "34236", city: "Sarasota", state: "FL", county: "Sarasota", lat: 27.336, lng: -82.545, ghi: 5.29, climate: "hot", rate: 0.163, utility: "Florida Power & Light" },
  { zip: "34285", city: "Venice", state: "FL", county: "Sarasota", lat: 27.1, lng: -82.44, ghi: 5.32, climate: "hot", rate: 0.163, utility: "Florida Power & Light" },
  { zip: "33602", city: "Tampa", state: "FL", county: "Hillsborough", lat: 27.95, lng: -82.457, ghi: 5.18, climate: "hot", rate: 0.1828, utility: "Tampa Electric (TECO)" },
  { zip: "33701", city: "St. Petersburg", state: "FL", county: "Pinellas", lat: 27.77, lng: -82.64, ghi: 5.2, climate: "hot", rate: 0.1666, utility: "Duke Energy Florida" },
  { zip: "32801", city: "Orlando", state: "FL", county: "Orange", lat: 28.542, lng: -81.379, ghi: 5.22, climate: "hot", rate: 0.132, utility: "Orlando Utilities Commission" },
  { zip: "32789", city: "Winter Park", state: "FL", county: "Orange", lat: 28.6, lng: -81.35, ghi: 5.2, climate: "hot", rate: 0.1666, utility: "Duke Energy Florida" },
  { zip: "33131", city: "Miami", state: "FL", county: "Miami-Dade", lat: 25.765, lng: -80.191, ghi: 5.45, climate: "hot", rate: 0.163, utility: "Florida Power & Light" },
  { zip: "33301", city: "Fort Lauderdale", state: "FL", county: "Broward", lat: 26.12, lng: -80.14, ghi: 5.4, climate: "hot", rate: 0.163, utility: "Florida Power & Light" },
  { zip: "33401", city: "West Palm Beach", state: "FL", county: "Palm Beach", lat: 26.71, lng: -80.05, ghi: 5.38, climate: "hot", rate: 0.163, utility: "Florida Power & Light" },
  { zip: "32202", city: "Jacksonville", state: "FL", county: "Duval", lat: 30.329, lng: -81.656, ghi: 4.92, climate: "hot", rate: 0.148, utility: "JEA" },
  { zip: "32501", city: "Pensacola", state: "FL", county: "Escambia", lat: 30.42, lng: -87.22, ghi: 4.85, climate: "hot", rate: 0.145, utility: "FPL Northwest Florida" },
  { zip: "32301", city: "Tallahassee", state: "FL", county: "Leon", lat: 30.44, lng: -84.28, ghi: 4.88, climate: "hot", rate: 0.121, utility: "City of Tallahassee Utilities" },
  { zip: "32601", city: "Gainesville", state: "FL", county: "Alachua", lat: 29.65, lng: -82.32, ghi: 5.02, climate: "hot", rate: 0.128, utility: "Gainesville Regional Utilities" },
  { zip: "30303", city: "Atlanta", state: "GA", county: "Fulton", lat: 33.753, lng: -84.39, ghi: 4.72, climate: "temperate", rate: 0.138, utility: "Georgia Power" },
  { zip: "78701", city: "Austin", state: "TX", county: "Travis", lat: 30.267, lng: -97.743, ghi: 5.12, climate: "hot", rate: 0.132, utility: "Austin Energy" },
  { zip: "85004", city: "Phoenix", state: "AZ", county: "Maricopa", lat: 33.448, lng: -112.074, ghi: 5.76, climate: "hot", rate: 0.141, utility: "Arizona Public Service" },
  { zip: "92101", city: "San Diego", state: "CA", county: "San Diego", lat: 32.716, lng: -117.161, ghi: 5.38, climate: "temperate", rate: 0.348, utility: "San Diego Gas & Electric" },
  { zip: "90012", city: "Los Angeles", state: "CA", county: "Los Angeles", lat: 34.054, lng: -118.243, ghi: 5.35, climate: "temperate", rate: 0.268, utility: "Los Angeles Department of Water and Power" },
  { zip: "10007", city: "New York", state: "NY", county: "New York", lat: 40.713, lng: -74.006, ghi: 3.98, climate: "cold", rate: 0.268, utility: "Con Edison" },
  { zip: "60601", city: "Chicago", state: "IL", county: "Cook", lat: 41.885, lng: -87.622, ghi: 3.92, climate: "cold", rate: 0.158, utility: "ComEd" },
  { zip: "80202", city: "Denver", state: "CO", county: "Denver", lat: 39.739, lng: -104.99, ghi: 4.82, climate: "cold", rate: 0.145, utility: "Xcel Energy" },
  { zip: "98101", city: "Seattle", state: "WA", county: "King", lat: 47.606, lng: -122.332, ghi: 3.42, climate: "temperate", rate: 0.118, utility: "Puget Sound Energy" },
  { zip: "02108", city: "Boston", state: "MA", county: "Suffolk", lat: 42.358, lng: -71.064, ghi: 3.88, climate: "cold", rate: 0.288, utility: "Eversource" },
];

const BY_ZIP = new Map(ROWS.map((r) => [r.zip, r]));

export function lookupZip(zip: string): ZipRow | null {
  const z = zip.replace(/\D/g, "").slice(0, 5);
  return BY_ZIP.get(z) ?? null;
}

export function nearestZip(lat: number, lng: number): ZipRow {
  let best = ROWS[0]!;
  let bestD = Infinity;
  for (const r of ROWS) {
    const d = (r.lat - lat) ** 2 + (r.lng - lng) ** 2;
    if (d < bestD) {
      bestD = d;
      best = r;
    }
  }
  return best;
}

export function ghiFromLat(lat: number): number {
  const x = Math.abs(lat);
  if (x < 24.5) return 5.58;
  if (x < 28.5) return Number((5.52 - (x - 25) * 0.045).toFixed(2));
  if (x < 32) return Number((5.28 - (x - 28.5) * 0.08).toFixed(2));
  if (x < 38) return Number((4.95 - (x - 32) * 0.09).toFixed(2));
  if (x < 45) return Number((4.4 - (x - 38) * 0.09).toFixed(2));
  return 3.45;
}

export function solarStrength(ghi: number, lat: number): "Exceptional" | "Great" | "Good" | "Fair" {
  if (ghi >= 5.05 || (lat >= 24.4 && lat <= 28.2 && ghi >= 4.85)) return "Exceptional";
  if (ghi >= 4.55) return "Great";
  if (ghi >= 3.9) return "Good";
  return "Fair";
}

export function utilityFor(zip: string, state: string, county = "") {
  return utilityForZip(zip, state, county);
}

export function seasonalKwhShape(lat: number, climate: Climate) {
  const hot = [0.78, 0.74, 0.80, 0.88, 1.08, 1.28, 1.38, 1.36, 1.18, 0.96, 0.82, 0.74];
  const cold = [1.32, 1.22, 1.08, 0.90, 0.78, 0.82, 0.92, 0.90, 0.80, 0.88, 1.08, 1.30];
  const mild = [1.08, 1.00, 0.90, 0.84, 0.92, 1.10, 1.18, 1.16, 0.98, 0.88, 0.94, 1.02];
  const raw =
    climate === "hot" || lat < 32 ? hot : climate === "cold" || lat > 41 ? cold : mild;
  const mean = raw.reduce((a, b) => a + b, 0) / 12;
  return raw.map((v) => v / mean);
}
