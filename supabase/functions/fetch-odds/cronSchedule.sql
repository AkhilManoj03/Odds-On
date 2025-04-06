-- Create the new cron job using vault secrets
select
  cron.schedule(
    'fetch-odds-daily',
    '0 0 * * *',
    $$
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