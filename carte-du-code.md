# Carte de `compteur-blackjack.jsx`

Relevé pour la **version 1.47.8**, fichier de 11 464 lignes.

Les numéros de ligne sont indicatifs et se décalent à la première édition. Ils
servent à situer un bloc, pas à y sauter aveuglément. **Chercher par nom de
composant reste la méthode fiable** — c'est précisément l'approximation des
motifs de recherche qui a coûté trois échecs en une session.

---

## Vue d'ensemble

| Bloc | Lignes | Poids |
|---|---|---|
| Écran de code et utilitaires | 22 – 230 | ~210 |
| Styles et primitives visuelles | 230 – 415 | ~185 |
| Théorie : menu, fiche, comparatif | 415 – 1 412 | ~1 000 |
| Compteur | 1 412 – 2 118 | ~700 |
| Exercices | 2 118 – 4 392 | ~2 270 |
| Stratégie | 4 392 – 5 508 | ~1 120 |
| Mises | 5 508 – 5 808 | ~300 |
| Paramètres | 5 808 – 7 226 | ~1 420 |
| Lexique et lectures | 7 226 – 7 579 | ~350 |
| Journal | 7 579 – 10 060 | ~2 480 |
| Accueil et navigation | 10 060 – 10 259 | ~200 |
| `App` | 10 259 – 11 464 | ~1 200 |

---

## Détail

### Ouverture — 22 à 230

`EcranCode` (22) le verrou d'entrée · `effacerStockage` (128) ·
`calculerSerie` (140) · `evaluerPrets` (158) le calcul « prêt pour la table » ·
`useMediaQuery` (211).

### Styles et primitives — 230 à 415

`CSS` (230) et `S` (282), les deux tables de style · `Pips` (317) ·
`CarteFace` (336) · `Segments` (380) le sélecteur segmenté.

### Théorie — 415 à 1 412

`LigneMobile` (415) la ligne dépliable d'un système · `TRIS` (641) les sept
critères de tri · `VueMenu` (658) la liste des neuf systèmes ·
`TableValeurs` (977) · `Bloc` (1064) et `Liste` (1073) ·
`VueFiche` (1086) la fiche détaillée.

Puis trois primitives réutilisées partout : `Chevron` (1361),
`Cartouche` (1380), `Stat` (1403).

### Compteur — 1 412 à 2 118

`VueCompteur` (1412), d'un seul tenant : compte courant, vrai compte,
pénétration, mise indicative, gain horaire.

### Exercices — 2 118 à 4 392

Le cadre commun : `tirerMainExercice` (2118) · `BilanSerie` (2160) ·
`ChoixLongueur` (2291) · `SERIE` (2331) le drapeau de série engagée ·
`AccueilExercice` (2337).

Les cinq drills : `DrillStrategie` (2448) · `DrillIndices` (2790) ·
`DrillValeur` (2982) · `DrillSabot` (3234) · `DrillVraiCompte` (3539).

`VueEntrainement` (3753) les enveloppe et porte la progression.

### Stratégie — 4 392 à 5 508

`Grille` (4392) le tableau générique · `VueStrategie` (4495) ·
`Calculateur` (5240) le risque de ruine.

### Mises — 5 508 à 5 808

`PROGRESSIONS` (5508) les six façons de miser · `VueMises` (5602).

### Paramètres — 5 808 à 7 226

Primitives : `JetonLogo` (5808) · `Confirmation` (5832) ·
`TitreCadre` (6014) · `SectionReglages` (6034) · `ChampNombre` (6121) ·
`ChampHeure` (6154) · `LigneReglage` (6194).

Données et aides : `PROFILS` (5879) · `PROVENANCE` (5921) ·
`AideReleve` (5967) · `detailsRegles` (6210) · `EditeurRegles` (6234).

`VueParametres` (6326) assemble le tout — 900 lignes, une vingtaine de props.

### Lexique et lectures — 7 226 à 7 579

`VueLexique` (7226) · `VueLectures` (7387).

### Journal — 7 579 à 10 060

Aides de regroupement : `MOIS` (7579) · `etiquetteBloc` (7582) ·
`bornesBloc` (7588) · `regrouper` (7595) · `bornesVisibles` (7632).

Graphiques : `Histogramme` (7640) · `CourbeCumul` (7798).

Import et export : `exporterCSV` (7708) · `assainir` (7731) ·
`analyserCSV` (7758).

`LienLieu` (7921) · **`VueJournal` (7935 – 10060)**, 2 125 lignes en un seul
composant. C'est le prochain découpage.

### Accueil et navigation — 10 060 à 10 259

`VueAccueil` (10060) · `SousNav` (10163) · `useBalayage` (10228).

### `App` — 10 259 à 11 464

`export default function App()`. Porte l'état global, le routage entre les dix
écrans, la gestion du bouton retour d'Android et la barre d'onglets du bas.

**Le fichier n'appelle jamais `createRoot`** : c'est `entree.jsx` qui monte
`App` dans `#racine`.

---

## Notes de découpage

`VueJournal` est le seul composant à dépasser deux mille lignes. Ses aides
— regroupement, CSV, graphiques — sont déjà des fonctions pures séparées, donc
directement extractibles vers `src/`. Le composant lui-même demandera un
découpage en sous-vues, les onglets étant depuis la 1.45.1 des vues à part
entière.

Le bloc des exercices est plus gros encore mais déjà structuré : cinq drills
autonomes autour d'un cadre commun. Il se découperait en fichiers de composants
plutôt qu'en modules `src/`.
