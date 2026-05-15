-- House candidates and comments for rental comparison

create table house_candidates (
  id              uuid primary key default gen_random_uuid(),
  name            text,
  listing_url     text not null,
  address         text,
  price_per_night numeric,
  image_url       text,
  notes           text,
  added_by        text not null,
  is_selected     boolean default false,
  created_at      timestamptz default now()
);

create table house_candidate_comments (
  id            uuid primary key default gen_random_uuid(),
  candidate_id  uuid references house_candidates(id) on delete cascade,
  family_name   text not null,
  body          text not null,
  created_at    timestamptz default now()
);

-- RLS
alter table house_candidates enable row level security;
alter table house_candidate_comments enable row level security;

create policy "Allow all" on house_candidates for all using (true) with check (true);
create policy "Allow all" on house_candidate_comments for all using (true) with check (true);

-- Realtime
alter publication supabase_realtime add table house_candidates;
alter publication supabase_realtime add table house_candidate_comments;
