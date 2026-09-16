export type LeadStatus = "new" | "contacted" | "no_response" | "deleted";

export type ContactLead = {
  id: string;
  createdAt: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  zip: string;
  bill: string;
  backup: boolean;
  message: string;
  status: LeadStatus;
  fromCalculator: boolean;
  systemKw: string;
  panelCount: string;
  offsetPct: string;
  batteryName: string;
  batteryCount: string;
};
