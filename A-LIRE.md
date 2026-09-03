# Mise à jour GitHub — 1.47.8

Le dépôt est en **1.45.20**. Cette livraison le porte en **1.47.8** : les
parties 46 (journal, alerte de plafond de perte, formulaire de session) et
47 (exercices).

**Aucune manipulation préalable.** `index.html` est votre fichier compilé,
déjà en 1.47.8 — il n'a pas été recompilé ni modifié.

---

## Vérifications faites

| | |
|---|---|
| `index.html` contient 1.47.8 | oui |
| `sw.js` : cache `big-jack-theory-1.47.8` | oui |
| `<div id="racine">` présent avant le script | oui |
| Suite de tests sur le bundle | 99 passées, 0 échouée |

---

## Envoi

Sur la page du dépôt : **Add file** → **Upload files**, glisser le contenu
de ce dossier — les fichiers eux-mêmes, pas le dossier qui les contient —
puis **Commit changes**. GitHub écrase ce qui porte le même nom.

Les icônes et `LICENSE` ne sont pas là : elles n'ont pas changé depuis la
1.45.20 et sont déjà en ligne. Inutile de les redéposer.

---

## Vérification sur le téléphone

Connecté : ouvrir l'application, la **fermer entièrement**, la rouvrir. Le
service worker interroge le réseau en priorité pour la page, donc la
nouvelle version arrive au **deuxième** lancement, pas au premier.

Le pied de page doit afficher **1.47.8**. S'il reste sur 1.45.20 après deux
lancements, c'est que `sw.js` n'a pas été remplacé : son nom de cache est ce
qui force le renouvellement.

---

## Ce que ce dépôt gagne

`entree.jsx` — il n'y figurait pas et avait disparu de partout. Reconstruit
puis validé par compilation : sans lui, le dépôt n'était pas recompilable.

`.github/workflows/apk.yml` — vérifier l'onglet **Actions** après l'envoi.
Si « Compiler l'APK » y apparaît, le fichier est pris en compte. Il reste
non testé.

`carte-du-code.md` et `ou-on-en-est.md` — repérage dans le fichier principal
et état du projet.

---

## Deux points à corriger plus tard

`tests/LISEZMOI.md` annonce 68 vérifications ; la suite en compte 99.

`src/version.js` porte `DATE_VERSION = "29 août 2026"` alors que le README
annonce la 1.47.8 au 31 août. L'une des deux dates est fausse.
