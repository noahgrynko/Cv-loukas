import '@fontsource-variable/geist';
import '@fontsource-variable/geist-mono';

import './styles/base.css';
import './styles/components.css';
import './styles/sections.css';

import { initLoader } from './modules/loader';
import { initNav } from './modules/nav';
import { initCursor } from './modules/cursor';
import { initReveal, revealHero } from './modules/reveal';
import { initSphere } from './modules/sphere';
import { initWhyNetwork } from './modules/network';
import { initInterests, initMagnetic, initTilt, initTimeline } from './modules/interactions';

// La structure est prête immédiatement : on prépare tout sous le loader
document.documentElement.dataset.ready = '1';
initReveal();
initNav();
initCursor();
initSphere();
initInterests();
initTilt();
initMagnetic();
initTimeline();
initWhyNetwork();

void initLoader().then(revealHero);
