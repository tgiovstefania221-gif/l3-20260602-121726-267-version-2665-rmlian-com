(function () {
    function ready(callback) {
        if (document.readyState !== 'loading') {
            callback();
            return;
        }
        document.addEventListener('DOMContentLoaded', callback);
    }

    function setupMenu() {
        var toggle = document.querySelector('.menu-toggle');
        var menu = document.querySelector('#mobileNav');
        if (!toggle || !menu) {
            return;
        }
        toggle.addEventListener('click', function () {
            var open = menu.classList.toggle('is-open');
            toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
        });
    }

    function setupHero() {
        var hero = document.querySelector('[data-hero]');
        if (!hero) {
            return;
        }
        var slides = Array.prototype.slice.call(hero.querySelectorAll('.hero-slide'));
        var dots = Array.prototype.slice.call(hero.querySelectorAll('.hero-dot'));
        var prev = hero.querySelector('[data-hero-prev]');
        var next = hero.querySelector('[data-hero-next]');
        var active = 0;
        var timer = null;

        function show(index) {
            if (!slides.length) {
                return;
            }
            active = (index + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('is-active', slideIndex === active);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('is-active', dotIndex === active);
                dot.setAttribute('aria-current', dotIndex === active ? 'true' : 'false');
            });
        }

        function start() {
            stop();
            timer = window.setInterval(function () {
                show(active + 1);
            }, 5200);
        }

        function stop() {
            if (timer) {
                window.clearInterval(timer);
                timer = null;
            }
        }

        dots.forEach(function (dot, index) {
            dot.addEventListener('click', function () {
                show(index);
                start();
            });
        });
        if (prev) {
            prev.addEventListener('click', function () {
                show(active - 1);
                start();
            });
        }
        if (next) {
            next.addEventListener('click', function () {
                show(active + 1);
                start();
            });
        }
        hero.addEventListener('mouseenter', stop);
        hero.addEventListener('mouseleave', start);
        show(0);
        start();
    }

    function setupFilters() {
        var scopes = Array.prototype.slice.call(document.querySelectorAll('[data-filter-scope]'));
        scopes.forEach(function (scope) {
            var input = scope.querySelector('[data-filter-input]');
            var year = scope.querySelector('[data-filter-year]');
            var type = scope.querySelector('[data-filter-type]');
            var category = scope.querySelector('[data-filter-category]');
            var cards = Array.prototype.slice.call(scope.querySelectorAll('.filter-card'));
            var params = new URLSearchParams(window.location.search);
            var q = params.get('q');
            if (q && input) {
                input.value = q;
            }

            function normalize(value) {
                return String(value || '').toLowerCase().trim();
            }

            function apply() {
                var keyword = normalize(input && input.value);
                var yearValue = year ? year.value : '';
                var typeValue = type ? type.value : '';
                var categoryValue = category ? category.value : '';
                cards.forEach(function (card) {
                    var text = normalize(card.getAttribute('data-tags'));
                    var matchesKeyword = !keyword || text.indexOf(keyword) !== -1;
                    var matchesYear = !yearValue || card.getAttribute('data-year') === yearValue;
                    var matchesType = !typeValue || card.getAttribute('data-type') === typeValue;
                    var matchesCategory = !categoryValue || card.getAttribute('data-category') === categoryValue;
                    card.hidden = !(matchesKeyword && matchesYear && matchesType && matchesCategory);
                });
            }

            [input, year, type, category].forEach(function (control) {
                if (!control) {
                    return;
                }
                control.addEventListener('input', apply);
                control.addEventListener('change', apply);
            });
            apply();
        });
    }

    ready(function () {
        setupMenu();
        setupHero();
        setupFilters();
    });
})();
