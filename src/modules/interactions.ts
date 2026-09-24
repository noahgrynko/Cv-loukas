import { $$, clamp, finePointer, reducedMotion } from './utils';

/** Carte identité : tilt très léger (desktop large uniquement). */
export function initTilt(): void {
  const wide = window.matchMedia('(min-width: 1025px)');
  $$('[data-tilt]').forEach((card) => {
    const reset = () => {
      card.classList.remove('is-tilting');
      card.style.setProperty('--rx', '0deg');
      card.style.setProperty('--ry', '0deg');
    };
    card.addEventListener('pointermove', (e) => {
      if (e.pointerType !== 'mouse' || !wide.matches || reducedMotion()) return;
      const r = card.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width;
      const py = (e.clientY - r.top) / r.height;
      card.classList.add('is-tilting');
      card.style.setProperty('--ry', `${((px - 0.5) * 6).toFixed(2)}deg`);
      card.style.setProperty('--rx', `${((0.5 - py) * 4).toFixed(2)}deg`);
      card.style.setProperty('--gx', `${(px * 100).toFixed(1)}%`);
      card.style.setProperty('--gy', `${(py * 100).toFixed(1)}%`);
    });
    card.addEventListener('pointerleave', reset);
    wide.addEventListener('change', reset);
  });
}

/** Boutons magnétiques : déplacement de quelques pixels vers le pointeur. */
export function initMagnetic(): void {
  if (!finePointer() || reducedMotion()) return;
  $$('[data-magnetic]').forEach((el) => {
    const strength = el.classList.contains('btn-xl') ? 0.18 : 0.12;
    el.style.transition = `${getComputedStyle(el).transition}, transform 0.5s cubic-bezier(0.16, 1, 0.3, 1)`;
    el.addEventListener('pointermove', (e) => {
      const r = el.getBoundingClientRect();
      const dx = e.clientX - (r.left + r.width / 2);
      const dy = e.clientY - (r.top + r.height / 2);
      const tx = clamp(dx * strength, -10, 10);
      const ty = clamp(dy * strength * 1.4, -8, 8);
      const scale = el.classList.contains('btn-xl') ? 1.03 : 1.015;
      el.style.transform = `translate3d(${tx}px, ${ty}px, 0) scale(${scale})`;
      el.style.setProperty('--bx', `${((e.clientX - r.left) / r.width) * 100}%`);
      el.style.setProperty('--by', `${((e.clientY - r.top) / r.height) * 100}%`);
    });
    el.addEventListener('pointerleave', () => {
      el.style.transform = '';
    });
  });
}

const GLYPHS = '{}[]<>/\;:=+*#01_';

/** Effet de brouillage typographique (bloc « Codage »). */
function scramble(el: HTMLElement): void {
  const original = el.dataset.text ?? el.textContent ?? '';
  el.dataset.text = original;
  if (el.dataset.running) return;
  el.dataset.running = '1';

  const duration = 700;
  const start = performance.now();
  const frame = (now: number) => {
    const p = Math.min(1, (now - start) / duration);
    const fixed = Math.floor(p * original.length);
    el.textContent = original
      .split('')
      .map((ch, i) =>
        ch === ' ' || i < fixed ? ch : GLYPHS[Math.floor(Math.random() * GLYPHS.length)],
      )
      .join('');
    if (p < 1) requestAnimationFrame(frame);
    else {
      el.textContent = original;
      delete el.dataset.running;
    }
  };
  requestAnimationFrame(frame);
}

/** Blocs « Interests » : halo local, tracés normalisés, brouillage. */
export function initInterests(): void {
  // pathLength=1 permet d'animer tous les tracés avec le même dasharray
  $$('.draw path, .draw rect, .draw circle').forEach((s) => s.setAttribute('pathLength', '1'));

  $$('.interest').forEach((card) => {
    card.addEventListener('pointermove', (e) => {
      const r = card.getBoundingClientRect();
      card.style.setProperty('--lx', `${e.clientX - r.left}px`);
      card.style.setProperty('--ly', `${e.clientY - r.top}px`);
    });

    const glyphs = card.querySelector<HTMLElement>('[data-scramble]');
    if (glyphs && !reducedMotion()) {
      card.addEventListener('pointerenter', () => scramble(glyphs));
      card.addEventListener('focus', () => scramble(glyphs));
    }
  });
}

/** Timeline « Mission » : la ligne se remplit avec le scroll. */
export function initTimeline(): void {
  const timeline = document.querySelector<HTMLElement>('[data-timeline]');
  if (!timeline) return;
  const track = timeline.querySelector<HTMLElement>('.timeline__track');
  const steps = $$('.timeline__step', timeline);
  if (!track) return;

  let ticking = false;
  const update = () => {
    ticking = false;
    const vh = window.innerHeight;
    const vertical = track.clientWidth <= 1;
    const tr = track.getBoundingClientRect();

    let progress: number;
    if (vertical) {
      progress = clamp((vh * 0.65 - tr.top) / tr.height, 0, 1);
    } else {
      const rect = timeline.getBoundingClientRect();
      progress = clamp((vh * 0.85 - rect.top) / (vh * 0.5), 0, 1);
    }
    timeline.style.setProperty('--progress', progress.toFixed(4));

    steps.forEach((step) => {
      const node = step.querySelector<HTMLElement>('.timeline__node');
      if (!node) return;
      const nr = node.getBoundingClientRect();
      const at = vertical
        ? (nr.top + nr.height / 2 - tr.top) / tr.height
        : (nr.left + nr.width / 2 - tr.left) / tr.width;
      step.classList.toggle('is-reached', progress >= at - 0.001);
    });
  };

  const request = () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(update);
  };

  window.addEventListener('scroll', request, { passive: true });
  window.addEventListener('resize', request);
  update();
}
