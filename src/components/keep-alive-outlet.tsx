import { useRef, type ReactNode } from "react";
import { Outlet, useRouterState } from "@tanstack/react-router";
import { DesignerApp } from "@/components/designer-app";
import { HomePage } from "@/routes/index";

const CACHED = new Set(["/", "/calculator"]);

function Pane({ active, children }: { active: boolean; children: ReactNode }) {
  return (
    <div hidden={!active} className={active ? undefined : "hidden"} inert={!active} aria-hidden={!active}>
      {children}
    </div>
  );
}

export function KeepAliveOutlet() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const seen = useRef(new Set<string>(["/"]));
  seen.current.add(pathname);

  return (
    <>
      {seen.current.has("/") ? (
        <Pane active={pathname === "/"}>
          <HomePage />
        </Pane>
      ) : null}
      {seen.current.has("/calculator") ? (
        <Pane active={pathname === "/calculator"}>
          <main>
            <DesignerApp />
          </main>
        </Pane>
      ) : null}
      {CACHED.has(pathname) ? null : <Outlet />}
    </>
  );
}