import { $$, debounce, finePointer, reducedMotion, seeded } from './utils';

const SVG_NS = 'http://www.w3.org/2000/svg';

interface Node {
  x: number;
  y: number;
  key: boolean;
}

/**
 * « Why cybersecurity » : réseau abstrait, purement graphique,
 * tissé derrière les cinq mots. Reconstruit au redimensionnement.
 */
export function initWhyNetwork(): void {
  const stage = document.querySelector<HTMLElement>('[data-why]');
  const svg = stage?.querySelector<SVGSVGElement>('[data-why-net]');
  if (!stage || !svg) return;

  const words = $$('.why__words li', stage);

  const build = () => {
    const w = stage.clientWidth;
    const h = stage.clientHeight;
    if (!w || !h) return;
    const rand = seeded(2026);

    svg.setAttribute('viewBox', `0 0 ${w} ${h}`);

    // Un nœud clé par mot, placé juste à gauche de son numéro
    const keys: Node[] = words.map((li) => ({
      x: li.offsetLeft + 4,
      y: li.offsetTop + li.offsetHeight / 2,
      key: true,
    }));

    const count = Math.round(Math.min(46, Math.max(18, (w * h) / 16000)));
    const nodes: Node[] = [...keys];
    for (let i = 0; i < count; i++) {
      nodes.push({ x: rand() * w, y: rand() * h, key: false });
    }

    const edges: [number, number, boolean][] = [];
    const seen = new Set<string>();
    const add = (a: number, b: number, key: boolean) => {
      const id = a < b ? `${a}-${b}` : `${b}-${a}`;
      if (a === b || seen.has(id)) return;
      seen.add(id);
      edges.push([a, b, key]);
    };

    // Chaîne entre les mots
    for (let i = 0; i < keys.length - 1; i++) add(i, i + 1, true);

    // Chaque nœud rejoint ses deux plus proches voisins
    nodes.forEach((n, i) => {
      nodes
        .map((m, j) => ({ j, d: (n.x - m.x) ** 2 + (n.y - m.y) ** 2 }))
        .filter(({ j }) => j !== i)
        .sort((a, b) => a.d - b.d)
        .slice(0, 2)
        .forEach(({ j }) => add(i, j, false));
    });

    const frag = document.createDocumentFragment();
    edges.forEach(([a, b, key], i) => {
      const line = document.createElementNS(SVG_NS, 'line');
      line.setAttribute('x1', nodes[a].x.toFixed(1));
      line.setAttribute('y1', nodes[a].y.toFixed(1));
      line.setAttribute('x2', nodes[b].x.toFixed(1));
      line.setAttribute('y2', nodes[b].y.toFixed(1));
      line.setAttribute('pathLength', '1');
      if (key) line.classList.add('is-key');
      line.style.setProperty('--d', `${(key ? 0.4 : 0) + (i % 12) * 0.05}s`);
      frag.appendChild(line);
    });
    nodes.forEach((n, i) => {
      const c = document.createElementNS(SVG_NS, 'circle');
      c.setAttribute('cx', n.x.toFixed(1));
      c.setAttribute('cy', n.y.toFixed(1));
      c.setAttribute('r', n.key ? '3.5' : String(1.2 + (i % 3) * 0.5));
      if (n.key) c.classList.add('is-key');
      c.style.setProperty('--d', `${(i % 10) * 0.06}s`);
      frag.appendChild(c);
    });
    svg.replaceChildren(frag);
  };

  build();
  document.fonts?.ready.then(build);
  new ResizeObserver(debounce(build, 150)).observe(stage);

  // Légère parallaxe au survol
  if (finePointer() && !reducedMotion()) {
    stage.addEventListener('pointermove', (e) => {
      const r = stage.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width - 0.5;
      const y = (e.clientY - r.top) / r.height - 0.5;
      stage.style.setProperty('--px', `${(x * -12).toFixed(1)}px`);
      stage.style.setProperty('--py', `${(y * -12).toFixed(1)}px`);
    });
    stage.addEventListener('pointerleave', () => {
      stage.style.setProperty('--px', '0px');
      stage.style.setProperty('--py', '0px');
    });
  }
}
