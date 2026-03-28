-- ============================================================
-- CREATE GAME + ADMIN PLAYER (atomic)
-- ============================================================
create or replace function create_game(
  p_user_name text,
  p_avatar text default '🎭',
  p_total_rounds int default 5
)
returns jsonb
language plpgsql
security definer
as $$
declare
  v_game_id uuid;
  v_player_id uuid;
  v_code text;
begin
  loop
    v_code := upper(substr(md5(random()::text), 1, 6));
    exit when not exists (select 1 from games where code = v_code);
  end loop;

  insert into games (code, total_rounds)
    values (v_code, p_total_rounds)
    returning id into v_game_id;

  insert into players (game_id, user_id, user_name, avatar, is_admin)
    values (v_game_id, auth.uid(), p_user_name, p_avatar, true)
    returning id into v_player_id;

  update games set admin_id = v_player_id where id = v_game_id;

  return jsonb_build_object(
    'game_id', v_game_id,
    'player_id', v_player_id,
    'code', v_code
  );
end;
$$;

-- ============================================================
-- JOIN GAME
-- ============================================================
create or replace function join_game(
  p_code text,
  p_user_name text,
  p_avatar text default '🎭'
)
returns jsonb
language plpgsql
security definer
as $$
declare
  v_game_id uuid;
  v_player_id uuid;
  v_status game_status;
begin
  select id, status into v_game_id, v_status
    from games where code = upper(p_code);

  if v_game_id is null then
    raise exception 'Game not found';
  end if;

  if v_status != 'lobby' then
    raise exception 'Game already started';
  end if;

  insert into players (game_id, user_id, user_name, avatar)
    values (v_game_id, auth.uid(), p_user_name, p_avatar)
    returning id into v_player_id;

  return jsonb_build_object(
    'game_id', v_game_id,
    'player_id', v_player_id
  );
end;
$$;

-- ============================================================
-- START NEXT ROUND
-- ============================================================
create or replace function start_next_round(p_game_id uuid)
returns jsonb
language plpgsql
security definer
as $$
declare
  v_round_number int;
  v_questioner_id uuid;
  v_round_id uuid;
  v_admin_user_id uuid;
begin
  select p.user_id into v_admin_user_id
    from games g join players p on p.id = g.admin_id
    where g.id = p_game_id;

  if v_admin_user_id != auth.uid() then
    raise exception 'Only admin can start a round';
  end if;

  select coalesce(max(round_number), 0) + 1 into v_round_number
    from rounds where game_id = p_game_id;

  select id into v_questioner_id
    from players
    where game_id = p_game_id
    order by question_count asc, random()
    limit 1;

  update players set question_count = question_count + 1
    where id = v_questioner_id;

  insert into rounds (game_id, round_number, questioner_id, status)
    values (p_game_id, v_round_number, v_questioner_id, 'question')
    returning id into v_round_id;

  update games set current_round = v_round_number, status = 'playing'
    where id = p_game_id;

  return jsonb_build_object(
    'round_id', v_round_id,
    'round_number', v_round_number,
    'questioner_id', v_questioner_id
  );
end;
$$;

-- ============================================================
-- SUBMIT QUESTION
-- ============================================================
create or replace function submit_question(p_round_id uuid, p_question text)
returns void
language plpgsql
security definer
as $$
declare
  v_questioner_user_id uuid;
begin
  select p.user_id into v_questioner_user_id
    from rounds r join players p on p.id = r.questioner_id
    where r.id = p_round_id;

  if v_questioner_user_id != auth.uid() then
    raise exception 'Only the questioner can submit the question';
  end if;

  update rounds set question = p_question, status = 'answering'
    where id = p_round_id;
end;
$$;

-- ============================================================
-- PREPARE DRAWS
-- ============================================================
create or replace function prepare_draws(p_round_id uuid)
returns void
language plpgsql
security definer
as $$
declare
  v_answer record;
  v_order int := 0;
begin
  update rounds set status = 'drawing' where id = p_round_id;

  for v_answer in
    select id from answers where round_id = p_round_id order by random()
  loop
    v_order := v_order + 1;
    insert into draws (round_id, answer_id, draw_order, status)
      values (p_round_id, v_answer.id, v_order, 'pending');
  end loop;
end;
$$;

-- ============================================================
-- REVEAL NEXT DRAW
-- ============================================================
create or replace function reveal_next_draw(p_round_id uuid)
returns jsonb
language plpgsql
security definer
as $$
declare
  v_draw record;
  v_answer_text text;
begin
  select d.id, d.draw_order, d.answer_id into v_draw
    from draws d
    where d.round_id = p_round_id and d.status = 'pending'
    order by d.draw_order asc
    limit 1;

  if v_draw.id is null then
    return jsonb_build_object('done', true);
  end if;

  update draws set status = 'voting' where id = v_draw.id;

  select answer_text into v_answer_text from answers where id = v_draw.answer_id;

  return jsonb_build_object(
    'draw_id', v_draw.id,
    'draw_order', v_draw.draw_order,
    'answer_text', v_answer_text,
    'done', false
  );
end;
$$;

-- ============================================================
-- SCORE DRAW
-- ============================================================
create or replace function score_draw(p_draw_id uuid)
returns jsonb
language plpgsql
security definer
as $$
declare
  v_author_id uuid;
  v_vote record;
  v_correct_count int := 0;
  v_wrong_count int := 0;
  v_total_inspectors int;
begin
  select a.player_id into v_author_id
    from draws d join answers a on a.id = d.answer_id
    where d.id = p_draw_id;

  select count(*) into v_total_inspectors
    from votes where draw_id = p_draw_id and voter_id != v_author_id;

  for v_vote in
    select * from votes where draw_id = p_draw_id
  loop
    if v_vote.voter_id = v_author_id then
      update votes set is_correct = false, points_earned = 0
        where id = v_vote.id;
    elsif v_vote.voted_player_id = v_author_id then
      v_correct_count := v_correct_count + 1;
      update votes set is_correct = true, points_earned = 1
        where id = v_vote.id;
      update players set score = score + 1 where id = v_vote.voter_id;
    else
      update votes set is_correct = false, points_earned = 0
        where id = v_vote.id;
    end if;
  end loop;

  v_wrong_count := v_total_inspectors - v_correct_count;
  update players set score = score + v_wrong_count - v_correct_count
    where id = v_author_id;

  update draws set status = 'completed' where id = p_draw_id;

  return jsonb_build_object(
    'author_id', v_author_id,
    'correct_guesses', v_correct_count,
    'wrong_guesses', v_wrong_count,
    'impostor_points', v_wrong_count - v_correct_count
  );
end;
$$;
