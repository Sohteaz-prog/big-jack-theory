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

- **1.0, 1.1, 1.2 …** — sujet différent : un autre écran, un autre réglage, une
  correction sans rapport avec la précédente.
- **1.84.1, 1.84.2 …** — retouche du sujet qu'on vient de traiter : on affine, on
  corrige ce qu'on a introduit, on revient dessus.
- **2.0** — ajout majeur : nouvel écran, nouvel exercice, nouveau moteur de calcul.

Version actuelle : **1.34**, du 30 août 2026.

| | |
|---|---|
| 1.34 | journal : saisie repliée, séances groupées par semaine et par jour |
| 1.33.1 | numérotation à trois niveaux |
| 1.33 | explication des trois corrélations |
| 1.32.8 | correction du coin bas des cartes |
| 1.32.7 | enseignes des cartes agrandies |
| 1.32.6 | figures en lettres françaises R, D, V |
| 1.32.5 | cartes redessinées : enseignes aux coins, rang au centre |
| 1.32.4 | emblèmes dessinés pour le valet, la dame et le roi |
| 1.32.3 | note sur la couleur du sept pour le Red 7 |
| 1.32.2 | cartes à l'enseigne choisie dans les paramètres |
| 1.32.1 | figures dessinées dans la table des valeurs |
| 1.32 | table des valeurs regroupée par valeur, en cartes |
| 1.31 | grille des caractéristiques alignée en deux lignes pleines |
| 1.30.1 | textes corrigés et resserrés |
| 1.30 | textes du journal allégés |
| 1.29.2 | écran de préparation avant chaque exercice |
| 1.29.1 | sous-titres des exercices réécrits |
| 1.29 | lien vers la théorie depuis chaque exercice |
| 1.28 | exercice des indices : consigne et retour explicites |
| 1.27.2 | récapitulatif des dépôts par site, réglages repliés |
| 1.27.1 | gestion des lieux placée après la répartition par lieu |
| 1.27 | gestion des lieux et suivi du plafond de dépôt hebdomadaire |
| 1.26 | lieux déjà saisis proposés dans le journal |
| 1.25.1 | sections des mises fermées à l'ouverture |
| 1.25 | page des mises réorganisée en trois sections |
| 1.24.1 | décompte automatique seulement si les neutres sont comptées |
| 1.24 | paquets restants déduits des cartes comptées |
| 1.23 | pourcentage sur le résultat net, bloc « Plus de détails » |
| 1.22.1 | correction d'une session directement sous sa ligne |
| 1.22 | modification d'une session déjà enregistrée |
| 1.21.5 | étiquettes hautes basculées sous leur point |
| 1.21.4 | montants annotés sur la courbe cumulée |
| 1.21.3 | dates de la courbe alignées sur ses extrémités |
| 1.21.2 | repères des graphiques allégés |
| 1.21.1 | montants sur les barres, dates sur la courbe |
| 1.21 | repères chiffrés sous les graphiques du journal |
| 1.20 | historique des séries visible même vide |
| 1.19.1 | longueurs de série en menus déroulants |
| 1.19 | défilé chronométré : cartes et vitesse en menus déroulants |
| 1.18.1 | titres de contrôles uniformisés dans toute l'application |
| 1.18 | libellés du calculateur de risque explicités |
| 1.17.1 | toutes les sections de paramètres fermées à l'ouverture |
| 1.17 | apparence et sons déplacés après les limites de jeu |
| 1.16.1 | accents plus francs en thème clair |
| 1.16 | deux thèmes casino : tapis vert et velours rouge |
| 1.15.4 | hiérarchie des fonds identique dans les deux thèmes |
| 1.15.3 | fond des sections dépliées plus contrasté |
| 1.15.2 | fond distinct pour les sections dépliées |
| 1.15.1 | section dépliée encadrée dans la continuité du liseré doré |
| 1.15 | démarcation des sections dépliées |
| 1.14.1 | espérances calculées sur le total exact des lignes regroupées |
| 1.14 | recherche rapide dans la stratégie de base |
| 1.13.6 | correction de structure des paramètres, ajout de table clarifié |
| 1.13.5 | titres distincts, contrastes renforcés, mains souples allégées |
| 1.13.4 | enregistrement d'une table déplacé en fin de page |
| 1.13.3 | checklist « Que relever à la table » |
| 1.13.2 | tables nommées : enregistrez vos relevés sous le nom du casino |
| 1.13.1 | profils physiques et européens en 6 et 8 paquets, coupe non supposée |
| 1.13 | profil « Casino terrestre — 8 paquets » |
| 1.12 | la réinitialisation complète ramène à l'accueil |
| 1.11 | champs numériques corrigés, capital de jeu réglable |
| 1.10 | afficheurs clairs en thème clair, en-têtes de section adoucis |
| 1.9.1 | sabot conservé trente minutes après une interruption |
| 1.9 | l'application rouvre sur le dernier écran consulté |
| 1.8 | doublement après séparation : effet réel sur le tableau |
| 1.7 | le calculateur de risque part des mises de votre table |
| 1.6 | paramètres réorganisés en sections dépliables |
| 1.5 | paquets restreints à 4, 6 et 8 |
| 1.4.14 | clé de secours pour un code oublié |
| 1.4.13 | code exigé pour supprimer une session |
| 1.4.12 | suppression d'une session : confirmation en deux temps |
| 1.4.11 | sauvegarde unifiée, sept boutons ramenés à quatre |
| 1.4.10 | « Réinitialiser tout » devient « Réinitialiser l'application » |
| 1.4.9 | historique des séries : « tout effacer » rétabli |
| 1.4.8 | libellés de réinitialisation harmonisés |
| 1.4.7 | effacement total possible depuis l'application |
| 1.4.6 | « Tout effacer » renommé « Réinitialiser l'application » |
| 1.4.5 | sauvegarde interne restaurable en un clic, date affichée |
| 1.4.4 | retouches de formulation |
| 1.4.3 | textes du code de protection resserrés |
| 1.4.2 | code de protection des suppressions |
| 1.4.1 | réinitialisation totale |
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
