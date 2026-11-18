(() => {
  const cover = document.querySelector('.book-intro');
  const openButton = cover.querySelector('button');
  if (location.hash || matchMedia('(prefers-reduced-motion: reduce)').matches || !cover.showModal) return;
  try {
    if (sessionStorage.getItem('wedding-cover-seen')) return;
    sessionStorage.setItem('wedding-cover-seen', '1');
  } catch {
    // The cover still works if browser storage is unavailable.
  }
  cover.showModal();
  const automaticOpening = setTimeout(openInvitation, 2400);
  openButton.addEventListener('click', openInvitation);
  cover.addEventListener('cancel', () => clearTimeout(automaticOpening));

  function openInvitation() {
    clearTimeout(automaticOpening);
    if (!cover.open || cover.classList.contains('turning')) return;
    cover.classList.add('turning');
    setTimeout(() => cover.close(), 1050);
  }
})();
