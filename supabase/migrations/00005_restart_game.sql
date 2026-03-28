create or replace function restart_game(p_game_id uuid, p_total_rounds int default 5)
returns jsonb
language plpgsql
security definer
as $$
declare
  v_new_game_id uuid;
  v_new_code text;
  v_admin_user_id uuid;
  v_new_admin_id uuid;
  v_player record;
begin
  select p.user_id into v_admin_user_id
    from games g join players p on p.id = g.admin_id
    where g.id = p_game_id;

  if v_admin_user_id != auth.uid() then
    raise exception 'Only admin can restart';
  end if;

  loop
    v_new_code := upper(substr(md5(random()::text), 1, 6));
    exit when not exists (select 1 from games where code = v_new_code);
  end loop;

  insert into games (code, total_rounds)
    values (v_new_code, p_total_rounds)
    returning id into v_new_game_id;

  for v_player in
    select user_id, user_name, avatar, is_admin from players where game_id = p_game_id
  loop
    insert into players (game_id, user_id, user_name, avatar, is_admin)
      values (v_new_game_id, v_player.user_id, v_player.user_name, v_player.avatar, v_player.is_admin);

    if v_player.is_admin then
      select id into v_new_admin_id from players where game_id = v_new_game_id and user_id = v_player.user_id;
    end if;
  end loop;

  update games set admin_id = v_new_admin_id where id = v_new_game_id;

  return jsonb_build_object(
    'game_id', v_new_game_id,
    'code', v_new_code
  );
end;
$$;
