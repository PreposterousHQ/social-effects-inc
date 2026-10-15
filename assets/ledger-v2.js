(function () {
  'use strict';

  var ENTRY_ORDER = [
    'rawk', 'fbr', 'ecoset', 'earth-angel',
    'skater-girl', 'sing-sing', 'mptf', 'hobbiton',
    'field-of-dreams', 'wicked', 'interstellar', 'patch-adams',
    'black-panther', 'schindlers-list', 'slumdog', 'braddock'
  ];

  var LEGACY_CASE_ANCHORS = new Set([
    'forerunners', 'rock-and-wrap-it-up', 'film-biz-recycling',
    'motion-picture-relief-fund', 'lord-of-the-rings',
    'slumdog-millionaire', 'braddock-free-store'
  ]);

  var CHAPTERS = {
    'A word about the films themselves': {
      id: 'essay-films-themselves',
      summary: 'The art is already a gift. This Ledger follows the giving that happens around the making.'
    },
    'The hundred years between': {
      id: 'essay-hundred-years-between',
      summary: 'Mutual aid, advocacy and fame used as an instrument — including the times it did not work.'
    },
    'The modern renaissance': {
      id: 'essay-modern-renaissance',
      summary: 'The operators, scholars and namers who began turning scattered instinct into a field.'
    },
    'The thing no one named': {
      id: 'essay-thing-no-one-named',
      summary: 'The second axis: gifts left in the people and places a production reaches.'
    },
    'Why now': {
      id: 'essay-why-now',
      summary: 'A founding era is closing as artificial intelligence separates the artifact from the event.'
    },
    'The next hundred years': {
      id: 'essay-next-hundred-years',
      summary: 'Regenerative filmmaking designs the giving in before the first frame is shot.'
    },
    'New Jersey, and the open hand': {
      id: 'essay-new-jersey-open-hand',
      summary: 'Where American film began, and where a different production model could take root.'
    },
    'Author’s note': {
      id: 'essay-authors-note',
      summary: 'How this record was found, researched and offered as a first draft.'
    }
  };

  var hub = document.getElementById('hub');
  var hero = document.getElementById('ledger-top');
  var heroDivider = hero ? hero.nextElementSibling : null;
  var views = Array.from(document.querySelectorAll('.ledger-view'));
  var entryPanel = document.getElementById('ledger-expanded');
  var currentEntry = null;
  var lastEntryTrigger = null;
  var feedPromise = null;

  function chapterKey(text) {
    return text.replace(/\u2019/g, '’').trim();
  }

  function buildEssayChapters() {
    var fold = document.querySelector('.essay-fold');
    var container = document.querySelector('.essay-expanded');
    var toc = document.getElementById('essay-toc-links');
    if (!fold || !container || !toc || container.dataset.enhanced === 'true') return;

    fold.open = true;
    container.dataset.enhanced = 'true';

    var nodes = Array.from(container.childNodes);
    var fragment = document.createDocumentFragment();
    var chapterContent = null;

    nodes.forEach(function (node) {
      if (node.nodeType === Node.ELEMENT_NODE && node.matches('h3.essay-h3')) {
        var title = chapterKey(node.textContent);
        var config = CHAPTERS[title] || {
          id: 'essay-' + title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
          summary: ''
        };
        var chapter = document.createElement('details');
        var summary = document.createElement('summary');
        var content = document.createElement('div');
        var titleSpan = document.createElement('span');
        var summarySpan = document.createElement('span');
        var toggleSpan = document.createElement('span');

        chapter.className = 'essay-chapter';
        chapter.id = config.id;
        summary.setAttribute('aria-label', title);
        titleSpan.className = 'chapter-title';
        titleSpan.textContent = title;
        summarySpan.className = 'chapter-summary';
        summarySpan.textContent = config.summary;
        toggleSpan.className = 'chapter-toggle';
        toggleSpan.setAttribute('aria-hidden', 'true');
        toggleSpan.textContent = '+';
        content.className = 'essay-chapter-content';

        summary.append(titleSpan, summarySpan, toggleSpan);
        content.appendChild(node);
        chapter.append(summary, content);
        fragment.appendChild(chapter);
        chapterContent = content;

        var tocLink = document.createElement('a');
        tocLink.href = '#' + config.id;
        tocLink.textContent = title;
        toc.appendChild(tocLink);
      } else if (chapterContent) {
        chapterContent.appendChild(node);
      } else {
        fragment.appendChild(node);
      }
    });

    container.replaceChildren(fragment);

    var tocDisclosure = document.querySelector('.essay-toc');
    if (window.matchMedia('(min-width: 1050px)').matches && tocDisclosure) {
      tocDisclosure.open = true;
    }

    var expandAll = document.getElementById('essay-expand-all');
    if (expandAll) {
      expandAll.addEventListener('click', function () {
        var chapters = Array.from(document.querySelectorAll('.essay-chapter'));
        var shouldOpen = chapters.some(function (chapter) { return !chapter.open; });
        chapters.forEach(function (chapter) { chapter.open = shouldOpen; });
        expandAll.setAttribute('aria-pressed', String(shouldOpen));
        expandAll.textContent = shouldOpen ? 'Collapse sections' : 'Expand all · Read straight through';
      });
    }
  }

  function enhanceCaseCards() {
    document.querySelectorAll('.l-card[data-entry]').forEach(function (card) {
      card.setAttribute('role', 'link');
      card.setAttribute('tabindex', '0');
      card.setAttribute('aria-label', 'Open ' + card.querySelector('.l-card-name').textContent);
      card.addEventListener('keydown', function (event) {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          window.expandEntry(card.dataset.entry);
        }
      });
    });
  }

  function labelShareControls() {
    document.querySelectorAll('.share-btn[data-label]').forEach(function (control) {
      if (!control.hasAttribute('aria-label')) {
        control.setAttribute('aria-label', control.dataset.label);
      }
    });
  }

  function setBackgroundAccessibility(isHidden) {
    [
      document.querySelector('body > nav'),
      hero,
      hub,
      document.querySelector('.ledger-v1-record'),
      document.querySelector('body > footer')
    ].concat(views).filter(Boolean).forEach(function (element) {
      if (element === entryPanel) return;
      if (isHidden) {
        element.setAttribute('aria-hidden', 'true');
        element.setAttribute('inert', '');
      } else {
        element.removeAttribute('aria-hidden');
        element.removeAttribute('inert');
      }
    });
  }

  function closeEntryPanel(restoreFocus) {
    if (!entryPanel.classList.contains('is-open')) return;
    entryPanel.classList.remove('is-open');
    document.body.classList.remove('entry-open');
    setBackgroundAccessibility(false);
    currentEntry = null;
    if (restoreFocus && lastEntryTrigger && document.contains(lastEntryTrigger)) {
      lastEntryTrigger.focus();
    }
  }

  function renderEntry(id) {
    var entry = entries[id];
    if (!entry) return;
    currentEntry = id;

    var card = entryPanel.querySelector('.exp-card');
    if (card) card.style.setProperty('--taxonomy-color', 'rgba(200,168,75,0.4)');

    var badge = document.getElementById('exp-badge');
    badge.className = 'l-badge ' + entry.bCls;
    badge.innerHTML = '<span class="l-badge-dot"></span> ' + entry.bLabel;
    badge.style.display = '';

    document.getElementById('exp-name').textContent = entry.name;
    document.getElementById('exp-editorial').textContent = entry.editorial;
    document.getElementById('exp-meta').innerHTML = entry.meta;

    var provenance = document.getElementById('exp-provenance');
    if (entry.provenance) {
      provenance.innerHTML = '<span class="exp-provenance-label">In their own words</span><span class="exp-provenance-note">' + entry.provenance + '</span>';
      provenance.style.display = 'inline-flex';
    } else {
      provenance.style.display = 'none';
    }

    var verdictLabel = entry.verdict ? entry.verdict.label : '';
    var verdictText = entry.verdict ? entry.verdict.text : '';
    document.getElementById('exp-verdict-label').textContent = verdictLabel;
    document.getElementById('exp-verdict-text').textContent = verdictText;
    document.getElementById('exp-verdict-container').style.display = verdictLabel || verdictText ? 'block' : 'none';

    document.getElementById('exp-stats').innerHTML = entry.stats.map(function (stat) {
      return '<div class="exp-stat"><span class="exp-stat-label">' + stat[0] + '</span><span class="exp-stat-value">' + stat[1] + '</span></div>';
    }).join('');

    var narrative = entry.body.map(function (paragraph) {
      return '<p class="case-body light">' + paragraph + '</p>';
    }).join('');

    if (entry.quote) {
      var quotes = Array.isArray(entry.quote) ? entry.quote : [entry.quote];
      narrative += quotes.map(function (quote) {
        return '<div class="exp-quote"><p>' + quote.text + '</p><cite>' + quote.attr + '</cite></div>';
      }).join('');
    }

    if (entry.links && entry.links.length) {
      narrative += '<div class="exp-links">' + entry.links.map(function (link) {
        return '<a href="' + link.url + '" target="_blank" rel="noopener noreferrer">' + link.label + ' <i class="ti ti-arrow-right"></i></a>';
      }).join('') + '</div>';
    }
    document.getElementById('exp-narrative').innerHTML = narrative;

    var shareUrlObject = new URL(window.location.href);
    shareUrlObject.hash = id;
    var shareUrl = encodeURIComponent(shareUrlObject.toString());
    var shareText = encodeURIComponent(entry.name + ' — A Social Effects Ledger of Filmanthropy · Social Effects NJ.');
    document.getElementById('share-twitter').href = 'https://twitter.com/intent/tweet?url=' + shareUrl + '&text=' + shareText;
    document.getElementById('share-linkedin').href = 'https://www.linkedin.com/sharing/share-offsite/?url=' + shareUrl;
    document.getElementById('share-facebook').href = 'https://www.facebook.com/sharer/sharer.php?u=' + shareUrl;
    document.getElementById('share-whatsapp').href = 'https://wa.me/?text=' + shareText + '%20' + shareUrl;
    document.getElementById('share-threads').href = 'https://www.threads.net/intent/post?text=' + shareText + '%20' + shareUrl;

    entryPanel.classList.add('is-open');
    entryPanel.scrollTop = 0;
    document.body.classList.add('entry-open');
    entryPanel.focus({ preventScroll: true });
    setBackgroundAccessibility(true);
  }

  window.expandEntry = function (id) {
    if (!entries[id]) return;
    lastEntryTrigger = document.activeElement;
    var currentHash = window.location.hash || '#case-studies';
    if (ENTRY_ORDER.includes(currentHash.slice(1))) {
      history.replaceState(history.state, '', '#' + id);
    } else {
      history.pushState({ ledgerEntry: true, returnHash: '#case-studies' }, '', '#' + id);
    }
    routeHash(false);
  };

  window.closeExpanded = function () {
    if (history.state && history.state.ledgerEntry) {
      history.back();
    } else {
      history.replaceState(null, '', '#case-studies');
      routeHash(false);
    }
  };

  function moveEntry(direction) {
    if (!currentEntry) return;
    var index = ENTRY_ORDER.indexOf(currentEntry);
    var nextIndex = (index + direction + ENTRY_ORDER.length) % ENTRY_ORDER.length;
    history.replaceState(history.state || { ledgerEntry: true, returnHash: '#case-studies' }, '', '#' + ENTRY_ORDER[nextIndex]);
    routeHash(false);
  }

  function showView(name) {
    var isHub = name === 'hub';
    hub.hidden = !isHub;
    hero.hidden = !isHub;
    if (heroDivider) heroDivider.hidden = !isHub;
    views.forEach(function (view) {
      view.hidden = view.dataset.view !== name;
    });
    document.body.dataset.ledgerView = name;
  }

  function openChapterIfNeeded(hash) {
    var chapter = document.getElementById(hash);
    if (chapter && chapter.classList.contains('essay-chapter')) {
      chapter.open = true;
    }
  }

  function scrollToHash(hash, initial) {
    var target;
    if (!hash) {
      target = document.documentElement;
    } else if (hash === 'essay') {
      target = document.getElementById('essay-view');
    } else if (hash === 'case-studies' || hash === 'forerunners') {
      target = document.getElementById('forerunners');
    } else if (hash === 'happening-now') {
      target = document.getElementById('happening-now-view');
    } else if (hash === 'stories-from-the-field') {
      target = document.getElementById('stories-from-the-field-view');
    } else {
      target = document.getElementById(hash);
    }
    if (target && target.scrollIntoView) {
      window.requestAnimationFrame(function () {
        target.scrollIntoView({ behavior: initial ? 'instant' : 'smooth', block: 'start' });
      });
      // Web fonts can change the height of the introduction above this anchor.
      if (document.fonts && document.fonts.status === 'loading') {
        document.fonts.ready.then(function () {
          if (window.location.hash.slice(1) === hash) {
            target.scrollIntoView({ behavior: 'instant', block: 'start' });
          }
        });
      }
    }
  }

  function routeHash(initial) {
    var hash = window.location.hash.slice(1);

    if (ENTRY_ORDER.includes(hash)) {
      showView('case-studies');
      renderEntry(hash);
      return;
    }

    closeEntryPanel(!initial);

    if (!hash || hash === 'hub') {
      showView('hub');
      loadFeed();
    } else if (
      hash === 'essay' ||
      hash === 'opening-essay' ||
      hash === 'essay-title' ||
      hash.indexOf('essay-') === 0
    ) {
      showView('essay');
      openChapterIfNeeded(hash);
    } else if (hash === 'case-studies' || LEGACY_CASE_ANCHORS.has(hash)) {
      showView('case-studies');
    } else if (hash === 'happening-now' || hash === 'watch') {
      showView('happening-now');
      loadFeed();
    } else if (hash === 'stories-from-the-field') {
      showView('stories-from-the-field');
    } else {
      showView('hub');
    }

    scrollToHash(hash, initial);
    updateReadingProgress();
  }

  function formatDate(value, style) {
    return new Intl.DateTimeFormat('en-US', style || {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      timeZone: 'UTC'
    }).format(new Date(value + 'T00:00:00Z'));
  }

  function makeElement(tag, className, text) {
    var element = document.createElement(tag);
    if (className) element.className = className;
    if (text !== undefined) element.textContent = text;
    return element;
  }

  function renderFeed(data) {
    var updated = 'Updated ' + formatDate(data.updated);
    document.getElementById('feed-updated').textContent = updated;
    document.getElementById('hub-feed-updated').textContent = updated;

    var hubTeasers = document.getElementById('hub-happening-teasers');
    hubTeasers.replaceChildren();
    data.items.slice(0, 3).forEach(function (item) {
      hubTeasers.appendChild(makeElement('span', 'hub-headline', formatDate(item.date, {
        month: 'short',
        day: 'numeric',
        timeZone: 'UTC'
      }) + ' · ' + item.production));
    });

    var feed = document.getElementById('happening-feed');
    feed.replaceChildren();
    data.items.forEach(function (item) {
      var article = makeElement('article', 'feed-item');
      article.id = 'now-' + item.id;
      article.appendChild(makeElement('p', 'feed-dateline', item.place + ' · ' + formatDate(item.date)));
      article.appendChild(makeElement('h3', '', item.production));
      article.appendChild(makeElement('p', 'feed-byline', item.who));
      article.appendChild(makeElement('p', 'feed-summary', item.summary));

      var meta = makeElement('div', 'feed-meta');
      meta.appendChild(makeElement('span', 'verification-badge', item.verification.label));
      meta.appendChild(makeElement('span', 'feed-tag', item.tag));
      article.appendChild(meta);

      if (item.followUp) {
        article.appendChild(makeElement('p', 'feed-follow-up', item.followUp));
      }

      var links = makeElement('div', 'feed-links');
      item.sources.forEach(function (source) {
        var link = makeElement('a', '', source.outlet + ' · ' + source.date + ' ↗');
        link.href = source.url;
        link.target = '_blank';
        link.rel = 'noopener noreferrer';
        links.appendChild(link);
      });
      if (item.related) {
        var related = makeElement('a', '', item.related.label + ' →');
        related.href = '#' + item.related.anchor;
        links.appendChild(related);
      }
      article.appendChild(links);
      feed.appendChild(article);
    });
  }

  function loadFeed() {
    if (!feedPromise) {
      feedPromise = fetch('data/happening-now.json')
        .then(function (response) {
          if (!response.ok) throw new Error('Feed unavailable');
          return response.json();
        })
        .then(renderFeed)
        .catch(function () {
          var feed = document.getElementById('happening-feed');
          feed.replaceChildren(makeElement('p', 'feed-error', 'The prototype feed could not be loaded. Please try again from a web server.'));
          document.getElementById('hub-happening-teasers').textContent = 'Feed unavailable';
        });
    }
    return feedPromise;
  }

  function updateReadingProgress() {
    var progress = document.getElementById('reading-progress');
    var essayView = document.getElementById('essay-view');
    if (document.body.dataset.ledgerView !== 'essay' || essayView.hidden) {
      progress.classList.remove('is-visible');
      progress.style.width = '0';
      return;
    }

    var start = essayView.offsetTop;
    var distance = Math.max(1, essayView.offsetHeight - window.innerHeight);
    var percent = Math.min(100, Math.max(0, ((window.scrollY - start) / distance) * 100));
    progress.style.width = percent + '%';
    progress.classList.add('is-visible');
  }

  function trapEntryFocus(event) {
    if (!entryPanel.classList.contains('is-open')) return;
    if (event.key === 'Escape') {
      event.preventDefault();
      window.closeExpanded();
      return;
    }
    if (event.key !== 'Tab') return;

    var focusable = Array.from(entryPanel.querySelectorAll(
      'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])'
    )).filter(function (element) {
      return !element.hasAttribute('hidden');
    });
    if (!focusable.length) return;
    var first = focusable[0];
    var last = focusable[focusable.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  }

  // Keep anchor landings clear of the fixed navigation at any viewport size.
  function updateNavHeight() {
    var nav = document.querySelector('body > nav');
    if (nav) document.body.style.setProperty('--ledger-nav-height', nav.getBoundingClientRect().height + 'px');
  }
  updateNavHeight();
  window.addEventListener('resize', updateNavHeight);

  buildEssayChapters();
  enhanceCaseCards();
  labelShareControls();
  document.getElementById('entry-previous').addEventListener('click', function () { moveEntry(-1); });
  document.getElementById('entry-next').addEventListener('click', function () { moveEntry(1); });
  document.addEventListener('keydown', trapEntryFocus);
  window.addEventListener('hashchange', function () { routeHash(false); });
  window.addEventListener('popstate', function () { routeHash(false); });
  window.addEventListener('scroll', updateReadingProgress, { passive: true });
  window.addEventListener('resize', updateReadingProgress);
  window.addEventListener('load', function () {
    if (!currentEntry) scrollToHash(window.location.hash.slice(1), true);
  }, { once: true });
  history.scrollRestoration = 'manual';
  routeHash(true);
})();
