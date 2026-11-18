(() => {
  const video = document.getElementById('couple-motion');
  const hero = video.closest('.hero');
  const track = hero.parentElement;
  const cover = document.querySelector('.book-intro');
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  let frame = 0;
  let fallbackStarted = false;

  function syncFrame() {
    frame = 0;
    if (cover.open || reducedMotion.matches || document.documentElement.classList.contains('still')) return;
    if (!Number.isFinite(video.duration) || video.duration <= 0) return;
    if (!video.seekable.length || video.seekable.end(video.seekable.length - 1) < 0.1) {
      if (!fallbackStarted && video.readyState >= 4) {
        fallbackStarted = true;
        fetch(video.currentSrc)
          .then(response => {
            if (!response.ok) throw new Error('Video download failed');
            return response.blob();
          })
          .then(blob => { video.src = URL.createObjectURL(blob); })
          .catch(() => { /* Keep the first frame available. */ });
      }
      return;
    }
    const bounds = track.getBoundingClientRect();
    const distance = Math.max(1, track.offsetHeight - hero.offsetHeight);
    const progress = Math.min(1, Math.max(0, -bounds.top / distance));
    const time = progress * Math.max(0, video.duration - 0.05);
    if (Math.abs(video.currentTime - time) >= 0.035) video.currentTime = time;
  }

  function queueFrame() {
    if (!frame) frame = requestAnimationFrame(syncFrame);
  }

  addEventListener('scroll', queueFrame, { passive: true });
  addEventListener('resize', queueFrame);
  video.addEventListener('loadedmetadata', () => {
    track.classList.add('motion-ready');
    queueFrame();
  });
  if (video.readyState >= 1) track.classList.add('motion-ready');
  video.addEventListener('error', () => track.classList.remove('motion-ready'));
  video.addEventListener('canplaythrough', queueFrame);
  cover.addEventListener('close', queueFrame);
  reducedMotion.addEventListener('change', queueFrame);
  document.querySelector('.motion').addEventListener('click', queueFrame);
  queueFrame();
})();
