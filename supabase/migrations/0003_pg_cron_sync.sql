-- ╔════════════════════════════════════════════════════════════════════╗
-- ║  pg_cron — Schedule daily TCGdex sync                             ║
-- ║                                                                   ║
-- ║  Lance l'Edge Function sync-catalog tous les jours à 4h UTC      ║
-- ║                                                                   ║
-- ║  Prérequis :                                                      ║
-- ║    1. Activer pg_cron dans Supabase (Database → Extensions)      ║
-- ║    2. Activer pg_net dans Supabase (Database → Extensions)       ║
-- ║    3. Avoir déployé la fonction sync-catalog                      ║
-- ║    4. Avoir créé un secret 'project_url' et 'service_role_key'   ║
-- ║       via Supabase Vault (Database → Vault)                      ║
-- ╚════════════════════════════════════════════════════════════════════╝

-- ── Activer les extensions ──
create extension if not exists pg_cron;
create extension if not exists pg_net;

-- ── Helper function pour invoquer l'edge function ──
create or replace function public.invoke_sync_catalog()
returns void
language plpgsql
security definer
as $$
declare
  proj_url text;
  service_key text;
  request_id bigint;
begin
  -- Récupère les secrets depuis le Vault
  select decrypted_secret into proj_url
  from vault.decrypted_secrets where name = 'project_url';

  select decrypted_secret into service_key
  from vault.decrypted_secrets where name = 'service_role_key';

  if proj_url is null or service_key is null then
    raise exception 'Missing secrets: project_url or service_role_key in Vault';
  end if;

  -- Appel HTTP non-bloquant via pg_net
  select net.http_post(
    url := proj_url || '/functions/v1/sync-catalog',
    headers := jsonb_build_object(
      'Authorization', 'Bearer ' || service_key,
      'Content-Type', 'application/json'
    ),
    body := '{}'::jsonb
  ) into request_id;

  raise notice 'sync-catalog triggered, request_id=%', request_id;
end;
$$;

-- ── Planifier le cron ──
-- '0 4 * * *' = tous les jours à 4h UTC (5h Paris été, 6h hiver)
select cron.schedule(
  'daily-sync-catalog',
  '0 4 * * *',
  $$ select public.invoke_sync_catalog(); $$
);

-- Pour annuler plus tard :
-- select cron.unschedule('daily-sync-catalog');

-- Pour vérifier :
-- select * from cron.job;
-- select * from cron.job_run_details order by start_time desc limit 10;

-- ╔════════════════════════════════════════════════════════════════════╗
-- ║  sync-prices : toutes les 6h                                      ║
-- ╚════════════════════════════════════════════════════════════════════╝

create or replace function public.invoke_sync_prices()
returns void
language plpgsql
security definer
as $$
declare
  proj_url text;
  service_key text;
begin
  select decrypted_secret into proj_url    from vault.decrypted_secrets where name = 'project_url';
  select decrypted_secret into service_key from vault.decrypted_secrets where name = 'service_role_key';

  if proj_url is null or service_key is null then
    raise exception 'Missing secrets in Vault';
  end if;

  perform net.http_post(
    url := proj_url || '/functions/v1/sync-prices',
    headers := jsonb_build_object(
      'Authorization', 'Bearer ' || service_key,
      'Content-Type', 'application/json'
    ),
    body := '{}'::jsonb
  );
end;
$$;

select cron.schedule(
  '6h-sync-prices',
  '0 */6 * * *',                  -- 0h, 6h, 12h, 18h UTC
  $$ select public.invoke_sync_prices(); $$
);

-- ╔════════════════════════════════════════════════════════════════════╗
-- ║  daily-snapshot : tous les jours à 3h UTC                         ║
-- ╚════════════════════════════════════════════════════════════════════╝

create or replace function public.invoke_daily_snapshot()
returns void
language plpgsql
security definer
as $$
declare
  proj_url text;
  service_key text;
begin
  select decrypted_secret into proj_url    from vault.decrypted_secrets where name = 'project_url';
  select decrypted_secret into service_key from vault.decrypted_secrets where name = 'service_role_key';

  if proj_url is null or service_key is null then
    raise exception 'Missing secrets in Vault';
  end if;

  perform net.http_post(
    url := proj_url || '/functions/v1/daily-snapshot',
    headers := jsonb_build_object(
      'Authorization', 'Bearer ' || service_key,
      'Content-Type', 'application/json'
    ),
    body := '{}'::jsonb
  );
end;
$$;

select cron.schedule(
  'daily-snapshot',
  '0 3 * * *',                    -- 3h UTC tous les jours
  $$ select public.invoke_daily_snapshot(); $$
);
