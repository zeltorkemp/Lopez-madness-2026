-- Speed Work Sundays: live-mode database (Supabase / Postgres)
-- Applied 2026-11-14 to the Zeltor Labs Supabase project as migration
-- "speed_work_sundays_init". Every object is prefixed sws_ so it never
-- touches Zeltor Labs tables. The site only uses the sws_ functions and view.
--
-- Privacy: sws_rsvps and sws_settings have RLS on with NO policies, so the
-- public can never read or write them directly (parent contact info and the
-- coach PIN stay private). Sign-ups go through sws_signup(), which also
-- decides confirmed vs waitlist against the cap in sws_settings.
--
-- To raise the cap or add a session:  update sws_settings set cap = 40;
-- To see sign-ups: Supabase > Table Editor > sws_rsvps
-- Coach PIN: select coach_pin from sws_settings;  (random at setup)

create table if not exists sws_rsvps (
  id uuid primary key default gen_random_uuid(),
  athlete_name text not null, age int, sport text,
  parent_name text not null, parent_contact text not null,
  waiver boolean not null default false, photo_ok boolean not null default false, updates_ok boolean not null default true,
  status text not null default 'confirmed' check (status in ('confirmed','waitlist')),
  created_at timestamptz not null default now()
);
alter table sws_rsvps enable row level security;

create table if not exists sws_settings (
  id int primary key default 1 check (id = 1),
  cap int not null default 20,
  coach_pin text not null
);
alter table sws_settings enable row level security;
insert into sws_settings (id, cap, coach_pin) values (1, 20, encode(gen_random_bytes(4), 'hex')) on conflict (id) do nothing;

-- Three spots reserved from day one: Kai, Kannon and one more athlete.
insert into sws_rsvps (athlete_name, parent_name, parent_contact, waiver, photo_ok, updates_ok)
select v.name, 'Gabe Lopez', 'reserved', true, false, false
from (values ('Kai'), ('Kannon'), ('Reserved athlete')) as v(name)
where not exists (select 1 from sws_rsvps);

create or replace function sws_signup(
  p_athlete_name text, p_age int, p_sport text, p_parent_name text,
  p_parent_contact text, p_waiver boolean, p_photo_ok boolean, p_updates_ok boolean
) returns text language plpgsql security definer set search_path = public as $$
declare v_status text;
begin
  if not coalesce(p_waiver, false) then raise exception 'waiver required'; end if;
  if coalesce(trim(p_athlete_name), '') = '' or coalesce(trim(p_parent_contact), '') = '' then
    raise exception 'missing required fields';
  end if;
  perform pg_advisory_xact_lock(hashtext('sws_signup'));
  select case when count(*) >= (select cap from sws_settings where id = 1) then 'waitlist' else 'confirmed' end
    into v_status from sws_rsvps where status = 'confirmed';
  insert into sws_rsvps (athlete_name, age, sport, parent_name, parent_contact, waiver, photo_ok, updates_ok, status)
  values (left(trim(p_athlete_name), 80), p_age, left(p_sport, 40), left(trim(p_parent_name), 80),
          left(trim(p_parent_contact), 120), true, coalesce(p_photo_ok, false), coalesce(p_updates_ok, true), v_status);
  return v_status;
end $$;

create or replace function sws_rsvp_counts() returns json
language sql stable security definer set search_path = public as $$
  select json_build_object(
    'confirmed', count(*) filter (where status = 'confirmed'),
    'waitlist',  count(*) filter (where status = 'waitlist'))
  from sws_rsvps;
$$;

create table if not exists sws_athletes (
  id uuid primary key default gen_random_uuid(),
  display_name text not null, age int, sport text,
  active boolean not null default true
);
create table if not exists sws_results (
  athlete_id uuid references sws_athletes(id) on delete cascade,
  test text not null check (test in ('dash','shuttle','jump')),
  week_index int not null check (week_index between 0 and 2),
  value numeric not null,
  logged_at timestamptz not null default now(),
  primary key (athlete_id, test, week_index)
);
alter table sws_athletes enable row level security;
alter table sws_results enable row level security;
create policy "sws public read athletes" on sws_athletes for select to anon using (active);
create policy "sws public read results" on sws_results for select to anon using (true);

create or replace view sws_athlete_results with (security_invoker = true) as
select a.id, a.display_name, a.age, a.sport,
  jsonb_build_object(
    'dash',    (select jsonb_agg((select r.value from sws_results r where r.athlete_id = a.id and r.test = 'dash' and r.week_index = w) order by w) from generate_series(0,2) w),
    'shuttle', (select jsonb_agg((select r.value from sws_results r where r.athlete_id = a.id and r.test = 'shuttle' and r.week_index = w) order by w) from generate_series(0,2) w),
    'jump',    (select jsonb_agg((select r.value from sws_results r where r.athlete_id = a.id and r.test = 'jump' and r.week_index = w) order by w) from generate_series(0,2) w)
  ) as results
from sws_athletes a where a.active;
grant select on sws_athlete_results to anon;

create or replace function sws_log_result(p_athlete uuid, p_test text, p_week_index int, p_value numeric, p_pin text)
returns void language plpgsql security definer set search_path = public as $$
begin
  if p_pin is distinct from (select coach_pin from sws_settings where id = 1) then
    raise exception 'bad pin';
  end if;
  insert into sws_results (athlete_id, test, week_index, value)
  values (p_athlete, p_test, p_week_index, p_value)
  on conflict (athlete_id, test, week_index) do update set value = excluded.value, logged_at = now();
end $$;

revoke all on function sws_signup, sws_rsvp_counts, sws_log_result from public;
grant execute on function sws_signup, sws_rsvp_counts, sws_log_result to anon;

-- Migration "speed_work_sundays_waiver" (2026-11-14): waiver record per sign-up.
-- Waiver text lives in src/data/waiver.js; WAIVER_VERSION is stored with each sign-up.
alter table sws_rsvps
  add column if not exists emergency_contact text,
  add column if not exists signature_name text,
  add column if not exists waiver_version text,
  add column if not exists waiver_agreed_at timestamptz;
-- sws_signup was replaced with an 11-argument version that requires
-- emergency contact and typed signature, and stamps waiver_version + time.

-- Migration "speed_work_sundays_add_forty" (2026-11-14): 40-yard dash is an official test.
-- The 20-yard 'dash' is now the split timed inside the 40.
alter table sws_results drop constraint if exists sws_results_test_check;
alter table sws_results add constraint sws_results_test_check check (test in ('forty','dash','shuttle','jump'));
-- sws_athlete_results view recreated with a 'forty' key (same pattern as the others).

-- Migration "speed_work_sundays_time_pref" (2026-11-14): families vote on the Sunday time at sign-up.
-- sws_rsvps.time_pref in ('morning','afternoon','evening','any'); sws_signup takes p_time_pref (default null,
-- so older clients still work); sws_time_pref_counts() returns vote totals for the coach page.
