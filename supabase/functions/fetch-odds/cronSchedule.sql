-- Create the new cron job using vault secrets
select
  cron.schedule(
    'fetch-odds-daily',
    '0 0 * * *',
    $$
    -- First delete all existing entries from available_lines table
    delete from available_lines;

    -- Then delete all existing entries from todays_games table
    delete from todays_games;
    
    -- Then make the HTTP call to fetch new odds
    select
      net.http_post(
          url:= (select decrypted_secret from vault.decrypted_secrets where name = 'function_url') || '/functions/v1/fetch-odds',
          headers:=jsonb_build_object(
            'Content-type', 'application/json',
            'Authorization', 'Bearer ' || (select decrypted_secret from vault.decrypted_secrets where name = 'auth_token')
          ),
          body:=jsonb_build_object(
            'name', 'Functions'
          )
      ) as request_id;
    $$
  );