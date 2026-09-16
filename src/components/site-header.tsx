import { Link, useRouterState } from "@tanstack/react-router";
import { Menu, X } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { SiteMark } from "@/components/site-mark";
import { NAV, SITE_NAME } from "@/lib/site";
import { cn } from "@/lib/utils";

export function SiteHeader() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const [open, setOpen] = useState(false);
  const [eduOpen, setEduOpen] = useState(false);
  const [eduHoverLocked, setEduHoverLocked] = useState(false);

  useEffect(() => {
    setOpen(false);
    setEduOpen(false);
  }, [pathname]);

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
      <div className="mx-auto flex h-12 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
        <Link
          to="/"
          className="flex min-h-10 min-w-0 shrink-0 items-center gap-2 text-gold"
          aria-label={`${SITE_NAME} home`}
        >
          <span className="sun-mark-wrap">
            <span className="sun-mark">
              <SiteMark className="relative z-10 size-6" />
            </span>
          </span>
          <span className="font-caps text-sm font-semibold tracking-[0.14em] text-gold uppercase sm:text-base">
            {SITE_NAME}
          </span>
        </Link>

        <nav className="hidden min-w-0 flex-1 items-center justify-end gap-0.5 lg:flex" aria-label="Primary">
          {NAV.map((item) => {
            const active = pathname === item.to || pathname.startsWith(`${item.to}/`);
            const children = "children" in item ? item.children : undefined;
            if (!children) {
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  preload="intent"
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "inline-flex h-10 items-center px-1.5 text-[11px] font-medium whitespace-nowrap transition-colors duration-150 md:px-2 md:text-xs xl:px-2.5 xl:text-sm",
                    active ? "text-gold" : "nav-glow-hover text-muted",
                  )}
                >
                  {item.label}
                </Link>
              );
            }
            return (
              <div
                key={item.to}
                className="relative"
                onMouseEnter={() => {
                  if (!eduHoverLocked) setEduOpen(true);
                }}
                onMouseLeave={() => {
                  setEduOpen(false);
                  setEduHoverLocked(false);
                }}
              >
                <Link
                  to={item.to}
                  preload="intent"
                  aria-current={active ? "page" : undefined}
                  aria-haspopup="menu"
                  aria-expanded={eduOpen}
                  onClick={() => {
                    setEduOpen(false);
                    setEduHoverLocked(true);
                  }}
                  className={cn(
                    "inline-flex h-10 items-center px-1.5 text-[11px] font-medium whitespace-nowrap transition-colors duration-150 md:px-2 md:text-xs xl:px-2.5 xl:text-sm",
                    active ? "text-gold" : "nav-glow-hover text-muted",
                  )}
                >
                  {item.label}
                </Link>
                <div
                  className={cn(
                    "absolute top-full left-1/2 z-50 w-max min-w-[14rem] -translate-x-1/2 pt-1 transition-[opacity,visibility] duration-150",
                    eduOpen ? "visible opacity-100" : "invisible opacity-0",
                  )}
                >
                  <div className="rounded-md border border-border/80 bg-bg/90 py-1 shadow-[var(--shadow-border)] backdrop-blur-xl">
                    {children.map((child) => {
                      const childActive = pathname === child.to;
                      return (
                        <Link
                          key={child.to}
                          to={child.to}
                          preload="intent"
                          aria-current={childActive ? "page" : undefined}
                          onClick={() => {
                            setEduOpen(false);
                            setEduHoverLocked(true);
                          }}
                          className={cn(
                            "flex h-10 items-center justify-center px-3 text-center text-xs font-medium whitespace-nowrap",
                            childActive ? "text-gold" : "nav-glow-hover text-muted",
                          )}
                        >
                          {child.label}
                        </Link>
                      );
                    })}
                  </div>
                </div>
              </div>
            );
          })}
        </nav>

        <div className="flex items-center gap-2">
          <Button asChild size="sm" className="hidden lg:inline-flex">
            <Link to="/contact">
              Get a quote
            </Link>
          </Button>
          <button
            type="button"
            className="inline-flex size-10 items-center justify-center rounded-md text-fg lg:hidden"
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
          className="border-t border-border bg-bg px-4 py-4 lg:hidden"
        >
          <nav className="flex flex-col" aria-label="Mobile">
            {NAV.map((item) => {
              const active = pathname === item.to || pathname.startsWith(`${item.to}/`);
              const children = "children" in item ? item.children : undefined;
              return (
                <div key={item.to}>
                  <Link
                    to={item.to}
                    className={cn(
                      "flex min-h-12 items-center border-b border-border text-base",
                      active ? "text-gold" : "nav-glow-hover text-fg",
                    )}
                  >
                    {item.label}
                  </Link>
                  {children?.map((child) => (
                    <Link
                      key={child.to}
                      to={child.to}
                      className={cn(
                        "flex min-h-11 items-center border-b border-border pl-4 text-sm",
                        pathname === child.to ? "text-gold" : "nav-glow-hover text-muted",
                      )}
                    >
                      {child.label}
                    </Link>
                  ))}
                </div>
              );
            })}
            <Link
              to="/contact"
              className="mt-4 inline-flex min-h-12 items-center justify-center rounded-md bg-gold px-4 text-sm font-medium text-gold-fg"
            >
              Get a quote
            </Link>
          </nav>
        </div>
      ) : null}
    </header>
  );
}
