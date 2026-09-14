alter table contact_leads add column if not exists from_calculator boolean not null default false;
alter table contact_leads add column if not exists system_kw text not null default '';
alter table contact_leads add column if not exists panel_count text not null default '';
alter table contact_leads add column if not exists battery_name text not null default '';
alter table contact_leads add column if not exists battery_count text not null default '';
