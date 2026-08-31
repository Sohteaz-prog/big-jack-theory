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

Version actuelle : **1.42.20**, du 31 août 2026.

| | |
|---|---|
| 1.42.20 | retour matériel : tampon de deux jalons, plus de sortie brutale |
| 1.42.19 | retour matériel : jalons posés une seule fois, sortie fiable |
| 1.42.18 | plafond de dépôt : la valeur prend la couleur de sa barre |
| 1.42.17 | le retour repasse par l'onglet précédent du journal |
| 1.42.16 | le retour suit l'historique des pages consultées |
| 1.42.15 | retour graduel des exercices, confirmation seulement si engagé |
| 1.42.14 | logo en ligne sur l'accueil, suivant l'enseigne choisie |
| 1.42.13 | logo en tête de la page d'accueil |
| 1.42.12 | espacement des titres uniformisé sur toutes les pages |
| 1.42.11 | page d'accueil alignée sur la nouvelle structure |
| 1.42.10 | retour depuis un exercice : confirmation puis menu, en haut |
| 1.42.9 | retour matériel : confirmation avant de quitter un exercice |
| 1.42.8 | retour Android depuis une fiche : passe par la liste des systèmes |
| 1.42.7 | fiche et retour : remontée en haut sans mouvement parasite |
| 1.42.6 | onglet Fiche retiré : elle s'ouvre depuis la liste des systèmes |
| 1.42.5 | systèmes : détail centré et refermable, position retrouvée au retour |
| 1.42.4 | barre basse : colonnes ajustées au nombre d'onglets |
| 1.42.3 | mouvements parasites au focus et au changement de tableau |
| 1.42.2 | renvois croisés vérifiés après réorganisation |
| 1.42.1 | pages réorganisées par moment d'usage |
| 1.41.5 | toucher la recherche remonte pour rendre la réponse visible |
| 1.41.4 | bandeau de lecture à la demande, centrage au dépliage et au changement de tableau |
| 1.41.3 | réglages de stratégie repliés avec résumé |
| 1.41.2 | un seul tableau à la fois, la recherche bascule dessus |
| 1.41.1 | recherche de main : clavier numérique et bouton as |
| 1.40.15 | lancement accéléré, jeton correct en thème sombre |
| 1.40.14 | page icones.html pour changer l'icône sans réinstaller |
| 1.40.13 | écran de lancement avec le jeton et le nom courbé |
| 1.40.12 | « The » ajouté au titre de l'en-tête, à l'essai |
| 1.40.11 | historique filtrable par exercice, le défilé y figure enfin |
| 1.40.10 | séries et profil réunis dans « Votre progression » |
| 1.40.9 | quitter un exercice demande confirmation et ramène au menu |
| 1.40.8 | Commencer centré, repli en cartouche, exercice conservé au changement de page |
| 1.40.7 | code mort retiré après harmonisation des exercices |
| 1.40.6 | les cinq accueils d'exercice harmonisés, réglages compacts |
| 1.40.4 | accueil commun aux exercices, appliqué à Valeur de carte |
| 1.40.3 | « Prêt pour la table » aligné sur le résultat net du journal |
| 1.40.2 | titres des exercices un cran sous ceux des pages |
| 1.40.1 | exercices : remontée au choix, exercice conservé au rafraîchissement |
| 1.39.51 | fond des sections adouci, distinction portée par le bord |
| 1.39.50 | textes de la section Limites de jeu allégés de moitié |
| 1.39.49 | sections distinguées par le fond plutôt que par un filet |
| 1.39.48 | section Comptage compactée en deux colonnes |
| 1.39.47 | cadres fixes distingués des sections repliables |
| 1.39.46 | titres des cadres non repliables harmonisés |
| 1.39.45 | aides du jeu de sons et du tic mises à la même longueur |
| 1.39.44 | phrase d'introduction des paramètres remise à jour |
| 1.39.43 | enseigne en minuscule dans le résumé de section |
| 1.39.42 | section « Apparence et sons » renommée « Thème et sons » |
| 1.39.41 | résumé de la section aligné sur le libellé du menu |
| 1.39.40 | tous les titres de page à la même taille |
| 1.39.39 | « Suivre le système » raccourci en « Système » |
| 1.39.38 | deux colonnes aussi sur téléphone dans Apparence et sons |
| 1.39.37 | titre « Choix de la table » aligné sur les titres de section |
| 1.39.36 | jeu de sons et tic toujours visibles |
| 1.39.35 | phrase obsolète retirée de la gestion des tables |
| 1.39.34 | Théorie avant Journal dans la barre de navigation |
| 1.39.33 | contour doré des sections ouvertes retiré |
| 1.39.32 | aide du jeu de sons limitée au choix actif |
| 1.39.31 | « Apparence et sons » compactée en deux colonnes |
| 1.39.30 | paramètres : un seul panneau déplié, tout se ferme en quittant |
| 1.39.29 | paramètres : sections centrées à l'ouverture, gestion refermée au clic ailleurs |
| 1.39.28 | phrase d'introduction du choix de table retirée |
| 1.39.27 | lien « Détails » déplacé sur la ligne du choix de la table |
| 1.39.26 | « Vos mises » migré des règles de table vers les limites de jeu |
| 1.39.25 | supprimer la table active ramène à la première préenregistrée |
| 1.39.24 | mélangeur inconnu : libellé aligné sur la carte de coupe |
| 1.39.23 | section des règles remplacée par une fenêtre de détails |
| 1.39.22 | bloc de gestion redondant retiré des paramètres |
| 1.39.21 | mélange clarifié, carte de coupe masquée sur mélangeur continu |
| 1.39.20 | « Ajouter une table » devient « Créer une table » |
| 1.39.19 | numérotation des tables par ordre de création |
| 1.39.18 | « Mises de la table » renommé « Vos mises » |
| 1.39.17 | nom par défaut « Table 1, 2, 3… » si aucun n'est saisi |
| 1.39.16 | nouvelle table : partir d'une table préenregistrée comme modèle |
| 1.39.15 | « Points de départ » renommé « Tables préenregistrées » |
| 1.39.14 | lignes de tables sur le modèle des sessions : crayon et croix |
| 1.39.13 | « Table inconnue » retirée, tables perso sous les profils |
| 1.39.12 | tables créées et modifiées dans une fenêtre, sur un brouillon |
| 1.39.11 | tables et lieux inclus dans la sauvegarde et la réinitialisation |
| 1.39.10 | « Gérer mes tables » en lien discret, comme « Régler les lieux » |
| 1.39.9 | panneau « Gérer mes tables » : renommer, modifier, supprimer |
| 1.39.8 | phrase d'introduction des paramètres raccourcie |
| 1.39.7 | « Enregistrer cette table » placé en pied de la section des règles |
| 1.39.6 | libellés des tables personnalisées précisés |
| 1.39.5 | descriptions des réglages raccourcies |
| 1.39.4 | paramètres : ouverture en haut, profils renommés, confirmation centrée |
| 1.39.3 | typographie des onglets uniformisée sur les trois pages |
| 1.39.2 | marge basse du gabarit retirée des bandes d'onglets |
| 1.39.1 | bandes d'onglets de Stratégie et Théorie affinées à 28 px |
| 1.38.19 | la croix referme bien une correction sans modification |
| 1.38.18 | fermeture des paramètres à 90 ms |
| 1.38.17 | ouverture et fermeture des paramètres accélérées |
| 1.38.16 | les paramètres remontent en se fermant |
| 1.38.15 | les paramètres ne referment plus le formulaire d'encodage |
| 1.38.14 | remontée avant le rendu : plus aucun mouvement au changement d'onglet |
| 1.38.13 | les paramètres descendent par-dessus la page |
| 1.38.12 | les paramètres se superposent au journal sans le réinitialiser |
| 1.38.10 | les panneaux se referment au changement d'onglet |
| 1.38.9 | changement d'onglet : saut direct en haut, sans animation |
| 1.38.8 | panneaux exclusifs, repli sans saut, « Limites de dépôt » |
| 1.38.7 | signe + retiré des lignes de site |
| 1.38.6 | ligne de site entièrement cliquable, lien en bouton dans le détail |
| 1.38.5 | filtre sur une seule ligne, y compris sur téléphone |
| 1.38.4 | le balayage remonte en haut, comme les boutons d'onglet |
| 1.38.3 | plus de saut quand un panneau s'ouvre pendant que les réglages se referment |
| 1.38.2 | huit corrections du journal : dépôts, onglets, rappel, ancrage, lien, montant |
| 1.38.1 | logo en jeton de casino, enseignes des cartes redevenues aléatoires |
| 1.37.6 | icône disquette pour le bouton de sauvegarde |
| 1.37.5 | bouton de sauvegarde dans l'en-tête, à côté de l'engrenage |
| 1.37.4 | rappel de sauvegarde : pastille sur l'engrenage au-delà de 14 jours |
| 1.37.3 | onglet « Systèmes » renommé et placé en tête de Théorie |
| 1.37.2 | sous-onglets et balayage généralisés à Stratégie et Théorie |
| 1.37.1 | bouton retour : ferme la fenêtre, le formulaire, un panneau, puis la page |
| 1.36.19 | résultat net rappelé sous le résumé du filtre |
| 1.36.18 | formulaire vide refermé sans confirmation quand on va ailleurs |
| 1.36.17 | rappel glissé entre les deux onglets, barre à hauteur fixe |
| 1.36.16 | menus déroulants bloqués avant de s'ouvrir sur la fenêtre |
| 1.36.15 | compression des onglets accrue, le balayage compense |
| 1.36.14 | onglets comprimés sur la même progression que le rappel |
| 1.36.13 | barre des onglets recalée : le journal n'a pas de sous-navigation |
| 1.36.12 | barre des onglets calée sous l'en-tête, elle ne disparaît plus |
| 1.36.11 | titres Récapitulatif et Sessions retirés, les onglets suffisent |
| 1.36.10 | rappel sorti du flux : la page ne descend plus |
| 1.36.9 | deux onglets au lieu de trois, Général fondu dans Analyse |
| 1.36.8 | texte du rappel affiché seulement quand la barre est assez haute |
| 1.36.7 | l'abandon laisse la page où elle est |
| 1.36.6 | « Continuer » ramène au formulaire repris |
| 1.36.5 | filtre commun au-dessus des onglets, encodage dans Sessions |
| 1.36.4 | retour de focus sans défilement après la fenêtre de confirmation |
| 1.36.3 | changement d'onglet par balayage latéral |
| 1.36.2 | rappel du filtre déplié progressivement au défilement |
| 1.36.1 | trois sous-onglets dans le journal, filtre commun rappelé en barre collée |
| 1.35.37 | Récapitulatif et Sessions renforcés ensemble |
| 1.35.36 | barre déposé/retiré à la place des quatre indicateurs |
| 1.35.35 | en-tête « Sessions » aligné sur « Récapitulatif » |
| 1.35.34 | étiquettes du bloc résultat harmonisées |
| 1.35.33 | titre du récapitulatif harmonisé avec les autres |
| 1.35.32 | titre « Résultat net » agrandi |
| 1.35.31 | saisie limitée aux chiffres, clavier numérique forcé |
| 1.35.30 | titre du récapitulatif distingué de ses filtres |
| 1.35.29 | résultat net agrandi et épaissi |
| 1.35.28 | données abîmées écartées au chargement |
| 1.35.27 | paragraphe oublié retiré du formulaire |
| 1.35.26 | plus de confirmation demandée sur un formulaire vide |
| 1.35.25 | fenêtre de confirmation adaptée à la saisie neuve |
| 1.35.24 | saisie protégée : confirmation avant tout appui qui la perdrait |
| 1.35.23 | bornes de la période affichées sous le graphique |
| 1.35.22 | note et contrôle automatique sur les deux copies du formulaire |
| 1.35.21 | textes explicatifs remplacés par « (facultatif) » |
| 1.35.20 | centrage des panneaux nettement plus rapide |
| 1.35.19 | texte de l'export adouci sur les thèmes foncés |
| 1.35.18 | légende retirée sous le graphique en barres |
| 1.35.17 | boutons d'action du journal en capitales |
| 1.35.16 | texte de l'export renforcé |
| 1.35.15 | export et import sur fond nettement plus creusé |
| 1.35.14 | bouton d'encodage en capitales |
| 1.35.13 | export et import distingués visuellement |
| 1.35.12 | confirmation d'abandon en fenêtre centrée |
| 1.35.11 | bouton Annuler en rouge |
| 1.35.10 | crayon et Annuler partagent la même confirmation |
| 1.35.8 | le crayon referme la correction, avec confirmation si besoin |
| 1.35.7 | l'appui visé agit avant la fermeture des réglages |
| 1.35.6 | réglages des lieux amenés à l'écran à l'ouverture |
| 1.35.5 | réglages fermés seulement par une action, pas par un appui dans le vide |
| 1.35.4 | panneaux dépliés amenés à l'écran |
| 1.35.3 | réglages des lieux fermés au toucher extérieur |
| 1.35.2 | champs de dates placés sous leur propre menu |
| 1.35.1 | tableau par lieu conservé avec un seul lieu |
| 1.34.1 | délai de tap retiré sur les champs et menus |
| 1.33.35 | champ d'adresse renommé « Lien » |
| 1.33.34 | filtre casinos ou sites dans le récapitulatif |
| 1.33.33 | adresse enregistrable aussi pour les casinos physiques |
| 1.33.32 | ordre des phrases retiré au sort à chaque cycle |
| 1.33.31 | sept phrases d'intro du journal, une par jour |
| 1.33.30 | « Encoder une session » devient un vrai bouton |
| 1.33.29 | échéances suivantes affichées dans le détail d'un site |
| 1.33.28 | note explicative des dépôts retirée |
| 1.33.27 | panneau de correction centré à l'ouverture |
| 1.33.26 | note des dépôts simplifiée |
| 1.33.25 | retour sur la session corrigée après mise à jour |
| 1.33.24 | noms de fichiers datés en heure locale |
| 1.33.23 | découpage du graphique en menu déroulant |
| 1.33.22 | bornes du filtre calées sur les jours pleins |
| 1.33.21 | liens soulignés uniformisés avec une majuscule |
| 1.33.20 | granularité du graphique ramenée à jour, semaine, mois |
| 1.33.19 | filtre de période aligné sur les blocs de 28 jours |
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
