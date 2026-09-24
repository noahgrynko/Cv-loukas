import { $$ } from './utils';

/** Découpe un titre en lignes (séparées par <br>) pour une révélation masquée. */
function splitLines(el: HTMLElement): void {
  const lines: Node[][] = [[]];
  el.childNodes.forEach((node) => {
    if (node.nodeName === 'BR') lines.push([]);
    else lines[lines.length - 1].push(node);
  });

  const frag = document.createDocumentFragment();
  lines.forEach((nodes, i) => {
    if (!nodes.some((n) => n.textContent?.trim())) return;
    const line = document.createElement('span');
    const inner = document.createElement('span');
    line.className = 'split-line';
    inner.className = 'split-line__inner';
    line.style.setProperty('--i', String(i));
    nodes.forEach((n) => inner.appendChild(n));
    line.appendChild(inner);
    frag.appendChild(line);
  });
  el.replaceChildren(frag);
}

export function initReveal(): void {
  $$('[data-split]').forEach(splitLines);

  // Décalage progressif entre éléments frères
  $$('[data-reveal]').forEach((el) => {
    if (el.style.getPropertyValue('--delay')) return;
    const siblings = Array.from(el.parentElement?.children ?? []).filter((c) =>
      c.hasAttribute('data-reveal'),
    );
    const i = siblings.indexOf(el);
    if (i > 0) el.style.setProperty('--delay', `${Math.min(i, 5) * 0.08}s`);
  });

  const once = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        entry.target.classList.add('is-in');
        once.unobserve(entry.target);
      }
    },
    { rootMargin: '0px 0px -12% 0px', threshold: 0.01 },
  );

  // Le hero est révélé par l'introduction (voir revealHero), pas au scroll
  $$('[data-reveal], [data-split], [data-draw], [data-word], [data-why]')
    .filter((el) => !el.closest('.hero'))
    .forEach((el) => once.observe(el));

  // Mindset : chaque mot se « remplit » en passant au centre de l'écran
  const active = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        entry.target.classList.add('is-active');
        active.unobserve(entry.target);
      }
    },
    { rootMargin: '-40% 0px -40% 0px' },
  );
  $$('[data-word]').forEach((el) => active.observe(el));
}

/** Révèle le contenu du hero en cascade, à la fin de l'introduction. */
export function revealHero(): void {
  $$('.hero [data-reveal]').forEach((el, i) => {
    el.style.setProperty('--delay', `${0.35 + i * 0.08}s`);
    el.classList.add('is-in');
  });
}
