(function () {
    var toggle = document.querySelector('.menu-toggle');
    var panel = document.querySelector('.mobile-panel');
    if (toggle && panel) {
        toggle.addEventListener('click', function () {
            panel.classList.toggle('open');
        });
    }

    var slides = Array.prototype.slice.call(document.querySelectorAll('.hero-slide'));
    var dots = Array.prototype.slice.call(document.querySelectorAll('.hero-dot'));
    if (slides.length > 1) {
        var current = 0;
        var activate = function (index) {
            current = index;
            slides.forEach(function (slide, i) {
                slide.classList.toggle('active', i === index);
            });
            dots.forEach(function (dot, i) {
                dot.classList.toggle('active', i === index);
            });
        };
        dots.forEach(function (dot, i) {
            dot.addEventListener('click', function () {
                activate(i);
            });
        });
        window.setInterval(function () {
            activate((current + 1) % slides.length);
        }, 5200);
    }

    var grids = Array.prototype.slice.call(document.querySelectorAll('[data-filter-grid]'));
    grids.forEach(function (grid) {
        var scope = grid.closest('[data-filter-scope]') || document;
        var input = scope.querySelector('[data-filter-input]');
        var chips = Array.prototype.slice.call(scope.querySelectorAll('[data-filter-chip]'));
        var empty = scope.querySelector('[data-empty-state]');
        var selected = 'all';
        var cards = Array.prototype.slice.call(grid.querySelectorAll('.movie-card'));
        var apply = function () {
            var q = input ? input.value.trim().toLowerCase() : '';
            var visible = 0;
            cards.forEach(function (card) {
                var hay = [
                    card.getAttribute('data-title') || '',
                    card.getAttribute('data-tags') || '',
                    card.getAttribute('data-year') || '',
                    card.getAttribute('data-type') || '',
                    card.getAttribute('data-region') || ''
                ].join(' ').toLowerCase();
                var chipOk = selected === 'all' || hay.indexOf(selected.toLowerCase()) !== -1;
                var queryOk = !q || hay.indexOf(q) !== -1;
                var show = chipOk && queryOk;
                card.style.display = show ? '' : 'none';
                if (show) {
                    visible += 1;
                }
            });
            if (empty) {
                empty.style.display = visible ? 'none' : 'block';
            }
        };
        if (input) {
            var params = new URLSearchParams(window.location.search);
            var q = params.get('q');
            if (q) {
                input.value = q;
            }
            input.addEventListener('input', apply);
        }
        chips.forEach(function (chip) {
            chip.addEventListener('click', function () {
                selected = chip.getAttribute('data-filter-chip') || 'all';
                chips.forEach(function (item) {
                    item.classList.toggle('active', item === chip);
                });
                apply();
            });
        });
        apply();
    });

    var players = Array.prototype.slice.call(document.querySelectorAll('.player-shell'));
    players.forEach(function (shell) {
        var src = shell.getAttribute('data-src');
        var video = shell.querySelector('video');
        var cover = shell.querySelector('.player-cover');
        var started = false;
        var start = function () {
            if (!video || !src) {
                return;
            }
            if (!started) {
                if (video.canPlayType('application/vnd.apple.mpegurl')) {
                    video.src = src;
                } else if (window.Hls && window.Hls.isSupported()) {
                    var hls = new window.Hls();
                    hls.loadSource(src);
                    hls.attachMedia(video);
                } else {
                    video.src = src;
                }
                started = true;
            }
            if (cover) {
                cover.classList.add('hidden');
            }
            var playPromise = video.play();
            if (playPromise && playPromise.catch) {
                playPromise.catch(function () {});
            }
        };
        if (cover) {
            cover.addEventListener('click', start);
        }
        if (video) {
            video.addEventListener('click', function () {
                if (!started) {
                    start();
                }
            });
        }
    });
})();
