export const WATTAGE_MIN = 400;
export const WATTAGE_MAX = 480;
export const DEFAULT_WATTAGE = 425;
export const DEFAULT_BRAND_ID = "generic";
export const PANEL_EFFICIENCY = 0.218;
export const PANEL_TEMP_COEFF = -0.003;

export type PanelBrand = {
  id: string;
  name: string;
  watts: number;
  efficiency: number;
  tempCoeff: number;
};

export const PANEL_BRANDS: PanelBrand[] = [
  {
    id: "generic",
    name: "Helio Module",
    watts: DEFAULT_WATTAGE,
    efficiency: PANEL_EFFICIENCY,
    tempCoeff: PANEL_TEMP_COEFF,
  },
];

export function brandById(id: string): PanelBrand {
  return PANEL_BRANDS.find((b) => b.id === id) ?? PANEL_BRANDS[0]!;
}

/** Midpoint installed $/W used for 25-year net (never shown as PPW). */
export const PPW_LOW = 2.35;
export const PPW_HIGH = 3.15;
export const SAMPLE_PANEL_W = 1.13;
export const SAMPLE_PANEL_H = 1.92;
export const SAMPLE_PANEL_GAP = 0.04;
export const LIFETIME = 25;
export const DEGRADATION = 0.004;
export const UTILITY_INFLATION = 0.04;
export const NIGHT_SHARE = 0.35;
