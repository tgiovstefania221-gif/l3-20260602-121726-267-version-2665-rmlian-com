(function () {
    function ready(fn) {
        if (document.readyState !== 'loading') {
            fn();
        } else {
            document.addEventListener('DOMContentLoaded', fn);
        }
    }

    function normalize(value) {
        return String(value || '').toLowerCase().trim();
    }

    function initMobileMenu() {
        var button = document.querySelector('[data-mobile-menu="toggle"]');
        var panel = document.querySelector('[data-mobile-menu="panel"]');
        if (!button || !panel) {
            return;
        }
        button.addEventListener('click', function () {
            panel.classList.toggle('open');
        });
    }

    function initHero() {
        var root = document.querySelector('[data-hero]');
        if (!root) {
            return;
        }
        var slides = Array.prototype.slice.call(root.querySelectorAll('[data-hero-slide]'));
        var thumbs = Array.prototype.slice.call(root.querySelectorAll('[data-hero-target]'));
        var index = 0;
        var timer = null;

        function show(nextIndex) {
            index = nextIndex % slides.length;
            if (index < 0) {
                index = slides.length - 1;
            }
            slides.forEach(function (slide, i) {
                slide.classList.toggle('active', i === index);
            });
            thumbs.forEach(function (thumb, i) {
                thumb.classList.toggle('active', i === index);
            });
        }

        function start() {
            stop();
            timer = window.setInterval(function () {
                show(index + 1);
            }, 5200);
        }

        function stop() {
            if (timer) {
                window.clearInterval(timer);
                timer = null;
            }
        }

        thumbs.forEach(function (thumb) {
            thumb.addEventListener('click', function () {
                show(Number(thumb.getAttribute('data-hero-target')) || 0);
                start();
            });
        });

        root.addEventListener('mouseenter', stop);
        root.addEventListener('mouseleave', start);
        if (slides.length > 1) {
            start();
        }
    }

    function initFilters() {
        var roots = document.querySelectorAll('[data-filter-root]');
        roots.forEach(function (root) {
            var section = root.closest('section') || document;
            var list = section.querySelector('[data-filter-list]');
            var input = root.querySelector('[data-filter-input]');
            var year = root.querySelector('[data-filter-year]');
            var region = root.querySelector('[data-filter-region]');
            if (!list) {
                return;
            }
            var cards = Array.prototype.slice.call(list.querySelectorAll('.movie-card'));
            function run() {
                var q = normalize(input && input.value);
                var y = year ? year.value : '';
                var r = region ? region.value : '';
                cards.forEach(function (card) {
                    var text = normalize([
                        card.getAttribute('data-title'),
                        card.getAttribute('data-year'),
                        card.getAttribute('data-region'),
                        card.getAttribute('data-genre'),
                        card.getAttribute('data-category'),
                        card.textContent
                    ].join(' '));
                    var ok = true;
                    if (q && text.indexOf(q) === -1) {
                        ok = false;
                    }
                    if (y && card.getAttribute('data-year') !== y) {
                        ok = false;
                    }
                    if (r && card.getAttribute('data-region') !== r) {
                        ok = false;
                    }
                    card.style.display = ok ? '' : 'none';
                });
            }
            [input, year, region].forEach(function (el) {
                if (el) {
                    el.addEventListener('input', run);
                    el.addEventListener('change', run);
                }
            });
        });
    }

    function initPlayers() {
        var players = document.querySelectorAll('[data-player]');
        players.forEach(function (root) {
            var video = root.querySelector('video');
            var button = root.querySelector('[data-play-button]');
            var message = root.querySelector('[data-video-message]');
            var src = root.getAttribute('data-src');
            var started = false;

            function setMessage(text) {
                if (message) {
                    message.textContent = text || '';
                }
            }

            function attachSource() {
                if (started || !video || !src) {
                    return;
                }
                started = true;
                setMessage('正在加载播放源...');
                if (window.Hls && window.Hls.isSupported()) {
                    var hls = new window.Hls({
                        enableWorker: true,
                        lowLatencyMode: true
                    });
                    hls.loadSource(src);
                    hls.attachMedia(video);
                    hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
                        video.play().catch(function () {
                            setMessage('播放源已加载，请再次点击播放。');
                        });
                    });
                    hls.on(window.Hls.Events.ERROR, function (event, data) {
                        if (data && data.fatal) {
                            setMessage('播放源暂时无法加载，请刷新后重试。');
                        }
                    });
                } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
                    video.src = src;
                    video.play().catch(function () {
                        setMessage('播放源已加载，请再次点击播放。');
                    });
                } else {
                    video.src = src;
                    video.play().catch(function () {
                        setMessage('当前浏览器可能不支持 m3u8 播放。');
                    });
                }
            }

            if (button) {
                button.addEventListener('click', function () {
                    button.classList.add('hidden');
                    attachSource();
                });
            }
            if (video) {
                video.addEventListener('play', function () {
                    if (button) {
                        button.classList.add('hidden');
                    }
                    setMessage('');
                });
            }
        });
    }

    function movieCard(movie) {
        return [
            '<article class="movie-card" data-title="' + escapeHtml(movie.title) + '" data-year="' + escapeHtml(movie.year) + '" data-region="' + escapeHtml(movie.region) + '" data-genre="' + escapeHtml(movie.genre) + '" data-category="' + escapeHtml(movie.category) + '">',
            '    <a class="poster-wrap" href="detail/movie-' + movie.id + '.html">',
            '        <img src="' + movie.cover + '" alt="' + escapeHtml(movie.title) + '" loading="lazy">',
            '        <span class="poster-mask"></span>',
            '        <span class="play-dot">▶</span>',
            '    </a>',
            '    <div class="movie-card-body">',
            '        <a class="movie-title" href="detail/movie-' + movie.id + '.html">' + escapeHtml(movie.title) + '</a>',
            '        <p class="movie-meta">' + escapeHtml(movie.year) + ' · ' + escapeHtml(movie.region) + ' · ' + escapeHtml(movie.type) + '</p>',
            '        <p class="movie-tags">' + escapeHtml(movie.genre) + '</p>',
            '        <p class="movie-one-line">' + escapeHtml(movie.one_line) + '</p>',
            '    </div>',
            '</article>'
        ].join('');
    }

    function escapeHtml(value) {
        return String(value || '')
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    }

    function initSearchPage() {
        var root = document.querySelector('[data-search-page]');
        if (!root || !window.MOVIE_DATA) {
            return;
        }
        var input = root.querySelector('[data-search-input]');
        var button = root.querySelector('[data-search-button]');
        var results = root.querySelector('[data-search-results]');
        var summary = root.querySelector('[data-search-summary]');
        var params = new URLSearchParams(window.location.search);
        var initial = params.get('q') || '';

        function search() {
            var q = normalize(input.value);
            if (!q) {
                results.innerHTML = '';
                summary.textContent = '请输入关键词开始搜索。';
                return;
            }
            var matched = window.MOVIE_DATA.filter(function (movie) {
                var text = normalize([
                    movie.title,
                    movie.year,
                    movie.region,
                    movie.type,
                    movie.genre,
                    movie.category,
                    movie.one_line,
                    (movie.tags || []).join(' ')
                ].join(' '));
                return text.indexOf(q) !== -1;
            }).slice(0, 120);
            summary.textContent = '找到 ' + matched.length + ' 条结果，最多显示前 120 条。';
            results.innerHTML = matched.map(movieCard).join('\n');
        }

        if (initial && input) {
            input.value = initial;
            search();
        }
        if (button) {
            button.addEventListener('click', search);
        }
        if (input) {
            input.addEventListener('keydown', function (event) {
                if (event.key === 'Enter') {
                    event.preventDefault();
                    search();
                }
            });
        }
    }

    ready(function () {
        initMobileMenu();
        initHero();
        initFilters();
        initPlayers();
        initSearchPage();
    });
})();
