# Big Jack Theory

Application web d'apprentissage du blackjack : stratégie de base calculée,
compteur de cartes, exercices chronométrés et journal de sessions.

Tout fonctionne hors ligne. Aucune donnée n'est transmise : réglages, journal et
progression restent dans le navigateur de l'appareil.

## Ce que contient l'application

**Stratégie** — Le tableau des mains dures, souples et paires, avec l'espérance
de chaque option calculée pour vos règles de table. Une section distincte
examine les progressions de mise et un calculateur de risque de ruine, qui
compare les six façons de miser avec votre unité et votre capital.

**Compteur** — Neuf systèmes : Hi-Lo, KO, Red 7, Hi-Opt I et II, Omega II, Zen,
Wong Halves, Ace-Five. Compte courant, vrai compte, pénétration, mise indicative
et gain horaire selon la profondeur de coupe.

**Exercices** — Cinq entraînements : stratégie de base, valeur de carte, défilé
chronométré, vrai compte, indices de déviation. Séries de longueur choisie avec
bilan, suivi des erreurs classées par coût, et un indicateur « prêt pour la
table » fondé sur vos dernières réponses plutôt que sur votre historique
complet.

**Journal** — Sessions, résultat net, rendement mesuré rapporté aux sommes
engagées, courbe cumulée, comparaison par lieu, filtres par période, plafond de
perte, export et import CSV.

**Théorie** — Fiche détaillée par système, comparatif des neuf, lexique de
26 entrées, bibliographie.

**Paramètres** — Profils de table, relevé des sept points à vérifier sur place,
sauvegarde complète, code de protection des suppressions.

## Vos données

Réglages, journal et profil d'entraînement sont enregistrés automatiquement dans
le navigateur, et survivent aux mises à jour de l'application.

Ils sont en revanche liés à l'adresse d'où l'application est ouverte : changer
d'hébergement ou vider les données du navigateur les rend inaccessibles. Les
Paramètres proposent donc **Télécharger une sauvegarde**, un fichier contenant
l'ensemble, et **Restaurer** pour le relire. Faites-en une avant tout changement.

Un code à quatre chiffres, facultatif, peut être exigé avant toute suppression.
Il protège des fausses manœuvres, non d'une personne déterminée : qui a accès à
l'appareil peut vider le stockage du navigateur sans passer par l'application.

## Origine des chiffres

Les espérances sont calculées par l'application, par énumération combinatoire du
sabot. Elles ont été confrontées à l'appendice 9 du Wizard of Odds : écart
maximal de 0,14 point sur rester et tirer, 0,34 sur doubler.

Les caractéristiques des systèmes de comptage proviennent de l'Encyclopedia of
Blackjack de Michael Dalton et du comparatif d'Arnold Snyder. Les indices de
déviation viennent de Blackjack Attack de Don Schlesinger.

La section Paramètres détaille la provenance de chaque chiffre et les limites
connues du moteur.

## Une mise en garde

Le blackjack reste un jeu à espérance négative pour qui ne compte pas, et le
comptage n'est rentable que dans des conditions précises — pénétration
suffisante, blackjack payé 3:2, absence de mélangeur continu. La plupart des
tables, en ligne comme en salle, ne les réunissent pas.

Cette application sert à mesurer et à s'entraîner. Elle ne promet aucun gain, et
le journal existe précisément pour que les résultats réels soient visibles plutôt
que reconstitués de mémoire.

## Versions

Le numéro s'affiche en pied de page et dans les paramètres. Il permet de vérifier
qu'une mise à jour publiée a bien remplacé l'ancienne.

- **1.0, 1.1, 1.2 …** — ajustements, corrections, réglages, retouches d'écran.
- **2.0** — ajout majeur : nouvel écran, nouvel exercice, nouveau moteur de calcul.

Version actuelle : **1.9**, du 29 août 2026.

| | |
|---|---|
| 1.9 | retouches de formulation |
| 1.8 | textes du code de protection resserrés |
| 1.7 | paquets restreints à 4, 6 et 8 — le simple et le double paquet ont disparu d'Europe |
| 1.6 | code de protection des suppressions |
| 1.5 | réinitialisation totale |
| 1.4 | sauvegarde complète et restauration |
| 1.3 | noms d'exercices harmonisés |
| 1.2 | correction du défilement au rechargement |
| 1.1 | contraste des afficheurs en thème sombre |
| 1.0 | première publication |

## Licence

Tous droits réservés. Voir `LICENSE.txt`.

La redistribution, l'exploitation commerciale et les œuvres dérivées sont
interdites sans autorisation écrite. La consultation du code à des fins d'étude
personnelle est libre.
