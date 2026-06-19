(function () {
  function byData(name) {
    return document.querySelector("[data-" + name + "]");
  }

  function allByData(name) {
    return Array.prototype.slice.call(document.querySelectorAll("[data-" + name + "]"));
  }

  function setupNavigation() {
    var toggle = byData("nav-toggle");
    var mobile = byData("mobile-nav");
    if (!toggle || !mobile) {
      return;
    }
    toggle.addEventListener("click", function () {
      mobile.classList.toggle("open");
    });
  }

  function setupHero() {
    var slider = byData("hero-slider");
    if (!slider) {
      return;
    }
    var slides = Array.prototype.slice.call(slider.querySelectorAll(".hero-slide"));
    var dots = Array.prototype.slice.call(slider.querySelectorAll("[data-hero-dot]"));
    if (!slides.length) {
      return;
    }
    var active = 0;
    var timer = null;

    function show(index) {
      active = (index + slides.length) % slides.length;
      slides.forEach(function (slide, itemIndex) {
        slide.classList.toggle("active", itemIndex === active);
      });
      dots.forEach(function (dot, itemIndex) {
        dot.classList.toggle("active", itemIndex === active);
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
      }
    }

    dots.forEach(function (dot, index) {
      dot.addEventListener("click", function () {
        show(index);
        start();
      });
    });

    slider.addEventListener("mouseenter", stop);
    slider.addEventListener("mouseleave", start);
    start();
  }

  function setupSearch() {
    var panel = byData("search-panel");
    var input = byData("search-input");
    var results = byData("search-results");
    if (!panel || !input || !results) {
      return;
    }

    function openSearch(value) {
      panel.classList.add("open");
      panel.setAttribute("aria-hidden", "false");
      input.focus();
      if (typeof value === "string" && value.trim()) {
        input.value = value.trim();
      }
      renderResults();
    }

    function closeSearch() {
      panel.classList.remove("open");
      panel.setAttribute("aria-hidden", "true");
    }

    function renderResults() {
      var list = window.SEARCH_INDEX || [];
      var query = input.value.trim().toLowerCase();
      var matches = [];
      if (query) {
        matches = list.filter(function (item) {
          return item.keywords.indexOf(query) !== -1;
        }).slice(0, 36);
      } else {
        matches = list.slice(0, 12);
      }
      results.innerHTML = matches.map(function (item) {
        return '<a class="search-result-item" href="' + item.url + '">' +
          '<img src="' + item.cover + '" alt="' + escapeHtml(item.title) + '">' +
          '<span><strong>' + escapeHtml(item.title) + '</strong>' +
          '<span>' + escapeHtml(item.year + ' · ' + item.region + ' · ' + item.category) + '</span>' +
          '<p>' + escapeHtml(item.line) + '</p></span></a>';
      }).join("");
    }

    function escapeHtml(value) {
      return String(value).replace(/[&<>"']/g, function (char) {
        return {
          "&": "&amp;",
          "<": "&lt;",
          ">": "&gt;",
          '"': "&quot;",
          "'": "&#39;"
        }[char];
      });
    }

    allByData("open-search").forEach(function (button) {
      button.addEventListener("click", function () {
        var heroInput = byData("hero-search");
        openSearch(heroInput ? heroInput.value : "");
      });
    });

    allByData("close-search").forEach(function (button) {
      button.addEventListener("click", closeSearch);
    });

    input.addEventListener("input", renderResults);
    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape") {
        closeSearch();
      }
    });

    var heroInput = byData("hero-search");
    if (heroInput) {
      heroInput.addEventListener("focus", function () {
        openSearch(heroInput.value);
      });
      heroInput.addEventListener("keydown", function (event) {
        if (event.key === "Enter") {
          openSearch(heroInput.value);
        }
      });
    }
  }

  function setupFilters() {
    var input = byData("filter-input");
    var year = byData("year-filter");
    var cards = Array.prototype.slice.call(document.querySelectorAll("[data-card]"));
    if (!cards.length || (!input && !year)) {
      return;
    }

    function apply() {
      var query = input ? input.value.trim().toLowerCase() : "";
      var selectedYear = year ? year.value : "";
      cards.forEach(function (card) {
        var text = card.getAttribute("data-filter-text") || "";
        var itemYear = card.getAttribute("data-year") || "";
        var okText = !query || text.indexOf(query) !== -1;
        var okYear = !selectedYear || itemYear === selectedYear;
        card.classList.toggle("is-hidden", !(okText && okYear));
      });
    }

    if (input) {
      input.addEventListener("input", apply);
    }
    if (year) {
      year.addEventListener("change", apply);
    }
  }

  document.addEventListener("DOMContentLoaded", function () {
    setupNavigation();
    setupHero();
    setupSearch();
    setupFilters();
  });
})();
