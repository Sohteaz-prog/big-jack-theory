# Big Jack Theory — système visuel actuel

Document de référence à donner à un outil de design, avec des captures d'écran
de l'application. Il décrit ce qui existe, pas ce qu'il faut faire.

## Ce qu'est l'application

Un compagnon de blackjack pour téléphone : tableau de stratégie, compteur de
cartes en direct, exercices d'entraînement, journal de sessions. Elle s'utilise
en deux contextes très différents — **debout à une table de casino**, où il faut
lire vite et discrètement, et **assis chez soi**, pour apprendre et consulter.

Quatre pages : À la table, S'entraîner, Comprendre, Journal.

## Couleurs

Deux thèmes, clair et sombre, en variables CSS.

**Clair** — papier `#DCDDD7`, panneaux `#F2F2EE`, encre `#14171A`, encre
secondaire `#5C6066`, filets `#C3C4BC`.

**Sombre** — papier `#0F1114`, panneaux `#191C21`, encre `#E7E8E3`, encre
secondaire `#939AA2`, filets `#2C3138`.

**Accents, communs aux deux** — rouge `#B81528` (perte, alerte), bleu `#20419E`
(sélection), doré `#856806` (seuil intermédiaire), vert `#218337` (gain).

**Le compteur a sa propre palette**, plus sourde : un « écran » gris-vert en
clair (`#C7C8C0`), presque noir en sombre (`#07090B`). C'est le seul écran
traité comme un instrument plutôt que comme une page.

## Typographie

Trois familles, chacune avec un rôle strict.

**Bricolage Grotesque 800** — tout ce qui nomme : titres de page, titres de
section, nom de l'application. Interlettrage resserré (−.02em).

**Public Sans 400/500/700** — tout ce qui se lit : paragraphes, descriptions,
libellés de formulaire.

**JetBrains Mono** — tout ce qui se chiffre : compte courant, pourcentages,
montants, valeurs de cartes.

**Titres de page** : `clamp(26px, 6.4vw, 44px)`, graisse 800.
**Étiquettes** : 10 px, interlettrage .12em, majuscules, graisse 700. Un seul
style pour toute l'application.

## Formes

Rayon de bordure de 3 px seulement — quasiment carré. Bordures de 1 px sur les
filets. Panneaux à fond uni sans ombre, sauf les fenêtres modales.

Bordure gauche de 3 px colorée pour signaler un état : rouge pour l'élément
actif, bleu pour l'élément déplié, doré pour une alerte.

## Gestes et animations

Animations très courtes : 140 à 180 ms, jamais plus. Ouverture d'un panneau,
descente des paramètres, apparition d'une fenêtre. Tout est désactivé si le
système demande une réduction des animations.

Un seul panneau déplié à la fois, partout. Toute interaction ailleurs referme
ce qui était ouvert.

## Ce qui est délibérément sobre

Le tableau des mains et le compteur sont dépouillés à dessein : on les consulte
en quelques secondes, parfois discrètement, souvent en pleine lumière. Rien ne
doit y ralentir la lecture.

## Ce qui pourrait porter davantage de caractère

Les écrans qu'on consulte à froid : la page d'accueil, les cartes des cinq
exercices, la liste des neuf systèmes, la page des façons de miser. Ce sont eux
qui manquent aujourd'hui d'identité.

## Signe distinctif existant

Un jeton de casino dessiné en SVG, décliné selon l'enseigne choisie par
l'utilisateur — pique, cœur, carreau, trèfle. Huit créneaux, un anneau
intérieur, l'enseigne évidée au centre. Il sert d'icône d'application, d'écran
de lancement et de logo sur l'accueil, accompagné du nom sur deux lignes de
même largeur.
