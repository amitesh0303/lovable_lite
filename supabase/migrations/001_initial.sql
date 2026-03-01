-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Profiles table
create table if not exists profiles (
  id uuid references auth.users on delete cascade primary key,
  email text not null,
  username text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Projects table
create table if not exists projects (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references profiles(id) on delete cascade not null,
  name text not null,
  description text,
  framework text not null default 'React + Tailwind',
  status text not null default 'draft' check (status in ('active', 'deploying', 'error', 'draft')),
  deployment_url text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Project files table
create table if not exists project_files (
  id uuid default uuid_generate_v4() primary key,
  project_id uuid references projects(id) on delete cascade not null,
  path text not null,
  content text not null default '',
  language text not null default 'plaintext',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(project_id, path)
);

-- Chat messages table
create table if not exists chat_messages (
  id uuid default uuid_generate_v4() primary key,
  project_id uuid references projects(id) on delete cascade not null,
  role text not null check (role in ('user', 'assistant')),
  content text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable Row Level Security
alter table profiles enable row level security;
alter table projects enable row level security;
alter table project_files enable row level security;
alter table chat_messages enable row level security;

-- RLS Policies
create policy "Users can view their own profile" on profiles for select using (auth.uid() = id);
create policy "Users can update their own profile" on profiles for update using (auth.uid() = id);

create policy "Users can view their own projects" on projects for select using (auth.uid() = user_id);
create policy "Users can create projects" on projects for insert with check (auth.uid() = user_id);
create policy "Users can update their own projects" on projects for update using (auth.uid() = user_id);
create policy "Users can delete their own projects" on projects for delete using (auth.uid() = user_id);

create policy "Users can view files of their projects" on project_files for select using (
  exists (select 1 from projects where projects.id = project_files.project_id and projects.user_id = auth.uid())
);
create policy "Users can manage files of their projects" on project_files for all using (
  exists (select 1 from projects where projects.id = project_files.project_id and projects.user_id = auth.uid())
);

create policy "Users can view chat messages of their projects" on chat_messages for select using (
  exists (select 1 from projects where projects.id = chat_messages.project_id and projects.user_id = auth.uid())
);
create policy "Users can create chat messages in their projects" on chat_messages for insert with check (
  exists (select 1 from projects where projects.id = chat_messages.project_id and projects.user_id = auth.uid())
);
