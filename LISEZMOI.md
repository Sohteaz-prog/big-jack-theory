# Tests de Big Jack Theory

## Lancer

```
npm install jsdom
node tests.mjs
```

Les tests lisent `big-jack-theory.html` — le fichier compilé, pas la source.
Recompilez avant de les lancer. Le code de sortie vaut 0 si tout passe.

## Ce qu'ils couvrent

1. **Les dix écrans** s'affichent avec un titre et du contenu.
2. **Les paramètres** sont réellement visibles depuis chaque page, et ne
   comptent pas comme une étape du parcours.
3. **Le bouton retour** du téléphone : onglet, page, accueil, avertissement,
   sortie au second appui.
4. **La fiche d'un système** rend la main à sa liste avant l'accueil.
5. **Les exercices** : remontée à l'ouverture, place retrouvée au retour,
   confirmation avant d'abandonner une série.
6. **Les décisions du tableau** sont exactes sur cinq mains de référence.
6 bis. **L'apparence** issue de la refonte : lettre colorée sur fond atténué,
   légende du tableau, cartouches d'état, chiffre du compteur en encre pleine,
   jauges avec cran de cible, titres en serif, barème sur dix cartes.
7. **Le journal** enregistre une session, exporte son CSV, sépare les milliers
   par une espace fine, et sa courbe cumulée porte aire, ligne de zéro et
   plus bas annoté.
8. **Le compteur** : cadre bien placé, clavier en colonnes, comptage effectif.
9. **Le sabot** expire au bout de dix minutes.
10. **Une sauvegarde ancienne** se restaure entièrement.

## Le point important

`affiche()` dans `outils.mjs` remonte la chaîne des parents pour vérifier
qu'aucun ancêtre n'est masqué. C'est ce qui distingue « présent dans le
document » de « visible à l'écran ».

Sans cela, les paramètres sont restés invisibles pendant vingt versions alors
que les tests les déclaraient présents. N'utilisez jamais `textContent` seul
pour affirmer qu'une chose s'affiche.

## L'historique simulé

`lancer()` reproduit un navigateur mobile qui **ignore les jalons d'historique
posés pendant le traitement du retour**. C'est le comportement réel d'Android,
et c'est ce qui faisait quitter l'application au bout de deux appuis.
