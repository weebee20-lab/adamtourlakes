import { Link, useRouterState } from "@tanstack/react-router";
import { Menu, Phone, X } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { SiteMark } from "@/components/site-mark";
import { COMPANY, NAV, SITE_NAME } from "@/lib/site";
import { cn } from "@/lib/utils";

export function SiteHeader() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <header className="sticky top-0 z-40 border-0 bg-bg/40 shadow-none backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
        <Link
          to="/"
          className="flex min-h-11 min-w-0 shrink-0 items-center gap-2 text-gold"
          aria-label={`${SITE_NAME} home`}
        >
          <span className="sun-mark-wrap">
            <span className="sun-mark">
              <SiteMark className="relative z-10 size-7" />
            </span>
          </span>
          <span className="font-display text-xl leading-none font-semibold tracking-tight text-gold sm:text-2xl">
            {SITE_NAME}
          </span>
        </Link>

        <nav className="hidden min-w-0 flex-1 items-center justify-end gap-0.5 sm:flex" aria-label="Primary">
          {NAV.map((item) => {
            const active = pathname === item.to || pathname.startsWith(`${item.to}/`);
            return (
              <Link
                key={item.to}
                to={item.to}
                preload="intent"
                aria-current={active ? "page" : undefined}
                className={cn(
                  "inline-flex h-11 items-center px-1.5 text-[11px] font-medium whitespace-nowrap transition-colors duration-150 md:px-2 md:text-xs xl:px-2.5 xl:text-sm",
                  active ? "text-gold" : "nav-glow-hover text-muted",
                )}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-2">
          <Button asChild size="sm" className="hidden sm:inline-flex">
            <a href={COMPANY.phoneHref}>
              <Phone className="size-4" />
              Get a quote
            </a>
          </Button>
          <button
            type="button"
            className="inline-flex size-11 items-center justify-center rounded-md text-fg sm:hidden"
            aria-expanded={open}
            aria-controls="mobile-nav"
            onClick={() => setOpen((v) => !v)}
          >
            {open ? <X className="size-5" /> : <Menu className="size-5" />}
            <span className="sr-only">{open ? "Close menu" : "Open menu"}</span>
          </button>
        </div>
      </div>

      {open ? (
        <div
          id="mobile-nav"
          className="border-t border-border bg-bg px-4 py-4 sm:hidden"
        >
          <nav className="flex flex-col" aria-label="Mobile">
            {NAV.map((item) => {
              const active = pathname === item.to || pathname.startsWith(`${item.to}/`);
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  className={cn(
                    "flex min-h-12 items-center border-b border-border text-base",
                    active ? "text-gold" : "nav-glow-hover text-fg",
                  )}
                >
                  {item.label}
                </Link>
              );
            })}
            <a
              href={COMPANY.phoneHref}
              className="mt-4 inline-flex min-h-12 items-center justify-center gap-2 rounded-md bg-gold px-4 text-sm font-medium text-gold-fg"
            >
              <Phone className="size-4" />
              Call {COMPANY.phoneDisplay}
            </a>
          </nav>
        </div>
      ) : null}
    </header>
  );
}
