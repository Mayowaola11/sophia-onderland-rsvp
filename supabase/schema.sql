create extension if not exists pgcrypto;

create table if not exists public.rsvps (
  id uuid primary key default gen_random_uuid(),
  guest_name text not null,
  email text not null,
  phone text not null,
  attending text not null check (attending in ('yes', 'no')),
  number_of_adults integer not null default 0 check (number_of_adults >= 0),
  number_of_children integer not null default 0 check (number_of_children >= 0),
  dietary_notes text not null default '',
  message text not null,
  source text not null default 'netlify',
  formspree_notified boolean not null default false,
  netlify_site_url text,
  created_at timestamptz not null default now()
);

alter table public.rsvps enable row level security;

revoke all on public.rsvps from anon, authenticated;
