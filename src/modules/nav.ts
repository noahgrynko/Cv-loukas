import { $, $$ } from './utils';

export function initNav(): void {
  const nav = $('[data-nav]');
  const toggle = $<HTMLButtonElement>('[data-menu-toggle]');
  const panel = $('[data-menu-panel]');
  if (!nav) return;

  // Opacité au scroll
  const onScroll = () => nav.classList.toggle('is-scrolled', window.scrollY > 40);
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  // Menu mobile
  let closeTimer = 0;
  const setOpen = (open: boolean) => {
    if (!toggle || !panel) return;
    window.clearTimeout(closeTimer);
    toggle.setAttribute('aria-expanded', String(open));
    if (open) {
      panel.hidden = false;
      requestAnimationFrame(() => nav.classList.add('is-open'));
    } else {
      nav.classList.remove('is-open');
      closeTimer = window.setTimeout(() => (panel.hidden = true), 300);
    }
  };

  toggle?.addEventListener('click', () => setOpen(!nav.classList.contains('is-open')));
  panel?.addEventListener('click', (e) => {
    if ((e.target as HTMLElement).closest('a')) setOpen(false);
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && nav.classList.contains('is-open')) {
      setOpen(false);
      toggle?.focus();
    }
  });
  window.matchMedia('(min-width: 861px)').addEventListener('change', (e) => {
    if (e.matches) setOpen(false);
  });

  // Lien actif selon la section visible
  const links = $$<HTMLAnchorElement>('[data-link]');
  const io = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        const id = (entry.target as HTMLElement).dataset.section;
        links.forEach((l) => l.classList.toggle('is-active', l.dataset.link === id));
      }
    },
    { rootMargin: '-50% 0px -50% 0px' },
  );
  $$('[data-section]').forEach((s) => io.observe(s));
}
