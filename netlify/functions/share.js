// Treeshelf: builds a link-preview page for one book, so WhatsApp and other apps
// show that book's cover and title. People are sent straight on to the book.

const SUPABASE_URL = 'https://dsigjiuemndfydfedeae.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRzaWdqaXVlbW5kZnlkZmVkZWFlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTI5OTMzMjMsImV4cCI6MjEwODU2OTMyM30.J-YE9e1YkcFP8Gc2PmZyzpGtNCMIaY5aAXhJgf_flyk';

function esc(text) {
  return String(text == null ? '' : text)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

function page(site, shareUrl, target, title, description, image) {
  return '<!DOCTYPE html><html lang="en"><head><meta charset="utf-8">' +
    '<title>' + esc(title) + '</title>' +
    '<meta name="description" content="' + esc(description) + '">' +
    '<meta property="og:type" content="book">' +
    '<meta property="og:site_name" content="Treeshelf">' +
    '<meta property="og:title" content="' + esc(title) + '">' +
    '<meta property="og:description" content="' + esc(description) + '">' +
    '<meta property="og:image" content="' + esc(image) + '">' +
    '<meta property="og:url" content="' + esc(shareUrl) + '">' +
    '<meta name="twitter:card" content="summary_large_image">' +
    '<meta http-equiv="refresh" content="0;url=' + esc(target) + '">' +
    '</head><body><p>Opening <a href="' + esc(target) + '">' + esc(title) + '</a>...</p>' +
    '<script>location.replace(' + JSON.stringify(target) + ');</script></body></html>';
}

exports.handler = async function (event) {
  const headers = event.headers || {};
  const host = String(headers['x-forwarded-host'] || headers.host || '').split(',')[0].trim();
  const site = host ? 'https://' + host : 'https://booka-reads.netlify.app';
  const id = String((event.queryStringParameters && event.queryStringParameters.id) || '').trim();

  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)) {
    return { statusCode: 302, headers: { Location: site + '/' }, body: '' };
  }

  const target = site + '/#book=' + id;
  const shareUrl = site + '/share/' + id;
  let title = 'Treeshelf | Cozy reads from amateur writers';
  let description = 'Read and share books, stories and poems written by amateur writers.';
  let image = site + '/share.jpg';

  try {
    const url = SUPABASE_URL + '/rest/v1/books?id=eq.' + id + '&select=title,author,blurb,cover_path&limit=1';
    const res = await fetch(url, { headers: { apikey: SUPABASE_ANON_KEY, Authorization: 'Bearer ' + SUPABASE_ANON_KEY } });
    const rows = res.ok ? await res.json() : [];
    if (Array.isArray(rows) && rows.length) {
      const book = rows[0];
      title = book.title + ' by ' + book.author + ' | Treeshelf';
      description = (book.blurb && book.blurb.trim()) ? book.blurb.trim() : 'Read this book on Treeshelf.';
      if (book.cover_path) {
        image = SUPABASE_URL + '/storage/v1/object/public/books/' + String(book.cover_path).split('/').map(encodeURIComponent).join('/');
      }
    }
  } catch (err) {
    /* fall back to the general preview */
  }

  return {
    statusCode: 200,
    headers: { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'public, max-age=300' },
    body: page(site, shareUrl, target, title, description, image)
  };
};
