(function () {
    "use strict";

    var currentScript = document.currentScript;
    var assetPrefix = document.documentElement.getAttribute("data-asset-prefix") || "";
    var appScriptUrl = currentScript ? currentScript.src : assetPrefix + "assets/app.js";
    var hlsModuleUrl = new URL("hls-dru42stk.js", appScriptUrl).href;

    function selectAll(selector, root) {
        return Array.prototype.slice.call((root || document).querySelectorAll(selector));
    }

    function setupMobileMenu() {
        var button = document.querySelector("[data-mobile-menu-button]");
        var panel = document.querySelector("[data-mobile-panel]");
        if (!button || !panel) {
            return;
        }
        button.addEventListener("click", function () {
            panel.classList.toggle("is-open");
        });
    }

    function setupGlobalSearch() {
        selectAll("[data-global-search]").forEach(function (form) {
            form.addEventListener("submit", function (event) {
                event.preventDefault();
                var input = form.querySelector("input[name='q']");
                var query = input ? input.value.trim() : "";
                if (query) {
                    window.location.href = assetPrefix + "search.html?q=" + encodeURIComponent(query);
                }
            });
        });
    }

    function setupHeroCarousel() {
        var carousel = document.querySelector("[data-hero-carousel]");
        if (!carousel) {
            return;
        }
        var slides = selectAll("[data-hero-slide]", carousel);
        var dots = selectAll("[data-hero-dot]", carousel);
        if (!slides.length) {
            return;
        }
        var current = 0;
        var timer = null;

        function show(index) {
            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle("is-active", slideIndex === current);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle("is-active", dotIndex === current);
            });
        }

        function start() {
            stop();
            timer = window.setInterval(function () {
                show(current + 1);
            }, 5600);
        }

        function stop() {
            if (timer) {
                window.clearInterval(timer);
                timer = null;
            }
        }

        dots.forEach(function (dot, dotIndex) {
            dot.addEventListener("click", function () {
                show(dotIndex);
                start();
            });
        });

        carousel.addEventListener("mouseenter", stop);
        carousel.addEventListener("mouseleave", start);
        show(0);
        start();
    }

    function setupImageFallbacks() {
        selectAll("img[data-fallback]").forEach(function (image) {
            image.addEventListener("error", function () {
                image.style.opacity = "0";
                image.setAttribute("aria-hidden", "true");
            }, { once: true });
        });
    }

    function setupPageFilter() {
        var input = document.querySelector("[data-page-filter]");
        var container = document.querySelector("[data-card-container]");
        var emptyState = document.querySelector("[data-empty-state]");
        var sortSelect = document.querySelector("[data-sort-select]");
        if (!container) {
            return;
        }
        var cards = selectAll("[data-card]", container);

        function applyFilter() {
            var query = input ? input.value.trim().toLowerCase() : "";
            var visibleCount = 0;
            cards.forEach(function (card) {
                var text = (card.getAttribute("data-search-text") || "").toLowerCase();
                var visible = !query || text.indexOf(query) !== -1;
                card.hidden = !visible;
                if (visible) {
                    visibleCount += 1;
                }
            });
            if (emptyState) {
                emptyState.hidden = visibleCount !== 0;
            }
        }

        function applySort() {
            if (!sortSelect) {
                return;
            }
            var value = sortSelect.value;
            cards.sort(function (a, b) {
                if (value === "rating-desc") {
                    return Number(b.dataset.rating || 0) - Number(a.dataset.rating || 0);
                }
                if (value === "year-desc") {
                    return Number(b.dataset.year || 0) - Number(a.dataset.year || 0);
                }
                if (value === "title-asc") {
                    return (a.dataset.title || "").localeCompare(b.dataset.title || "", "zh-Hans-CN");
                }
                return Number(b.dataset.views || 0) - Number(a.dataset.views || 0);
            });
            cards.forEach(function (card) {
                container.appendChild(card);
            });
            applyFilter();
        }

        if (input) {
            input.addEventListener("input", applyFilter);
        }
        if (sortSelect) {
            sortSelect.addEventListener("change", applySort);
            applySort();
        } else {
            applyFilter();
        }
    }

    function setupSearchPage() {
        var root = document.querySelector("[data-search-page]");
        if (!root || !window.MOVIE_SEARCH_DATA) {
            return;
        }
        var form = root.querySelector("[data-search-form]");
        var input = form ? form.querySelector("input[name='q']") : null;
        var meta = root.querySelector("[data-search-meta]");
        var results = root.querySelector("[data-search-results]");
        var params = new URLSearchParams(window.location.search);
        var initialQuery = params.get("q") || "";
        if (input) {
            input.value = initialQuery;
        }

        function card(movie) {
            var tags = (movie.tags || []).slice(0, 3).join(" ");
            return [
                '<article class="movie-card">',
                '    <a class="poster-frame" href="' + assetPrefix + movie.url + '" aria-label="观看 ' + escapeHtml(movie.title) + '">',
                '        <img src="' + assetPrefix + movie.image + '" alt="' + escapeHtml(movie.title) + ' 海报" loading="lazy" data-fallback>',
                '        <span class="poster-shade"></span>',
                '        <span class="play-chip" aria-hidden="true">▶</span>',
                '        <span class="duration-chip">' + escapeHtml(movie.duration) + '</span>',
                '    </a>',
                '    <div class="movie-card-body">',
                '        <div class="card-meta-row">',
                '            <a class="category-pill" href="' + assetPrefix + movie.categoryUrl + '">' + escapeHtml(movie.category) + '</a>',
                '            <span class="score-pill">★ ' + escapeHtml(movie.rating) + '</span>',
                '        </div>',
                '        <h3><a href="' + assetPrefix + movie.url + '">' + escapeHtml(movie.title) + '</a></h3>',
                '        <p class="card-desc">' + escapeHtml(movie.description) + '</p>',
                '        <div class="card-foot">',
                '            <span>' + escapeHtml(movie.year) + '</span>',
                '            <span>' + escapeHtml(movie.region) + '</span>',
                '            <span>' + Number(movie.views).toLocaleString() + ' 热度</span>',
                '        </div>',
                '        <div class="tag-line">' + escapeHtml(tags) + '</div>',
                '    </div>',
                '</article>'
            ].join("\n");
        }

        function runSearch(query) {
            var normalized = query.trim().toLowerCase();
            if (!normalized) {
                results.innerHTML = "";
                meta.textContent = "请输入关键词开始搜索。";
                return;
            }
            var terms = normalized.split(/\s+/).filter(Boolean);
            var matched = window.MOVIE_SEARCH_DATA.filter(function (movie) {
                var haystack = movie.searchText.toLowerCase();
                return terms.every(function (term) {
                    return haystack.indexOf(term) !== -1;
                });
            }).slice(0, 120);
            meta.textContent = "找到 " + matched.length + " 条结果" + (matched.length === 120 ? "（最多显示 120 条）" : "") + "。";
            results.innerHTML = matched.map(card).join("\n");
            setupImageFallbacks();
        }

        if (form) {
            form.addEventListener("submit", function (event) {
                event.preventDefault();
                var query = input ? input.value : "";
                var nextUrl = "search.html?q=" + encodeURIComponent(query.trim());
                history.replaceState(null, "", nextUrl);
                runSearch(query);
            });
        }
        runSearch(initialQuery);
    }

    function escapeHtml(value) {
        return String(value || "")
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

    function setupPlayers() {
        selectAll("[data-player]").forEach(function (player) {
            var video = player.querySelector("video");
            var frame = player.querySelector(".player-frame");
            var overlay = player.querySelector(".player-overlay");
            var message = player.querySelector("[data-player-message]");
            var source = player.getAttribute("data-video-src");
            var initialized = false;
            var hlsInstance = null;

            if (!video || !source) {
                setMessage("播放源暂不可用");
                return;
            }

            function setMessage(text) {
                if (message) {
                    message.textContent = text || "";
                }
            }

            function attachNative() {
                video.src = source;
                initialized = true;
                setMessage("");
                return Promise.resolve();
            }

            function attachHls() {
                return import(hlsModuleUrl).then(function (module) {
                    var Hls = module.H;
                    if (!Hls || !Hls.isSupported()) {
                        throw new Error("当前浏览器不支持 HLS 播放");
                    }
                    hlsInstance = new Hls({
                        enableWorker: true,
                        lowLatencyMode: true
                    });
                    hlsInstance.loadSource(source);
                    hlsInstance.attachMedia(video);
                    hlsInstance.on(Hls.Events.ERROR, function (_event, data) {
                        if (!data || !data.fatal) {
                            return;
                        }
                        if (data.type === Hls.ErrorTypes.NETWORK_ERROR) {
                            setMessage("网络加载异常，正在重试...");
                            hlsInstance.startLoad();
                        } else if (data.type === Hls.ErrorTypes.MEDIA_ERROR) {
                            setMessage("媒体解码异常，正在恢复...");
                            hlsInstance.recoverMediaError();
                        } else {
                            setMessage("播放源加载失败");
                            hlsInstance.destroy();
                        }
                    });
                    initialized = true;
                    setMessage("");
                });
            }

            function initialize() {
                if (initialized) {
                    return Promise.resolve();
                }
                setMessage("正在加载播放源...");
                if (video.canPlayType("application/vnd.apple.mpegurl")) {
                    return attachNative();
                }
                return attachHls().catch(function (error) {
                    setMessage(error.message || "播放器初始化失败");
                    throw error;
                });
            }

            function togglePlay() {
                initialize().then(function () {
                    if (video.paused) {
                        return video.play();
                    }
                    video.pause();
                    return Promise.resolve();
                }).catch(function () {
                    setMessage("无法自动播放，请再次点击播放按钮");
                });
            }

            player.addEventListener("click", function (event) {
                var target = event.target;
                if (target.closest("[data-player-mute]") || target.closest("[data-player-fullscreen]")) {
                    return;
                }
                if (target.closest("[data-player-play]") || target === video) {
                    togglePlay();
                }
            });

            var muteButton = player.querySelector("[data-player-mute]");
            if (muteButton) {
                muteButton.addEventListener("click", function () {
                    video.muted = !video.muted;
                    muteButton.textContent = video.muted ? "取消静音" : "静音";
                });
            }

            var fullscreenButton = player.querySelector("[data-player-fullscreen]");
            if (fullscreenButton) {
                fullscreenButton.addEventListener("click", function () {
                    var target = frame || video;
                    if (document.fullscreenElement) {
                        document.exitFullscreen();
                    } else if (target.requestFullscreen) {
                        target.requestFullscreen();
                    }
                });
            }

            video.addEventListener("play", function () {
                if (overlay) {
                    overlay.classList.add("is-hidden");
                }
                if (frame) {
                    frame.classList.add("is-playing");
                }
            });

            video.addEventListener("pause", function () {
                if (frame) {
                    frame.classList.remove("is-playing");
                }
            });

            window.addEventListener("beforeunload", function () {
                if (hlsInstance) {
                    hlsInstance.destroy();
                }
            });
        });
    }

    document.addEventListener("DOMContentLoaded", function () {
        setupMobileMenu();
        setupGlobalSearch();
        setupHeroCarousel();
        setupImageFallbacks();
        setupPageFilter();
        setupSearchPage();
        setupPlayers();
    });
})();
