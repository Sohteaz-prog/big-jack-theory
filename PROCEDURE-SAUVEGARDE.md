# Sauvegarde et versions — Big Jack Theory

## Pourquoi ce document

Le 29 août 2026, une modification a supprimé 1 850 lignes du code source sans que la
compilation ne signale quoi que ce soit. Aucune copie n'existait : le fichier HTML
et les copies de travail avaient toutes été écrasées par la même opération. La
reconstruction a pris plusieurs étapes et n'a été validée que par un audit ligne à ligne.

Ce document décrit ce qui a été mis en place pour que cela ne se reproduise pas.

## Côté code — versions horodatées

Un script `sauvegarder.sh` archive le composant React et le fichier HTML dans un
dossier daté, avec une note décrivant l'état :

    ./sauvegarder.sh "description de l'état"

Chaque archive contient `compteur-blackjack.jsx`, `big-jack-theory.html` et `note.txt`.
Un fichier `journal.txt` liste toutes les versions avec leur nombre de lignes — une
chute brutale du nombre de lignes est le signal d'alerte qui manquait.

La règle : archiver **avant** toute modification, pas après.

## Ce que la compilation ne détecte pas

`esbuild` valide la syntaxe, pas la cohérence. Un fichier amputé de la moitié de ses
fonctions compile sans un mot. Les deux contrôles qui, eux, l'auraient vu :

- compter les définitions attendues (`grep -c "^function"`) et comparer au nombre de lignes ;
- exécuter le fichier dans un navigateur simulé et lire les erreurs JavaScript.

Le second est décisif : c'est lui qui a produit « PROFILS is not defined ».

## Côté données — vos sessions

Le bouton **Exporter en CSV** de l'onglet Historique produit un fichier lisible par
tout tableur, séparateur point-virgule, montants à la virgule française.

## Sauvegarde complète

Depuis la version 1.4, les Paramètres proposent **Télécharger une sauvegarde** :
un fichier JSON contenant réglages, journal des sessions et profil d'entraînement.
Le bouton **Restaurer** le relit et remet tout en place.

C'est la seule protection contre le cas le plus courant : changer d'adresse
d'hébergement, ce qui donne une application vide sans avertissement. Le stockage
du navigateur est lié à l'adresse exacte, et les anciennes données restent
inaccessibles.

Faites-en une avant tout changement d'hébergement, et de temps en temps par
précaution.

## Export CSV du journal

Le bouton **Importer** relit un fichier de ce format et fusionne les sessions avec
celles déjà enregistrées. Les sessions identiques — même date, même dépôt, même
retrait — ne sont jamais dupliquées, et les lignes illisibles sont comptées puis
ignorées plutôt que d'interrompre l'import.

Exportez après chaque série de sessions et conservez le fichier ailleurs que sur le
téléphone. Le stockage du navigateur est lié à l'emplacement du fichier HTML : le
déplacer, le retélécharger ailleurs ou vider les données du navigateur efface
l'historique sans avertissement. Avec l'export et l'import, cette perte devient
réparable — sans eux, elle est définitive.
