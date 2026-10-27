-- Key-value store used by lib/db.js (the whole portal state lives in one JSON row).
create table if not exists public.kv (
  key text primary key,
  value text not null
);

-- RLS on with no policies: the public anon key cannot read student data.
-- The server uses the secret/service_role key, which bypasses RLS.
alter table public.kv enable row level security;
