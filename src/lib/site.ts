export const SITE_NAME = "Adam Tourlakes";
export const SITE_TAGLINE = "Solar for Southwest Florida";
export const JOB_TITLE = "Sales Manager";

export const COMPANY = {
  name: "Solar Energy Solutions of America",
  short: "SES of America",
  url: "https://solarenergysolutionsofamerica.com",
  contactUrl: "https://solarenergysolutionsofamerica.com/contact-us/",
  phone: "239-994-2100",
  phoneHref: "tel:+12399942100",
  phoneDisplay: "(239) 994-2100",
  addressLine: "2528 Andalusia Blvd",
  cityStateZip: "Cape Coral, FL 33909",
  founded: 2018,
  licenses: [
    { label: "Certified Solar Contractor", id: "CVC57062" },
    { label: "Certified Pool / Spa Contractor", id: "CPC1459638" },
  ],
} as const;

export const NAV = [
  { to: "/company", label: "Solar Energy Solutions of America", match: "prefix" as const },
  { to: "/solar", label: "Solar Education", match: "prefix" as const },
  { to: "/calculator", label: "Free Solar Calculator", match: "prefix" as const },
] as const;
