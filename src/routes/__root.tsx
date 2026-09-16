import { createRootRoute, HeadContent, Scripts } from "@tanstack/react-router";
import { AuthProvider } from "@/lib/auth/provider";
import { KeepAliveOutlet } from "@/components/keep-alive-outlet";
import { IpadFlag, IPAD_FLAG_SCRIPT } from "@/components/ipad-flag";
import { PreviewHostBridge } from "@/components/preview-host-bridge";
import { SiteFooter } from "@/components/site-footer";
import { SiteGate } from "@/components/site-gate";
import { SiteHeader } from "@/components/site-header";
import { AppErrorComponent } from "@/lib/error-component";
import { PERSON_JSON_LD, seoHead } from "@/lib/seo";
import { SITE_NAME } from "@/lib/site";
import appCss from "../styles.css?url";

export const Route = createRootRoute({
  errorComponent: AppErrorComponent,
  head: () => {
    const page = seoHead(
      `${SITE_NAME} | Solar for Southwest Florida`,
      "Adam Tourlakes, Sales Manager at Solar Energy Solutions of America in Cape Coral. Honest rooftop solar for Southwest Florida homeowners — plus a clear guide to how systems work.",
    );
    return {
      meta: [
        { charSet: "utf-8" },
        { name: "viewport", content: "width=device-width, initial-scale=1, viewport-fit=cover" },
        ...page.meta,
        { name: "theme-color", content: "#08090c" },
      ],
      links: [
        { rel: "icon", type: "image/svg+xml", href: "/favicon.svg" },
        { rel: "stylesheet", href: appCss },
        { rel: "manifest", href: "/__grok/manifest.webmanifest" },
        { rel: "apple-touch-icon", href: "/__grok/icon-180.png" },
        { rel: "preconnect", href: "https://fonts.googleapis.com" },
        { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
        {
          rel: "stylesheet",
          href: "https://fonts.googleapis.com/css2?family=Cinzel:wght@500;600;700&family=Cormorant+Garamond:ital,wght@0,500;0,600;0,700;1,500&family=Outfit:wght@400;500;600;700&display=swap",
        },
        ...page.links,
      ],
      scripts: [{ src: "/ipad-flag.js?v=2" }],
    };
  },
  component: RootDocument,
});

function RootDocument() {
  return (
    <html lang="en" className="antialiased" suppressHydrationWarning>
      <head>
        <HeadContent />
        <script dangerouslySetInnerHTML={{ __html: IPAD_FLAG_SCRIPT }} />
      </head>
      <body className="flex min-h-dvh flex-col bg-bg text-fg">
        <PreviewHostBridge />
        <IpadFlag />
        <AuthProvider>
          <SiteGate>
            <SiteHeader />
            <KeepAliveOutlet />
            <SiteFooter />
          </SiteGate>
        </AuthProvider>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(PERSON_JSON_LD) }}
        />
        <Scripts />
      </body>
    </html>
  );
}
