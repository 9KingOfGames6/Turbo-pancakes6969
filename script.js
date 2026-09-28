/**
 * CYBERWIKI - Всё о компьютерах
 * Interactive Wiki Engine
 */

document.addEventListener('DOMContentLoaded', () => {
  initReadingProgress();
  initNavigation();
  initSearch();
  initCitations();
  initFontSizeControls();
  initLightbox();
  initTableOfContents();
  handleInitialHash();
});

// Reading Progress Bar
function initReadingProgress() {
  const progressBar = document.getElementById('readingProgress');
  if (!progressBar) return;

  window.addEventListener('scroll', () => {
    const winScroll = document.documentElement.scrollTop || document.body.scrollTop;
    const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
    const scrolled = (winScroll / height) * 100;
    progressBar.style.width = scrolled + '%';
  });
}

// Navigation & Article Switching
function initNavigation() {
  const navLinks = document.querySelectorAll('.nav-link');
  const articles = document.querySelectorAll('.wiki-article');
  const breadcrumbCurrent = document.querySelector('.breadcrumb-current');
  const mobileToggle = document.querySelector('.mobile-nav-toggle');
  const sidebar = document.querySelector('.wiki-sidebar');

  function switchArticle(targetId, updateHash = true) {
    let matchedArticle = null;

    articles.forEach(article => {
      if (article.id === targetId) {
        article.style.display = 'block';
        matchedArticle = article;
      } else {
        article.style.display = 'none';
      }
    });

    if (!matchedArticle && articles.length > 0) {
      articles[0].style.display = 'block';
      matchedArticle = articles[0];
      targetId = articles[0].id;
    }

    navLinks.forEach(link => {
      if (link.getAttribute('data-target') === targetId) {
        link.classList.add('active');
        const title = link.querySelector('.link-text')?.textContent || link.textContent;
        if (breadcrumbCurrent) breadcrumbCurrent.textContent = title.trim();
        document.title = `${title.trim()} — Всё о компьютерах | CyberWiki`;
      } else {
        link.classList.remove('active');
      }
    });

    if (updateHash) {
      window.location.hash = targetId;
    }

    window.scrollTo({ top: 0, behavior: 'smooth' });

    // Close mobile sidebar if open
    if (sidebar && sidebar.classList.contains('mobile-open')) {
      sidebar.classList.remove('mobile-open');
    }

    // Refresh TOC and citations
    generateDynamicTOC(matchedArticle);
  }

  navLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const target = link.getAttribute('data-target');
      switchArticle(target);
    });
  });

  // Internal wiki links with data-article
  document.addEventListener('click', (e) => {
    const wikiLink = e.target.closest('a[data-article]');
    if (wikiLink) {
      e.preventDefault();
      const target = wikiLink.getAttribute('data-article');
      const section = wikiLink.getAttribute('data-section');
      switchArticle(target);
      if (section) {
        setTimeout(() => {
          const el = document.getElementById(section);
          if (el) el.scrollIntoView({ behavior: 'smooth' });
        }, 150);
      }
    }
  });

  // Mobile menu toggle
  if (mobileToggle && sidebar) {
    mobileToggle.addEventListener('click', () => {
      sidebar.classList.toggle('mobile-open');
    });

    // Close on click outside on mobile
    document.addEventListener('click', (e) => {
      if (window.innerWidth <= 860 && 
          sidebar.classList.contains('mobile-open') && 
          !sidebar.contains(e.target) && 
          !mobileToggle.contains(e.target)) {
        sidebar.classList.remove('mobile-open');
      }
    });
  }

  window.cyberWikiSwitchArticle = switchArticle;
}

// Handle URL hash on load (e.g., #cpu or #history)
function handleInitialHash() {
  const hash = window.location.hash.replace('#', '');
  if (hash && window.cyberWikiSwitchArticle) {
    const targetArticle = document.getElementById(hash);
    if (targetArticle && targetArticle.classList.contains('wiki-article')) {
      window.cyberWikiSwitchArticle(hash, false);
      return;
    }
    // Check if hash matches an internal section
    const sectionEl = document.getElementById(hash);
    if (sectionEl) {
      const parentArticle = sectionEl.closest('.wiki-article');
      if (parentArticle) {
        window.cyberWikiSwitchArticle(parentArticle.id, false);
        setTimeout(() => {
          sectionEl.scrollIntoView({ behavior: 'smooth' });
        }, 200);
      }
    }
  } else {
    // Default to first article
    const firstArticle = document.querySelector('.wiki-article');
    if (firstArticle && window.cyberWikiSwitchArticle) {
      window.cyberWikiSwitchArticle(firstArticle.id, false);
    }
  }
}

// Dynamic Table of Contents Generator & ScrollSpy
function initTableOfContents() {
  const tocContainers = document.querySelectorAll('.wiki-toc-box');
  tocContainers.forEach(box => {
    const toggleBtn = box.querySelector('.toc-toggle');
    const list = box.querySelector('.toc-list');
    if (toggleBtn && list) {
      toggleBtn.addEventListener('click', () => {
        const isHidden = list.style.display === 'none';
        list.style.display = isHidden ? 'block' : 'none';
        toggleBtn.textContent = isHidden ? '[скрыть]' : '[показать]';
      });
    }
  });
}

function generateDynamicTOC(activeArticle) {
  if (!activeArticle) return;
  const tocBox = activeArticle.querySelector('.wiki-toc-box');
  if (!tocBox) return;

  const headings = activeArticle.querySelectorAll('.article-prose h2, .article-prose h3');
  const tocList = tocBox.querySelector('.toc-list');
  if (!tocList) return;

  tocList.innerHTML = '';

  let h2Count = 0;
  let h3Count = 0;

  headings.forEach(heading => {
    if (!heading.id) {
      heading.id = heading.textContent.toLowerCase()
        .replace(/[^a-zа-яё0-9\s]/gi, '')
        .trim()
        .replace(/\s+/g, '-');
    }

    const li = document.createElement('li');
    const a = document.createElement('a');
    a.href = `#${heading.id}`;
    a.className = 'toc-link';

    const numSpan = document.createElement('span');
    numSpan.className = 'toc-num';

    if (heading.tagName === 'H2') {
      h2Count++;
      h3Count = 0;
      li.className = 'toc-item';
      numSpan.textContent = `${h2Count}. `;
    } else {
      h3Count++;
      li.className = 'toc-item nested';
      numSpan.textContent = `${h2Count}.${h3Count} `;
    }

    a.appendChild(numSpan);
    a.appendChild(document.createTextNode(heading.textContent.trim()));

    a.addEventListener('click', (e) => {
      e.preventDefault();
      heading.scrollIntoView({ behavior: 'smooth' });
      window.location.hash = heading.id;
    });

    li.appendChild(a);
    tocList.appendChild(li);
  });
}

// Citations, Popovers & Reference Highlighting
function initCitations() {
  const tooltip = document.createElement('div');
  tooltip.className = 'citation-tooltip';
  tooltip.id = 'citationTooltip';
  document.body.appendChild(tooltip);

  let activeTimeout = null;

  document.addEventListener('mouseover', (e) => {
    const citeLink = e.target.closest('.ref-cite a');
    if (!citeLink) return;

    clearTimeout(activeTimeout);
    const targetRefId = citeLink.getAttribute('href').replace('#', '');
    const refItem = document.getElementById(targetRefId);

    if (refItem) {
      const title = refItem.getAttribute('data-source-title') || 'Авторитетный источник';
      const author = refItem.getAttribute('data-source-author') || '';
      const url = refItem.querySelector('a')?.getAttribute('href') || '#';
      const year = refItem.getAttribute('data-source-year') || '';

      tooltip.innerHTML = `
        <div class="citation-tooltip-title">${title}</div>
        <div style="color: #94a3b8; font-size: 0.76rem;">${author ? author + ' ' : ''}${year ? '(' + year + ')' : ''}</div>
        <div class="citation-tooltip-source">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line></svg>
          ${new URL(url, window.location.href).hostname}
        </div>
      `;

      const rect = citeLink.getBoundingClientRect();
      const tooltipX = Math.min(rect.left + window.scrollX, window.innerWidth - 340);
      const tooltipY = rect.bottom + window.scrollY + 8;

      tooltip.style.left = `${Math.max(10, tooltipX)}px`;
      tooltip.style.top = `${tooltipY}px`;
      tooltip.classList.add('active');
    }
  });

  document.addEventListener('mouseout', (e) => {
    const citeLink = e.target.closest('.ref-cite a');
    if (citeLink) {
      activeTimeout = setTimeout(() => {
        tooltip.classList.remove('active');
      }, 250);
    }
  });

  tooltip.addEventListener('mouseenter', () => clearTimeout(activeTimeout));
  tooltip.addEventListener('mouseleave', () => tooltip.classList.remove('active'));

  // Click on citation jumps to references and pulses
  document.addEventListener('click', (e) => {
    const citeLink = e.target.closest('.ref-cite a');
    if (!citeLink) return;

    e.preventDefault();
    const targetRefId = citeLink.getAttribute('href').replace('#', '');
    const refItem = document.getElementById(targetRefId);

    if (refItem) {
      refItem.scrollIntoView({ behavior: 'smooth', block: 'center' });
      refItem.classList.add('highlighted');
      setTimeout(() => {
        refItem.classList.remove('highlighted');
      }, 2500);
    }
  });
}

// Full-text Instant Search Modal
function initSearch() {
  const triggerBtn = document.getElementById('searchTriggerBtn');
  const modal = document.getElementById('searchModal');
  const closeBtn = document.getElementById('searchCloseBtn');
  const searchInput = document.getElementById('searchInput');
  const resultsContainer = document.getElementById('searchResults');

  if (!modal || !searchInput) return;

  function openModal() {
    modal.classList.add('open');
    searchInput.focus();
    performSearch(searchInput.value.trim());
  }

  function closeModal() {
    modal.classList.remove('open');
  }

  if (triggerBtn) triggerBtn.addEventListener('click', openModal);
  if (closeBtn) closeBtn.addEventListener('click', closeModal);

  modal.addEventListener('click', (e) => {
    if (e.target === modal) closeModal();
  });

  // Keyboard shortcut Ctrl+K / Cmd+K
  document.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
      e.preventDefault();
      if (modal.classList.contains('open')) {
        closeModal();
      } else {
        openModal();
      }
    } else if (e.key === 'Escape' && modal.classList.contains('open')) {
      closeModal();
    }
  });

  // Search indexing
  searchInput.addEventListener('input', () => {
    performSearch(searchInput.value.trim());
  });

  function performSearch(query) {
    resultsContainer.innerHTML = '';

    if (!query) {
      resultsContainer.innerHTML = '<li style="padding: 1.5rem; text-align: center; color: var(--text-dim); font-size: 0.85rem;">Введите ключевое слово (например: CPU, DDR5, фон Нейман, NVMe, ENIAC, Тьюринг...)</li>';
      return;
    }

    const q = query.toLowerCase();
    const matches = [];

    // Search inside all articles
    const articles = document.querySelectorAll('.wiki-article');
    articles.forEach(article => {
      const articleId = article.id;
      const articleTitle = article.querySelector('.article-title')?.textContent || articleId;
      const category = article.querySelector('.article-meta-item')?.textContent || 'Статья';

      // Check headings
      const headings = article.querySelectorAll('h2, h3');
      headings.forEach(heading => {
        if (heading.textContent.toLowerCase().includes(q)) {
          matches.push({
            articleId,
            articleTitle,
            category,
            headingId: heading.id,
            matchTitle: heading.textContent.trim(),
            snippet: `Раздел: ${heading.textContent.trim()}`
          });
        }
      });

      // Check paragraphs
      const paras = article.querySelectorAll('.article-prose p');
      paras.forEach(p => {
        const text = p.textContent;
        const idx = text.toLowerCase().indexOf(q);
        if (idx !== -1) {
          const start = Math.max(0, idx - 45);
          const end = Math.min(text.length, idx + q.length + 75);
          let snippet = text.substring(start, end);
          if (start > 0) snippet = '...' + snippet;
          if (end < text.length) snippet = snippet + '...';

          matches.push({
            articleId,
            articleTitle,
            category,
            headingId: null,
            matchTitle: articleTitle,
            snippet: snippet.replace(new RegExp(`(${query})`, 'gi'), '<mark>$1</mark>')
          });
        }
      });
    });

    if (matches.length === 0) {
      resultsContainer.innerHTML = '<li style="padding: 1.5rem; text-align: center; color: var(--text-dim); font-size: 0.85rem;">Ничего не найдено по вашему запросу.</li>';
      return;
    }

    // Limit to top 8 distinct results
    const shown = matches.slice(0, 10);
    shown.forEach(match => {
      const li = document.createElement('li');
      li.className = 'search-result-item';
      li.innerHTML = `
        <div class="result-article-title">
          <span>${match.matchTitle}</span>
          <span class="category-tag-small">${match.category}</span>
        </div>
        <div class="result-snippet">${match.snippet}</div>
      `;

      li.addEventListener('click', () => {
        closeModal();
        if (window.cyberWikiSwitchArticle) {
          window.cyberWikiSwitchArticle(match.articleId);
          if (match.headingId) {
            setTimeout(() => {
              const el = document.getElementById(match.headingId);
              if (el) el.scrollIntoView({ behavior: 'smooth' });
            }, 180);
          }
        }
      });

      resultsContainer.appendChild(li);
    });
  }
}

// Lightbox for Images
function initLightbox() {
  const lightbox = document.getElementById('lightboxModal');
  const lightboxImg = document.getElementById('lightboxImg');
  const lightboxCaption = document.getElementById('lightboxCaption');
  const lightboxClose = document.getElementById('lightboxClose');

  if (!lightbox) return;

  document.addEventListener('click', (e) => {
    const clickableImg = e.target.closest('.infobox-image, .wiki-figure img');
    if (clickableImg) {
      lightboxImg.src = clickableImg.src;
      lightboxCaption.textContent = clickableImg.alt || clickableImg.title || 'Изображение CyberWiki';
      lightbox.classList.add('open');
    }
  });

  const closeLb = () => lightbox.classList.remove('open');
  if (lightboxClose) lightboxClose.addEventListener('click', closeLb);
  lightbox.addEventListener('click', (e) => {
    if (e.target === lightbox) closeLb();
  });
}

// Font Size Controls (A- / A+)
function initFontSizeControls() {
  const btnDecrease = document.getElementById('fontDecreaseBtn');
  const btnIncrease = document.getElementById('fontIncreaseBtn');
  const root = document.documentElement;

  let currentSize = 16;

  if (btnDecrease) {
    btnDecrease.addEventListener('click', () => {
      if (currentSize > 14) {
        currentSize -= 1;
        root.style.setProperty('--wiki-font-size', `${currentSize}px`);
      }
    });
  }

  if (btnIncrease) {
    btnIncrease.addEventListener('click', () => {
      if (currentSize < 21) {
        currentSize += 1;
        root.style.setProperty('--wiki-font-size', `${currentSize}px`);
      }
    });
  }
}
