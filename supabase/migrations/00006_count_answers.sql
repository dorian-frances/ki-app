create or replace function count_round_answers(p_round_id uuid)
returns int
language sql
security definer
stable
as $$
  select count(*)::int from answers where round_id = p_round_id
$$;

create or replace function count_draw_votes(p_draw_id uuid)
returns int
language sql
security definer
stable
as $$
  select count(*)::int from votes where draw_id = p_draw_id
$$;
