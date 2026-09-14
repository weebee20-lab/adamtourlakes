create table if not exists contact_leads (
  id text primary key,
  created_at timestamptz not null default now(),
  name text not null,
  email text not null,
  phone text not null default '',
  address text not null default '',
  zip text not null default '',
  bill text not null default '',
  backup boolean not null default false,
  message text not null default '',
  status text not null default 'new'
);

create index if not exists contact_leads_created_at_idx on contact_leads (created_at desc);
