-- Speed Work Sundays: live-mode database (Supabase / Postgres)
-- Run once in the Supabase SQL editor, then set VITE_SUPABASE_URL and
-- VITE_SUPABASE_ANON_KEY in Vercel. The site switches from demo to live.

-- Sign-ups. The public can insert, never read (parent contact info stays private).
create table if not exists rsvps (
  id uuid primary key default gen_random_uuid(),
  athlete_name text not null,
  age int,
  sport text,
  parent_name text not null,
  parent_contact text not null,
  waiver boolean not null default false,
  photo_ok boolean not null default false,
  updates_ok boolean not null default true,
  status text not null default 'confirmed' check (status in ('confirmed','waitlist')),
  created_at timestamptz not null default now()
);

-- Cap: once 20 are confirmed, new sign-ups go to the waitlist automatically.
-- Change the 20 here if you add a session or raise the cap.
create or replace function rsvp_set_status() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  perform pg_advisory_xact_lock(424242);
  if (select count(*) from rsvps where status = 'confirmed') >= 20 then
    new.status := 'waitlist';
  else
    new.status := 'confirmed';
  end if;
  return new;
end $$;
create trigger rsvps_status before insert on rsvps for each row execute function rsvp_set_status();
alter table rsvps enable row level security;
create policy "anyone can sign up" on rsvps for insert to anon with check (waiver = true);

-- Three spots reserved from day one: Kai, Kannon and one more athlete.
-- Edit the third name when you know it.
insert into rsvps (athlete_name, parent_name, parent_contact, waiver, photo_ok, updates_ok)
select v.name, 'Gabe Lopez', 'reserved', true, false, false
from (values ('Kai'), ('Kannon'), ('Reserved athlete')) as v(name)
where not exists (select 1 from rsvps);

create or replace view rsvp_count as
select count(*) filter (where status = 'confirmed')::int as confirmed,
       count(*) filter (where status = 'waitlist')::int as waitlist
from rsvps;
grant select on rsvp_count to anon;

-- Athletes shown on the site use a display name only (first name + last initial).
create table if not exists athletes (
  id uuid primary key default gen_random_uuid(),
  display_name text not null,
  age int,
  sport text,
  active boolean not null default true
);

create table if not exists results (
  athlete_id uuid references athletes(id) on delete cascade,
  test text not null check (test in ('dash','shuttle','jump')),
  week_index int not null check (week_index between 0 and 2),
  value numeric not null,
  logged_at timestamptz not null default now(),
  primary key (athlete_id, test, week_index)
);

alter table athletes enable row level security;
alter table results enable row level security;
create policy "public read athletes" on athletes for select to anon using (active);
create policy "public read results" on results for select to anon using (true);

create or replace view athlete_results as
select a.id, a.display_name, a.age, a.sport,
  jsonb_build_object(
    'dash',    (select jsonb_agg((select value from results r where r.athlete_id=a.id and r.test='dash' and r.week_index=w)) from generate_series(0,2) w),
    'shuttle', (select jsonb_agg((select value from results r where r.athlete_id=a.id and r.test='shuttle' and r.week_index=w)) from generate_series(0,2) w),
    'jump',    (select jsonb_agg((select value from results r where r.athlete_id=a.id and r.test='jump' and r.week_index=w)) from generate_series(0,2) w)
  ) as results
from athletes a where a.active;
grant select on athlete_results to anon;

-- Coach PIN for logging times from the track. Change it after setup.
create table if not exists coach_settings (id int primary key default 1, pin text not null);
alter table coach_settings enable row level security; -- no policies: unreadable from the site
insert into coach_settings (id, pin) values (1, 'CHANGE-ME') on conflict (id) do nothing;

create or replace function log_result(p_athlete uuid, p_test text, p_week_index int, p_value numeric, p_pin text)
returns void language plpgsql security definer set search_path = public as $$
begin
  if p_pin is distinct from (select pin from coach_settings where id = 1) then
    raise exception 'bad pin';
  end if;
  insert into results (athlete_id, test, week_index, value)
  values (p_athlete, p_test, p_week_index, p_value)
  on conflict (athlete_id, test, week_index) do update set value = excluded.value, logged_at = now();
end $$;
grant execute on function log_result to anon;
