(() => {
  const portrait = document.getElementById('couple-motion');
  const hero = portrait.closest('.hero');
  const track = hero.parentElement;
  const cover = document.querySelector('.book-intro');
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  const frameDirectory = portrait.getAttribute('src').replace(/[^/]+$/, '');
  const last = Number(portrait.dataset.frames) - 1;
  const loaded = new Map([[0, portrait.getAttribute('src')]]);
  const requested = new Set();
  let active = 0;
  let tick = 0;
  let shown = 0;
  let target = 0;
  let position = 0;
  let previousTime = 0;

  function load(index) {
    if (loaded.has(index) || requested.has(index)) return;
    const frame = new Image();
    requested.add(index);
    active++;
    frame.src = frameDirectory + String(index).padStart(3, '0') + '.webp';
    frame.decode().then(() => {
      loaded.set(index, frame.src);
      queueFrame();
    }).catch(() => {}).finally(() => {
      active--;
      fillQueue();
    });
  }

  function fillQueue() {
    const order = [target, last];
    for (let offset = 1; offset <= last; offset++) {
      if (target + offset <= last) order.push(target + offset);
      if (target - offset >= 0) order.push(target - offset);
    }
    for (const index of order) {
      if (active >= 4) break;
      load(index);
    }
  }

  function syncFrame(now) {
    tick = 0;
    if (cover.open || reducedMotion.matches || document.documentElement.classList.contains('still')) {
      previousTime = 0;
      return;
    }
    const distance = Math.max(1, track.offsetHeight - hero.offsetHeight);
    const progress = Math.min(1, Math.max(0, -track.getBoundingClientRect().top / distance));
    target = Math.round(progress * last);
    const elapsed = previousTime ? Math.min(now - previousTime, 32) : 16;
    previousTime = now;
    const difference = target - position;
    if (progress === 0 || progress === 1 || Math.abs(difference) < 0.5) {
      position = target;
    } else {
      position += difference * (1 - Math.exp(-elapsed / 48));
      queueFrame();
    }
    const desired = Math.round(position);
    let closest = shown;
    for (const index of loaded.keys()) {
      if (Math.abs(index - desired) < Math.abs(closest - desired)) closest = index;
    }
    if (closest !== shown) {
      portrait.src = loaded.get(closest);
      shown = closest;
    }
    fillQueue();
  }

  function queueFrame() {
    if (!tick) tick = requestAnimationFrame(syncFrame);
  }

  function enable() {
    track.classList.add('motion-ready');
    if (!reducedMotion.matches) fillQueue();
    queueFrame();
  }

  portrait.decode().then(enable).catch(() => {});
  addEventListener('scroll', queueFrame, { passive: true });
  addEventListener('resize', queueFrame);
  cover.addEventListener('close', queueFrame);
  reducedMotion.addEventListener('change', queueFrame);
  document.querySelector('.motion').addEventListener('click', queueFrame);
})();
