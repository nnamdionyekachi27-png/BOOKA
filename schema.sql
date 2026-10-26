-- BOOKA backend: paste this whole file into Supabase > SQL Editor > Run.

create table if not exists public.books (
  id         uuid primary key default gen_random_uuid(),
  owner      uuid not null default auth.uid() references auth.users(id) on delete cascade,
  title      text not null check (char_length(title) between 1 and 80),
  author     text not null check (char_length(author) between 1 and 60),
  genre      text not null,
  blurb      text not null default '' check (char_length(blurb) <= 240),
  type       text not null check (type in ('pdf', 'docx', 'doc', 'text')),
  body       text,
  file_path  text,
  file_name  text,
  reads      integer not null default 0,
  hidden     boolean not null default false,   -- set to true in the dashboard to hide a book
  created_at timestamptz not null default now()
);

create table if not exists public.reports (
  id         uuid primary key default gen_random_uuid(),
  book_id    uuid not null references public.books(id) on delete cascade,
  reason     text not null check (char_length(reason) <= 300),
  created_at timestamptz not null default now()
);

alter table public.books   enable row level security;
alter table public.reports enable row level security;

-- Anyone can read visible books; owners can also see their own hidden ones.
create policy "read books" on public.books for select
  using (hidden = false or owner = auth.uid());

-- Only logged-in writers can publish, and only as themselves.
create policy "insert own books" on public.books for insert
  to authenticated with check (owner = auth.uid() and hidden = false);

-- Writers can delete only their own books.
create policy "delete own books" on public.books for delete
  to authenticated using (owner = auth.uid());

-- Anyone can report a book. Only you (in the dashboard) can read reports.
create policy "anyone can report" on public.reports for insert
  to anon, authenticated with check (true);

-- Read counter that visitors can trigger without being able to edit books.
create or replace function public.increment_reads(book_id uuid)
returns void language sql security definer set search_path = public as $$
  update public.books set reads = reads + 1 where id = book_id and hidden = false;
$$;
grant execute on function public.increment_reads(uuid) to anon, authenticated;

-- File storage: public bucket, 25 MB limit, writers upload into their own folder.
insert into storage.buckets (id, name, public, file_size_limit)
values ('books', 'books', true, 26214400)
on conflict (id) do nothing;

create policy "upload to own folder" on storage.objects for insert
  to authenticated
  with check (bucket_id = 'books' and (storage.foldername(name))[1] = auth.uid()::text);

create policy "delete own files" on storage.objects for delete
  to authenticated
  using (bucket_id = 'books' and (storage.foldername(name))[1] = auth.uid()::text);
