/* ===== Treeshelf: draw.js =====
   Navigation, Explore cards, uploads, and the reader.
   Books and accounts live in Supabase (see SETUP.md). */

(function () {
  'use strict';

  /* ---------- Settings ---------- */
  var MAX_FILE_BYTES = 25 * 1024 * 1024; // 25 MB
  var GENRES = [
    'Short story', 'Novel', 'Poetry', 'Romance', 'Fantasy', 'Science fiction',
    'Mystery and thriller', 'Horror', 'Memoir and essay', "Children's story",
    'Faith and reflection', 'Other'
  ];
  var COVER_COLOURS = [
    '#1f4e5f', '#5a3e5c', '#7a4a2b', '#2f5d3a', '#6b2f3a',
    '#3b4a78', '#6a5a1f', '#2b5d63', '#5b3a29'
  ];

  /* ---------- Sample books (nine cards to start with) ---------- */
  var SAMPLES = [
    {
      id: 'sample-1', title: 'The Last Bus to Aba', author: 'Sample Author', genre: 'Short story',
      blurb: 'A student misses the last bus home and meets someone who changes his plans.',
      text: 'The last bus left the motor park at nine, and Chidi watched its red lights shrink down the road with his bag still on his shoulder.\n\nHe was ready to complain to the night itself when a voice behind him said, "You can walk with me to the junction, if you like. The lamps are brighter there."\n\nIt was an old woman selling roasted groundnuts. She had been closing her stall, and she talked the whole way about the town as it was before the tarred roads. By the junction, Chidi had stopped being angry. He had a place to sleep, a story to tell, and a promise to buy groundnuts every Friday.'
    },
    {
      id: 'sample-2', title: 'Salt and Lantern', author: 'Sample Author', genre: 'Fantasy',
      blurb: 'A lighthouse keeper discovers that her lantern guides more than ships.',
      text: 'Every night Meru climbed one hundred and twelve steps to light the lantern, and every night something answered from the sea.\n\nAt first she thought it was the wind in the rocks. Then the answers grew patient and slow, like a question being asked back to her.\n\nOn the fortieth night she left the lantern dark. The sea went quiet, and then, very gently, the tide brought a door to her shore: weathered, painted blue, and standing upright in the sand.'
    },
    {
      id: 'sample-3', title: 'Rain on Zinc Roofs', author: 'Sample Author', genre: 'Poetry',
      blurb: 'Small poems about rainy seasons, kitchens and the people who wait for them to pass.',
      text: 'Rain on Zinc Roofs\n\nThe first drops are a rumour,\nthen the roof begins to drum,\nand every cup in the house\nbecomes a small, loud sea.\n\nMother covers the rice.\nFather counts the leaks.\nI sit by the window\nand learn the sound of being home.'
    },
    {
      id: 'sample-4', title: 'Letters I Never Posted', author: 'Sample Author', genre: 'Memoir and essay',
      blurb: 'Short essays addressed to people from the writer\'s past, written in plain, honest words.',
      text: 'Dear Mr. Okafor,\n\nYou probably will not remember me. I was the boy at the back who never answered questions, even when I knew them.\n\nYou once wrote on my test paper, "You think better than you speak. Write it down." I did not know that one sentence would become the road I walk on. I write this letter today because I have finally stopped being afraid of the page.\n\nThank you for noticing a quiet child.'
    },
    {
      id: 'sample-5', title: 'The Case of the Missing Ledger', author: 'Sample Author', genre: 'Mystery and thriller',
      blurb: 'A village shopkeeper is robbed of a book that proves everyone owes him money.',
      text: 'Mama Ngozi did not report the missing ledger to the police. She reported it to the market.\n\n"Someone has taken my book," she announced, standing on an upturned crate. "Do not worry. I remember every debt in it."\n\nBy evening, six people had quietly paid. By morning, the ledger was back on her counter, with a note tucked inside: "I only wanted to see my own name erased." She never found out who wrote it. She never needed to.'
    },
    {
      id: 'sample-6', title: 'Hour of the Hollow House', author: 'Sample Author', genre: 'Horror',
      blurb: 'A family moves into a house where every clock stops at exactly 3:03.',
      text: 'The estate agent had warned them about the clocks, but only in the way people warn you about a loud neighbour.\n\n"They stop at three minutes past three," he said. "Nothing to worry about."\n\nOn the first night the whole family woke at 3:03 without an alarm. On the second night they woke to find the kitchen table set for five. They were only four. The fifth chair was pulled out, as if somebody had just stood up.'
    },
    {
      id: 'sample-7', title: 'Mango Season', author: 'Sample Author', genre: 'Romance',
      blurb: 'Two neighbours, one tree and a summer of arguing over whose mangoes they really are.',
      text: 'Adaeze and Tobenna had argued over the mango tree for eleven years, ever since its branches crossed the wall between their compounds.\n\nThis summer the tree gave more fruit than anyone could remember, and neither of them could eat it all. So Tobenna left a basket on the wall, and Adaeze left a note in the basket: "Still mine."\n\nThe notes grew longer. By the end of the season they were no longer about mangoes at all.'
    },
    {
      id: 'sample-8', title: 'Star Maps for Ama', author: 'Sample Author', genre: "Children's story",
      blurb: 'A little girl draws the sky every night so her grandfather can see it again.',
      text: 'Ama\'s grandfather could no longer see the stars, so Ama decided to bring the stars to him.\n\nEvery night she lay on the roof and drew what she saw: a big spoon, a lazy fish, three friends holding hands. In the morning she read the map aloud while he drank his tea.\n\n"That is the fish," he would say, smiling at the ceiling. "I remember him." And Ama knew the map was working.'
    },
    {
      id: 'sample-9', title: 'Signal Lost, Signal Found', author: 'Sample Author', genre: 'Science fiction',
      blurb: 'A repair technician on a quiet moon station hears a message that was sent from her own future.',
      text: 'Technician Yara had repaired nine thousand antennas, and none of them had ever spoken her name.\n\nThe tenth did. It was a faint voice, tired but kind, saying, "Yara, do not fix the relay on Deck Four. Please. Trust me. I am you, and I am very sorry about the coffee."\n\nShe stared at the relay for a long minute. Then she put down her tools, walked to the canteen and, for the first time in months, made two cups of coffee.'
    }
  ];

  /* ---------- Small helpers ---------- */
  function $(sel, root) { return (root || document).querySelector(sel); }
  function $all(sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); }

  function el(tag, props, children) {
    var node = document.createElement(tag);
    if (props) {
      Object.keys(props).forEach(function (k) {
        if (k === 'class') node.className = props[k];
        else if (k === 'text') node.textContent = props[k];
        else if (k.slice(0, 2) === 'on') node.addEventListener(k.slice(2), props[k]);
        else node.setAttribute(k, props[k]);
      });
    }
    (children || []).forEach(function (c) { if (c) node.appendChild(c); });
    return node;
  }

  function hashString(s) {
    var h = 0;
    for (var i = 0; i < s.length; i++) { h = (h * 31 + s.charCodeAt(i)) >>> 0; }
    return h;
  }

  var toastTimer;
  function toast(message) {
    var t = $('#toast');
    t.textContent = message;
    t.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { t.classList.remove('show'); }, 3200);
  }

  /* ---------- Backend (Supabase) ---------- */
  var cfg = window.BOOKA_CONFIG || window.Treeshelf_CONFIG || window.TREESHELF_CONFIG || {};
  var sb = null;
  var session = null;
  var uploaded = [];

  function rowToBook(r) {
    var url = r.file_path ? sb.storage.from('books').getPublicUrl(r.file_path).data.publicUrl : null;
    return {
      id: r.id, title: r.title, author: r.author, genre: r.genre, blurb: r.blurb, type: r.type,
      text: r.body, fileName: r.file_name, filePath: r.file_path, fileUrl: url,
      reads: r.reads, owner: r.owner, created: new Date(r.created_at).getTime()
    };
  }

  function getAllBooks() {
    if (!sb) return Promise.resolve([]);
    return sb.from('books').select('*').order('created_at', { ascending: false }).then(function (res) {
      return res.error ? [] : res.data.map(rowToBook);
    });
  }

  function saveBook(meta, file) {
    var path = null;
    var step = Promise.resolve();
    if (file) {
      path = session.user.id + '/' + Date.now() + '-' + file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
      step = sb.storage.from('books').upload(path, file, { contentType: file.type || undefined })
        .then(function (r) { if (r.error) throw r.error; });
    }
    return step.then(function () {
      return sb.from('books').insert({
        title: meta.title, author: meta.author, genre: meta.genre, blurb: meta.blurb,
        type: meta.type, body: meta.body, file_path: path, file_name: meta.fileName
      }).select().single();
    }).then(function (r) {
      if (r.error) throw r.error;
      return rowToBook(r.data);
    });
  }

  function deleteBook(book) {
    return sb.from('books').delete().eq('id', book.id).then(function (r) {
      if (r.error) throw r.error;
      if (book.filePath) return sb.storage.from('books').remove([book.filePath]);
    });
  }

  function allBooks() {
    return uploaded.concat(SAMPLES.slice(0, Math.max(0, 9 - uploaded.length)));
  }

  function isOwner(book) { return !!(session && book.owner === session.user.id); }

  function backendMessage() {
    return window.supabase
      ? 'Backend not set up yet. Add your Supabase details in config.js.'
      : 'The Supabase library did not load. Check your internet connection and refresh the page.';
  }

  function openAuth() {
    var d = $('#auth-dialog');
    if (typeof d.showModal === 'function' && !d.open) d.showModal();
  }

  function initAuth() {
    var dlg = $('#auth-dialog'), form = $('#auth-form'), msg = $('#auth-msg'), btn = $('#auth-btn');
    function say(t) { msg.textContent = t; msg.hidden = !t; }
    function ui() { btn.textContent = session ? 'Log out' : 'Log in'; }

    btn.addEventListener('click', function () {
      if (!sb) { toast(backendMessage()); return; }
      if (session) { sb.auth.signOut(); toast('Logged out.'); } else { say(''); openAuth(); }
    });
    $('#close-auth').addEventListener('click', function () { dlg.close(); });

    function go(mode) {
      if (!sb) { say(backendMessage()); return; }
      var email = form.elements.email.value.trim(), pw = form.elements.password.value;
      if (!email || pw.length < 6) { say('Enter your email and a password of at least 6 characters.'); return; }
      var call = mode === 'up' ? sb.auth.signUp({ email: email, password: pw }) : sb.auth.signInWithPassword({ email: email, password: pw });
      call.then(function (r) {
        if (r.error) { say(r.error.message); return; }
        if (mode === 'up' && !r.data.session) { say('Account created. Check your email to confirm it, then log in.'); return; }
        form.reset(); say(''); dlg.close(); toast('Welcome to Treeshelf.');
      });
    }
    form.addEventListener('submit', function (e) { e.preventDefault(); go('in'); });
    $('#signup-btn').addEventListener('click', function () { go('up'); });

    if (sb) {
      sb.auth.onAuthStateChange(function (_event, s) { session = s; ui(); renderGrid(); });
      sb.auth.getSession().then(function (r) { session = r.data.session; ui(); renderGrid(); });
    }
  }

  /* ---------- Navigation ---------- */
  var VIEWS = ['about', 'explore', 'write'];

  function showView(name, updateHash) {
    if (name.indexOf('book=') === 0) name = 'explore';
    if (VIEWS.indexOf(name) === -1) name = 'about';
    VIEWS.forEach(function (v) { $('#' + v).hidden = (v !== name); });
    $all('.main-nav button').forEach(function (b) {
      var on = b.getAttribute('data-view') === name;
      b.classList.toggle('active', on);
      if (on) b.setAttribute('aria-current', 'page'); else b.removeAttribute('aria-current');
    });
    if (updateHash !== false && location.hash !== '#' + name) {
      history.replaceState(null, '', '#' + name);
    }
    window.scrollTo(0, 0);
  }

  function initNavigation() {
    document.addEventListener('click', function (e) {
      var target = e.target.closest('[data-view]');
      if (!target) return;
      e.preventDefault();
      closeReader();
      showView(target.getAttribute('data-view'));
    });
    window.addEventListener('hashchange', function () {
      showView(location.hash.replace('#', ''), false);
    });
    showView(location.hash.replace('#', '') || 'about', false);
  }

  /* ---------- Explore: filters and cards ---------- */
  function fillGenreSelects() {
    var filter = $('#genre-filter');
    filter.appendChild(el('option', { value: '', text: 'All genres' }));
    GENRES.forEach(function (g) { filter.appendChild(el('option', { value: g, text: g })); });
  }

  function coverFor(book) {
    var colour = COVER_COLOURS[hashString(book.title + book.author) % COVER_COLOURS.length];
    var btn = el('button', {
      type: 'button',
      class: 'cover',
      'aria-label': 'Read ' + book.title,
      style: 'background:linear-gradient(155deg,' + colour + ',' + colour + 'cc)',
      onclick: function () { openReader(book); }
    }, [
      el('span', { class: 'cover-title', text: book.title }),
      el('span', { class: 'cover-author', text: book.author })
    ]);
    return btn;
  }

  function shareBook(book) {
    var url = location.href.split('#')[0] + '#book=' + book.id;
    if (navigator.clipboard) navigator.clipboard.writeText(url).then(function () { toast('Link copied.'); }, function () { toast(url); });
    else toast(url);
  }

  function reportBook(book) {
    var reason = window.prompt('What is wrong with "' + book.title + '"? (copied work, explicit content, abuse, other)');
    if (!reason || !reason.trim()) return;
    sb.from('reports').insert({ book_id: book.id, reason: reason.trim().slice(0, 300) }).then(function (r) {
      toast(r.error ? 'Could not send the report.' : 'Thank you. We will review this book.');
    });
  }

  function cardFor(book) {
    var real = !book.sample;
    var tags = [el('span', { class: 'tag', text: book.genre })];
    tags.push(el('span', { class: real ? 'tag new' : 'tag', text: real ? (book.reads || 0) + ' reads' : 'Sample' }));

    if (book.type === 'chapters') tags.push(el('span', { class: 'tag', text: 'Serial' }));

    var actions = [el('button', { type: 'button', class: 'btn btn-primary btn-small', text: 'Read', onclick: function () { openReader(book); } })];
    if (real && book.fileUrl) actions.push(el('a', { class: 'btn btn-small', text: 'Download', href: book.fileUrl, target: '_blank', rel: 'noopener' }));
    if (real) {
      actions.push(el('button', { type: 'button', class: 'btn btn-small', text: 'Share', onclick: function () { shareBook(book); } }));
      actions.push(el('button', { type: 'button', class: 'btn btn-small', text: 'Report', onclick: function () { reportBook(book); } }));
    }
    if (isOwner(book)) {
      actions.push(el('button', { type: 'button', class: 'btn btn-small', text: 'Manage', onclick: function () { openManage(book); } }));
      actions.push(el('button', { type: 'button', class: 'btn btn-small btn-danger', text: 'Remove', onclick: function () { removeBook(book); } }));
    }

    return el('article', { class: 'card' }, [
      coverFor(book),
      el('div', { class: 'card-body' }, [
        el('div', { class: 'tags' }, tags),
        el('h3', { text: book.title }),
        el('p', { class: 'by', text: 'by ' + book.author }),
        el('p', { class: 'blurb', text: book.blurb || 'No description yet.' }),
        el('div', { class: 'card-actions' }, actions)
      ])
    ]);
  }

  function renderGrid() {
    var q = $('#search').value.trim().toLowerCase();
    var g = $('#genre-filter').value;
    var grid = $('#book-grid');
    grid.innerHTML = '';

    var books = allBooks().filter(function (b) {
      var hay = (b.title + ' ' + b.author + ' ' + (b.blurb || '') + ' ' + b.genre).toLowerCase();
      return (!q || hay.indexOf(q) !== -1) && (!g || b.genre === g);
    });

    books.forEach(function (b) { grid.appendChild(cardFor(b)); });
    $('#empty').hidden = books.length > 0;
    $('#book-count').textContent = books.length + (books.length === 1 ? ' book' : ' books') + ' on the shelf.';
  }

  function removeBook(book) {
    if (!window.confirm('Remove "' + book.title + '" from Explore? This cannot be undone.')) return;
    deleteBook(book).then(function () {
      uploaded = uploaded.filter(function (b) { return b.id !== book.id; });
      renderGrid();
      toast('Book removed.');
    }).catch(function () { toast('Could not remove the book. Try again.'); });
  }

  /* ---------- Reader ---------- */
  var readerUrl = null;
  var readerFontSize = 1.2;
  var lastFocus = null;

  function setReadingSize() {
    var page = $('.reading-page');
    if (page) page.style.setProperty('--reading-size', readerFontSize + 'rem');
  }

  function textToPage(text) {
    var page = el('article', { class: 'reading-page' });
    text.split(/\n\s*\n/).forEach(function (block) {
      var p = el('p');
      block.split('\n').forEach(function (line, i) {
        if (i > 0) p.appendChild(document.createElement('br'));
        p.appendChild(document.createTextNode(line));
      });
      page.appendChild(p);
    });
    return page;
  }

  function note(message) {
    return el('div', { class: 'reading-note', text: message });
  }

  function openReader(book) {
    lastFocus = document.activeElement;
    var body = $('#reader-body');
    var dl = $('#reader-download');
    body.innerHTML = '';
    body.scrollTop = 0;
    dl.hidden = true;

    $('#reader-title').textContent = book.title;
    $('#reader-author').textContent = 'by ' + book.author;
    $('#reader').hidden = false;
    document.body.style.overflow = 'hidden';

    if (book.fileUrl) { dl.href = book.fileUrl; dl.target = '_blank'; dl.rel = 'noopener'; dl.hidden = false; }
    if (!book.sample && sb) {
      sb.rpc('increment_reads', { book_id: book.id }).then(function () { book.reads = (book.reads || 0) + 1; });
    }

    if (book.type === 'pdf' && book.fileUrl) {
      body.appendChild(el('iframe', { src: book.fileUrl, title: book.title }));
    } else if (book.type === 'docx' && book.fileUrl) {
      body.appendChild(note('Opening your document...'));
      renderDocx(book, body);
    } else if (book.type === 'chapters') {
      body.appendChild(note('Loading chapters...'));
      renderChapters(book, body);
    } else if (book.type === 'doc') {
      body.appendChild(note('This older .doc file cannot be shown inside the reader. Use Download to open it in Word.'));
    } else {
      body.appendChild(textToPage(book.text || ''));
      setReadingSize();
    }
    $('#reader-close').focus();
  }

  function renderDocx(book, body) {
    if (typeof mammoth === 'undefined') {
      body.innerHTML = '';
      body.appendChild(note('The Word reader could not load. Check your internet connection, or use Download.'));
      return;
    }
    fetch(book.fileUrl).then(function (r) { return r.arrayBuffer(); }).then(function (buf) {
      return mammoth.convertToHtml({ arrayBuffer: buf });
    }).then(function (result) {
      body.innerHTML = '';
      var page = el('article', { class: 'reading-page' });
      page.innerHTML = result.value || '<p>This document appears to be empty.</p>';
      body.appendChild(page);
      setReadingSize();
    }).catch(function () {
      body.innerHTML = '';
      body.appendChild(note('This document could not be displayed. Use Download to open it in Word.'));
    });
  }

  function closeReader() {
    var reader = $('#reader');
    if (reader.hidden) return;
    reader.hidden = true;
    $('#reader-body').innerHTML = '';
    document.body.style.overflow = '';
    if (readerUrl) { URL.revokeObjectURL(readerUrl); readerUrl = null; }
    if (lastFocus && lastFocus.focus) lastFocus.focus();
  }

  function initReader() {
    $('#reader-close').addEventListener('click', closeReader);
    $('#font-up').addEventListener('click', function () {
      readerFontSize = Math.min(2, readerFontSize + 0.1); setReadingSize();
    });
    $('#font-down').addEventListener('click', function () {
      readerFontSize = Math.max(0.9, readerFontSize - 0.1); setReadingSize();
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') closeReader();
    });
  }

  /* ---------- Chapters: reading ---------- */
  function renderChapters(book, body) {
    sb.from('chapters').select('id,position,title,body').eq('book_id', book.id)
      .order('position', { ascending: true }).then(function (res) {
        body.innerHTML = '';
        var list = res.error ? [] : res.data;
        if (!list.length) {
          body.appendChild(note('The author has not published any chapters yet. Check back soon.'));
          return;
        }
        var page = el('article', { class: 'reading-page' });
        body.appendChild(page);

        function show(i) {
          page.innerHTML = '';
          var sel = el('select', { 'aria-label': 'Choose chapter' });
          list.forEach(function (c, idx) {
            var o = el('option', { value: String(idx), text: (idx + 1) + '. ' + c.title });
            if (idx === i) o.selected = true;
            sel.appendChild(o);
          });
          sel.addEventListener('change', function () { show(Number(sel.value)); });
          page.appendChild(el('div', { class: 'chapter-nav' }, [sel]));
          page.appendChild(el('h2', { text: list[i].title }));

          var text = textToPage(list[i].body || '');
          while (text.firstChild) page.appendChild(text.firstChild);

          var prev = el('button', { type: 'button', class: 'btn btn-small', text: 'Previous chapter', onclick: function () { show(i - 1); } });
          var next = el('button', { type: 'button', class: 'btn btn-small btn-primary', text: 'Next chapter', onclick: function () { show(i + 1); } });
          if (i === 0) prev.disabled = true;
          if (i === list.length - 1) next.disabled = true;
          page.appendChild(el('div', { class: 'chapter-nav' }, [prev, next]));
          body.scrollTop = 0;
          setReadingSize();
        }
        show(0);
      });
  }

  /* ---------- Manage a book: edit details and chapters ---------- */
  function field(label, input) {
    return el('label', { class: 'field' }, [el('span', { class: 'field-label', text: label }), input]);
  }

  function actionBtn(text, fn, disabled, danger) {
    var b = el('button', { type: 'button', class: 'btn btn-small' + (danger ? ' btn-danger' : ''), text: text, onclick: fn });
    if (disabled) b.disabled = true;
    return b;
  }

  function chaptersSection(book) {
    var wrap = el('div', { class: 'chapters-admin' });
    wrap.appendChild(el('h3', { text: 'Chapters' }));
    var listBox = el('div', { class: 'chapter-list' });
    wrap.appendChild(listBox);

    var form = el('form', { class: 'chapter-form', novalidate: '' });
    var titleIn = el('input', { type: 'text', maxlength: '100', placeholder: 'Chapter title' });
    var bodyIn = el('textarea', { rows: '10', placeholder: 'Paste or write the chapter here' });
    var msg = el('p', { class: 'form-error', hidden: '' });
    var saveBtn = el('button', { type: 'submit', class: 'btn btn-primary', text: 'Add chapter' });
    var cancelBtn = el('button', { type: 'button', class: 'btn', text: 'Cancel edit', hidden: '' });
    [field('Chapter title', titleIn), field('Chapter text', bodyIn), msg, saveBtn, cancelBtn].forEach(function (n) { form.appendChild(n); });
    wrap.appendChild(form);

    var items = [];
    var editing = null;

    function resetForm() {
      editing = null;
      titleIn.value = ''; bodyIn.value = '';
      saveBtn.textContent = 'Add chapter';
      cancelBtn.hidden = true;
    }

    function startEdit(c) {
      editing = c;
      titleIn.value = c.title; bodyIn.value = c.body || '';
      saveBtn.textContent = 'Save chapter';
      cancelBtn.hidden = false;
      titleIn.focus();
    }

    function load() {
      return sb.from('chapters').select('id,position,title,body').eq('book_id', book.id)
        .order('position', { ascending: true }).then(function (r) {
          items = r.error ? [] : r.data;
          draw();
        });
    }

    function draw() {
      listBox.innerHTML = '';
      if (!items.length) {
        listBox.appendChild(el('p', { class: 'sub', text: 'No chapters yet. Add your first one below.' }));
        return;
      }
      items.forEach(function (c, i) {
        listBox.appendChild(el('div', { class: 'chapter-row' }, [
          el('span', { class: 'chapter-name', text: (i + 1) + '. ' + c.title }),
          el('span', { class: 'chapter-btns' }, [
            actionBtn('Edit', function () { startEdit(c); }),
            actionBtn('Up', function () { move(i, -1); }, i === 0),
            actionBtn('Down', function () { move(i, 1); }, i === items.length - 1),
            actionBtn('Delete', function () { remove(c); }, false, true)
          ])
        ]));
      });
    }

    function move(i, dir) {
      var a = items[i], o = items[i + dir];
      if (!o) return;
      Promise.all([
        sb.from('chapters').update({ position: o.position }).eq('id', a.id),
        sb.from('chapters').update({ position: a.position }).eq('id', o.id)
      ]).then(load);
    }

    function remove(c) {
      if (!window.confirm('Delete the chapter "' + c.title + '"?')) return;
      sb.from('chapters').delete().eq('id', c.id).then(function () { if (editing && editing.id === c.id) resetForm(); load(); });
    }

    cancelBtn.addEventListener('click', resetForm);

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      msg.hidden = true;
      var t = titleIn.value.trim(), x = bodyIn.value.trim();
      if (!t || !x) { msg.textContent = 'Add a chapter title and some text.'; msg.hidden = false; return; }
      var wasEditing = !!editing, op;
      if (wasEditing) {
        op = sb.from('chapters').update({ title: t, body: x }).eq('id', editing.id);
      } else {
        var pos = items.length ? Math.max.apply(null, items.map(function (c) { return c.position; })) + 1 : 1;
        op = sb.from('chapters').insert({ book_id: book.id, title: t, body: x, position: pos });
      }
      saveBtn.disabled = true;
      op.then(function (r) {
        saveBtn.disabled = false;
        if (r.error) { msg.textContent = r.error.message; msg.hidden = false; return; }
        resetForm();
        toast(wasEditing ? 'Chapter saved.' : 'Chapter published.');
        return load();
      });
    });

    load();
    return wrap;
  }

  function openManage(book) {
    var dlg = $('#manage-dialog'), box = $('#manage-body');
    $('#manage-title').textContent = 'Manage: ' + book.title;
    box.innerHTML = '';

    var f = el('form', { class: 'book-form', novalidate: '' });
    var title = el('input', { type: 'text', maxlength: '80' }); title.value = book.title;
    var author = el('input', { type: 'text', maxlength: '60' }); author.value = book.author;
    var genre = el('select');
    GENRES.forEach(function (g) { genre.appendChild(el('option', { value: g, text: g })); });
    genre.value = book.genre;
    var blurb = el('textarea', { rows: '3', maxlength: '240' }); blurb.value = book.blurb || '';

    var parts = [field('Book title', title), field('Author or pen name', author), field('Genre', genre), field('Short description', blurb)];
    var storyIn = null;
    if (book.type === 'text') {
      storyIn = el('textarea', { rows: '10' });
      storyIn.value = book.text || '';
      parts.push(field('Story text', storyIn));
    }
    var msg = el('p', { class: 'form-error', hidden: '' });
    var save = el('button', { type: 'submit', class: 'btn btn-primary', text: 'Save changes' });
    parts.push(msg); parts.push(save);
    parts.forEach(function (p) { f.appendChild(p); });

    f.addEventListener('submit', function (e) {
      e.preventDefault();
      msg.hidden = true;
      if (!title.value.trim() || !author.value.trim()) { msg.textContent = 'Title and author cannot be empty.'; msg.hidden = false; return; }
      var changes = { title: title.value.trim(), author: author.value.trim(), genre: genre.value, blurb: blurb.value.trim() };
      if (storyIn) changes.body = storyIn.value;
      save.disabled = true;
      sb.from('books').update(changes).eq('id', book.id).select().single().then(function (r) {
        save.disabled = false;
        if (r.error) { msg.textContent = r.error.message; msg.hidden = false; return; }
        var fresh = rowToBook(r.data);
        Object.keys(fresh).forEach(function (k) { book[k] = fresh[k]; });
        $('#manage-title').textContent = 'Manage: ' + book.title;
        renderGrid();
        toast('Changes saved.');
      });
    });

    box.appendChild(f);
    if (book.type === 'chapters') box.appendChild(chaptersSection(book));
    if (typeof dlg.showModal === 'function' && !dlg.open) dlg.showModal();
  }

  /* ---------- Upload form (used on Write page and in Explore dialog) ---------- */
  function extensionOf(name) {
    var m = /\.([a-z0-9]+)$/i.exec(name || '');
    return m ? m[1].toLowerCase() : '';
  }

  function buildForm(onPublished) {
    var tpl = $('#book-form-template');
    var form = tpl.content.firstElementChild.cloneNode(true);
    var genreSelect = form.elements.genre;
    GENRES.forEach(function (g) { genreSelect.appendChild(el('option', { value: g, text: g })); });
    var errorBox = $('.form-error', form);
    var submitBtn = $('button[type="submit"]', form);
    var optionalSources = $all('.optional-source', form);
    form.elements.serial.addEventListener('change', function () {
      optionalSources.forEach(function (n) { n.hidden = form.elements.serial.checked; });
    });

    function fail(msg) { errorBox.textContent = msg; errorBox.hidden = false; }

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      errorBox.hidden = true;

      if (!sb) { fail(backendMessage()); return; }
      if (!session) { fail('Log in or create a free writer account to publish.'); openAuth(); return; }

      var title = form.elements.title.value.trim();
      var author = form.elements.author.value.trim();
      var text = form.elements.text.value.trim();
      var file = form.elements.file.files[0];
      var serial = form.elements.serial.checked;

      if (!title) { fail('Add a title for your book.'); form.elements.title.focus(); return; }
      if (!author) { fail('Add your name or a pen name.'); form.elements.author.focus(); return; }
      if (!serial && !file && !text) { fail('Attach a file or write your story in the text box.'); return; }

      var meta = {
        title: title, author: author, genre: form.elements.genre.value,
        blurb: form.elements.blurb.value.trim(), type: serial ? 'chapters' : 'text', body: serial ? null : (text || null), fileName: null
      };
      var upload = null;
      var prep = Promise.resolve();

      if (file && !serial) {
        var ext = extensionOf(file.name);
        if (['pdf', 'docx', 'doc', 'txt'].indexOf(ext) === -1) { fail('That file type is not supported. Use PDF, DOCX or TXT.'); return; }
        if (file.size > MAX_FILE_BYTES) { fail('That file is larger than 25 MB. Try compressing it or splitting the book.'); return; }
        if (ext === 'txt') {
          prep = file.text().then(function (t) { meta.body = t; });
        } else {
          meta.type = ext; meta.body = null; meta.fileName = file.name; upload = file;
        }
      }

      submitBtn.disabled = true;
      submitBtn.textContent = 'Publishing...';
      prep.then(function () { return saveBook(meta, upload); }).then(function (book) {
        uploaded.unshift(book);
        form.reset();
        renderGrid();
        toast('"' + book.title + '" is now on Explore.');
        if (onPublished) onPublished();
        if (book.type === 'chapters') openManage(book);
      }).catch(function (err) {
        fail('Your book could not be saved. ' + (err && err.message ? err.message : 'Please try again.'));
      }).then(function () {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Publish book';
      });
    });

    return form;
  }

  function initForms() {
    var manageDlg = $('#manage-dialog');
    $('#close-manage').addEventListener('click', function () { manageDlg.close(); });
    manageDlg.addEventListener('click', function (e) { if (e.target === manageDlg) manageDlg.close(); });

    $('#write-form-slot').appendChild(buildForm(function () { showView('explore'); }));

    var dialog = $('#upload-dialog');
    $('#dialog-form-slot').appendChild(buildForm(function () { dialog.close(); }));

    $('#open-upload').addEventListener('click', function () {
      if (typeof dialog.showModal === 'function') dialog.showModal();
      else showView('write');
    });
    $('#close-upload').addEventListener('click', function () { dialog.close(); });
    dialog.addEventListener('click', function (e) { if (e.target === dialog) dialog.close(); });
  }

  /* ---------- Start ---------- */
  function init() {
    SAMPLES.forEach(function (b) { b.sample = true; b.type = 'text'; });
    fillGenreSelects();
    initNavigation();
    initReader();
    initForms();
    $('#search').addEventListener('input', renderGrid);
    $('#genre-filter').addEventListener('change', renderGrid);

    if (window.supabase && cfg.SUPABASE_URL && cfg.SUPABASE_URL.indexOf('YOUR-PROJECT') === -1) {
      sb = window.supabase.createClient(cfg.SUPABASE_URL, cfg.SUPABASE_ANON_KEY);
    }
    initAuth();
    getAllBooks().then(function (books) {
      uploaded = books;
      renderGrid();
      var m = /#book=([\w-]+)/.exec(location.hash);
      if (m) {
        var found = uploaded.filter(function (b) { return b.id === m[1]; })[0];
        if (found) openReader(found);
      }
    });
    renderGrid();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();

})();
