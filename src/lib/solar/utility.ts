import type { Climate } from "./types";

export type UtilityInfo = {
  utility: string;
  /** Volumetric energy charge, $/kWh. */
  rate: number;
  /** Monthly customer / facilities charge that solar does not erase. */
  customerCharge: number;
  climate: Climate;
};

function tariff(utility: string, allIn: number, climate: Climate, customerCharge: number): UtilityInfo {
  const rate = Number(Math.max(0.07, allIn - customerCharge / 1000 + 0.01).toFixed(4));
  return { utility, rate, customerCharge, climate };
}

export function usageKwhFromBill(bill: number, rate: number, customerCharge: number) {
  if (!(rate > 0.01) || !(bill > 0)) return 0;
  return Math.max(0, bill - Math.max(0, customerCharge)) / rate;
}

export function billForKwh(kwh: number, rate: number, customerCharge: number) {
  return Math.max(0, customerCharge) + Math.max(0, kwh) * Math.max(0, rate);
}

/** All-in residential typical at 1,000 kWh (EIA-style), split into service + energy, 2026. */
const U = {
  fpl: tariff("Florida Power & Light", 0.163, "hot", 12.32),
  fplNw: tariff("FPL Northwest Florida", 0.145, "hot", 12.32),
  duke: tariff("Duke Energy Florida", 0.1666, "hot", 14.19),
  teco: tariff("Tampa Electric (TECO)", 0.1828, "hot", 18.5),
  jea: tariff("JEA", 0.148, "hot", 14.5),
  ouc: tariff("Orlando Utilities Commission", 0.132, "hot", 11),
  fpu: tariff("Florida Public Utilities", 0.1698, "hot", 15),
  gru: tariff("Gainesville Regional Utilities", 0.128, "hot", 16),
  tal: tariff("City of Tallahassee Utilities", 0.121, "hot", 8.5),
  lake: tariff("Lakeland Electric", 0.125, "hot", 12),
  keys: tariff("Keys Energy Services", 0.157, "hot", 16),
  lcec: tariff("Lee County Electric Cooperative", 0.147, "hot", 19.5),
  comed: tariff("ComEd", 0.158, "cold", 14.36),
  amerenIl: tariff("Ameren Illinois", 0.145, "cold", 13.5),
};

export function climateFromLat(lat: number): Climate {
  if (lat < 32) return "hot";
  if (lat > 40) return "cold";
  return "temperate";
}

export function stateFromZip(zip: string): string {
  const n = Number(zip.replace(/\D/g, "").slice(0, 3));
  if (!Number.isFinite(n) || n <= 0) return "";
  if (n >= 10 && n <= 27) return "MA";
  if (n >= 28 && n <= 29) return "RI";
  if (n >= 30 && n <= 38) return "NH";
  if (n >= 39 && n <= 49) return "ME";
  if (n >= 50 && n <= 59) return "VT";
  if (n >= 60 && n <= 69) return "CT";
  if (n >= 70 && n <= 89) return "NJ";
  if (n >= 100 && n <= 149) return "NY";
  if (n >= 150 && n <= 196) return "PA";
  if (n >= 197 && n <= 199) return "DE";
  if (n >= 200 && n <= 205) return "DC";
  if (n >= 206 && n <= 219) return "MD";
  if (n >= 220 && n <= 246) return "VA";
  if (n >= 247 && n <= 268) return "WV";
  if (n >= 270 && n <= 289) return "NC";
  if (n >= 290 && n <= 299) return "SC";
  if (n >= 300 && n <= 319) return "GA";
  if (n >= 320 && n <= 349) return "FL";
  if (n >= 350 && n <= 369) return "AL";
  if (n >= 370 && n <= 385) return "TN";
  if (n >= 386 && n <= 397) return "MS";
  if (n >= 400 && n <= 427) return "KY";
  if (n >= 430 && n <= 458) return "OH";
  if (n >= 460 && n <= 479) return "IN";
  if (n >= 480 && n <= 499) return "MI";
  if (n >= 500 && n <= 528) return "IA";
  if (n >= 530 && n <= 549) return "WI";
  if (n >= 550 && n <= 567) return "MN";
  if (n >= 570 && n <= 577) return "SD";
  if (n >= 580 && n <= 588) return "ND";
  if (n >= 590 && n <= 599) return "MT";
  if (n >= 600 && n <= 629) return "IL";
  if (n >= 630 && n <= 658) return "MO";
  if (n >= 660 && n <= 679) return "KS";
  if (n >= 680 && n <= 693) return "NE";
  if (n >= 700 && n <= 714) return "LA";
  if (n >= 716 && n <= 729) return "AR";
  if (n >= 730 && n <= 749) return "OK";
  if (n >= 750 && n <= 799) return "TX";
  if (n >= 800 && n <= 816) return "CO";
  if (n >= 820 && n <= 831) return "WY";
  if (n >= 832 && n <= 838) return "ID";
  if (n >= 840 && n <= 847) return "UT";
  if (n >= 850 && n <= 865) return "AZ";
  if (n >= 870 && n <= 884) return "NM";
  if (n >= 889 && n <= 898) return "NV";
  if (n >= 900 && n <= 961) return "CA";
  if (n >= 967 && n <= 968) return "HI";
  if (n >= 970 && n <= 979) return "OR";
  if (n >= 980 && n <= 994) return "WA";
  if (n >= 995 && n <= 999) return "AK";
  return "";
}

function isFloridaZip(z: string) {
  const n = Number(z.slice(0, 3));
  return n >= 320 && n <= 349;
}

const FL_PREFIX: Record<string, UtilityInfo> = {
  "320": U.jea,
  "321": U.duke,
  "322": U.jea,
  "323": U.tal,
  "324": U.fplNw,
  "325": U.fplNw,
  "326": U.gru,
  "327": U.duke,
  "328": U.ouc,
  "329": U.fpl,
  "330": U.fpl,
  "331": U.fpl,
  "332": U.fpl,
  "333": U.fpl,
  "334": U.fpl,
  "335": U.teco,
  "336": U.teco,
  "337": U.duke,
  "338": U.teco,
  "339": U.fpl,
  "341": U.fpl,
  "342": U.fpl,
  "344": U.duke,
  "346": U.duke,
  "347": U.duke,
  "349": U.fpl,
};

const FL_ZIP: Record<string, UtilityInfo> = {
  "33901": U.fpl,
  "33902": U.fpl,
  "33907": U.fpl,
  "33916": U.fpl,
  "33919": U.fpl,
  "33966": U.fpl,
  "33904": U.lcec,
  "33909": U.lcec,
  "33914": U.lcec,
  "33990": U.lcec,
  "33991": U.lcec,
  "33993": U.lcec,
  "33903": U.lcec,
  "33917": U.lcec,
  "33928": U.lcec,
  "33967": U.lcec,
  "33971": U.lcec,
  "33972": U.lcec,
  "33973": U.lcec,
  "33974": U.lcec,
  "33976": U.lcec,
  "33908": U.lcec,
  "33912": U.lcec,
  "33913": U.lcec,
  "33920": U.lcec,
  "33922": U.lcec,
  "33956": U.lcec,
  "33957": U.lcec,
  "33924": U.lcec,
  "34134": U.lcec,
  "34135": U.lcec,
  "34145": U.lcec,
  "33040": U.keys,
  "33041": U.keys,
  "33042": U.keys,
  "33043": U.keys,
  "33045": U.keys,
  "33050": U.keys,
  "33051": U.keys,
  "33052": U.keys,
  "33801": U.lake,
  "33802": U.lake,
  "33803": U.lake,
  "33804": U.lake,
  "33805": U.lake,
  "33806": U.lake,
  "33807": U.lake,
  "33809": U.lake,
  "33810": U.lake,
  "33811": U.lake,
  "33813": U.lake,
  "33815": U.lake,
};

const STATE_FALLBACK: Record<string, UtilityInfo> = {
  FL: U.fpl,
  GA: tariff("Georgia Power", 0.138, "temperate", 14),
  AL: tariff("Alabama Power", 0.145, "hot", 14.5),
  SC: tariff("Dominion Energy South Carolina", 0.142, "hot", 12),
  NC: tariff("Duke Energy Carolinas", 0.132, "temperate", 14.19),
  VA: tariff("Dominion Energy Virginia", 0.142, "temperate", 12.5),
  TX: tariff("Oncor / local REP", 0.151, "hot", 10),
  CA: tariff("Pacific Gas & Electric", 0.312, "temperate", 15.2),
  NY: tariff("Con Edison", 0.268, "cold", 20),
  NJ: tariff("PSE&G", 0.198, "cold", 15),
  PA: tariff("PECO", 0.178, "cold", 13.5),
  MA: tariff("Eversource", 0.288, "cold", 10),
  IL: U.comed,
  OH: tariff("AEP Ohio", 0.162, "cold", 10),
  MI: tariff("DTE Energy", 0.192, "cold", 12),
  AZ: tariff("Arizona Public Service", 0.141, "hot", 13),
  NV: tariff("NV Energy", 0.138, "hot", 12.5),
  CO: tariff("Xcel Energy", 0.145, "cold", 8.5),
  WA: tariff("Puget Sound Energy", 0.118, "temperate", 10.5),
  OR: tariff("Portland General Electric", 0.142, "temperate", 13),
  IN: tariff("Indiana Michigan Power", 0.152, "cold", 12),
  WI: tariff("We Energies", 0.172, "cold", 15),
  MN: tariff("Xcel Energy Minnesota", 0.148, "cold", 10),
  MO: tariff("Ameren Missouri", 0.128, "temperate", 10),
  KS: tariff("Evergy", 0.138, "temperate", 14),
  TN: tariff("TVA / local distributor", 0.125, "temperate", 16),
  KY: tariff("Kentucky Utilities", 0.132, "temperate", 12),
  LA: tariff("Entergy Louisiana", 0.118, "hot", 12),
  MS: tariff("Entergy Mississippi", 0.128, "hot", 14),
  AR: tariff("Entergy Arkansas", 0.118, "hot", 11),
  OK: tariff("OG&E", 0.118, "temperate", 13),
  NM: tariff("PNM", 0.148, "temperate", 10),
  UT: tariff("Rocky Mountain Power", 0.118, "temperate", 10),
  ID: tariff("Idaho Power", 0.108, "temperate", 8),
  MT: tariff("NorthWestern Energy", 0.128, "cold", 8.5),
  ND: tariff("Xcel Energy North Dakota", 0.118, "cold", 10),
  SD: tariff("Xcel Energy South Dakota", 0.128, "cold", 10),
  NE: tariff("OPPD / local public power", 0.118, "cold", 12),
  IA: tariff("MidAmerican Energy", 0.128, "cold", 10),
  CT: tariff("Eversource Connecticut", 0.268, "cold", 12),
  RI: tariff("Rhode Island Energy", 0.248, "cold", 10),
  NH: tariff("Eversource New Hampshire", 0.238, "cold", 12),
  ME: tariff("Central Maine Power", 0.228, "cold", 13),
  VT: tariff("Green Mountain Power", 0.198, "cold", 14),
  DE: tariff("Delmarva Power", 0.168, "temperate", 12),
  MD: tariff("BGE", 0.178, "temperate", 12),
  DC: tariff("Pepco", 0.188, "temperate", 13),
  WV: tariff("Appalachian Power", 0.142, "temperate", 12),
  HI: tariff("Hawaiian Electric", 0.428, "hot", 18),
  AK: tariff("Chugach Electric", 0.228, "cold", 15),
};

const FL_CITY_COUNTY: Record<string, string> = {
  "cape coral": "Lee",
  "fort myers": "Lee",
  "north fort myers": "Lee",
  "lehigh acres": "Lee",
  "estero": "Lee",
  "bonita springs": "Lee",
  "sanibel": "Lee",
  "captiva": "Lee",
  "saint james city": "Lee",
  "st james city": "Lee",
  "bokeelia": "Lee",
  "matlacha": "Lee",
  "alva": "Lee",
  "naples": "Collier",
  "marco island": "Collier",
  "immokalee": "Collier",
  "everglades city": "Collier",
  "port charlotte": "Charlotte",
  "punta gorda": "Charlotte",
  "englewood": "Charlotte",
  "rotonda west": "Charlotte",
  "sarasota": "Sarasota",
  "venice": "Sarasota",
  "osprey": "Sarasota",
  "nokomis": "Sarasota",
  "north port": "Sarasota",
  "siesta key": "Sarasota",
  bradenton: "Manatee",
  palmetto: "Manatee",
  "lakewood ranch": "Manatee",
  "anna maria": "Manatee",
  "holmes beach": "Manatee",
  "bradenton beach": "Manatee",
  ellenton: "Manatee",
  parrish: "Manatee",
  cortez: "Manatee",
  "myakka city": "Manatee",
};

export function countyFromCity(city: string, state: string): string {
  if (state.toUpperCase() !== "FL") return "";
  return FL_CITY_COUNTY[city.trim().toLowerCase()] ?? "";
}

export function utilityFor(zip: string, state: string, county = ""): UtilityInfo {
  const z = zip.replace(/\D/g, "").slice(0, 5);
  const st = (state || stateFromZip(z) || "").toUpperCase();
  const cty = county.toLowerCase().replace(/\s+county$/, "").trim();

  if (FL_ZIP[z]) return FL_ZIP[z]!;
  if (isFloridaZip(z) || (st === "FL" && z.length !== 5)) {
    if (cty === "lee") return U.lcec;
    if (cty === "hillsborough" || cty === "pasco") return U.teco;
    if (cty === "pinellas" || cty === "hernando" || cty === "citrus" || cty === "marion") return U.duke;
    if (cty === "duval") return U.jea;
    if (cty === "orange" && z.startsWith("328")) return U.ouc;
    if (cty === "leon") return U.tal;
    if (cty === "alachua") return U.gru;
    if (cty === "monroe") return U.keys;
    const pref = FL_PREFIX[z.slice(0, 3)];
    if (pref) return pref;
    return U.fpl;
  }

  if (st === "IL") {
    const n = Number(z.slice(0, 3));
    if (n >= 600 && n <= 608) return U.comed;
    if (cty === "will" || cty === "cook" || cty === "dupage" || cty === "kane" || cty === "kendall" || cty === "lake" || cty === "mchenry") {
      return U.comed;
    }
    if (n >= 609 && n <= 629) return U.amerenIl;
    return U.comed;
  }

  if (st === "CA") {
    if (z.startsWith("921") || z.startsWith("919") || z.startsWith("920")) {
      return tariff("San Diego Gas & Electric", 0.348, "temperate", 16);
    }
    if (z.startsWith("900") || z.startsWith("902") || z.startsWith("903") || z.startsWith("904") || z.startsWith("907")) {
      return tariff("Los Angeles Department of Water and Power", 0.268, "temperate", 12);
    }
    return tariff("Pacific Gas & Electric", 0.312, "temperate", 15.2);
  }
  if (st === "TX") {
    if (z.startsWith("787") || z.startsWith("786")) return tariff("Austin Energy", 0.132, "hot", 12);
    if (z.startsWith("770") || z.startsWith("772") || z.startsWith("773") || z.startsWith("774") || z.startsWith("775")) {
      return tariff("CenterPoint Energy", 0.148, "hot", 10);
    }
    return tariff("Oncor / local REP", 0.151, "hot", 10);
  }

  return STATE_FALLBACK[st] ?? tariff("Local utility", 0.16, climateFromLat(40), 12);
}
