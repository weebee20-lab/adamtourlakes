export type HubFaq = { q: string; a: string };
export type HubChild = {
  to:
    | "/florida/lee-county"
    | "/florida/collier-county"
    | "/florida/charlotte-county"
    | "/florida/sarasota-county";
  label: string;
};

export const FLORIDA_CHILDREN: HubChild[] = [
  { to: "/florida/lee-county", label: "Lee County (Cape Coral & Fort Myers)" },
  { to: "/florida/collier-county", label: "Collier County (Naples)" },
  { to: "/florida/charlotte-county", label: "Charlotte County (Punta Gorda)" },
  { to: "/florida/sarasota-county", label: "Sarasota County (Sarasota & Venice)" },
];

export const FLORIDA_FAQ: HubFaq[] = [
  {
    q: "Does every Florida utility credit extra solar the same way?",
    a: "No. Credits, netting periods, and export rules vary by utility — FPL, LCEC, a muni, or a co-op — and they can change. I won’t invent a Florida rate table. We confirm what applies to your meter on the bill.",
  },
  {
    q: "Do more panels keep the house on during a hurricane?",
    a: "No. Grid-tied rooftop solar shuts off when the grid drops. That’s islanding protection. Backup is batteries, sized as their own decision after the array.",
  },
  {
    q: "Where does Adam actually install?",
    a: "Southwest Florida: Lee, Collier, Charlotte, and Sarasota counties — Cape Coral, Fort Myers, Naples, Punta Gorda, Sarasota, Venice, and the surrounding coast. If you’re elsewhere in Florida, use the free calculator and HelioSolarCalculator.com to find installers in your area.",
  },
];
