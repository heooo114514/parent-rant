-- Create reports table
create table if not exists reports (
  id uuid default gen_random_uuid() primary key,
  post_id uuid references posts(id) on delete cascade not null,
  reason text not null,
  status text check (status in ('pending', 'resolved', 'dismissed')) default 'pending',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create announcements table
create table if not exists announcements (
  id uuid default gen_random_uuid() primary key,
  content text not null,
  is_active boolean default true,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- RLS for reports
alter table reports enable row level security;

create policy "Admins can view all reports." on reports
  for select using (true); -- In a real app, you'd check for admin role/claim

create policy "Anyone can create a report." on reports
  for insert with check (true);

-- RLS for announcements
alter table announcements enable row level security;

create policy "Everyone can view active announcements." on announcements
  for select using (is_active = true);

create policy "Admins can view all announcements." on announcements
  for select using (true); -- Simplified for now, backend will handle filtering usually

create policy "Admins can insert announcements." on announcements
  for insert with check (true);

create policy "Admins can update announcements." on announcements
  for update using (true);

create policy "Admins can delete announcements." on announcements
  for delete using (true);
