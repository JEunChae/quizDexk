-- supabase/migrations/001_initial_schema.sql

-- sets
create table sets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  title text not null,
  folder text,
  tags text[] default '{}',
  is_public boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- cards
create table cards (
  id uuid primary key default gen_random_uuid(),
  set_id uuid references sets(id) on delete cascade not null,
  front text not null,
  back text not null,
  difficulty text check (difficulty in ('easy','medium','hard')) default 'medium',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- study_sessions
create table study_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  set_id uuid references sets(id) on delete cascade not null,
  mode text check (mode in ('flip','mcq','short_answer','exam')) not null,
  started_at timestamptz default now(),
  ended_at timestamptz
);

-- card_results
create table card_results (
  id uuid primary key default gen_random_uuid(),
  card_id uuid references cards(id) on delete cascade not null,
  session_id uuid references study_sessions(id) on delete cascade not null,
  is_correct boolean not null,
  answered_at timestamptz default now()
);

-- bookmarks
create table bookmarks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  card_id uuid references cards(id) on delete cascade,
  set_id uuid references sets(id) on delete cascade,
  created_at timestamptz default now(),
  constraint bookmarks_target_required check (card_id is not null or set_id is not null)
);

-- RLS 활성화
alter table sets enable row level security;
alter table cards enable row level security;
alter table study_sessions enable row level security;
alter table card_results enable row level security;
alter table bookmarks enable row level security;

-- sets RLS
create policy "Users own their sets"
  on sets for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Public sets visible to all"
  on sets for select using (is_public = true);

-- cards RLS (set owner or public set)
create policy "Cards visible to set owner"
  on cards for all
  using (
    exists (select 1 from sets where sets.id = cards.set_id and sets.user_id = auth.uid())
  )
  with check (
    exists (select 1 from sets where sets.id = cards.set_id and sets.user_id = auth.uid())
  );

create policy "Cards visible if set is public"
  on cards for select using (
    exists (select 1 from sets where sets.id = cards.set_id and sets.is_public = true)
  );

-- study_sessions, card_results, bookmarks: own rows only
create policy "Users own their sessions"
  on study_sessions for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users own their results"
  on card_results for all
  using (
    exists (select 1 from study_sessions where study_sessions.id = card_results.session_id and study_sessions.user_id = auth.uid())
  )
  with check (
    exists (select 1 from study_sessions where study_sessions.id = card_results.session_id and study_sessions.user_id = auth.uid())
  );

create policy "Users own their bookmarks"
  on bookmarks for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- updated_at trigger function
create or replace function update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger sets_updated_at before update on sets
  for each row execute function update_updated_at();

create trigger cards_updated_at before update on cards
  for each row execute function update_updated_at();
