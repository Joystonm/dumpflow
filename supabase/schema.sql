-- DumpFlow Supabase Schema

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Users profile table (extends auth.users)
create table public.profiles (
  id uuid references auth.users(id) on delete cascade primary key,
  email text,
  full_name text,
  avatar_url text,
  settings jsonb default '{"theme":"dark","autoDelete":"never","aiSensitivity":"high","clipboardPermission":false}'::jsonb,
  created_at timestamptz default now()
);

-- Spaces table
create table public.spaces (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  name text not null,
  description text,
  color text default '#8B5CF6',
  icon text default '📁',
  ai_generated boolean default false,
  created_at timestamptz default now()
);

-- Tags table
create table public.tags (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  name text not null,
  color text default '#8B5CF6',
  created_at timestamptz default now(),
  unique(user_id, name)
);

-- Drops table (main content)
create table public.drops (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  type text not null check (type in ('screenshot','image','video','pdf','text','link','prompt','github','voice','file')),
  title text,
  content text,
  file_url text,
  file_name text,
  file_size bigint,
  thumbnail_url text,
  ai_summary text,
  ai_category text,
  ai_space text,
  ai_metadata jsonb default '{}'::jsonb,
  tags text[] default '{}',
  space_id uuid references public.spaces(id) on delete set null,
  is_favorite boolean default false,
  is_archived boolean default false,
  expires_at timestamptz,
  source text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Voice notes table
create table public.voice_notes (
  id uuid default uuid_generate_v4() primary key,
  drop_id uuid references public.drops(id) on delete cascade,
  user_id uuid references public.profiles(id) on delete cascade not null,
  file_url text not null,
  duration integer,
  transcript text,
  summary text,
  created_at timestamptz default now()
);

-- Clipboard history
create table public.clipboard_history (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  content text not null,
  content_type text default 'text',
  created_at timestamptz default now()
);

-- Favorites view
create view public.favorites as
  select * from public.drops where is_favorite = true;

-- RLS Policies
alter table public.profiles enable row level security;
alter table public.spaces enable row level security;
alter table public.tags enable row level security;
alter table public.drops enable row level security;
alter table public.voice_notes enable row level security;
alter table public.clipboard_history enable row level security;

create policy "Users own their profile" on public.profiles for all using (auth.uid() = id);
create policy "Users own their spaces" on public.spaces for all using (auth.uid() = user_id);
create policy "Users own their tags" on public.tags for all using (auth.uid() = user_id);
create policy "Users own their drops" on public.drops for all using (auth.uid() = user_id);
create policy "Users own their voice notes" on public.voice_notes for all using (auth.uid() = user_id);
create policy "Users own their clipboard" on public.clipboard_history for all using (auth.uid() = user_id);

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, full_name)
  values (new.id, new.email, new.raw_user_meta_data->>'full_name');
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Update updated_at on drops
create or replace function public.update_updated_at()
returns trigger as $$
begin new.updated_at = now(); return new; end;
$$ language plpgsql;

create trigger drops_updated_at before update on public.drops
  for each row execute procedure public.update_updated_at();
