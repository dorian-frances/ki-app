alter table games enable row level security;
alter table players enable row level security;
alter table rounds enable row level security;
alter table answers enable row level security;
alter table draws enable row level security;
alter table votes enable row level security;

-- GAMES
create policy "games_select" on games for select to authenticated using (true);
create policy "games_insert" on games for insert to authenticated with check (true);
create policy "games_update" on games for update to authenticated using (
  admin_id in (select id from players where user_id = auth.uid())
);

-- PLAYERS
create policy "players_select" on players for select to authenticated using (
  game_id in (select game_id from players where user_id = auth.uid())
);
create policy "players_insert" on players for insert to authenticated with check (user_id = auth.uid());
create policy "players_update" on players for update to authenticated using (user_id = auth.uid());

-- ROUNDS
create policy "rounds_select" on rounds for select to authenticated using (
  game_id in (select game_id from players where user_id = auth.uid())
);
create policy "rounds_insert" on rounds for insert to authenticated with check (
  game_id in (select g.id from games g join players p on p.id = g.admin_id where p.user_id = auth.uid())
);
create policy "rounds_update" on rounds for update to authenticated using (
  game_id in (select g.id from games g join players p on p.id = g.admin_id where p.user_id = auth.uid())
);

-- ANSWERS: own answer always visible, all answers visible during drawing+
create policy "answers_select" on answers for select to authenticated using (
  player_id in (select id from players where user_id = auth.uid())
  or round_id in (
    select r.id from rounds r join players p on p.game_id = r.game_id
    where p.user_id = auth.uid() and r.status in ('drawing', 'scoring', 'completed')
  )
);
create policy "answers_insert" on answers for insert to authenticated with check (
  player_id in (select id from players where user_id = auth.uid())
);

-- DRAWS
create policy "draws_select" on draws for select to authenticated using (
  round_id in (select r.id from rounds r join players p on p.game_id = r.game_id where p.user_id = auth.uid())
);
create policy "draws_insert" on draws for insert to authenticated with check (
  round_id in (select r.id from rounds r join games g on g.id = r.game_id join players p on p.id = g.admin_id where p.user_id = auth.uid())
);
create policy "draws_update" on draws for update to authenticated using (
  round_id in (select r.id from rounds r join games g on g.id = r.game_id join players p on p.id = g.admin_id where p.user_id = auth.uid())
);

-- VOTES
create policy "votes_select" on votes for select to authenticated using (
  draw_id in (select d.id from draws d join rounds r on r.id = d.round_id join players p on p.game_id = r.game_id where p.user_id = auth.uid())
);
create policy "votes_insert" on votes for insert to authenticated with check (
  voter_id in (select id from players where user_id = auth.uid())
);
