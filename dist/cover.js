(() => {
  const audio = document.querySelector('#melody');
  const music = document.querySelector('.music-toggle');
  audio.volume = 0.55;
  function updateMusic() {
    music.textContent = audio.paused ? '♫ Music off' : '♫ Music on';
    music.setAttribute('aria-pressed', String(!audio.paused));
  }
  music.addEventListener('click', async () => {
    if (!audio.paused) return audio.pause();
    try { await audio.play(); }
    catch { music.textContent = 'Retry music'; }
  });
  audio.addEventListener('play', updateMusic);
  audio.addEventListener('pause', updateMusic);

  const cover = document.querySelector('.book-intro');
  function showHero() {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }

  history.scrollRestoration = 'manual';
  if (location.hash && location.hash !== '#home') {
    history.replaceState(history.state, '', location.pathname + location.search + '#home');
  }
  showHero();
  window.addEventListener('pageshow', showHero, { once: true });
  const animateCover = cover.showModal && !matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (animateCover) cover.showModal();
  cover.addEventListener('close', () => {
    showHero();
    requestAnimationFrame(showHero);
  }, { once: true });

  let timer;
  function startMusic() {
    return audio.play().catch(() => {});
  }
  if (animateCover) {
    cover.querySelector('button').addEventListener('click', () => {
      startMusic();
      openInvitation();
    });
    cover.addEventListener('cancel', () => {
      clearTimeout(timer);
      startMusic();
    });
  }
  audio.play().then(() => {
    if (cover.open) timer = setTimeout(openInvitation, 2100);
  }).catch(() => {
    if (cover.open) {
      cover.querySelector('button').innerHTML = 'Open with music <span aria-hidden="true">♫</span>';
    } else {
      document.addEventListener('click', event => {
        if (!music.contains(event.target)) startMusic();
      }, { once: true });
    }
  });
  function openInvitation() {
    clearTimeout(timer);
    if (!cover.open || cover.classList.contains('turning')) return;
    cover.classList.add('turning');
    setTimeout(() => cover.close(), 1150);
  }
})();
