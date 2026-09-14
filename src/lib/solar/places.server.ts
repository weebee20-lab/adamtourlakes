import { lookupZip, nearestZip, solarStrength, ghiFromLat } from "./zip";
import { countyFromCity, utilityFor } from "./utility";
import type { LocationInfo } from "./types";
import { bundledGoogleMapsKey } from "./bundled-secrets.server";
import { capCache, coalesce, envFileValue, fetchJson } from "./guard.server";
import type { AddressHit } from "./places";

const NASA_MONTHS = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"] as const;

const nasaCache = new Map<string, { ghi: number; ghiMonthly?: number[] }>();
const locCache = new Map<string, LocationInfo>();
const suggestCache = new Map<string, AddressHit[]>();

const STATE_LL: Record<string, [number, number]> = {
  AL: [32.6, -86.7], AZ: [34.3, -111.7], AR: [34.8, -92.2], CA: [37.2, -119.5], CO: [39.0, -105.5],
  CT: [41.6, -72.7], DE: [39.0, -75.5], FL: [27.8, -81.7], GA: [32.7, -83.4], IA: [42.0, -93.5],
  ID: [44.4, -114.6], IL: [40.6, -89.2], IN: [39.9, -86.3], KS: [38.5, -98.3], KY: [37.5, -85.3],
  LA: [31.0, -92.0], MA: [42.2, -71.5], MD: [39.0, -76.7], ME: [45.3, -69.2], MI: [44.3, -85.4],
  MN: [46.3, -94.3], MO: [38.4, -92.5], MS: [32.7, -89.7], MT: [47.0, -109.6], NC: [35.6, -79.4],
  ND: [47.4, -100.5], NE: [41.5, -99.8], NH: [43.7, -71.6], NJ: [40.2, -74.7], NM: [34.4, -106.1],
  NV: [39.3, -116.6], NY: [42.9, -75.5], OH: [40.3, -82.8], OK: [35.6, -97.5], OR: [43.9, -120.6],
  PA: [40.9, -77.8], RI: [41.7, -71.5], SC: [33.9, -80.9], SD: [44.4, -100.2], TN: [35.8, -86.3],
  TX: [31.5, -99.3], UT: [39.3, -111.7], VA: [37.5, -78.6], VT: [44.0, -72.7], WA: [47.4, -120.5],
  WI: [44.6, -89.8], WV: [38.6, -80.6], WY: [43.0, -107.6], DC: [38.9, -77.0], HI: [20.8, -156.3],
  AK: [64.2, -153.4],
};

function stateCodeOf(raw: string) {
  const t = raw.trim();
  if (/^[A-Za-z]{2}$/.test(t)) return t.toUpperCase();
  const names: Record<string, string> = {
    Alabama: "AL", Alaska: "AK", Arizona: "AZ", Arkansas: "AR", California: "CA", Colorado: "CO",
    Connecticut: "CT", Delaware: "DE", Florida: "FL", Georgia: "GA", Hawaii: "HI", Idaho: "ID",
    Illinois: "IL", Indiana: "IN", Iowa: "IA", Kansas: "KS", Kentucky: "KY", Louisiana: "LA",
    Maine: "ME", Maryland: "MD", Massachusetts: "MA", Michigan: "MI", Minnesota: "MN",
    Mississippi: "MS", Missouri: "MO", Montana: "MT", Nebraska: "NE", Nevada: "NV",
    "New Hampshire": "NH", "New Jersey": "NJ", "New Mexico": "NM", "New York": "NY",
    "North Carolina": "NC", "North Dakota": "ND", Ohio: "OH", Oklahoma: "OK", Oregon: "OR",
    Pennsylvania: "PA", "Rhode Island": "RI", "South Carolina": "SC", "South Dakota": "SD",
    Tennessee: "TN", Texas: "TX", Utah: "UT", Vermont: "VT", Virginia: "VA", Washington: "WA",
    "West Virginia": "WV", Wisconsin: "WI", Wyoming: "WY", "District of Columbia": "DC",
  };
  return Object.entries(names).find(([name]) => name.toLowerCase() === t.toLowerCase())?.[1] ?? "";
}

function titleStreet(value: string) {
  return value
    .toLowerCase()
    .replace(/\b\w/g, (c) => c.toUpperCase())
    .replace(/\b(Fl|Tx|Ny|Ca|Ga|Nc|Sc|Va|Md|Pa|Nj|Ma|Oh|Il|Mi|Wa|Or|Az|Nv|Co|Ut|Nm|Hi|Al|Tn|Ky|In|Wi|Mn|Mo|La|Ok|Ar|Ms|Ks|Ne|Ia|Ct|Ri|Nh|Me|Vt|De|Wv|Sd|Nd|Mt|Id|Wy|Ak)\b/g, (s) =>
      s.toUpperCase(),
    );
}

function formatHit(parts: { house?: string; street?: string; city?: string; state?: string; zip?: string }) {
  const street = [parts.house, parts.street].filter(Boolean).join(" ").replace(/\s+/g, " ").trim();
  const st = stateCodeOf(parts.state ?? "") || (parts.state ?? "");
  const city = parts.city || "";
  const zip = (parts.zip ?? "").replace(/\D/g, "").slice(0, 5);
  const cityLine = [city, st].filter(Boolean).join(", ");
  const label = [street || null, cityLine || null, zip || null].filter(Boolean).join(", ");
  return { label: titleStreet(label), city, state: st, zip };
}

function pushUnique(out: AddressHit[], hit: AddressHit) {
  if (hit.label.length < 6) return;
  if (out.some((o) => o.label.toLowerCase() === hit.label.toLowerCase())) return;
  out.push(hit);
}

function queryState(q: string): string {
  const m = q.match(/,\s*([A-Za-z]{2})\s*(?:\d{5})?$/) || q.match(/\b([A-Za-z]{2})\s+\d{5}\b/) || q.match(/\s([A-Za-z]{2})$/);
  if (m?.[1] && /^[A-Za-z]{2}$/.test(m[1]) && STATE_LL[m[1].toUpperCase()]) return m[1].toUpperCase();
  const named = q.match(
    /\b(Alabama|Alaska|Arizona|Arkansas|California|Colorado|Connecticut|Delaware|Florida|Georgia|Hawaii|Idaho|Illinois|Indiana|Iowa|Kansas|Kentucky|Louisiana|Maine|Maryland|Massachusetts|Michigan|Minnesota|Mississippi|Missouri|Montana|Nebraska|Nevada|New Hampshire|New Jersey|New Mexico|New York|North Carolina|North Dakota|Ohio|Oklahoma|Oregon|Pennsylvania|Rhode Island|South Carolina|South Dakota|Tennessee|Texas|Utah|Vermont|Virginia|Washington|West Virginia|Wisconsin|Wyoming)\b/i,
  );
  return named ? stateCodeOf(named[1] ?? "") : "";
}

function hasHouseNumber(q: string) {
  return /^\d+\s+\S/.test(q.trim());
}

function censusLabel(matched: string) {
  return titleStreet(matched.replace(/,\s*([A-Z]{2}),\s*(\d{5})\s*$/, ", $1 $2"));
}

function expandQuery(q: string): string {
  const pairs: Array<[RegExp, string]> = [
    [/\bSt\b\.?/i, "Street"],
    [/\bStreet\b/i, "St"],
    [/\bAve\b\.?/i, "Avenue"],
    [/\bAvenue\b/i, "Ave"],
    [/\bWay\b/i, "Rd"],
    [/\bRd\b\.?/i, "Road"],
    [/\bRoad\b/i, "Rd"],
    [/\bDr\b\.?/i, "Drive"],
    [/\bLn\b\.?/i, "Lane"],
    [/\bCt\b\.?/i, "Court"],
    [/\bBlvd\b\.?/i, "Boulevard"],
    [/\bCir\b\.?/i, "Circle"],
    [/\bPl\b\.?/i, "Place"],
    [/\bTer\b\.?/i, "Terrace"],
    [/\bPkwy\b\.?/i, "Parkway"],
    [/\bHwy\b\.?/i, "Highway"],
    [/\bTrl\b\.?/i, "Trail"],
  ];
  for (const [re, to] of pairs) {
    if (re.test(q)) return q.replace(re, to);
  }
  return q;
}

function queryVariants(q: string): string[] {
  const seen = new Set<string>();
  const add = (value: string) => {
    const t = value.replace(/\s+/g, " ").trim();
    if (t) seen.add(t);
  };
  add(q);
  add(expandQuery(q));
  const pairs: Array<[RegExp, string]> = [
    [/\bSt\b\.?/i, "Street"],
    [/\bStreet\b/i, "St"],
    [/\bAve\b\.?/i, "Avenue"],
    [/\bAvenue\b/i, "Ave"],
    [/\bWay\b/i, "Rd"],
    [/\bWay\b/i, "Road"],
    [/\bRd\b\.?/i, "Way"],
    [/\bRd\b\.?/i, "Road"],
    [/\bRoad\b/i, "Way"],
    [/\bRoad\b/i, "Rd"],
    [/\bDr\b\.?/i, "Drive"],
    [/\bDrive\b/i, "Dr"],
    [/\bLn\b\.?/i, "Lane"],
    [/\bLane\b/i, "Ln"],
    [/\bCt\b\.?/i, "Court"],
    [/\bBlvd\b\.?/i, "Boulevard"],
    [/\bCir\b\.?/i, "Circle"],
    [/\bPl\b\.?/i, "Place"],
    [/\bTer\b\.?/i, "Terrace"],
    [/\bPkwy\b\.?/i, "Parkway"],
    [/\bHwy\b\.?/i, "Highway"],
    [/\bTrl\b\.?/i, "Trail"],
  ];
  for (const [re, to] of pairs) {
    if (re.test(q)) add(q.replace(re, to));
  }
  add(q.replace(/\b([A-Za-z]{3,})(bank|wood|view|side|shore|gate|point|haven|crest|ridge)\b/i, "$1 $2"));
  add(q.replace(/\b([A-Za-z]{3,})\s+(bank|wood|view|side|shore|gate|point|haven|crest|ridge)\b/i, "$1$2"));
  return [...seen];
}

function typedHouse(q: string) {
  return q.trim().match(/^(\d+[A-Za-z]?)\s+\S/)?.[1] ?? "";
}

function typedCity(q: string) {
  const parts = q.split(",").map((p) => p.trim()).filter(Boolean);
  if (parts.length >= 2) {
    const mid = parts[1] ?? "";
    const city = mid
      .replace(/\b[A-Za-z]{2}\b\s*\d{5}.*$/, "")
      .replace(/\b[A-Za-z]{2}\s*$/, "")
      .replace(/\d{5}.*$/, "")
      .trim();
    if (city.length > 2) return city;
  }
  const m = q
    .replace(/,/g, " ")
    .match(
      /\b(?:St|Street|Ave|Avenue|Rd|Road|Way|Dr|Drive|Ln|Lane|Ct|Court|Blvd|Boulevard|Cir|Circle|Pl|Place|Ter|Terrace|Pkwy|Parkway|Hwy|Highway|Trl|Trail|Pass|Loop)\b\.?\s+(.+?)\s+([A-Za-z]{2})(?:\s+\d{5})?\s*$/i,
    );
  const city = m?.[1]?.trim() ?? "";
  if (city.length > 2 && !/^\d/.test(city)) return city;
  return "";
}

type SuggestSource = "census" | "nominatim" | "photon" | "google" | "zip";
type RankedHit = AddressHit & { source: SuggestSource };

function citiesAlign(want: string, got: string) {
  if (!want || !got) return "none";
  if (want === got) return "exact";
  if (got.includes(want) || want.includes(got)) return "soft";
  return "conflict";
}

function rankHits(hits: RankedHit[], q: string): AddressHit[] {
  const house = typedHouse(q).toLowerCase();
  const wantCity = typedCity(q).toLowerCase();
  const wantState = queryState(q);
  const scored = hits.map((hit) => {
    const city = (hit.city || "").toLowerCase();
    const label = hit.label.toLowerCase();
    const st = (hit.state || "").toUpperCase();
    let n = 0;
    const cityFit = citiesAlign(wantCity, city);
    if (cityFit === "exact") n += 120;
    else if (cityFit === "soft") n += 70;
    else if (cityFit === "conflict") n -= 80;
    if (wantState) {
      if (st === wantState) n += 40;
      else if (st.length === 2) n -= 55;
    }
    if (hit.source === "google") n += 55;
    else if (hit.source === "census") n += 45;
    else if (hit.source === "nominatim") n += 40;
    else if (hit.source === "photon") n += 8;
    if (house && (label.startsWith(`${house} `) || label.startsWith(house))) n += 25;
    else if (house) n -= 8;
    return { hit, n };
  });
  scored.sort((a, b) => b.n - a.n);
  const out: AddressHit[] = [];
  for (const row of scored) {
    const { source: _source, ...hit } = row.hit;
    pushUnique(out, hit);
  }
  return out;
}

async function censusHits(q: string): Promise<AddressHit[]> {
  const url = `https://geocoding.geo.census.gov/geocoder/locations/onelineaddress?address=${encodeURIComponent(q)}&benchmark=Public_AR_Current&format=json`;
  const data = (await fetchJson(url, 1800)) as {
    result?: {
      addressMatches?: Array<{
        matchedAddress?: string;
        addressComponents?: { city?: string; state?: string; zip?: string };
      }>;
    };
  } | null;
  const out: AddressHit[] = [];
  for (const m of data?.result?.addressMatches ?? []) {
    if (!m.matchedAddress) continue;
    const c = m.addressComponents ?? {};
    const hit = formatHit({
      street: censusLabel(m.matchedAddress).replace(/, [^,]+$/, ""),
      city: c.city,
      state: c.state,
      zip: c.zip,
    });
    hit.label = censusLabel(m.matchedAddress);
    pushUnique(out, hit);
  }
  return out;
}

async function censusPoint(q: string) {
  const url = `https://geocoding.geo.census.gov/geocoder/locations/onelineaddress?address=${encodeURIComponent(q)}&benchmark=Public_AR_Current&format=json`;
  const data = (await fetchJson(url, 1800)) as {
    result?: {
      addressMatches?: Array<{
        matchedAddress?: string;
        coordinates?: { x?: number; y?: number };
        addressComponents?: { city?: string; state?: string; zip?: string };
      }>;
    };
  } | null;
  const m = data?.result?.addressMatches?.[0];
  if (!m?.coordinates || !Number.isFinite(m.coordinates.y) || !Number.isFinite(m.coordinates.x)) return null;
  const c = m.addressComponents ?? {};
  return {
    lat: Number(m.coordinates.y),
    lng: Number(m.coordinates.x),
    city: c.city || "",
    state: c.state || "",
    zip: (c.zip ?? "").replace(/\D/g, "").slice(0, 5),
    address: m.matchedAddress ? censusLabel(m.matchedAddress) : q,
  };
}

async function photonHits(q: string): Promise<AddressHit[]> {
  const st = queryState(q) || "FL";
  const ll = STATE_LL[st] ?? STATE_LL.FL;
  const bias = ll ? `&lat=${ll[0]}&lon=${ll[1]}` : "";
  const url = `https://photon.komoot.io/api/?q=${encodeURIComponent(q)}&limit=8&lang=en${bias}`;
  const data = (await fetchJson(url, 1400)) as {
    features?: Array<{
      properties?: {
        housenumber?: string;
        street?: string;
        name?: string;
        city?: string;
        locality?: string;
        state?: string;
        postcode?: string;
        countrycode?: string;
      };
    }>;
  } | null;
  const out: AddressHit[] = [];
  for (const f of data?.features ?? []) {
    const p = f.properties ?? {};
    if (p.countrycode && p.countrycode.toUpperCase() !== "US") continue;
    const hit = formatHit({
      house: p.housenumber,
      street: p.street || p.name,
      city: p.city || p.locality,
      state: p.state,
      zip: p.postcode,
    });
    pushUnique(out, hit);
  }
  return out;
}

async function nominatimHits(q: string): Promise<AddressHit[]> {
  const url = `https://nominatim.openstreetmap.org/search?format=json&addressdetails=1&limit=6&countrycodes=us&viewbox=-87.63,31.00,-79.97,24.40&q=${encodeURIComponent(q)}`;
  const rows = (await fetchJson(url, 1400)) as Array<{
    address?: {
      house_number?: string;
      road?: string;
      city?: string;
      town?: string;
      village?: string;
      hamlet?: string;
      state?: string;
      postcode?: string;
    };
  }> | null;
  const out: AddressHit[] = [];
  for (const row of rows ?? []) {
    const a = row.address ?? {};
    const hit = formatHit({
      house: a.house_number,
      street: a.road,
      city: a.city || a.town || a.village || a.hamlet,
      state: a.state,
      zip: a.postcode,
    });
    pushUnique(out, hit);
  }
  return out;
}

async function googleHits(q: string): Promise<AddressHit[]> {
  let key = "";
  for (const value of [process.env.GOOGLE_MAPS_API_KEY, bundledGoogleMapsKey, envFileValue("GOOGLE_MAPS_API_KEY")]) {
    const next = String(value ?? "").trim();
    if (next.startsWith("AIza")) {
      key = next;
      break;
    }
  }
  if (!key) return [];
  const url = `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${encodeURIComponent(q)}&types=address&components=country:us&key=${encodeURIComponent(key)}`;
  const data = (await fetchJson(url, 2500)) as {
    predictions?: Array<{ description?: string; structured_formatting?: { main_text?: string; secondary_text?: string } }>;
  } | null;
  const out: AddressHit[] = [];
  for (const p of data?.predictions ?? []) {
    const label = p.description || "";
    const secondary = p.structured_formatting?.secondary_text ?? "";
    const cityMatch = secondary.match(/^([^,]+),\s*([A-Z]{2})(?:\s+(\d{5}))?/);
    const hit = formatHit({
      street: p.structured_formatting?.main_text || label.split(",")[0],
      city: cityMatch?.[1],
      state: cityMatch?.[2],
      zip: cityMatch?.[3],
    });
    if (!hit.city && label) hit.label = titleStreet(label);
    pushUnique(out, hit);
  }
  return out;
}

function zipHits(q: string): AddressHit[] {
  const digits = q.replace(/\D/g, "");
  const row = lookupZip(digits.length === 5 ? digits : digits.padEnd(5, "0").slice(0, 5));
  if (!row) return [];
  return [{ label: `${row.city}, ${row.state} ${row.zip}`, city: row.city, state: row.state, zip: row.zip }];
}

const SUGGEST_CACHE_VER = "v5";

export async function lookupSuggestions(q: string): Promise<AddressHit[]> {
  const key = `${SUGGEST_CACHE_VER}:${q.toLowerCase()}`;
  const cached = suggestCache.get(key);
  if (cached?.length) return cached;
  return coalesce(`suggest:${key}`, async () => {
    const hit = suggestCache.get(key);
    if (hit?.length) return hit;
    if (/^\d{5}$/.test(q)) {
      const zips = zipHits(q);
      if (zips.length) {
        suggestCache.set(key, zips);
        capCache(suggestCache, 160);
        return zips;
      }
    }
    const ranked: RankedHit[] = zipHits(q).map((row) => ({ ...row, source: "zip" as const }));
    const tag = (source: SuggestSource, pack: AddressHit[]): RankedHit[] => pack.map((row) => ({ ...row, source }));
    const jobs: Array<Promise<RankedHit[]>> = [photonHits(q).then((pack) => tag("photon", pack))];
    if (hasHouseNumber(q)) {
      jobs.push(censusHits(q).then((pack) => tag("census", pack)));
      jobs.push(nominatimHits(q).then((pack) => tag("nominatim", pack)));
      jobs.push(googleHits(q).then((pack) => tag("google", pack)));
    } else if (q.includes(",")) {
      jobs.push(nominatimHits(q).then((pack) => tag("nominatim", pack)));
    }
    const packs = await Promise.allSettled(jobs);
    for (const pack of packs) {
      if (pack.status === "fulfilled") for (const row of pack.value) ranked.push(row);
    }
    const sliced = rankHits(ranked, q)
      .filter((row) => !row.state || row.state.toUpperCase() === "FL")
      .slice(0, 8);
    if (sliced.length) {
      suggestCache.set(key, sliced);
      capCache(suggestCache, 160);
    }
    return sliced;
  });
}

async function nasaPoint(lat: number, lng: number) {
  const key = `${lat.toFixed(2)},${lng.toFixed(2)}`;
  const hit = nasaCache.get(key);
  if (hit) return hit;
  return coalesce(`nasa:${key}`, async () => {
    const cached = nasaCache.get(key);
    if (cached) return cached;
    const url = `https://power.larc.nasa.gov/api/temporal/climatology/point?parameters=ALLSKY_SFC_SW_DWN&community=RE&longitude=${lng}&latitude=${lat}&format=JSON`;
    const nasa = (await fetchJson(url, 1600)) as {
      properties?: { parameter?: { ALLSKY_SFC_SW_DWN?: Record<string, number> } };
    } | null;
    const table = nasa?.properties?.parameter?.ALLSKY_SFC_SW_DWN ?? {};
    const monthly = NASA_MONTHS.map((k) => Number(table[k] ?? 0));
    const ann = Number(table.ANN ?? 0);
    const avg = monthly.every((n) => n > 0) ? monthly.reduce((a, b) => a + b, 0) / 12 : 0;
    const ghi = ann > 1 ? ann : avg;
    if (!(ghi > 1)) return null;
    const out = {
      ghi,
      ghiMonthly: monthly.length === 12 && monthly.every((v) => v > 0) ? monthly : undefined,
    };
    nasaCache.set(key, out);
    capCache(nasaCache, 200);
    return out;
  });
}

async function geocodeZip(zip: string): Promise<{
  city: string;
  state: string;
  county: string;
  lat: number;
  lng: number;
} | null> {
  const zippoP = fetchJson(`https://api.zippopotam.us/us/${zip}`, 1500).then((raw) => {
    const zp = raw as {
      "state abbreviation"?: string;
      places?: Array<{ "place name"?: string; latitude?: string; longitude?: string }>;
    } | null;
    const place = zp?.places?.[0];
    if (!place) return null;
    const city = place["place name"] || "";
    const state = zp?.["state abbreviation"] || "";
    const lat = Number(place.latitude);
    const lng = Number(place.longitude);
    if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;
    return { city, state, county: countyFromCity(city, state), lat, lng };
  });
  const nomP = fetchJson(
    `https://nominatim.openstreetmap.org/search?postalcode=${zip}&countrycodes=us&format=json&addressdetails=1&limit=1`,
    1800,
  ).then((raw) => {
    const hit = (raw as Array<{
      lat: string;
      lon: string;
      address?: { city?: string; town?: string; village?: string; hamlet?: string; state?: string; county?: string };
    }> | null)?.[0];
    if (!hit) return null;
    const city = hit.address?.city || hit.address?.town || hit.address?.village || hit.address?.hamlet || "";
    const state = stateCodeOf(hit.address?.state ?? "");
    const county = (hit.address?.county ?? "").replace(/ County$/i, "") || countyFromCity(city, state);
    const lat = Number(hit.lat);
    const lng = Number(hit.lon);
    if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;
    return { city, state, county, lat, lng };
  });
  const zippo = await zippoP;
  if (zippo) return zippo;
  return nomP;
}

export async function lookupLocation(q: string): Promise<LocationInfo | null> {
  const cacheKey = q.toLowerCase();
  const cached = locCache.get(cacheKey);
  if (cached?.zip && cached.city) return cached;
  return coalesce(`resolve:${cacheKey}`, async () => {
    const warm = locCache.get(cacheKey);
    if (warm?.zip && warm.city) return warm;
    const zip = (q.match(/\b(\d{5})\b/)?.[1] ?? q.replace(/\D/g, "")).slice(0, 5);
    const zipOnly = /^\d{5}$/.test(q);
    let row = zip.length === 5 ? lookupZip(zip) : null;
    let lat = row?.lat ?? NaN;
    let lng = row?.lng ?? NaN;
    let city = row?.city ?? "";
    let state = row?.state ?? "";
    let county = row?.county ?? "";
    let address = q;
    let actualZip = zip.length === 5 ? zip : "";

    if (zipOnly && actualZip) {
      if (!(row && Number.isFinite(lat) && Number.isFinite(lng))) {
        const geo = await geocodeZip(actualZip);
        if (geo) {
          city = geo.city || city;
          state = geo.state || state;
          county = geo.county || county || countyFromCity(city, state);
          lat = geo.lat;
          lng = geo.lng;
        }
      }
    } else {
      let placed = false;
      if (hasHouseNumber(q) || q.includes(",")) {
        const c = await censusPoint(q);
        if (c) {
          lat = c.lat;
          lng = c.lng;
          city = c.city || city;
          state = c.state || state;
          county = county || countyFromCity(city, state);
          address = c.address;
          if (c.zip.length === 5) {
            actualZip = c.zip;
            row = lookupZip(c.zip) ?? row;
          }
          placed = true;
        }
      }
      if (!placed) {
        const geo = (await fetchJson(
          `https://nominatim.openstreetmap.org/search?format=json&limit=1&addressdetails=1&countrycodes=us&viewbox=-87.63,31.00,-79.97,24.40&q=${encodeURIComponent(q)}`,
          1600,
        )) as Array<{
          lat: string;
          lon: string;
          display_name?: string;
          address?: { city?: string; town?: string; village?: string; hamlet?: string; state?: string; postcode?: string; county?: string };
        }> | null;
        const hit = geo?.[0];
        if (hit) {
          lat = Number(hit.lat);
          lng = Number(hit.lon);
          city = hit.address?.city || hit.address?.town || hit.address?.village || hit.address?.hamlet || city;
          state = stateCodeOf(hit.address?.state ?? "") || state;
          county = (hit.address?.county ?? county).replace(/ County$/i, "") || countyFromCity(city, state);
          address = hit.display_name ?? q;
          const z = (hit.address?.postcode ?? zip).replace(/\D/g, "").slice(0, 5);
          if (z.length === 5) {
            actualZip = z;
            row = lookupZip(z) ?? row;
          }
        }
      }
    }

    if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
      if (!row) return null;
      lat = row.lat;
      lng = row.lng;
    }
    if (!row) row = lookupZip(actualZip) ?? nearestZip(lat, lng);
    if (actualZip.length !== 5) actualZip = row.zip;
    if (!state) state = row.state;
    if (!city) city = row.city;
    if (!county) county = row.county || countyFromCity(city, state);

    const util = utilityFor(actualZip, state, county);
    const zipGhi = row.ghi || ghiFromLat(lat);
    let ghi = zipGhi;
    let ghiMonthly: number[] | undefined;
    let nasa = false;
    try {
      const sun = await nasaPoint(lat, lng);
      if (sun) {
        ghi = sun.ghi;
        ghiMonthly = sun.ghiMonthly;
        nasa = true;
      }
    } catch {
      ghi = zipGhi;
      nasa = false;
    }
    const loc: LocationInfo = {
      label: `${city || row.city}, ${state} ${actualZip}`,
      address,
      city: city || row.city,
      state,
      zip: actualZip,
      county: county || row.county,
      lat,
      lng,
      ghi,
      zipGhi,
      ghiMonthly,
      nasa,
      climate: util.climate,
      rate: util.rate,
      customerCharge: util.customerCharge,
      utilityName: util.utility,
      solarStrength: solarStrength(ghi || zipGhi, lat),
    };
    locCache.set(cacheKey, loc);
    capCache(locCache, 80);
    return loc;
  });
}
