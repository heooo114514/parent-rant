-- Add ip_address to posts table
alter table posts add column if not exists ip_address text;

-- Create banned_ips table
create table if not exists banned_ips (
  id uuid default gen_random_uuid() primary key,
  ip_address text not null unique,
  reason text,
  banned_at timestamp with time zone default timezone('utc'::text, now()) not null,
  banned_by uuid references auth.users(id)
);

-- RLS for banned_ips
alter table banned_ips enable row level security;

create policy "Admins can view banned ips." on banned_ips
  for select using (true); -- In a real app, you'd check for admin role/claim

create policy "Admins can insert banned ips." on banned_ips
  for insert with check (true);

create policy "Admins can delete banned ips." on banned_ips
  for delete using (true);

-- Index for faster IP lookups
create index if not exists idx_banned_ips_address on banned_ips(ip_address);
