# Big Jack Theory — installation

## Comparatif des trois méthodes

| | Fichier local | GitHub Pages | APK |
|---|---|---|---|
| **Temps de mise en place** | 5 min | 20 min | 20 min + compilation |
| **Compte à créer** | aucun | GitHub | GitHub |
| **Icône personnalisée** | non, celle de Chrome | oui | oui |
| **Plein écran** | variable | oui | oui |
| **Hors ligne** | oui | oui | oui |
| **Dans la liste des applications** | non | non | oui |
| **Code visible par des tiers** | non | oui | oui |
| **Mise à jour** | remplacer le fichier | remplacer le fichier | recompiler et réinstaller |
| **Fiabilité** | éprouvée | éprouvée | non testée |

**Recommandation.** GitHub Pages pour l'usage courant. Le fichier local si vous
tenez à ne rien publier. L'APK seulement si l'absence dans la liste des
applications vous gêne réellement — il n'apporte rien d'autre.

Note sur Netlify, que je vous avais d'abord conseillé : un dépôt anonyme y est
supprimé au bout d'une heure s'il n'est pas revendiqué par un compte. Comme un
compte est de toute façon nécessaire, GitHub Pages est préférable.

---

## Méthode 1 — Fichier local

1. Téléchargez `big-jack-theory.html` sur le téléphone.
2. Ouvrez-le depuis l'application **Fichiers**, en choisissant Chrome.
3. Menu **⋮** → **Ajouter à l'écran d'accueil**, si l'option apparaît.

Rien n'est publié, personne n'y a accès. En contrepartie, Chrome refuse souvent
l'ajout à l'écran d'accueil pour un fichier local, et l'icône reste générique.

---

## Méthode 2 — GitHub Pages

### Sur ordinateur

1. Créez un compte sur **github.com** si vous n'en avez pas.
2. Bouton **+** en haut à droite → **New repository**.
3. Nommez-le `big-jack-theory`, laissez **Public**, créez.
4. Décompressez `big-jack-theory-pwa.zip`.
5. **Facultatif — changer l'enseigne de l'icône.** Dans `icones/`, prenez les
   trois fichiers voulus (`coeur-192.png`, `coeur-512.png`,
   `coeur-512-maskable.png`), renommez-les en `icone-192.png`, `icone-512.png`,
   `icone-512-maskable.png`, et remplacez ceux de la racine.
6. Sur la page du dépôt : **Add file** → **Upload files**.
7. Glissez le **contenu** du dossier décompressé — les fichiers eux-mêmes, pas
   le dossier qui les contient.
8. Bouton **Commit changes** en bas.
9. Onglet **Settings** → **Pages** dans le menu de gauche.
10. Sous *Source*, choisissez **Deploy from a branch**, branche **main**,
    dossier **/ (root)**, puis **Save**.
11. Patientez une à deux minutes. L'adresse s'affiche en haut de cette page :
    `https://votrenom.github.io/big-jack-theory/`

### Sur le téléphone

12. Ouvrez cette adresse dans Chrome.
13. Chrome propose **Installer l'application**. Si la bannière n'apparaît pas :
    menu **⋮** → **Installer l'application**.
14. L'icône est sur l'écran d'accueil.

### Vérification

Activez le mode avion et ouvrez l'application. Si elle se charge, le cache
hors ligne fonctionne.

### Mettre à jour plus tard

Sur la page du dépôt, **Add file** → **Upload files**, déposez le nouveau
`index.html`, puis **Commit changes**. L'application se met à jour au prochain
lancement.

---

## Méthode 3 — APK

**Cette méthode n'a pas pu être testée avant livraison.** Le fichier de
compilation suit la procédure documentée de Bubblewrap, l'outil officiel de
Google, mais l'environnement où il a été écrit n'avait pas accès aux serveurs
Android. Vous découvrirez s'il fonctionne en le lançant.

**Prérequis** : avoir terminé la méthode 2.

1. Ouvrez `.github/workflows/apk.yml` dans votre dépôt.
2. Bouton crayon pour éditer.
3. Remplacez `https://VOTRENOM.github.io/big-jack-theory/` par votre adresse
   réelle, en conservant la barre oblique finale.
4. **Commit changes**.
5. Onglet **Actions** → **Compiler l'APK** → **Run workflow**.
6. Après quelques minutes, ouvrez l'exécution terminée et téléchargez
   l'artefact `big-jack-theory-apk`.
7. Transférez l'APK sur le téléphone et ouvrez-le. Android demandera
   d'autoriser une source inconnue.

**Conservez `signature.keystore`**, inclus dans l'artefact. Sans lui, aucune
version future ne pourra remplacer celle installée : il faudrait désinstaller,
et vous perdriez réglages et historique.

Si la compilation échoue, l'onglet Actions affiche le journal détaillé.
Communiquez-le-moi et je corrige.

---

## Vos données

Réglages, journal et profil d'entraînement sont enregistrés par le navigateur et
rattachés à **l'adresse d'où l'application est ouverte**.

Changer de méthode donne donc une application vide. Avant tout changement :
**Exporter en CSV** dans l'onglet Journal, puis **Importer** une fois la nouvelle
version en place.

Le dépôt public expose le code de l'application, jamais vos données : celles-ci
ne quittent pas votre téléphone. Une balise demande par ailleurs aux moteurs de
recherche de ne pas indexer le site, et `LICENSE.txt` réserve vos droits.
