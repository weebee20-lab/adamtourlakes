/** Custom-domain host only. Empty on grok.me / Vercel preview so we never emit a wrong canonical. */
export function publicShareHost() {
  const env = String(import.meta.env.VITE_PUBLIC_HOSTNAME ?? "").trim();
  const host =
    (env || "").split(",")[0]?.trim().split(":")[0]?.toLowerCase() ?? "";
  if (!host.includes(".")) return "";
  if (host === "localhost" || host.endsWith(".localhost")) return "";
  if (host === "vercel.app" || host.endsWith(".vercel.app")) return "";
  if (host === "vercel.com" || host.endsWith(".vercel.com")) return "";
  if (host.endsWith(".grok.me")) return "";
  if (/^\d{1,3}(?:\.\d{1,3}){3}$/.test(host)) return "";
  return host;
}

export function canonicalUrl(path: string, host = publicShareHost()) {
  if (!host) return "";
  const raw = path.startsWith("/") ? path : `/${path}`;
  if (raw === "/") return `https://${host}/`;
  return `https://${host}${raw.replace(/\/+$/, "")}`;
}

export function seoHead(title: string, description: string, path = "/") {
  const canonical = canonicalUrl(path);
  return {
    meta: [
      { title },
      { name: "description", content: description },
      { name: "robots", content: "index,follow" },
      { name: "author", content: "Adam Tourlakes" },
    ],
    links: canonical ? [{ rel: "canonical", href: canonical }] : [],
  };
}

export const PERSON_JSON_LD = {
  "@context": "https://schema.org",
  "@type": "Person",
  name: "Adam Tourlakes",
  jobTitle: "Sales Manager",
  description:
    "Sales Manager at Solar Energy Solutions of America, helping Southwest Florida homeowners design and install rooftop solar.",
  image: "/portraits/adam-studio.jpg",
  worksFor: {
    "@type": "Organization",
    name: "Solar Energy Solutions of America",
    url: "https://solarenergysolutionsofamerica.com",
    address: {
      "@type": "PostalAddress",
      streetAddress: "2528 Andalusia Blvd",
      addressLocality: "Cape Coral",
      addressRegion: "FL",
      postalCode: "33909",
      addressCountry: "US",
    },
    telephone: "+1-239-994-2100",
    foundingDate: "2018",
  },
  address: {
    "@type": "PostalAddress",
    addressLocality: "Cape Coral",
    addressRegion: "FL",
    addressCountry: "US",
  },
  areaServed: "Southwest Florida",
};

export const ORG_JSON_LD = {
  "@context": "https://schema.org",
  "@type": "LocalBusiness",
  "@id": "https://solarenergysolutionsofamerica.com/#org",
  name: "Solar Energy Solutions of America",
  url: "https://solarenergysolutionsofamerica.com",
  telephone: "+1-239-994-2100",
  image: "/images/waterfront-solar.jpg",
  address: {
    "@type": "PostalAddress",
    streetAddress: "2528 Andalusia Blvd",
    addressLocality: "Cape Coral",
    addressRegion: "FL",
    postalCode: "33909",
    addressCountry: "US",
  },
  areaServed: ["Cape Coral", "Fort Myers", "Southwest Florida"],
  foundingDate: "2018",
  employee: {
    "@type": "Person",
    name: "Adam Tourlakes",
    jobTitle: "Sales Manager",
  },
};
