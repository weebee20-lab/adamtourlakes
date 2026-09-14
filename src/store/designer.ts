import { useMemo } from "react";
import { create } from "zustand";
import { billFromKwh, calculateSavings, cellsForBillOffset, completeMonthlyKwh } from "@/lib/solar/calc";
import { DEFAULT_BRAND_ID, DEFAULT_WATTAGE, WATTAGE_MAX, WATTAGE_MIN } from "@/lib/solar/panels";
import { canPlacePanel, roofSpec, seedCells } from "@/lib/solar/roof";
import type { BillMode, HouseSize, LocationInfo, RoofKind, Rotation } from "@/lib/solar/types";
import { utilityFor, usageKwhFromBill } from "@/lib/solar/utility";
import { solarStrength } from "@/lib/solar/zip";
import { batteryById } from "@/lib/solar/batteries";
import { writeQuoteHandoff } from "@/lib/quote-handoff";

function persistHandoff(state: {
  location: LocationInfo | null;
  monthlyBill: number;
  billMode: BillMode;
  monthlyKwhInput: Array<number | null>;
  cells: Record<string, boolean>;
  house: HouseSize;
  roof: RoofKind;
  rotation: Rotation;
  pitch: number;
  brandId: string;
  wattage: number;
  chimney: boolean;
  wantBackup: boolean;
  batteryId: string;
  batteryCount: number;
}) {
  const monthlyUsageKwh =
    state.billMode === "kwh"
      ? completeMonthlyKwh(
          state.monthlyKwhInput,
          state.location?.lat ?? 27,
          state.location?.climate ?? "hot",
          usageKwhFromBill(state.monthlyBill, state.location?.rate ?? 0.15, state.location?.customerCharge ?? 0),
        )
      : undefined;
  const savings = calculateSavings({
    cells: state.cells,
    house: state.house,
    roof: state.roof,
    rotation: state.rotation,
    pitch: state.pitch,
    brandId: state.brandId,
    wattage: state.wattage,
    monthlyBill: state.monthlyBill,
    monthlyUsageKwh,
    chimney: state.chimney,
    location: state.location,
  });
  const batt = batteryById(state.batteryId);
  writeQuoteHandoff({
    fromCalculator: savings.panelCount > 0,
    label: state.location?.label || state.location?.zip || "",
    zip: state.location?.zip || "",
    monthlyBill: state.monthlyBill,
    systemKw: savings.systemKw,
    panelCount: savings.panelCount,
    wantBackup: state.wantBackup,
    batteryId: state.batteryId,
    batteryName: batt.name,
    batteryCount: state.batteryCount,
  });
}

function starterLocation(): LocationInfo {
  const util = utilityFor("33914", "FL", "Lee");
  return {
    label: "Enter a ZIP for local sun & utility",
    address: "",
    city: "",
    state: "FL",
    zip: "",
    county: "Lee",
    lat: 26.56,
    lng: -82.0,
    ghi: 5.42,
    zipGhi: 5.42,
    nasa: false,
    climate: util.climate,
    rate: util.rate,
    customerCharge: util.customerCharge,
    utilityName: util.utility,
    solarStrength: solarStrength(5.42, 26.56),
  };
}

export type DesignerState = {
  house: HouseSize;
  roof: RoofKind;
  rotation: Rotation;
  pitch: number;
  brandId: string;
  wattage: number;
  monthlyBill: number;
  billMode: BillMode;
  monthlyKwhInput: Array<number | null>;
  chimney: boolean;
  cells: Record<string, boolean>;
  hoverKey: string | null;
  location: LocationInfo | null;
  addressQuery: string;
  wantBackup: boolean;
  batteryId: string;
  batteryCount: number;
  setHouse: (house: HouseSize) => void;
  setRoof: (roof: RoofKind) => void;
  rotate: (dir: -1 | 1) => void;
  setWattage: (n: number) => void;
  setMonthlyBill: (n: number) => void;
  setBillMode: (mode: BillMode) => void;
  setMonthlyKwhMonth: (index: number, value: number | null) => void;
  setCell: (key: string, on: boolean) => void;
  toggleCell: (key: string) => void;
  setHover: (key: string | null) => void;
  clearRoof: () => void;
  sizeToBill: () => void;
  setLocation: (loc: LocationInfo | null) => void;
  setAddressQuery: (q: string) => void;
  setWantBackup: (on: boolean) => void;
  setBatteryId: (id: string) => void;
  setBatteryCount: (n: number) => void;
  setChimney: (on: boolean) => void;
  reset: () => void;
};

const emptyKwh = (): Array<number | null> => Array.from({ length: 12 }, () => null);

export const useDesigner = create<DesignerState>((set, get) => ({
  house: "family",
  roof: "gable",
  rotation: 0,
  pitch: 22,
  brandId: DEFAULT_BRAND_ID,
  wattage: DEFAULT_WATTAGE,
  monthlyBill: 200,
  billMode: "bill",
  monthlyKwhInput: emptyKwh(),
  chimney: true,
  cells: seedCells("family", "gable"),
  hoverKey: null,
  location: starterLocation(),
  addressQuery: "",
  wantBackup: false,
  batteryId: "pw3",
  batteryCount: 1,
  setHouse: (house) => {
    set({ house, pitch: roofSpec(house, get().roof).defaultPitch, cells: seedCells(house, get().roof) });
    persistHandoff(get());
  },
  setRoof: (roof) => {
    set({ roof, pitch: roofSpec(get().house, roof).defaultPitch, cells: seedCells(get().house, roof) });
    persistHandoff(get());
  },
  rotate: (dir) =>
    set((s) => ({ rotation: ((((s.rotation + dir * 90) % 360) + 360) % 360) as Rotation })),
  setWattage: (n) => {
    set({ wattage: Math.min(WATTAGE_MAX, Math.max(WATTAGE_MIN, Math.round(n))) });
    persistHandoff(get());
  },
  setMonthlyBill: (n) => {
    set({ monthlyBill: n, billMode: "bill" });
    persistHandoff(get());
  },
  setBillMode: (billMode) => set({ billMode }),
  setMonthlyKwhMonth: (index, value) => {
    if (index < 0 || index > 11) return;
    const next = [...get().monthlyKwhInput];
    next[index] = value;
    const location = get().location;
    set({
      billMode: "kwh",
      monthlyKwhInput: next,
      monthlyBill: billFromKwh(next, location) || get().monthlyBill,
    });
  },
  setCell: (key, on) => {
    set((s) => {
      if (on && !canPlacePanel(key, s.cells, roofSpec(s.house, s.roof), s.roof)) return s;
      const next = { ...s.cells };
      if (on) next[key] = true;
      else delete next[key];
      return { cells: next };
    });
    persistHandoff(get());
  },
  toggleCell: (key) => {
    set((s) => {
      if (s.cells[key]) {
        const next = { ...s.cells };
        delete next[key];
        return { cells: next };
      }
      if (!canPlacePanel(key, s.cells, roofSpec(s.house, s.roof), s.roof)) return s;
      return { cells: { ...s.cells, [key]: true } };
    });
    persistHandoff(get());
  },
  setHover: (key) => set({ hoverKey: key }),
  clearRoof: () => {
    set({ cells: {} });
    persistHandoff(get());
  },
  sizeToBill: () => {
    const state = get();
    const monthlyUsageKwh =
      state.billMode === "kwh"
        ? completeMonthlyKwh(
            state.monthlyKwhInput,
            state.location?.lat ?? 27,
            state.location?.climate ?? "hot",
            state.monthlyBill / (state.location?.rate ?? 0.15),
          )
        : undefined;
    set({
      cells: cellsForBillOffset({
        cells: state.cells,
        house: state.house,
        roof: state.roof,
        rotation: state.rotation,
        pitch: state.pitch,
        brandId: state.brandId,
        wattage: state.wattage,
        monthlyBill: state.monthlyBill,
        monthlyUsageKwh,
        chimney: state.chimney,
        location: state.location,
      }),
    });
    persistHandoff(get());
  },
  setLocation: (location) => {
    set({ location });
    persistHandoff(get());
  },
  setAddressQuery: (addressQuery) => set({ addressQuery }),
  setWantBackup: (wantBackup) => {
    set({ wantBackup });
    persistHandoff(get());
  },
  setBatteryId: (batteryId) => {
    set({ batteryId, batteryCount: 1 });
    persistHandoff(get());
  },
  setBatteryCount: (n) => {
    set({ batteryCount: Math.max(1, Math.round(n)) });
    persistHandoff(get());
  },
  setChimney: (chimney) => set({ chimney }),
  reset: () =>
    set({
      house: "family",
      roof: "gable",
      rotation: 0,
      pitch: 22,
      brandId: DEFAULT_BRAND_ID,
      wattage: DEFAULT_WATTAGE,
      monthlyBill: 200,
      billMode: "bill",
      monthlyKwhInput: emptyKwh(),
      chimney: true,
      cells: seedCells("family", "gable"),
      hoverKey: null,
      location: starterLocation(),
      addressQuery: "",
      wantBackup: false,
      batteryId: "pw3",
      batteryCount: 1,
    }),
}));

export function useSavings() {
  const cells = useDesigner((s) => s.cells);
  const house = useDesigner((s) => s.house);
  const roof = useDesigner((s) => s.roof);
  const rotation = useDesigner((s) => s.rotation);
  const pitch = useDesigner((s) => s.pitch);
  const brandId = useDesigner((s) => s.brandId);
  const wattage = useDesigner((s) => s.wattage);
  const monthlyBill = useDesigner((s) => s.monthlyBill);
  const billMode = useDesigner((s) => s.billMode);
  const monthlyKwhInput = useDesigner((s) => s.monthlyKwhInput);
  const chimney = useDesigner((s) => s.chimney);
  const location = useDesigner((s) => s.location);
  const monthlyUsageKwh =
    billMode === "kwh"
      ? completeMonthlyKwh(
          monthlyKwhInput,
          location?.lat ?? 27,
          location?.climate ?? "hot",
          usageKwhFromBill(monthlyBill, location?.rate ?? 0.15, location?.customerCharge ?? 0),
        )
      : undefined;
  return useMemo(
    () =>
      calculateSavings({
        cells,
        house,
        roof,
        rotation,
        pitch,
        brandId,
        wattage,
        monthlyBill,
        monthlyUsageKwh,
        chimney,
        location,
      }),
    [cells, house, roof, rotation, pitch, brandId, wattage, monthlyBill, monthlyUsageKwh, chimney, location],
  );
}
