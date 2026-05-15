-- Session 2 tables for Woolly Worm 26

-- Itinerary
create table itinerary (
  id uuid primary key default gen_random_uuid(),
  date date not null,
  time text,
  description text not null,
  created_by text,
  updated_at timestamptz default now()
);

-- Meals
create table meals (
  id uuid primary key default gen_random_uuid(),
  date date not null,
  meal_type text not null check (meal_type in ('breakfast', 'lunch', 'dinner')),
  claimed_by text,
  description text,
  notes text,
  updated_at timestamptz default now(),
  unique (date, meal_type)
);

-- House (single-row)
create table house (
  id uuid primary key default gen_random_uuid(),
  name text,
  listing_url text,
  address text,
  check_in date,
  check_out date,
  notes text,
  updated_at timestamptz default now()
);

-- Travel status
create table travel_status (
  id uuid primary key default gen_random_uuid(),
  family_name text unique not null,
  hometown text,
  status text default 'not_yet' check (status in ('not_yet', 'on_the_way', 'arrived')),
  current_lat double precision,
  current_lon double precision,
  eta_text text,
  updated_at timestamptz default now()
);

-- Packing lists
create table packing_lists (
  id uuid primary key default gen_random_uuid(),
  family_name text not null,
  item text not null,
  checked boolean default false,
  category text,
  updated_at timestamptz default now()
);

-- Messages
create table messages (
  id uuid primary key default gen_random_uuid(),
  family_name text not null,
  body text not null,
  created_at timestamptz default now()
);

-- Photos
create table photos (
  id uuid primary key default gen_random_uuid(),
  family_name text,
  storage_path text not null,
  caption text,
  created_at timestamptz default now()
);

-- Storage bucket for photos (public read)
insert into storage.buckets (id, name, public)
values ('photos', 'photos', true)
on conflict (id) do nothing;

-- Enable realtime on tables that need it
alter publication supabase_realtime add table meals;
alter publication supabase_realtime add table itinerary;
alter publication supabase_realtime add table house;
alter publication supabase_realtime add table travel_status;
alter publication supabase_realtime add table packing_lists;
alter publication supabase_realtime add table messages;
alter publication supabase_realtime add table photos;

-- RLS policies (permissive - single shared password model)
alter table itinerary enable row level security;
alter table meals enable row level security;
alter table house enable row level security;
alter table travel_status enable row level security;
alter table packing_lists enable row level security;
alter table messages enable row level security;
alter table photos enable row level security;

-- Allow all operations for anon (site is password-gated)
create policy "Allow all" on itinerary for all using (true) with check (true);
create policy "Allow all" on meals for all using (true) with check (true);
create policy "Allow all" on house for all using (true) with check (true);
create policy "Allow all" on travel_status for all using (true) with check (true);
create policy "Allow all" on packing_lists for all using (true) with check (true);
create policy "Allow all" on messages for all using (true) with check (true);
create policy "Allow all" on photos for all using (true) with check (true);

-- Storage policy for photos bucket
create policy "Allow public read" on storage.objects for select using (bucket_id = 'photos');
create policy "Allow anon upload" on storage.objects for insert with check (bucket_id = 'photos');
create policy "Allow anon delete" on storage.objects for delete using (bucket_id = 'photos');
