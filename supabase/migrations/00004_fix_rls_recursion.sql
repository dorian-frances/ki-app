create or replace function get_my_game_ids()
returns setof uuid
language sql
security definer
stable
as $$
  select game_id from players where user_id = auth.uid()
$$;

drop policy if exists "players_select" on players;
drop policy if exists "rounds_select" on rounds;
drop policy if exists "rounds_insert" on rounds;
drop policy if exists "rounds_update" on rounds;
drop policy if exists "answers_select" on answers;
drop policy if exists "draws_select" on draws;
drop policy if exists "draws_insert" on draws;
drop policy if exists "draws_update" on draws;
drop policy if exists "votes_select" on votes;

create policy "players_select" on players
  for select to authenticated
  using (game_id in (select get_my_game_ids()));

create policy "rounds_select" on rounds
  for select to authenticated
  using (game_id in (select get_my_game_ids()));

create policy "rounds_insert" on rounds
  for insert to authenticated
  with check (
    game_id in (
      select g.id from games g where g.admin_id in (select id from players where user_id = auth.uid())
    )
  );

create policy "rounds_update" on rounds
  for update to authenticated
  using (
    game_id in (
      select g.id from games g where g.admin_id in (select id from players where user_id = auth.uid())
    )
  );

create policy "answers_select" on answers
  for select to authenticated
  using (
    player_id in (select id from players where user_id = auth.uid())
    or round_id in (
      select r.id from rounds r
      where r.game_id in (select get_my_game_ids())
      and r.status in ('drawing', 'scoring', 'completed')
    )
  );

create policy "draws_select" on draws
  for select to authenticated
  using (
    round_id in (select r.id from rounds r where r.game_id in (select get_my_game_ids()))
  );

create policy "draws_insert" on draws
  for insert to authenticated
  with check (
    round_id in (
      select r.id from rounds r
      join games g on g.id = r.game_id
      where g.admin_id in (select id from players where user_id = auth.uid())
    )
  );

create policy "draws_update" on draws
  for update to authenticated
  using (
    round_id in (
      select r.id from rounds r
      join games g on g.id = r.game_id
      where g.admin_id in (select id from players where user_id = auth.uid())
    )
  );

create policy "votes_select" on votes
  for select to authenticated
  using (
    draw_id in (
      select d.id from draws d
      join rounds r on r.id = d.round_id
      where r.game_id in (select get_my_game_ids())
    )
  );
