# Lucas Arnoult — Portfolio / Cybersécurité

Portfolio personnel de **Lucas Arnoult**, élève en seconde MTNE, réalisé pour une
candidature de stage dans le domaine de la cybersécurité.

Direction artistique : **Technical editorial / Digital archive**. Palette graphite
presque monochrome, typographie éditoriale (Geist + Geist Mono), accents vert acide
et bleu froid utilisés avec parcimonie, grille architecturale, grain léger.

## Stack

- [Vite](https://vite.dev) + TypeScript, sans framework
- Polices auto-hébergées via Fontsource (aucune requête externe)
- Aucune bibliothèque d'animation : IntersectionObserver, `requestAnimationFrame`,
  Canvas 2D et transitions CSS (`transform`, `opacity`, `filter`, `clip-path`)

## Démarrer

```bash
npm install
npm run dev       # serveur de développement
npm run build     # vérification TypeScript + build de production dans dist/
npm run preview   # prévisualiser le build
```

## Structure

```
index.html                  contenu complet (HTML sémantique)
src/main.ts                 point d'entrée
src/styles/base.css         tokens, reset, ambiance, révélations
src/styles/components.css   loader, navigation, curseur, boutons
src/styles/sections.css     sections du site (hero → footer)
src/modules/loader.ts       introduction (≈ 1,2 s, ignorée si mouvement réduit)
src/modules/nav.ts          navigation flottante, menu mobile, lien actif
src/modules/cursor.ts       curseur desktop + halo lumineux suivant la souris
src/modules/reveal.ts       révélations au scroll, découpage des titres
src/modules/sphere.ts       visuel du hero (réseau géométrique en canvas)
src/modules/network.ts      réseau abstrait de la section « Pourquoi la cybersécurité »
src/modules/interactions.ts tilt de la carte, boutons magnétiques, interests, timeline
```

## Parcours

Introduction → Accueil → Profil → Identité → Centres d’intérêt → État d’esprit → Mission → Objectif →
Pourquoi la cybersécurité → Candidature → Contact → Pied de page. Tous les textes du site sont en français.

## Accessibilité et performances

- `prefers-reduced-motion` : introduction, parallaxes et animations désactivées
- Curseur personnalisé et effets de survol limités aux souris (`hover: hover` +
  `pointer: fine`) ; le curseur n'intercepte jamais les clics
- Navigation clavier (lien d'évitement, focus visibles, menu mobile fermable avec Échap)
- Les animations canvas s'arrêtent hors écran et quand l'onglet est masqué
- Si le JavaScript ne se charge pas, tout le contenu reste lisible

## Contenu

Le site ne présente que des informations fournies : centres d'intérêt, objectif de
stage et coordonnées. Aucune compétence technique, certification ou expérience n'a
été inventée ; les centres d'intérêt ne sont pas présentés comme des compétences.

## Déploiement

Le workflow `.github/workflows/deploy.yml` publie le site sur GitHub Pages à chaque
push sur `main` (activer *Settings → Pages → Source : GitHub Actions*). Le build
utilise des chemins relatifs et fonctionne aussi sur n'importe quel hébergement statique.
