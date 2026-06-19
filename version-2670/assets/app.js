(function () {
  function ready(callback) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', callback);
    } else {
      callback();
    }
  }

  ready(function () {
    var header = document.querySelector('.site-header');
    var navToggle = document.querySelector('.nav-toggle');

    if (header && navToggle) {
      navToggle.addEventListener('click', function () {
        header.classList.toggle('open');
      });
    }

    var slides = Array.prototype.slice.call(document.querySelectorAll('.hero-slide'));
    var dots = Array.prototype.slice.call(document.querySelectorAll('.hero-dot'));
    var activeIndex = 0;
    var timer = null;

    function showSlide(index) {
      if (!slides.length) {
        return;
      }

      activeIndex = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('active', slideIndex === activeIndex);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('active', dotIndex === activeIndex);
      });
    }

    function startHero() {
      if (timer || slides.length < 2) {
        return;
      }

      timer = window.setInterval(function () {
        showSlide(activeIndex + 1);
      }, 5200);
    }

    dots.forEach(function (dot, index) {
      dot.addEventListener('click', function () {
        showSlide(index);
        window.clearInterval(timer);
        timer = null;
        startHero();
      });
    });

    startHero();

    var searchInput = document.querySelector('.page-search');
    var yearFilter = document.querySelector('.page-year-filter');
    var cards = Array.prototype.slice.call(document.querySelectorAll('.filter-list .movie-card'));

    function filterCards() {
      var keyword = searchInput ? searchInput.value.trim().toLowerCase() : '';
      var year = yearFilter ? yearFilter.value : '';

      cards.forEach(function (card) {
        var text = [
          card.getAttribute('data-title'),
          card.getAttribute('data-year'),
          card.getAttribute('data-genre'),
          card.getAttribute('data-region'),
          card.textContent
        ].join(' ').toLowerCase();
        var matchKeyword = !keyword || text.indexOf(keyword) !== -1;
        var matchYear = !year || card.getAttribute('data-year').indexOf(year) !== -1;
        card.style.display = matchKeyword && matchYear ? '' : 'none';
      });
    }

    if (searchInput) {
      searchInput.addEventListener('input', filterCards);
    }

    if (yearFilter) {
      yearFilter.addEventListener('change', filterCards);
    }
  });
})();
