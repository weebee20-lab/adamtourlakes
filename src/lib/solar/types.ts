export type HouseSize = "family" | "estate";
export type RoofKind = "gable" | "shed" | "hip";
export type FaceId = "front" | "back" | "left" | "right";
export type Rotation = 0 | 90 | 180 | 270;
export type Cardinal = "N" | "E" | "S" | "W";
export type Climate = "hot" | "temperate" | "cold";
export type BillMode = "bill" | "kwh";

export type RoofSpec = {
  width: number;
  depth: number;
  wallH: number;
  sqft: number;
  cols: number;
  rows: number;
  sideCols: number;
  sideRows: number;
  defaultPitch: number;
  faces: FaceId[];
};

export type LocationInfo = {
  label: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  county: string;
  lat: number;
  lng: number;
  ghi: number;
  zipGhi: number;
  ghiMonthly?: number[];
  nasa: boolean;
  climate: Climate;
  rate: number;
  customerCharge: number;
  utilityName: string;
  solarStrength: "Exceptional" | "Great" | "Good" | "Fair";
};

export type RoofSpecInput = {
  house: HouseSize;
  roof: RoofKind;
};
