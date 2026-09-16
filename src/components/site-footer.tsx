import { Link } from "@tanstack/react-router";
import { COMPANY, NAV, SITE_NAME } from "@/lib/site";

export function SiteFooter() {
  return (
    <footer className="mt-auto border-t border-border bg-surface">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-12 sm:px-6 md:grid-cols-[1.4fr_1fr_1fr]">
        <div>
          <img
            src="/brand/signature-gold.png?v=3"
            alt={SITE_NAME}
            className="site-signature"
            width={2533}
            height={883}
          />
          <p className="mt-2 text-xs tracking-[0.14em] text-gold/80">
            © {new Date().getFullYear()} {SITE_NAME}
          </p>
          <p className="mt-3 max-w-sm text-sm leading-relaxed text-muted">
            Sales Manager at {COMPANY.name}. Cape Coral Office. Honest Numbers,
            In-House Installs, Southwest Florida Roofs.
          </p>
        </div>

        <div>
          <p className="text-xs font-medium tracking-[0.16em] text-gold">Pages</p>
          <ul className="mt-3 flex flex-col gap-2 text-sm">
            {NAV.map((item) => (
              <li key={item.to}>
                <Link to={item.to} className="text-muted transition-colors hover:text-fg">
                  {item.label}
                </Link>
              </li>
            ))}
            <li>
              <Link to="/solar/videos" className="text-muted transition-colors hover:text-fg">
                Solar Videos
              </Link>
            </li>
            <li>
              <Link to="/contact" className="text-muted transition-colors hover:text-fg">
                Contact Adam
              </Link>
            </li>
            <li>
              <Link to="/florida" className="text-muted transition-colors hover:text-fg">
                Florida Solar
              </Link>
            </li>
            <li>
              <Link to="/florida/lee-county" className="text-muted transition-colors hover:text-fg">
                Lee County
              </Link>
            </li>
            <li>
              <Link to="/florida/collier-county" className="text-muted transition-colors hover:text-fg">
                Collier County
              </Link>
            </li>
            <li>
              <Link to="/florida/charlotte-county" className="text-muted transition-colors hover:text-fg">
                Charlotte County
              </Link>
            </li>
            <li>
              <Link to="/florida/sarasota-county" className="text-muted transition-colors hover:text-fg">
                Sarasota County
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <p className="text-xs font-medium tracking-[0.16em] text-gold">Office</p>
          <address className="mt-3 not-italic text-sm leading-relaxed text-muted">
            {COMPANY.name}
            <br />
            {COMPANY.addressLine}
            <br />
            {COMPANY.cityStateZip}
            <br />
            <a href={COMPANY.phoneHref} className="mt-2 inline-block text-fg hover:text-gold">
              {COMPANY.phoneDisplay}
            </a>
            <br />
            <a
              href={COMPANY.url}
              className="text-blue hover:text-fg"
              rel="noreferrer"
              target="_blank"
            >
              Company Website
            </a>
          </address>
          <p className="mt-4 text-xs leading-relaxed text-muted">
            Licenses {COMPANY.licenses.map((l) => l.id).join(" · ")}
          </p>
        </div>
      </div>
      <div className="h-px w-full hairline" />
      <p className="mx-auto max-w-6xl px-4 py-5 text-xs text-muted sm:px-6">
        Independent Personal Site for {SITE_NAME}. Not the Official{" "}
        {COMPANY.short} Corporate Website.{" "}
        <Link to="/privacy" className="text-muted transition-colors hover:text-fg">
          Privacy
        </Link>
        {" · "}
        <Link to="/terms" className="text-muted transition-colors hover:text-fg">
          Terms
        </Link>
      </p>
    </footer>
  );
}
