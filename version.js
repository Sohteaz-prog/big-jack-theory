/* Numéro de version et date, lus par les paramètres et la sauvegarde. */

const VERSION = "1.47.8";
const DATE_VERSION = "29 août 2026";

/* Clé de secours. Saisie à la place du code de protection, elle le retire et
   rend la main. À changer ici, puis à republier : c'est le seul moyen de
   récupérer l'accès si le code est oublié, sans vider les données du navigateur.
   Quiconque lit ce fichier peut la voir — elle ne protège de rien, elle
   dépanne. */

export { DATE_VERSION, VERSION };
