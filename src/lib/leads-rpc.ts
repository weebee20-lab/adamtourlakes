import { createServerFn } from "@tanstack/react-start";
import type { ContactLead, LeadStatus } from "@/lib/leads-types";
import { isSwflZip, zipFromText } from "@/lib/swfl";

function text(value: unknown, max: number) {
  return String(value ?? "").trim().slice(0, max);
}

export const saveContactLead = createServerFn({ method: "POST" })
  .validator((d: Record<string, unknown>) => ({
    name: text(d?.name, 80),
    email: text(d?.email, 120),
    phone: text(d?.phone, 40),
    address: text(d?.address, 200),
    bill: text(d?.bill, 20),
    backup: Boolean(d?.backup),
    message: text(d?.message, 2000),
  }))
  .handler(async ({ data }) => {
    if (!data.name || !data.email) return { ok: false as const, error: "Name and email are required." };
    const zip = zipFromText(data.address);
    if (isSwflZip(zip) === false) return { ok: false as const, error: "out_of_area" as const };
    const { insertLead } = await import("@/lib/leads.server");
    await insertLead({
      name: data.name,
      email: data.email,
      phone: data.phone,
      address: data.address,
      zip,
      bill: data.bill,
      backup: data.backup,
      message: data.message,
    });
    return { ok: true as const };
  });

export const adminLeadStatus = createServerFn({ method: "POST" }).handler(async () => {
  const { isAdmin } = await import("@/lib/leads.server");
  return { ok: isAdmin() };
});

export const adminLeadLogin = createServerFn({ method: "POST" })
  .validator((d: { password: string }) => ({ password: text(d?.password, 80) }))
  .handler(async ({ data }) => {
    const { loginAdmin } = await import("@/lib/leads.server");
    const ok = loginAdmin(data.password);
    return ok ? { ok: true as const } : { ok: false as const, error: "That password does not match." };
  });

export const adminLeadLogout = createServerFn({ method: "POST" }).handler(async () => {
  const { logoutAdmin } = await import("@/lib/leads.server");
  logoutAdmin();
  return { ok: true as const };
});

export const adminListLeads = createServerFn({ method: "POST" }).handler(async () => {
  const mod = await import("@/lib/leads.server");
  if (!mod.isAdmin()) return { ok: false as const, error: "locked" as const, leads: [] as ContactLead[] };
  const leads = await mod.listLeads();
  return { ok: true as const, leads };
});

export const adminSetLeadStatus = createServerFn({ method: "POST" })
  .validator((d: { id: string; status: LeadStatus }) => ({
    id: text(d?.id, 80),
    status: (["new", "contacted", "no_response"].includes(d?.status) ? d.status : "new") as LeadStatus,
  }))
  .handler(async ({ data }) => {
    const mod = await import("@/lib/leads.server");
    if (!mod.isAdmin()) return { ok: false as const };
    await mod.setLeadStatus(data.id, data.status);
    return { ok: true as const };
  });
