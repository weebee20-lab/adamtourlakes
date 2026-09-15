import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  adminDeleteLead,
  adminLeadLogin,
  adminLeadLogout,
  adminLeadStatus,
  adminListLeads,
  adminSetLeadStatus,
} from "@/lib/leads-rpc";
import type { ContactLead, LeadStatus } from "@/lib/leads-types";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/admin1776")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Inbox" },
      { name: "robots", content: "noindex,nofollow,noarchive" },
    ],
  }),
  component: AdminInbox,
});

type Filter = "all" | LeadStatus;

function AdminInbox() {
  const [unlocked, setUnlocked] = useState(false);
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [leads, setLeads] = useState<ContactLead[]>([]);
  const [filter, setFilter] = useState<Filter>("all");
  const [busy, setBusy] = useState(false);
  const [storage, setStorage] = useState<"neon" | "pglite" | "">("");

  async function load() {
    const res = await adminListLeads();
    if (!res.ok) {
      setUnlocked(false);
      setError("Logged in, but the inbox could not load. Refresh and try once more.");
      return false;
    }
    setLeads(res.leads);
    setUnlocked(true);
    return true;
  }

  useEffect(() => {
    void adminLeadStatus().then((s) => {
      if (s.storage) setStorage(s.storage);
      if (s.ok) void load();
    });
  }, []);

  async function onLogin(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    const res = await adminLeadLogin({ data: { password: password.trim() } });
    if (!res.ok) {
      setBusy(false);
      setError("Could not unlock. Check the admin password (not the site preview password).");
      return;
    }
    setPassword("");
    await load();
    setBusy(false);
  }

  async function setStatus(id: string, status: LeadStatus) {
    await adminSetLeadStatus({ data: { id, status } });
    setLeads((rows) => rows.map((row) => (row.id === id ? { ...row, status } : row)));
  }

  async function removeLead(id: string) {
    const res = await adminDeleteLead({ data: { id } });
    if (!res.ok) return;
    setLeads((rows) => rows.map((row) => (row.id === id ? { ...row, status: "deleted" } : row)));
    if (filter !== "deleted") setFilter("deleted");
  }

  const visible = useMemo(() => {
    if (filter === "all") return leads.filter((row) => row.status !== "deleted");
    return leads.filter((row) => row.status === filter);
  }, [leads, filter]);
  const calcLeads = visible.filter((row) => row.fromCalculator);
  const formLeads = visible.filter((row) => !row.fromCalculator);

  if (!unlocked) {
    return (
      <main className="mx-auto flex min-h-[70vh] max-w-sm flex-col justify-center px-4 py-16">
        <p className="text-xs font-medium tracking-[0.2em] text-gold uppercase">Private</p>
        <h1 className="mt-2 font-display text-3xl font-semibold tracking-tight">Inbox</h1>
        <form className="mt-6 flex flex-col gap-3" onSubmit={onLogin}>
          <Input
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="min-h-11"
            placeholder="Password"
          />
          {error ? <p className="text-sm text-gold">{error}</p> : null}
          <Button type="submit" disabled={busy || !password}>
            Unlock
          </Button>
        </form>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-medium tracking-[0.2em] text-gold uppercase">Private</p>
          <h1 className="mt-2 font-display text-3xl font-semibold tracking-tight">Contact forms</h1>
          <p className="mt-1 text-sm text-muted">
            {leads.filter((row) => row.status !== "deleted").length} active ·{" "}
            {leads.filter((row) => row.status === "deleted").length} in deleted
            {" · "}
            {storage === "neon"
              ? "Neon (durable)"
              : storage === "pglite"
                ? "Temporary memory — leads will vanish on restart"
                : ""}
          </p>
        </div>
        <Button
          type="button"
          variant="outline"
          onClick={async () => {
            await adminLeadLogout();
            setUnlocked(false);
            setLeads([]);
          }}
        >
          Lock
        </Button>
      </div>

      <div className="mt-6 inline-flex rounded-lg bg-surface-2 p-0.5 ring-1 ring-border">
        {(
          [
            ["all", "All"],
            ["new", "New"],
            ["contacted", "Contacted"],
            ["no_response", "No Response"],
            ["deleted", "Deleted"],
          ] as const
        ).map(([key, label]) => (
          <button
            key={key}
            type="button"
            className={cn(
              "rounded-md px-3 py-1.5 text-xs font-semibold transition-colors",
              filter === key ? "bg-gold text-gold-fg" : "text-muted hover:text-fg",
            )}
            onClick={() => setFilter(key)}
          >
            {label}
          </button>
        ))}
      </div>

      <LeadCard
        title="Free Solar Calculator"
        hint="Sized a system on this site"
        rows={calcLeads}
        design
        onStatus={setStatus}
        onRemove={removeLead}
      />
      <LeadCard
        title="Contact form"
        hint="Filled the form without a calculator design"
        rows={formLeads}
        onStatus={setStatus}
        onRemove={removeLead}
      />
    </main>
  );
}

function LeadCard({
  title,
  hint,
  rows,
  design,
  onStatus,
  onRemove,
}: {
  title: string;
  hint: string;
  rows: ContactLead[];
  design?: boolean;
  onStatus: (id: string, status: LeadStatus) => void;
  onRemove: (id: string) => void;
}) {
  const cols = design ? 11 : 9;
  return (
    <section className="mt-8 rounded-xl border border-border bg-surface">
      <div className="border-b border-border px-4 py-4 sm:px-5">
        <h2 className="font-display text-2xl font-semibold tracking-tight">{title}</h2>
        <p className="mt-1 text-sm text-muted">
          {hint} · {rows.length}
        </p>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[56rem] text-left text-sm">
          <thead className="border-b border-border text-xs tracking-[0.12em] text-gold uppercase">
            <tr>
              <th className="px-4 py-3 font-medium">Sent</th>
              <th className="px-4 py-3 font-medium">Name</th>
              <th className="px-4 py-3 font-medium">Email</th>
              <th className="px-4 py-3 font-medium">Phone</th>
              <th className="px-4 py-3 font-medium">Address</th>
              <th className="px-4 py-3 font-medium">Bill</th>
              {design ? <th className="px-4 py-3 font-medium">System</th> : null}
              {design ? <th className="px-4 py-3 font-medium">Batteries</th> : null}
              <th className="px-4 py-3 font-medium">Note</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium"> </th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td colSpan={cols} className="px-4 py-8 text-muted">
                  None in this view.
                </td>
              </tr>
            ) : (
              rows.map((lead) => (
                <tr key={lead.id} className="border-b border-border/70 align-top last:border-0">
                  <td className="px-4 py-3 whitespace-nowrap text-muted">{formatWhen(lead.createdAt)}</td>
                  <td className="px-4 py-3 font-medium">{lead.name}</td>
                  <td className="px-4 py-3">
                    <a className="text-gold hover:text-fg" href={`mailto:${lead.email}`}>
                      {lead.email}
                    </a>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    {lead.phone ? (
                      <a className="hover:text-gold" href={`tel:${lead.phone}`}>
                        {lead.phone}
                      </a>
                    ) : (
                      "—"
                    )}
                  </td>
                  <td className="px-4 py-3">{lead.address || lead.zip || "—"}</td>
                  <td className="font-num px-4 py-3 whitespace-nowrap">{lead.bill ? `$${lead.bill}` : "—"}</td>
                  {design ? (
                    <td className="px-4 py-3 whitespace-nowrap">
                      {lead.systemKw
                        ? `${lead.systemKw} kW${lead.panelCount ? ` (${lead.panelCount} panels)` : ""}`
                        : "—"}
                    </td>
                  ) : null}
                  {design ? (
                    <td className="px-4 py-3">
                      {lead.backup
                        ? lead.batteryName
                          ? `${lead.batteryCount && lead.batteryCount !== "1" ? `${lead.batteryCount}× ` : ""}${lead.batteryName}`
                          : "Yes"
                        : "No"}
                    </td>
                  ) : null}
                  <td className="max-w-[16rem] px-4 py-3 text-muted">{lead.message || "—"}</td>
                  <td className="px-4 py-3">
                    {lead.status === "deleted" ? (
                      <div className="flex flex-col gap-1">
                        <p className="text-xs text-muted">Wipes in 30 days</p>
                        <StatusBtn active={false} onClick={() => onStatus(lead.id, "new")}>
                          Restore
                        </StatusBtn>
                      </div>
                    ) : (
                      <div className="flex flex-col gap-1">
                        <StatusBtn
                          active={lead.status === "contacted"}
                          onClick={() => onStatus(lead.id, lead.status === "contacted" ? "new" : "contacted")}
                        >
                          Contacted
                        </StatusBtn>
                        <StatusBtn
                          active={lead.status === "no_response"}
                          onClick={() =>
                            onStatus(lead.id, lead.status === "no_response" ? "new" : "no_response")
                          }
                        >
                          No Response
                        </StatusBtn>
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    {lead.status === "deleted" ? null : (
                      <button
                        type="button"
                        className="rounded-md px-2 py-1 text-xs font-semibold text-muted hover:bg-surface-2 hover:text-gold"
                        onClick={() => onRemove(lead.id)}
                      >
                        Delete
                      </button>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function StatusBtn({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "rounded-md px-2 py-1 text-xs font-semibold whitespace-nowrap",
        active ? "bg-gold text-gold-fg" : "bg-surface-2 text-muted hover:text-fg",
      )}
    >
      {children}
    </button>
  );
}

function formatWhen(iso: string) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}