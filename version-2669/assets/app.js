(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  function setupMobileMenu() {
    var toggle = document.querySelector(".mobile-menu-toggle");
    var panel = document.querySelector(".mobile-panel");
    if (!toggle || !panel) {
      return;
    }
    toggle.addEventListener("click", function () {
      var open = panel.classList.toggle("is-open");
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
      toggle.textContent = open ? "×" : "☰";
    });
  }

  function setupHero() {
    var root = document.querySelector(".hero-carousel");
    if (!root) {
      return;
    }
    var slides = Array.prototype.slice.call(root.querySelectorAll(".hero-slide"));
    var dots = Array.prototype.slice.call(root.querySelectorAll(".hero-dot"));
    var prev = root.querySelector(".hero-prev");
    var next = root.querySelector(".hero-next");
    var index = Math.max(0, slides.findIndex(function (slide) {
      return slide.classList.contains("is-active");
    }));
    var timer = null;

    function setSlide(nextIndex) {
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("is-active", slideIndex === index);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("is-active", dotIndex === index);
      });
    }

    function restart() {
      window.clearInterval(timer);
      timer = window.setInterval(function () {
        setSlide(index + 1);
      }, 5200);
    }

    if (next) {
      next.addEventListener("click", function () {
        setSlide(index + 1);
        restart();
      });
    }
    if (prev) {
      prev.addEventListener("click", function () {
        setSlide(index - 1);
        restart();
      });
    }
    dots.forEach(function (dot, dotIndex) {
      dot.addEventListener("click", function () {
        setSlide(dotIndex);
        restart();
      });
    });
    if (slides.length > 1) {
      restart();
    }
  }

  function setupCategoryFilters() {
    var panels = Array.prototype.slice.call(document.querySelectorAll(".filter-panel"));
    panels.forEach(function (panel) {
      var input = panel.querySelector(".filter-search");
      var chips = Array.prototype.slice.call(panel.querySelectorAll(".filter-chip"));
      var grid = panel.parentElement.querySelector(".movie-grid");
      if (!grid) {
        return;
      }
      var cards = Array.prototype.slice.call(grid.querySelectorAll(".movie-card"));
      var activeFilter = "all";

      function applyFilter() {
        var query = input ? input.value.trim().toLowerCase() : "";
        cards.forEach(function (card) {
          var text = (card.getAttribute("data-search") || "").toLowerCase();
          var passQuery = !query || text.indexOf(query) !== -1;
          var passChip = activeFilter === "all" || text.indexOf(activeFilter.toLowerCase()) !== -1;
          card.classList.toggle("is-hidden", !(passQuery && passChip));
        });
      }

      if (input) {
        input.addEventListener("input", applyFilter);
      }
      chips.forEach(function (chip) {
        chip.addEventListener("click", function () {
          chips.forEach(function (item) {
            item.classList.remove("is-active");
          });
          chip.classList.add("is-active");
          activeFilter = chip.getAttribute("data-filter") || "all";
          applyFilter();
        });
      });
    });
  }

  function setupSearchPage() {
    var results = document.getElementById("searchResults");
    var title = document.getElementById("searchResultTitle");
    var input = document.getElementById("siteSearchInput");
    if (!results || !window.SEARCH_MOVIES) {
      return;
    }
    var params = new URLSearchParams(window.location.search);
    var initialQuery = params.get("q") || "";
    if (input) {
      input.value = initialQuery;
    }

    function movieCard(movie) {
      var tags = movie.tags.slice(0, 3).map(function (tag) {
        return "<span>" + escapeHtml(tag) + "</span>";
      }).join("");
      return [
        "<article class=\"movie-card\">",
        "<a class=\"poster-link\" href=\"./" + escapeHtml(movie.url) + "\" aria-label=\"" + escapeHtml(movie.title) + "\">",
        "<img src=\"" + escapeHtml(movie.cover) + "\" alt=\"" + escapeHtml(movie.title) + "\" loading=\"lazy\">",
        "<span class=\"poster-year\">" + escapeHtml(movie.year) + "</span>",
        "<span class=\"poster-play\">▶</span>",
        "</a>",
        "<div class=\"movie-card-body\">",
        "<div class=\"card-tags\">" + tags + "</div>",
        "<h3><a href=\"./" + escapeHtml(movie.url) + "\">" + escapeHtml(movie.title) + "</a></h3>",
        "<p>" + escapeHtml(movie.oneLine) + "</p>",
        "<div class=\"card-meta\"><span>" + escapeHtml(movie.region) + "</span><span>" + escapeHtml(movie.year) + "</span><span>⭐ " + escapeHtml(movie.rating) + "</span></div>",
        "</div>",
        "</article>"
      ].join("");
    }

    function escapeHtml(value) {
      return String(value).replace(/[&<>\"]/g, function (char) {
        return {
          "&": "&amp;",
          "<": "&lt;",
          ">": "&gt;",
          "\"": "&quot;"
        }[char];
      });
    }

    function render(query) {
      var normalized = query.trim().toLowerCase();
      var list = window.SEARCH_MOVIES.filter(function (movie) {
        if (!normalized) {
          return movie.hot;
        }
        return movie.search.indexOf(normalized) !== -1;
      }).slice(0, normalized ? 80 : 24);
      if (title) {
        title.textContent = normalized ? "搜索结果" : "热门推荐";
      }
      results.innerHTML = list.map(movieCard).join("");
      if (!list.length) {
        results.innerHTML = "<div class=\"empty-state\">暂未找到相关内容</div>";
      }
    }

    render(initialQuery);
    if (input) {
      input.addEventListener("input", function () {
        render(input.value);
      });
    }
  }

  function setupPlayers() {
    var players = Array.prototype.slice.call(document.querySelectorAll(".player-card"));
    players.forEach(function (player) {
      var video = player.querySelector("video");
      var overlay = player.querySelector(".play-overlay");
      var message = player.querySelector(".player-message");
      var url = player.getAttribute("data-video-url");
      var started = false;
      var hls = null;

      function showMessage() {
        if (message) {
          message.hidden = false;
        }
      }

      function playVideo() {
        var playPromise = video.play();
        if (playPromise && typeof playPromise.catch === "function") {
          playPromise.catch(function () {
            showMessage();
          });
        }
      }

      function start() {
        if (!video || !url) {
          showMessage();
          return;
        }
        if (overlay) {
          overlay.classList.add("is-hidden");
        }
        if (started) {
          playVideo();
          return;
        }
        started = true;
        if (window.Hls && window.Hls.isSupported()) {
          hls = new window.Hls({ enableWorker: true, lowLatencyMode: true });
          hls.loadSource(url);
          hls.attachMedia(video);
          hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
            playVideo();
          });
          hls.on(window.Hls.Events.ERROR, function (event, data) {
            if (data && data.fatal) {
              if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
                hls.startLoad();
              } else if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
                hls.recoverMediaError();
              } else {
                hls.destroy();
                showMessage();
              }
            }
          });
        } else {
          video.src = url;
          playVideo();
        }
      }

      if (overlay) {
        overlay.addEventListener("click", start);
      }
      if (video) {
        video.addEventListener("click", function () {
          if (!started) {
            start();
          }
        });
      }
      window.addEventListener("pagehide", function () {
        if (hls) {
          hls.destroy();
        }
      });
    });
  }

  ready(function () {
    setupMobileMenu();
    setupHero();
    setupCategoryFilters();
    setupSearchPage();
    setupPlayers();
  });
})();
