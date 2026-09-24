export const reducedMotion = (): boolean =>
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/** Souris précise + survol réel : desktop uniquement. */
export const finePointer = (): boolean =>
  window.matchMedia('(hover: hover) and (pointer: fine)').matches;

export const lerp = (a: number, b: number, t: number): number => a + (b - a) * t;

export const clamp = (v: number, min: number, max: number): number =>
  Math.min(max, Math.max(min, v));

export const $ = <T extends Element = HTMLElement>(sel: string, root: ParentNode = document) =>
  root.querySelector<T>(sel);

export const $$ = <T extends Element = HTMLElement>(sel: string, root: ParentNode = document) =>
  Array.from(root.querySelectorAll<T>(sel));

export function debounce<A extends unknown[]>(fn: (...args: A) => void, ms: number) {
  let id = 0;
  return (...args: A) => {
    window.clearTimeout(id);
    id = window.setTimeout(() => fn(...args), ms);
  };
}

/** Générateur pseudo-aléatoire déterministe (mulberry32). */
export function seeded(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
