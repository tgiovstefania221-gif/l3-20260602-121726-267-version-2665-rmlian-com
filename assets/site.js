(function () {
  function normalize(value) {
    return String(value || "").toLowerCase().trim();
  }

  var button = document.querySelector("[data-menu-button]");
  var nav = document.querySelector("[data-mobile-nav]");
  if (button && nav) {
    button.addEventListener("click", function () {
      nav.classList.toggle("is-open");
    });
  }

  document.querySelectorAll("[data-filter-scope]").forEach(function (scope) {
    var search = scope.querySelector("[data-movie-search]");
    var region = scope.querySelector("[data-region-filter]");
    var year = scope.querySelector("[data-year-filter]");
    var category = scope.querySelector("[data-category-filter]");
    var container = scope.parentElement || document;
    var cards = Array.prototype.slice.call(container.querySelectorAll("[data-movie-card]"));

    if (!cards.length) {
      cards = Array.prototype.slice.call(scope.querySelectorAll("[data-movie-card]"));
    }

    function fillSelect(select, attr) {
      if (!select) {
        return;
      }
      var values = [];
      cards.forEach(function (card) {
        var value = card.getAttribute(attr);
        if (value && values.indexOf(value) === -1) {
          values.push(value);
        }
      });
      values.sort(function (a, b) {
        return b.localeCompare(a, "zh-CN");
      });
      values.forEach(function (value) {
        var option = document.createElement("option");
        option.value = value;
        option.textContent = value;
        select.appendChild(option);
      });
    }

    fillSelect(region, "data-region");
    fillSelect(year, "data-year");

    function apply() {
      var query = normalize(search && search.value);
      var regionValue = normalize(region && region.value);
      var yearValue = normalize(year && year.value);
      var categoryValue = normalize(category && category.value);

      cards.forEach(function (card) {
        var text = normalize(card.getAttribute("data-search"));
        var cardRegion = normalize(card.getAttribute("data-region"));
        var cardYear = normalize(card.getAttribute("data-year"));
        var cardCategory = normalize(card.getAttribute("data-category"));
        var visible = true;

        if (query && text.indexOf(query) === -1) {
          visible = false;
        }
        if (regionValue && cardRegion !== regionValue) {
          visible = false;
        }
        if (yearValue && cardYear !== yearValue) {
          visible = false;
        }
        if (categoryValue && cardCategory !== categoryValue) {
          visible = false;
        }
        card.classList.toggle("is-hidden-card", !visible);
      });
    }

    [search, region, year, category].forEach(function (control) {
      if (control) {
        control.addEventListener("input", apply);
        control.addEventListener("change", apply);
      }
    });
  });
})();
