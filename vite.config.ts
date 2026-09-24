import { defineConfig } from 'vite';

// Chemins relatifs : le site fonctionne aussi bien à la racine d'un domaine
// que dans un sous-dossier (ex. GitHub Pages /Cv-loukas/).
export default defineConfig({
  base: './',
  build: {
    target: 'es2022',
    cssMinify: true,
  },
});
