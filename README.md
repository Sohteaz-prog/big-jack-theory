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

**Paramètres** — Quatre sections dépliables, chacune résumant sa configuration
sans qu'on ait à l'ouvrir : votre table (paquets, coupe, règles, paiement,
mélangeur, mises), comptage, apparence et sons, limites de jeu. S'y ajoutent les
profils de table, la sauvegarde et le code de protection.

## Vos données

Réglages, journal et profil d'entraînement sont enregistrés automatiquement dans
le navigateur, et survivent aux mises à jour de l'application.

Le bouton **Sauvegarder** des Paramètres fait deux choses d'un coup : une copie
dans l'application, restaurable en un clic, et un fichier téléchargé à conserver
ailleurs. La date de la dernière sauvegarde est affichée.

**Restaurer** reprend la copie interne ; un lien permet de partir d'un fichier.

Deux réinitialisations sont proposées : **les réglages** seuls, ou
**l'application** entière — journal, entraînement, sauvegarde interne et code
compris, ce qui ramène à l'état d'une première installation.

Un code à quatre chiffres, facultatif, peut être exigé avant toute suppression.
Il protège des fausses manœuvres, non d'une personne déterminée : qui a accès à
l'appareil peut vider le stockage du navigateur sans passer par l'application.

En cas d'oubli, une **clé de secours** saisie à la place du code le retire. Elle
est définie dans `index.html`, à la ligne `CLE_SECOURS`, et se change en
republiant le fichier. Comme le reste du code source, elle est lisible par qui
ouvre le fichier : elle dépanne, elle ne protège pas.

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

Version actuelle : **1.64**, du 29 août 2026.

| | |
|---|---|
| 1.64 | sections des mises fermées à l'ouverture |
| 1.63 | lieux déjà saisis proposés dans le journal |
| 1.62 | page des mises réorganisée en trois sections |
| 1.61 | décompte automatique seulement si les neutres sont comptées |
| 1.60 | paquets restants déduits des cartes comptées |
| 1.59 | étiquettes hautes basculées sous leur point |
| 1.58 | montants annotés sur la courbe cumulée |
| 1.57 | correction d'une session directement sous sa ligne |
| 1.56 | pourcentage sur le résultat net, bloc « Plus de détails » |
| 1.55 | modification d'une session déjà enregistrée |
| 1.54 | dates de la courbe alignées sur ses extrémités |
| 1.53 | repères des graphiques allégés |
| 1.52 | montants sur les barres, dates sur la courbe |
| 1.51 | repères chiffrés sous les graphiques du journal |
| 1.50 | longueurs de série en menus déroulants |
| 1.49 | historique des séries visible même vide |
| 1.48 | défilé chronométré : cartes et vitesse en menus déroulants |
| 1.47 | titres de contrôles uniformisés dans toute l'application |
| 1.46 | libellés du calculateur de risque explicités |
| 1.45 | toutes les sections de paramètres fermées à l'ouverture |
| 1.44 | apparence et sons déplacés après les limites de jeu |
| 1.43 | accents plus francs en thème clair |
| 1.42 | deux thèmes casino : tapis vert et velours rouge |
| 1.41 | hiérarchie des fonds identique dans les deux thèmes |
| 1.40 | fond des sections dépliées plus contrasté |
| 1.39 | fond distinct pour les sections dépliées |
| 1.38 | section dépliée encadrée dans la continuité du liseré doré |
| 1.37 | démarcation des sections dépliées |
| 1.36 | correction de structure des paramètres, ajout de table clarifié |
| 1.35 | espérances calculées sur le total exact des lignes regroupées |
| 1.34 | recherche rapide dans la stratégie de base |
| 1.33 | titres distincts, contrastes renforcés, mains souples allégées |
| 1.32 | enregistrement d'une table déplacé en fin de page |
| 1.31 | checklist « Que relever à la table » |
| 1.30 | tables nommées : enregistrez vos relevés sous le nom du casino |
| 1.29 | profils physiques et européens en 6 et 8 paquets, coupe non supposée |
| 1.28 | profil « Casino terrestre — 8 paquets » |
| 1.27 | la réinitialisation complète ramène à l'accueil |
| 1.26 | sabot conservé trente minutes après une interruption |
| 1.25 | champs numériques corrigés, capital de jeu réglable |
| 1.24 | afficheurs clairs en thème clair, en-têtes de section adoucis |
| 1.23 | l'application rouvre sur le dernier écran consulté |
| 1.22 | doublement après séparation : effet réel sur le tableau, choix déplacé sur la page Stratégie |
| 1.21 | le calculateur de risque part des mises de votre table |
| 1.20 | clé de secours pour un code oublié |
| 1.19 | code exigé pour supprimer une session |
| 1.18 | suppression d'une session : confirmation en deux temps |
| 1.17 | sauvegarde unifiée, sept boutons ramenés à quatre |
| 1.16 | « Réinitialiser tout » devient « Réinitialiser l'application » |
| 1.15 | historique des séries : « tout effacer » rétabli |
| 1.14 | libellés de réinitialisation harmonisés |
| 1.13 | effacement total possible depuis l'application |
| 1.12 | « Tout effacer » renommé « Réinitialiser l'application » |
| 1.11 | paramètres réorganisés en sections dépliables |
| 1.10 | sauvegarde interne restaurable en un clic, date affichée |
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
