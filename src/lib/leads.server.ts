import { createHmac, randomUUID, timingSafeEqual } from "node:crypto";
import { getCookie, getRequest, setCookie } from "@tanstack/react-start/server";
import { getSql } from "@/lib/db";
import { envFileValue } from "@/lib/solar/guard.server";
import { bundledAdminPassword, bundledAdminSecret } from "@/lib/solar/bundled-secrets.server";
import type { ContactLead, LeadStatus } from "@/lib/leads-types";

const COOKIE = "adam_admin";

function envStr(key: string) {
  return String(process.env[key] ?? "").trim() || envFileValue(key);
}

function adminSecret() {
  return envStr("ADAM_ADMIN_SECRET") || bundledAdminSecret;
}

function adminPassword() {
  return envStr("ADAM_ADMIN_PASSWORD") || bundledAdminPassword;
}

function sign(exp: number) {
  return createHmac("sha256", adminSecret()).update(String(exp)).digest("hex");
}

function safeEqual(a: string, b: string) {
  const max = Math.max(Buffer.byteLength(a), Buffer.byteLength(b), 1);
  const left = Buffer.alloc(max);
  const right = Buffer.alloc(max);
  left.write(a);
  right.write(b);
  return timingSafeEqual(left, right) && a.length === b.length;
}

export function isAdmin() {
  if (!adminSecret()) return false;
  const raw = getCookie(COOKIE) ?? "";
  const [expRaw, sig] = raw.split(".");
  const exp = Number(expRaw);
  if (!exp || !sig || exp * 1000 < Date.now()) return false;
  return safeEqual(sig, sign(exp));
}

export function loginAdmin(password: string) {
  const expected = adminPassword();
  const secret = adminSecret();
  if (!expected || !secret) return false;
  if (!safeEqual(password, expected)) return false;
  const exp = Math.floor(Date.now() / 1000) + 12 * 60 * 60;
  let proto = "";
  let host = "";
  try {
    const req = getRequest();
    proto = req?.headers.get("x-forwarded-proto") ?? "";
    host = (req?.headers.get("x-forwarded-host") || req?.headers.get("host") || "").toLowerCase();
  } catch {
    /* no request context */
  }
  const secure = proto === "https" || host.includes(".grok.me");
  setCookie(COOKIE, `${exp}.${sign(exp)}`, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    secure,
  });
  return true;
}

export function logoutAdmin() {
  setCookie(COOKIE, "", { httpOnly: true, sameSite: "lax", path: "/", maxAge: 0 });
}

function asLead(row: Record<string, unknown>): ContactLead {
  const status = String(row.status ?? "new");
  return {
    id: String(row.id ?? ""),
    createdAt: row.created_at instanceof Date ? row.created_at.toISOString() : String(row.created_at ?? ""),
    name: String(row.name ?? ""),
    email: String(row.email ?? ""),
    phone: String(row.phone ?? ""),
    address: String(row.address ?? ""),
    zip: String(row.zip ?? ""),
    bill: String(row.bill ?? ""),
    backup: Boolean(row.backup),
    message: String(row.message ?? ""),
    fromCalculator: Boolean(row.from_calculator),
    systemKw: String(row.system_kw ?? ""),
    panelCount: String(row.panel_count ?? ""),
    batteryName: String(row.battery_name ?? ""),
    batteryCount: String(row.battery_count ?? ""),
    status:
      status === "contacted" || status === "no_response" || status === "deleted" ? status : "new",
  };
}

export async function insertLead(input: {
  name: string;
  email: string;
  phone: string;
  address: string;
  zip: string;
  bill: string;
  backup: boolean;
  message: string;
  fromCalculator?: boolean;
  systemKw?: string;
  panelCount?: string;
  batteryName?: string;
  batteryCount?: string;
}) {
  const sql = await getSql();
  const id = randomUUID();
  await sql`
    insert into contact_leads (
      id, name, email, phone, address, zip, bill, backup, message, status,
      from_calculator, system_kw, panel_count, battery_name, battery_count
    )
    values (
      ${id},
      ${input.name},
      ${input.email},
      ${input.phone},
      ${input.address},
      ${input.zip},
      ${input.bill},
      ${input.backup},
      ${input.message},
      ${"new"},
      ${Boolean(input.fromCalculator)},
      ${input.systemKw ?? ""},
      ${input.panelCount ?? ""},
      ${input.batteryName ?? ""},
      ${input.batteryCount ?? ""}
    )
  `;
  return id;
}

export async function listLeads() {
  const sql = await getSql();
  await sql`
    delete from contact_leads
    where deleted_at is not null
      and deleted_at < now() - interval '30 days'
  `;
  const rows = await sql<Record<string, unknown>>`
    select id, created_at, name, email, phone, address, zip, bill, backup, message, status,
           from_calculator, system_kw, panel_count, battery_name, battery_count
    from contact_leads
    order by created_at desc
  `;
  return rows.map(asLead);
}

export async function setLeadStatus(id: string, status: LeadStatus) {
  const sql = await getSql();
  if (status === "deleted") {
    await sql`update contact_leads set status = ${"deleted"}, deleted_at = now() where id = ${id}`;
    return;
  }
  await sql`update contact_leads set status = ${status}, deleted_at = null where id = ${id}`;
}

export async function deleteLead(id: string) {
  await setLeadStatus(id, "deleted");
}