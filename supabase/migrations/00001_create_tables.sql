-- gen_random_uuid() is available by default in modern PostgreSQL/Supabase

-- ============================================================
-- GAMES
-- ============================================================
create type game_status as enum ('lobby', 'playing', 'finished');

create table games (
  id uuid primary key default gen_random_uuid(),
  code text unique not null,
  status game_status not null default 'lobby',
  current_round int not null default 0,
  total_rounds int not null default 5,
  admin_id uuid,
  created_at timestamptz not null default now()
);

create index idx_games_code on games (code);

-- ============================================================
-- PLAYERS
-- ============================================================
create table players (
  id uuid primary key default gen_random_uuid(),
  game_id uuid not null references games(id) on delete cascade,
  user_id uuid not null,
  user_name text not null,
  avatar text not null default '🎭',
  is_admin boolean not null default false,
  score int not null default 0,
  question_count int not null default 0,
  created_at timestamptz not null default now(),
  unique(game_id, user_id)
);

create index idx_players_game on players (game_id);
create index idx_players_user on players (user_id);

-- FK from games.admin_id to players
alter table games add constraint fk_games_admin foreign key (admin_id) references players(id);

-- ============================================================
-- ROUNDS
-- ============================================================
create type round_status as enum ('question', 'answering', 'drawing', 'scoring', 'completed');

create table rounds (
  id uuid primary key default gen_random_uuid(),
  game_id uuid not null references games(id) on delete cascade,
  round_number int not null,
  question text,
  questioner_id uuid not null references players(id),
  status round_status not null default 'question',
  created_at timestamptz not null default now(),
  unique(game_id, round_number)
);

create index idx_rounds_game on rounds (game_id);

-- ============================================================
-- ANSWERS
-- ============================================================
create table answers (
  id uuid primary key default gen_random_uuid(),
  round_id uuid not null references rounds(id) on delete cascade,
  player_id uuid not null references players(id),
  answer_text text not null,
  created_at timestamptz not null default now(),
  unique(round_id, player_id)
);

create index idx_answers_round on answers (round_id);

-- ============================================================
-- DRAWS
-- ============================================================
create type draw_status as enum ('pending', 'revealed', 'voting', 'completed');

create table draws (
  id uuid primary key default gen_random_uuid(),
  round_id uuid not null references rounds(id) on delete cascade,
  answer_id uuid not null references answers(id),
  draw_order int not null,
  status draw_status not null default 'pending',
  unique(round_id, draw_order)
);

create index idx_draws_round on draws (round_id);

-- ============================================================
-- VOTES
-- ============================================================
create table votes (
  id uuid primary key default gen_random_uuid(),
  draw_id uuid not null references draws(id) on delete cascade,
  voter_id uuid not null references players(id),
  voted_player_id uuid not null references players(id),
  is_correct boolean,
  points_earned int default 0,
  unique(draw_id, voter_id)
);

create index idx_votes_draw on votes (draw_id);
