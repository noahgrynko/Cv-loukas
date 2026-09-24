import { finePointer, lerp, reducedMotion } from './utils';

interface P3 {
  x: number;
  y: number;
  z: number;
}

const COUNT = 150;
const LINKS = 3;

/** Points répartis uniformément sur une sphère (spirale de Fibonacci). */
function fibonacciSphere(n: number): P3[] {
  const pts: P3[] = [];
  const golden = Math.PI * (3 - Math.sqrt(5));
  for (let i = 0; i < n; i++) {
    const y = 1 - (i / (n - 1)) * 2;
    const r = Math.sqrt(1 - y * y);
    const t = golden * i;
    pts.push({ x: Math.cos(t) * r, y, z: Math.sin(t) * r });
  }
  return pts;
}

/** Relie chaque point à ses plus proches voisins (paires uniques). */
function nearestPairs(pts: P3[], k: number): [number, number][] {
  const seen = new Set<string>();
  const pairs: [number, number][] = [];
  pts.forEach((a, i) => {
    pts
      .map((b, j) => ({ j, d: (a.x - b.x) ** 2 + (a.y - b.y) ** 2 + (a.z - b.z) ** 2 }))
      .filter(({ j }) => j !== i)
      .sort((p, q) => p.d - q.d)
      .slice(0, k)
      .forEach(({ j }) => {
        const key = i < j ? `${i}-${j}` : `${j}-${i}`;
        if (seen.has(key)) return;
        seen.add(key);
        pairs.push([i, j]);
      });
  });
  return pairs;
}

/**
 * Visuel du hero : réseau géométrique abstrait en forme de sphère.
 * Rotation lente, réaction minuscule à la souris, arrêt hors écran.
 */
export function initSphere(): void {
  const canvas = document.querySelector<HTMLCanvasElement>('[data-sphere]');
  const wrap = document.querySelector<HTMLElement>('[data-hero-visual]');
  const ctx = canvas?.getContext('2d');
  if (!canvas || !wrap || !ctx) return;

  const still = reducedMotion();
  const pts = fibonacciSphere(COUNT);
  const pairs = nearestPairs(pts, LINKS);
  const accents = new Set([12, 47, 88, 121]);
  const coord = wrap.querySelector<HTMLElement>('.hero__coord--a');

  let w = 0;
  let h = 0;
  let angle = 0.6;
  let last = performance.now();
  let raf = 0;
  let onScreen = true;

  // Cible souris normalisée (-1..1) et valeur lissée
  const target = { x: 0, y: 0 };
  const eased = { x: 0, y: 0 };

  const resize = () => {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const rect = canvas.getBoundingClientRect();
    w = rect.width;
    h = rect.height;
    canvas.width = Math.round(w * dpr);
    canvas.height = Math.round(h * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    draw();
  };

  const project = (p: P3, rotY: number, rotX: number) => {
    // rotation Y puis X
    const cy = Math.cos(rotY);
    const sy = Math.sin(rotY);
    const x1 = p.x * cy - p.z * sy;
    const z1 = p.x * sy + p.z * cy;
    const cx = Math.cos(rotX);
    const sx = Math.sin(rotX);
    const y2 = p.y * cx - z1 * sx;
    const z2 = p.y * sx + z1 * cx;

    const R = Math.min(w, h) * 0.36;
    const persp = 2.6 / (2.6 + z2);
    return { x: w / 2 + x1 * R * persp, y: h / 2 + y2 * R * persp, z: z2, s: persp };
  };

  const draw = () => {
    if (!w || !h) return;
    ctx.clearRect(0, 0, w, h);

    const rotY = angle + eased.x * 0.12;
    const rotX = -0.32 + eased.y * 0.08;
    const proj = pts.map((p) => project(p, rotY, rotX));
    const R = Math.min(w, h) * 0.36;

    // Repères : cercle d'horizon + axes fins
    ctx.lineWidth = 1;
    ctx.strokeStyle = 'rgba(241,241,237,0.06)';
    ctx.beginPath();
    ctx.arc(w / 2, h / 2, R * 1.22, 0, Math.PI * 2);
    ctx.stroke();
    ctx.setLineDash([2, 6]);
    ctx.beginPath();
    ctx.moveTo(w / 2 - R * 1.4, h / 2);
    ctx.lineTo(w / 2 + R * 1.4, h / 2);
    ctx.moveTo(w / 2, h / 2 - R * 1.4);
    ctx.lineTo(w / 2, h / 2 + R * 1.4);
    ctx.stroke();
    ctx.setLineDash([]);

    // Arêtes
    for (const [a, b] of pairs) {
      const pa = proj[a];
      const pb = proj[b];
      const depth = (pa.z + pb.z) / 2; // -1 (devant) .. 1 (derrière)
      const alpha = 0.03 + (1 - (depth + 1) / 2) * 0.2;
      ctx.strokeStyle = `rgba(241,241,237,${alpha.toFixed(3)})`;
      ctx.beginPath();
      ctx.moveTo(pa.x, pa.y);
      ctx.lineTo(pb.x, pb.y);
      ctx.stroke();
    }

    // Points
    proj.forEach((p, i) => {
      const front = 1 - (p.z + 1) / 2;
      if (accents.has(i)) {
        ctx.fillStyle = `rgba(183,255,60,${(0.35 + front * 0.65).toFixed(3)})`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, 2.4 * p.s, 0, Math.PI * 2);
        ctx.fill();
        if (front > 0.5) {
          ctx.strokeStyle = `rgba(183,255,60,${(front * 0.25).toFixed(3)})`;
          ctx.beginPath();
          ctx.arc(p.x, p.y, 9 * p.s, 0, Math.PI * 2);
          ctx.stroke();
        }
      } else {
        ctx.fillStyle = `rgba(241,241,237,${(0.12 + front * 0.6).toFixed(3)})`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, (0.6 + front * 1.1) * p.s, 0, Math.PI * 2);
        ctx.fill();
      }
    });
  };

  const tick = (now: number) => {
    const dt = Math.min(64, now - last);
    last = now;
    angle += dt * 0.00009;
    eased.x = lerp(eased.x, target.x, 0.05);
    eased.y = lerp(eased.y, target.y, 0.05);

    // Micro-profondeur : ±2° en X, ±3° en Y, quelques pixels de déplacement
    wrap.style.transform =
      `perspective(1200px) rotateX(${(-eased.y * 2).toFixed(3)}deg) ` +
      `rotateY(${(eased.x * 3).toFixed(3)}deg) ` +
      `translate3d(${(eased.x * 6).toFixed(2)}px, ${(eased.y * 6).toFixed(2)}px, 0)`;
    wrap.style.setProperty('--hx', `${(eased.x * 18).toFixed(1)}px`);
    wrap.style.setProperty('--hy', `${(eased.y * 18).toFixed(1)}px`);

    draw();
    raf = onScreen && !document.hidden ? requestAnimationFrame(tick) : 0;
  };

  const start = () => {
    if (still || raf || !onScreen || document.hidden) return;
    last = performance.now();
    raf = requestAnimationFrame(tick);
  };

  new ResizeObserver(resize).observe(canvas);
  resize();

  if (still) return;

  if (finePointer()) {
    window.addEventListener(
      'pointermove',
      (e) => {
        target.x = (e.clientX / innerWidth) * 2 - 1;
        target.y = (e.clientY / innerHeight) * 2 - 1;
        if (coord) {
          coord.textContent = `X ${((target.x + 1) / 2).toFixed(3)} / Y ${((target.y + 1) / 2).toFixed(3)}`;
        }
      },
      { passive: true },
    );
  }

  new IntersectionObserver(([entry]) => {
    onScreen = entry.isIntersecting;
    start();
  }).observe(wrap);
  document.addEventListener('visibilitychange', start);
  start();
}
