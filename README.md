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

Le numéro s'affiche en pied de page. Il s'écrit sur trois niveaux et suit l'ordre
chronologique : le troisième nombre avance tant qu'on retouche la même partie de
l'application, le deuxième dès qu'on passe à une autre. Un ajout majeur donnerait
2.0.1.

Version actuelle : **1.33.18**, du 30 août 2026.

| | |
|---|---|
| 1.33.18 | indicateurs du résultat net rapprochés |
| 1.33.17 | sessions perdantes et nulles détaillées |
| 1.33.16 | formulaire de saisie centré à l'ouverture, retour en haut à la fermeture |
| 1.33.15 | résultat nul affiché en neutre, sans signe |
| 1.33.14 | calculateur et progressions alignés sur « session » |
| 1.33.13 | périodes glissantes comptées depuis aujourd'hui |
| 1.33.12 | vocabulaire du journal uniformisé sur « session » |
| 1.33.11 | six durées de période, en menu déroulant |
| 1.33.10 | détail dépliable pour chaque lieu |
| 1.33.9 | indicateurs du résultat net en deux rangées de deux |
| 1.33.8 | période de six mois ajoutée au graphique |
| 1.33.7 | périodes de 28 jours au lieu de mois calendaires |
| 1.33.6 | résultat net et pourcentage sur une seule ligne |
| 1.33.5 | mise seule correctement libellée dans la liste des séances |
| 1.33.4 | à marge égale, tri par libération la plus proche |
| 1.33.3 | seule la première libération est affichée |
| 1.33.2 | prochaine libération annoncée en délai sur la ligne du site |
| 1.33.1 | libérations groupées par échéance, calcul suivant l'horloge |
| 1.32.1 | vert du thème clair plus lisible |
| 1.31.2 | pourcentage du résultat net à côté du montant |
| 1.31.1 | détail des sites raccourci pour les écrans étroits |
| 1.30.1 | « Big Jack » et « Theory » de même largeur sur mobile |
| 1.29.16 | filtre « Tous » au lieu de « Les deux » |
| 1.29.15 | filtre casinos / sites sur le tableau par lieu |
| 1.29.14 | réglages rattachés à « Par lieu » |
| 1.29.13 | lien de réglage masqué quand la section est repliée |
| 1.29.12 | section des dépôts repliable, total disponible en en-tête |
| 1.29.11 | sites triés par marge disponible, mention « épuisé » |
| 1.29.10 | dépliage confié au chevron, le lien reste au nom |
| 1.29.9 | détail de chaque site dépliable, heure de libération rétablie |
| 1.29.8 | rendement en pourcentage à côté de chaque résultat net |
| 1.29.7 | bloc des dépôts par site compacté |
| 1.29.6 | barres du graphique tactiles, valeur lisible au toucher |
| 1.29.5 | export et import rattachés au bloc des séances |
| 1.29.4 | correction du regroupement par jour selon le fuseau |
| 1.29.3 | export et import placés en fin de journal |
| 1.29.2 | adresse de site enregistrable, nom cliquable |
| 1.29.1 | journal : saisie repliée, séances groupées par semaine et par jour |
| 1.28.1 | numérotation à trois niveaux |
| 1.27.11 | explication des trois corrélations |
| 1.27.10 | correction du coin bas des cartes |
| 1.27.9 | enseignes des cartes agrandies |
| 1.27.8 | figures en lettres françaises R, D, V |
| 1.27.7 | cartes redessinées : enseignes aux coins, rang au centre |
| 1.27.6 | emblèmes dessinés pour le valet, la dame et le roi |
| 1.27.5 | note sur la couleur du sept pour le Red 7 |
| 1.27.4 | cartes à l'enseigne choisie dans les paramètres |
| 1.27.3 | figures dessinées dans la table des valeurs |
| 1.27.2 | table des valeurs regroupée par valeur, en cartes |
| 1.27.1 | grille des caractéristiques alignée en deux lignes pleines |
| 1.26.1 | textes corrigés et resserrés |
| 1.25.1 | textes du journal allégés |
| 1.24.4 | écran de préparation avant chaque exercice |
| 1.24.3 | sous-titres des exercices réécrits |
| 1.24.2 | lien vers la théorie depuis chaque exercice |
| 1.24.1 | exercice des indices : consigne et retour explicites |
| 1.23.4 | récapitulatif des dépôts par site, réglages repliés |
| 1.23.3 | gestion des lieux placée après la répartition par lieu |
| 1.23.2 | gestion des lieux et suivi du plafond de dépôt hebdomadaire |
| 1.23.1 | lieux déjà saisis proposés dans le journal |
| 1.22.2 | sections des mises fermées à l'ouverture |
| 1.22.1 | page des mises réorganisée en trois sections |
| 1.21.2 | décompte automatique seulement si les neutres sont comptées |
| 1.21.1 | paquets restants déduits des cartes comptées |
| 1.20.9 | pourcentage sur le résultat net, bloc « Plus de détails » |
| 1.20.8 | correction d'une session directement sous sa ligne |
| 1.20.7 | modification d'une session déjà enregistrée |
| 1.20.6 | étiquettes hautes basculées sous leur point |
| 1.20.5 | montants annotés sur la courbe cumulée |
| 1.20.4 | dates de la courbe alignées sur ses extrémités |
| 1.20.3 | repères des graphiques allégés |
| 1.20.2 | montants sur les barres, dates sur la courbe |
| 1.20.1 | repères chiffrés sous les graphiques du journal |
| 1.19.3 | historique des séries visible même vide |
| 1.19.2 | longueurs de série en menus déroulants |
| 1.19.1 | défilé chronométré : cartes et vitesse en menus déroulants |
| 1.18.1 | titres de contrôles uniformisés dans toute l'application |
| 1.17.1 | libellés du calculateur de risque explicités |
| 1.16.2 | toutes les sections de paramètres fermées à l'ouverture |
| 1.16.1 | apparence et sons déplacés après les limites de jeu |
| 1.15.7 | accents plus francs en thème clair |
| 1.15.6 | deux thèmes casino : tapis vert et velours rouge |
| 1.15.5 | hiérarchie des fonds identique dans les deux thèmes |
| 1.15.4 | fond des sections dépliées plus contrasté |
| 1.15.3 | fond distinct pour les sections dépliées |
| 1.15.2 | section dépliée encadrée dans la continuité du liseré doré |
| 1.15.1 | démarcation des sections dépliées |
| 1.14.2 | espérances calculées sur le total exact des lignes regroupées |
| 1.14.1 | recherche rapide dans la stratégie de base |
| 1.13.1 | correction de structure des paramètres, ajout de table clarifié |
| 1.12.1 | titres distincts, contrastes renforcés, mains souples allégées |
| 1.11.7 | enregistrement d'une table déplacé en fin de page |
| 1.11.6 | checklist « Que relever à la table » |
| 1.11.5 | tables nommées : enregistrez vos relevés sous le nom du casino |
| 1.11.4 | profils physiques et européens en 6 et 8 paquets, coupe non supposée |
| 1.11.3 | profil « Casino terrestre — 8 paquets » |
| 1.11.2 | la réinitialisation complète ramène à l'accueil |
| 1.11.1 | champs numériques corrigés, capital de jeu réglable |
| 1.10.1 | afficheurs clairs en thème clair, en-têtes de section adoucis |
| 1.9.1 | sabot conservé trente minutes après une interruption |
| 1.8.1 | l'application rouvre sur le dernier écran consulté |
| 1.7.2 | doublement après séparation : effet réel sur le tableau |
| 1.7.1 | le calculateur de risque part des mises de votre table |
| 1.6.3 | paramètres réorganisés en sections dépliables |
| 1.6.2 | paquets restreints à 4, 6 et 8 |
| 1.6.1 | clé de secours pour un code oublié |
| 1.5.2 | code exigé pour supprimer une session |
| 1.5.1 | suppression d'une session : confirmation en deux temps |
| 1.4.2 | sauvegarde unifiée, sept boutons ramenés à quatre |
| 1.4.1 | « Réinitialiser tout » devient « Réinitialiser l'application » |
| 1.3.1 | historique des séries : « tout effacer » rétabli |
| 1.2.9 | libellés de réinitialisation harmonisés |
| 1.2.8 | effacement total possible depuis l'application |
| 1.2.7 | « Tout effacer » renommé « Réinitialiser l'application » |
| 1.2.6 | sauvegarde interne restaurable en un clic, date affichée |
| 1.2.5 | retouches de formulation |
| 1.2.4 | textes du code de protection resserrés |
| 1.2.3 | code de protection des suppressions |
| 1.2.2 | réinitialisation totale |
| 1.2.1 | sauvegarde complète et restauration |
| 1.1.1 | noms d'exercices harmonisés |
| 1.0.3 | correction du défilement au rechargement |
| 1.0.2 | contraste des afficheurs en thème sombre |
| 1.0.1 | première publication |

## Licence

Tous droits réservés. Voir `LICENSE.txt`.

La redistribution, l'exploitation commerciale et les œuvres dérivées sont
interdites sans autorisation écrite. La consultation du code à des fins d'étude
personnelle est libre.
