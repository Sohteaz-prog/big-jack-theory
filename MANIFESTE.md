# Manifeste de reprise — 1.47.9

Livraison du 3 septembre 2026.

**La modification demandée** : dans S'entraîner, le bouton « Tout effacer » de
l'historique des séries devient « Effacer l'historique ». Une seule occurrence
dans tout le code, ligne 4250 de `compteur-blackjack.jsx`.

---

## Fichiers modifiés

| Fichier | Ce qui change |
|---|---|
| `compteur-blackjack.jsx` | le libellé du bouton, ligne 4250 |
| `src/version.js` | 1.47.8 → 1.47.9, date au 3 septembre 2026 |
| `sw.js` | `CACHE` → `big-jack-theory-1.47.9` |
| `README.md` | version courante et nouvelle entrée au tableau |
| `index.html` | recompilé — enveloppe d'origine conservée |
| `big-jack-theory.html` | recompilé — version autonome |
| `ou-on-en-est.md` | régénéré |

**Non modifié** : les treize autres modules de `src/`, `tests/`, `entree.jsx`,
`manifest.webmanifest`, `apk.yml`, la documentation, les icônes.

`carte-du-code.md` n'est pas réexpédié : la modification a remplacé une ligne
par une ligne, tous ses numéros restent exacts.

---

## Vérifications faites

| | |
|---|---|
| Occurrences de « Tout effacer » restantes | 0 |
| « Effacer l'historique » présent dans le bundle | oui |
| Compilation esbuild | aboutie, 513,5 ko |
| Suite de tests sur `big-jack-theory.html` | **99 passées, 0 échouée** |
| Erreurs JavaScript au montage | aucune |
| Structure de `index.html` | 3 blocs `<script>`, identique à l'original |
| `sw.js` et `version.js` concordants | oui, 1.47.9 |

L'apostrophe employée est l'apostrophe droite, conforme aux 748 autres du
fichier — aucune apostrophe courbe n'y figure.

---

## Régressions possibles

**La seule qui demande votre œil.** Le nouveau libellé fait vingt caractères
contre douze. Ce bouton partage une ligne en `flexWrap` avec le paragraphe qui
explique la limite des séries. Sur un écran étroit, il peut désormais passer à
la ligne suivante. Les tests ne voient pas ce genre de chose — **à regarder sur
le téléphone**, en bas de S'entraîner, après avoir enregistré quelques séries.

**Le bundle a été compilé ici**, avec un esbuild fraîchement installé. La
version de React est la même que la vôtre — 18.3.1 — mais l'octet-à-octet peut
différer du bundle que vous produiriez. Si le téléphone se comporte
différemment ailleurs que sur ce bouton, c'est la première piste : recompilez
chez vous avec la même commande.

**La date affichée dans les Paramètres** passe du 29 août au 3 septembre. C'est
voulu — elle était incohérente avec le README — mais c'est un changement
visible que vous n'avez pas demandé. Dites-le si vous préférez l'ancienne.

---

## Quoi faire

**Base de connaissances** : remplacer `compteur-blackjack.jsx`, `version.js`,
`sw.js`, `README.md`, `ou-on-en-est.md`.

**Disque** : remplacer les sept fichiers dans `big-jack-theory-pwa`,
`version.js` allant dans `src/`.

**GitHub** : le dépôt est en 1.45.20. Déposer le contenu du dossier
`big-jack-theory-pwa` mis à jour — **Add file** → **Upload files** →
**Commit changes**. Les icônes et `LICENSE` n'ont pas changé, inutile de les
redéposer.

**Téléphone** : ouvrir l'application connecté, la fermer entièrement, la
rouvrir. Le service worker interroge le réseau en priorité pour la page, donc
la nouvelle version arrive au **deuxième** lancement. Le pied de page doit
afficher **1.47.9**.
