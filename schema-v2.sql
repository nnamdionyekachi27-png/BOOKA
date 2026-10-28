-- Treeshelf update 2: chapters + editing your own books.
-- Run this ONCE in Supabase > SQL Editor, BEFORE uploading the new site files.

-- 1. Allow a new kind of book: one published chapter by chapter.
alter table public.books drop constraint if exists books_type_check;
alter table public.books add constraint books_type_check
  check (type in ('pdf', 'docx', 'doc', 'text', 'chapters'));

-- 2. Chapters table.
create table if not exists public.chapters (
  id         uuid primary key default gen_random_uuid(),
  book_id    uuid not null references public.books(id) on delete cascade,
  owner      uuid not null default auth.uid() references auth.users(id) on delete cascade,
  position   integer not null default 1,
  title      text not null check (char_length(title) between 1 and 100),
  body       text not null default '',
  created_at timestamptz not null default now()
);
create index if not exists chapters_book_idx on public.chapters (book_id, position);

alter table public.chapters enable row level security;

-- Readers see chapters of any visible book.
create policy "read chapters" on public.chapters for select
  using (exists (select 1 from public.books b
                 where b.id = book_id and (b.hidden = false or b.owner = auth.uid())));

-- Writers add, edit and delete chapters only in their own books.
create policy "add own chapters" on public.chapters for insert
  to authenticated
  with check (owner = auth.uid()
              and exists (select 1 from public.books b where b.id = book_id and b.owner = auth.uid()));

create policy "edit own chapters" on public.chapters for update
  to authenticated using (owner = auth.uid()) with check (owner = auth.uid());

create policy "delete own chapters" on public.chapters for delete
  to authenticated using (owner = auth.uid());

-- 3. Let writers edit their own books, but only the safe columns.
--    (This also stops anyone setting their own read count or hiding/unhiding books.)
create policy "edit own books" on public.books for update
  to authenticated using (owner = auth.uid()) with check (owner = auth.uid());

revoke update on public.books from authenticated;
grant  update (title, author, genre, blurb, body) on public.books to authenticated;

revoke insert on public.books from authenticated;
grant  insert (title, author, genre, blurb, type, body, file_path, file_name)
  on public.books to authenticated;
