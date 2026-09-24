import { reducedMotion } from './utils';

const MIN_DURATION = 1150; // ms — introduction courte, jamais bloquante
const MAX_WAIT = 2000;

/** Affiche l'introduction puis révèle la page. */
export function initLoader(): Promise<void> {
  const root = document.documentElement;
  const loader = document.querySelector<HTMLElement>('.loader');

  const finish = () => {
    root.classList.add('is-loaded');
    window.setTimeout(() => loader?.remove(), 1000);
  };

  if (!loader || reducedMotion()) {
    finish();
    return Promise.resolve();
  }

  const start = performance.now();
  const fontsReady = Promise.race([
    document.fonts?.ready ?? Promise.resolve(),
    new Promise((r) => window.setTimeout(r, MAX_WAIT)),
  ]);

  return fontsReady.then(
    () =>
      new Promise<void>((resolve) => {
        const remaining = Math.max(0, MIN_DURATION - (performance.now() - start));
        window.setTimeout(() => {
          finish();
          resolve();
        }, remaining);
      }),
  );
}
