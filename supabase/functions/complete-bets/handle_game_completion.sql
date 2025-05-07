-- Function called by on_game_complete trigger to execute the complete-bets edge function
-- once a game has completed
create or replace function handle_game_completion()
returns trigger as $$
declare
  request_body jsonb;
begin
  -- Only trigger if status is changed to 3 (complete)
  if new.status = 3 and old.status != 3 then
    -- Construct the request body
    request_body := jsonb_build_object(
      'game_id', new.game_id,
      'final_score', new.final_score
    );
    -- Call the edge function using vault secrets
    perform net.http_post(
      url:= (select decrypted_secret from vault.decrypted_secrets where name = 'complete-bets-url') || '/functions/v1/complete-bets',
      headers:=jsonb_build_object(
        'Content-type', 'application/json',
        'Authorization', 'Bearer ' || (select decrypted_secret from vault.decrypted_secrets where name = 'auth_token')
      ),
      body:=request_body
    );
  end if;
  return new;
end;
$$ language plpgsql;
