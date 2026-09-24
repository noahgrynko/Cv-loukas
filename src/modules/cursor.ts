import { finePointer, lerp, reducedMotion } from './utils';

type CursorState = 'default' | 'link' | 'button' | 'focus';

/**
 * Curseur personnalisé (desktop) + position souris exposée en CSS (--mx / --my)
 * pour le halo lumineux d'ambiance. Le curseur est en pointer-events: none :
 * il n'intercepte jamais les clics.
 */
export function initCursor(): void {
  if (!finePointer()) return;

  const root = document.documentElement;
  const cursor = document.querySelector<HTMLElement>('.cursor');
  const dot = cursor?.querySelector<HTMLElement>('.cursor__dot');
  const ring = cursor?.querySelector<HTMLElement>('.cursor__ring');
  const still = reducedMotion();

  const pos = { x: innerWidth / 2, y: innerHeight / 2 };
  const ringPos = { ...pos };
  const light = { ...pos };
  let visible = false;
  let raf = 0;

  if (cursor && dot && ring) {
    root.classList.add('has-cursor');
    cursor.classList.add('is-hidden');
  }

  const stateFor = (el: Element | null): CursorState => {
    const target = el?.closest<HTMLElement>('[data-cursor], a, button');
    if (!target) return 'default';
    const explicit = target.dataset.cursor as CursorState | undefined;
    if (explicit) return explicit;
    return target.tagName === 'BUTTON' ? 'button' : 'link';
  };

  const tick = () => {
    const k = still ? 1 : 0.16;
    ringPos.x = lerp(ringPos.x, pos.x, k);
    ringPos.y = lerp(ringPos.y, pos.y, k);
    light.x = lerp(light.x, pos.x, still ? 1 : 0.08);
    light.y = lerp(light.y, pos.y, still ? 1 : 0.08);

    if (dot && ring) {
      dot.style.transform = `translate3d(${pos.x}px, ${pos.y}px, 0)`;
      ring.style.transform = `translate3d(${ringPos.x}px, ${ringPos.y}px, 0)`;
    }
    root.style.setProperty('--mx', `${light.x}px`);
    root.style.setProperty('--my', `${light.y}px`);

    const settled =
      Math.abs(ringPos.x - pos.x) < 0.1 &&
      Math.abs(ringPos.y - pos.y) < 0.1 &&
      Math.abs(light.x - pos.x) < 0.1 &&
      Math.abs(light.y - pos.y) < 0.1;
    raf = settled ? 0 : requestAnimationFrame(tick);
  };

  const wake = () => {
    if (!raf) raf = requestAnimationFrame(tick);
  };

  window.addEventListener(
    'pointermove',
    (e) => {
      if (e.pointerType !== 'mouse') return;
      pos.x = e.clientX;
      pos.y = e.clientY;
      if (!visible) {
        visible = true;
        ringPos.x = pos.x;
        ringPos.y = pos.y;
        cursor?.classList.remove('is-hidden');
      }
      wake();
    },
    { passive: true },
  );

  document.addEventListener('pointerover', (e) => {
    if (cursor) cursor.dataset.state = stateFor(e.target as Element);
  });
  document.documentElement.addEventListener('pointerleave', () => {
    visible = false;
    cursor?.classList.add('is-hidden');
  });
  window.addEventListener('pointerdown', () => cursor?.classList.add('is-down'));
  window.addEventListener('pointerup', () => cursor?.classList.remove('is-down'));
}
