# Big Jack Theory — où on en est

Note de reprise. À garder dans la base de connaissances du projet, et à
régénérer en fin de chaque session de travail.

**Version 1.47.9**, du 3 septembre 2026. Code de protection : **4270**.
Versionnage : `1.partie.retouche` — le troisième nombre avance tant qu'on
retouche la même partie, le deuxième dès qu'on passe à une autre.

---

## L'application en un coup d'œil

**Stratégie** — Tableau des mains dures, souples et paires, espérance de chaque
option calculée pour les règles de table configurées. Section distincte sur les
progressions de mise et calculateur de risque de ruine comparant six façons de
miser.

**Compteur** — Neuf systèmes : Hi-Lo, KO, Red 7, Hi-Opt I et II, Omega II, Zen,
Wong Halves, Ace-Five. Compte courant, vrai compte, pénétration, mise
indicative, gain horaire selon la profondeur de coupe.

**Exercices** — Cinq entraînements : stratégie de base, valeur de carte, défilé
chronométré, vrai compte, indices de déviation. Séries de longueur choisie,
erreurs classées par coût, indicateur « prêt pour la table » fondé sur les
dernières réponses.

**Journal** — Sessions, résultat net, rendement rapporté aux sommes engagées,
courbe cumulée, comparaison par lieu, filtres par période, plafond de perte,
export et import CSV.

**Théorie** — Fiche par système, comparatif des neuf, lexique de 26 entrées,
bibliographie.

**Paramètres** — Quatre sections dépliables résumant leur configuration sans
qu'on ait à les ouvrir. Profils de table, sauvegarde, code de protection.

---

## Architecture

| Élément | État |
|---|---|
| `entree.jsx` | 3 lignes — monte `App` dans `#racine` |
| `compteur-blackjack.jsx` | 11 464 lignes — les composants, `export default App` |
| `src/` | 14 modules, ~1 800 lignes au total |
| `tests/` | 99 vérifications, lit le fichier compilé |

Les modules de `src/` : cartes, dates, defilement, entrainement, lectures,
lexique, mises, navigation, sons, stockage, strategie, systemes, themes,
version. La règle : **tout ce qui n'est pas un composant y va**.

Pour se repérer dans le fichier principal, voir `carte-du-code.md`. Les numéros
de ligne qu'il donne restent valables en 1.47.9 : la modification a remplacé
une ligne par une ligne.

---

## Ce qui a été fait depuis le découpage (1.44.17)

**Partie 45 — les systèmes et le tableau des mains.** Les onglets du journal
sont devenus des vues à part entière (1.45.1). Puis tri des systèmes selon sept
critères, aide au choix repliée en tête, niveau affiché à côté du nom, jauges
alignées sur le chiffre affiché. Côté tableau : recherche en deux champs,
balayage à deux niveaux, calage stable au changement de tableau.

**Partie 46 — le journal.** L'alerte de plafond de perte a demandé une dizaine
d'itérations avant de tenir sur une ligne, dépliable avec sa jauge, en encre sur
papier avec la couleur dans le bord. Formulaire de session : saisie de l'heure
en un champ avec deux-points automatique, placement fiable, panneau conservé.
Tri des indices par seuil. Jalons d'historique reposés après rafraîchissement.

**Partie 47 — les exercices.** Bouton Réglages en fin de série, récapitulatif
des mains ratées, situations à revoir conservées entre les séances, maîtrise
déplacée dans la progression avec repère de vitesse visible. Corrections :
abandon sur sa rangée, fin du Vrai compte. En 1.47.9, le bouton « Tout effacer »
de l'historique des séries devient « Effacer l'historique ».

---

## Session du 3 septembre 2026

**Remise en ordre.** Le projet a été transféré dans un projet Claude et la base
de connaissances nettoyée. Le dépôt GitHub était resté en 1.45.20, trente-huit
versions en arrière ; la 1.47.8 puis la 1.47.9 sont à publier.

**`entree.jsx` reconstruit.** Il avait disparu à l'export des artefacts et ne se
trouvait ni à la racine ni dans `src/`. Rétabli à partir de deux indices :
`compteur-blackjack.jsx` se termine par `export default function App()` sans
jamais appeler `createRoot`, et `tests.mjs` interroge `#racine` à plus de trente
reprises. **Validé** : la compilation aboutit et les 99 vérifications passent.

**Date de version corrigée.** `src/version.js` portait « 29 août 2026 » alors
que le README annonçait le 31 août. La 1.47.9 porte le 3 septembre, ce qui
tranche la question.

---

## Ce qui reste ouvert

**Le découpage des gros blocs.** Le fichier principal est remonté de 10 620 à
11 464 lignes depuis le découpage de la partie 44. Quatre ensembles pèsent
chacun plus de mille lignes :

| Bloc | Lignes | Remarque |
|---|---|---|
| Le journal | ~2 480 | `VueJournal` à elle seule en fait 2 125 |
| Les exercices | ~2 270 | cinq drills plus leur cadre commun |
| Les paramètres | ~1 420 | déjà répartis en sous-composants |
| `App` | ~1 200 | l'état global et le routage |

Le journal reste le candidat le plus net : c'est le seul où un composant unique
dépasse les deux mille lignes. Ses aides — regroupement par période, import et
export CSV, histogramme, courbe cumulée — sont déjà des fonctions pures
détachées, extractibles vers `src/` sans toucher au composant.

**Le chantier 8** — la présentation des façons de miser. Jamais abordé.

**L'APK.** `apk.yml` existe, suit la procédure Bubblewrap documentée, mais n'a
jamais été exécuté — l'environnement où il a été écrit n'avait pas accès aux
serveurs Android. `INSTALLATION.md` le signale toujours comme non testé.

**`tests/LISEZMOI.md`** annonce 68 vérifications ; la suite en compte 99.

---

## Règles de travail établies

**En cas de doute, la structure existante l'emporte** sur ce que propose un
document extérieur.

**Lire le code avant de l'éditer.** Trois échecs en une session sont venus de
motifs de recherche approximatifs.

**Un test qui lit `textContent` ne prouve pas qu'une chose s'affiche.** Les
paramètres sont restés invisibles pendant vingt versions pour cette raison.
La fonction `affiche()` dans `tests/outils.mjs` remonte la chaîne des parents.

**Le téléphone reste le juge.** Plusieurs défauts n'ont été trouvés que là.

---

## Comment reconstruire

```
esbuild entree.jsx --bundle --minify --format=iife --loader:.jsx=jsx \
  --jsx=automatic --define:process.env.NODE_ENV='"production"' \
  --outfile=bundle.js
```

Le bundle s'insère entre les balises `<script>` de `index.html` — dans ce
fichier, entre la ligne 54 et la balise fermante, le reste de l'enveloppe étant
conservé tel quel. Même opération pour `big-jack-theory.html`, la version
autonome, dont le `<script>` s'ouvre à la ligne 24.

Les tests lisent `big-jack-theory.html` : recompiler avant `node tests.mjs`.

Le numéro de version vit dans `src/version.js`, et doit être reporté dans
`sw.js` (constante `CACHE`) et dans le tableau du README à chaque livraison.

---

## Base de connaissances du projet

**À y déposer** : cette fiche, `carte-du-code.md`, `instructions-projet.md`,
`entree.jsx`, `compteur-blackjack.jsx`, les quatorze modules de `src/`,
`tests.mjs`, `outils.mjs`, `sw.js`, `manifest.webmanifest`, `apk.yml`,
`README.md`, `INSTALLATION.md`, `LISEZMOI.md`, `PROCEDURE-SAUVEGARDE.md`,
`systeme-visuel.md`, `brief-design.md`.

**Les fichiers compilés** — `index.html` et `big-jack-theory.html` — pèsent
478 Ko chacun de bundle minifié. Les déposer entiers consomme la fenêtre de
contexte pour rien, mais les retirer complètement empêche de produire un
`index.html` livrable. **Bon compromis** : déposer `index.html` avec le contenu
entre les balises `<script>` vidé — l'enveloppe seule, quelques kilo-octets.
Les images n'ont rien à faire dans la base : extraction de texte uniquement.
