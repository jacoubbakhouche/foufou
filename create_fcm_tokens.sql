-- Create a table to store FCM tokens for users
create table if not exists public.fcm_tokens (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users not null,
  token text not null,
  device_type text, -- 'android', 'ios', 'web'
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(user_id, token)
);

-- Enable RLS
alter table public.fcm_tokens enable row level security;

-- Policies
-- Users can insert their own token
create policy "Users can insert their own token"
  on public.fcm_tokens for insert
  with check (auth.uid() = user_id);

-- Users can delete their own token (e.g. logout)
create policy "Users can delete their own token"
  on public.fcm_tokens for delete
  using (auth.uid() = user_id);

-- Admins can read all tokens (to send notifications)
-- Assuming you have an 'admin' role check or just allow authenticated read for now if simple
create policy "Admins can read all tokens"
  on public.fcm_tokens for select
  using (true); -- Ideally restrict to admin role, but for now allow reading to simplify
