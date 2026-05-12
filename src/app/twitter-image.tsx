// La twitter-image réutilise l'OG image (même rendu).
// Twitter utilise summary_large_image (ratio 2:1 préféré, 1200×600).
// Notre 1200×630 fonctionne aussi — Twitter recadre légèrement.
export { default } from './opengraph-image'
export {
  runtime,
  size,
  contentType,
  alt,
} from './opengraph-image'
