(function () {
  function initMoviePlayer(src) {
    var video = document.querySelector("[data-player-video]");
    var cover = document.querySelector("[data-player-cover]");
    var loaded = false;
    var hls = null;

    if (!video || !cover || !src) {
      return;
    }

    function attach() {
      if (loaded) {
        return Promise.resolve();
      }

      loaded = true;

      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = src;
        return Promise.resolve();
      }

      if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hls.loadSource(src);
        hls.attachMedia(video);
        return new Promise(function (resolve) {
          hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
            resolve();
          });
          hls.on(window.Hls.Events.ERROR, function (event, data) {
            if (data && data.fatal) {
              resolve();
            }
          });
        });
      }

      video.src = src;
      return Promise.resolve();
    }

    function start() {
      cover.classList.add("is-hidden");
      video.controls = true;
      attach().then(function () {
        var playAction = video.play();
        if (playAction && typeof playAction.catch === "function") {
          playAction.catch(function () {
            cover.classList.remove("is-hidden");
          });
        }
      });
    }

    cover.addEventListener("click", start);
    video.addEventListener("click", function () {
      if (video.paused) {
        start();
      }
    });
    video.addEventListener("play", function () {
      cover.classList.add("is-hidden");
    });
    window.addEventListener("pagehide", function () {
      if (hls && typeof hls.destroy === "function") {
        hls.destroy();
      }
    });
  }

  window.initMoviePlayer = initMoviePlayer;
})();
