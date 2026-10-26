# BOOKA backend setup (about 10 minutes)

1. Go to supabase.com, sign up (free, no card) and click **New project**.
2. Open **SQL Editor**, paste all of `schema.sql`, click **Run**.
3. Open **Authentication > Providers** and make sure **Email** is on.
   While testing, you can switch off **Confirm email** so new writers can log in at once.
4. Open **Project Settings > API**. Copy the **Project URL** and the **anon public key** into `config.js`.
5. Open `page.html`. Create a writer account with the Log in button, then publish a book.
6. Put the folder online (Netlify Drop: drag the folder onto app.netlify.com/drop).
   Then add your live address under **Authentication > URL Configuration > Site URL**.

## Moderation
- **Table Editor > reports** shows what readers flagged.
- To hide a book, open **books** and set `hidden` to true. To delete it, delete the row.

## Included in this version
Shared uploads for every visitor, writer accounts (readers need none), delete-your-own books,
read counts, share links, and a report button.

## Next phase (not built yet)
Likes, comments, bookmarks, chapter-by-chapter publishing and author profile pages.
