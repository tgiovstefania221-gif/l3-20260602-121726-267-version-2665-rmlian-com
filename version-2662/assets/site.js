(function () {
  var html = document.documentElement;
  var root = html.getAttribute('data-root') || './';

  function buildUrl(path) {
    return root + path;
  }

  function setupMenu() {
    var toggle = document.querySelector('[data-menu-toggle]');
    var panel = document.querySelector('[data-mobile-panel]');
    if (!toggle || !panel) {
      return;
    }
    toggle.addEventListener('click', function () {
      panel.classList.toggle('open');
    });
  }

  function setupSearchForms() {
    var forms = document.querySelectorAll('[data-search-form]');
    forms.forEach(function (form) {
      form.addEventListener('submit', function (event) {
        event.preventDefault();
        var input = form.querySelector('input[name="q"]');
        var query = input ? input.value.trim() : '';
        var target = buildUrl('search.html');
        if (query) {
          target += '?q=' + encodeURIComponent(query);
        }
        window.location.href = target;
      });
    });
  }

  function setupHero() {
    var hero = document.querySelector('[data-hero]');
    if (!hero) {
      return;
    }
    var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    var prev = hero.querySelector('[data-hero-prev]');
    var next = hero.querySelector('[data-hero-next]');
    var active = 0;

    function show(index) {
      if (!slides.length) {
        return;
      }
      active = (index + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('active', i === active);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('active', i === active);
      });
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        show(Number(dot.getAttribute('data-hero-dot')) || 0);
      });
    });

    if (prev) {
      prev.addEventListener('click', function () {
        show(active - 1);
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        show(active + 1);
      });
    }

    window.setInterval(function () {
      show(active + 1);
    }, 5600);
  }

  function setupPlayer() {
    var box = document.querySelector('[data-player]');
    if (!box) {
      return;
    }
    var video = box.querySelector('video[data-hls-src]');
    var button = box.querySelector('[data-play-button]');
    if (!video) {
      return;
    }
    var source = video.getAttribute('data-hls-src');
    var ready = false;

    function attachSource() {
      if (ready || !source) {
        return;
      }
      ready = true;
      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = source;
      } else if (window.Hls && window.Hls.isSupported()) {
        var hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hls.loadSource(source);
        hls.attachMedia(video);
      } else {
        video.src = source;
      }
    }

    function playVideo() {
      attachSource();
      if (button) {
        button.classList.add('hidden');
      }
      var playPromise = video.play();
      if (playPromise && playPromise.catch) {
        playPromise.catch(function () {
          video.setAttribute('controls', 'controls');
        });
      }
    }

    if (button) {
      button.addEventListener('click', playVideo);
    }
    video.addEventListener('click', function () {
      if (video.paused) {
        playVideo();
      }
    });
    video.addEventListener('play', function () {
      if (button) {
        button.classList.add('hidden');
      }
    });
  }

  function createCard(item) {
    var article = document.createElement('article');
    article.className = 'movie-card';
    article.innerHTML = [
      '<a class="poster-frame" href="' + item.url + '" style="--poster-image: url(\'' + item.image + '\');" aria-label="' + escapeHtml(item.title) + '">',
      '<span class="play-badge">▶</span>',
      '<span class="poster-meta">' + item.year + ' · ' + escapeHtml(item.type) + '</span>',
      '</a>',
      '<div class="card-body">',
      '<a class="card-title" href="' + item.url + '">' + escapeHtml(item.title) + '</a>',
      '<p>' + escapeHtml(item.oneLine || item.genre) + '</p>',
      '<div class="card-tags"><span>' + escapeHtml(item.region) + '</span><span>' + escapeHtml(item.genre) + '</span></div>',
      '</div>'
    ].join('');
    return article;
  }

  function escapeHtml(value) {
    return String(value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function setupSearchPage() {
    var results = document.querySelector('[data-search-results]');
    var summary = document.querySelector('[data-search-summary]');
    if (!results || !summary || !window.SEARCH_DATA) {
      return;
    }
    var params = new URLSearchParams(window.location.search);
    var query = (params.get('q') || '').trim();
    var input = document.querySelector('.search-large input[name="q"]');
    if (input) {
      input.value = query;
    }
    if (!query) {
      return;
    }
    var terms = query.toLowerCase().split(/\s+/).filter(Boolean);
    var matched = window.SEARCH_DATA.filter(function (item) {
      var haystack = [item.title, item.region, item.type, item.year, item.genre, item.channel, item.oneLine].join(' ').toLowerCase();
      return terms.every(function (term) {
        return haystack.indexOf(term) !== -1;
      });
    }).slice(0, 120);
    summary.textContent = matched.length ? '搜索结果：' + query : '没有找到匹配影片：' + query;
    results.innerHTML = '';
    matched.forEach(function (item) {
      results.appendChild(createCard(item));
    });
  }

  setupMenu();
  setupSearchForms();
  setupHero();
  setupPlayer();
  setupSearchPage();
})();
