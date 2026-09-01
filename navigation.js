/* Groupes de pages, jalons d historique et registre des fermetures. */

const GROUPE_STRATEGIE = [
  { v: "strategie", l: "Tableau" },
  { v: "compteur", l: "Compteur" },
];
const EST_STRATEGIE = (v) => GROUPE_STRATEGIE.some((o) => o.v === v);

/* La fiche n'a pas son onglet : on l'ouvre depuis la liste des systèmes, qui
   sert de menu. Elle reste une vue à part entière, avec son retour. */
/* Les onglets du journal sont des vues, comme ceux des autres pages. */
const GROUPE_JOURNAL = [
  { v: "journal", l: "Analyse" },
  { v: "journal_sessions", l: "Sessions" },
];
const EST_JOURNAL = (v) => GROUPE_JOURNAL.some((o) => o.v === v);

const GROUPE_THEORIE = [
  { v: "recap", l: "Systèmes" },
  { v: "mises", l: "Mise" },
  { v: "lexique", l: "Lexique" },
  { v: "lectures", l: "Lectures" },
];
const EST_THEORIE = (v) => v === "fiche" || GROUPE_THEORIE.some((o) => o.v === v);

const HAUTEUR_SOUSNAV = 54;

/* Registre des choses refermables, du plus proche au plus lointain. Chaque vue
   y dépose ses fermetures ; le bouton retour d'Android en consomme une à la
   fois. Un tableau simple suffit : une seule vue est montée à la fois. */
const RETOUR = { pile: [] };
/* Relevé provisoire du bouton retour, lu dans les paramètres. */
/* Compte des jalons d'historique encore en réserve : la sortie doit tous les
   franchir d'un coup. */
const JALONS = { restants: 0 };

/* Un jalon d'historique est posé à chaque pas en avant — page, sous-onglet,
   exercice ouvert. Le bouton du téléphone en consomme un par appui, et rien
   n'est reposé pendant son traitement : certains navigateurs mobiles ignorent
   un ajout fait à ce moment-là, et l'application se fermait au bout de deux
   appuis. */
/* La page principale dont relève une vue. Sert à distinguer un changement
   d'onglet d'un changement de page. */
/* Les vues secondaires — sans onglet à elles — rendent la main à leur page mère
   avant de remonter plus haut. */
const PAGE_MERE = { fiche: "recap" };

function groupeDe(v) {
  if (EST_STRATEGIE(v)) return "table";
  if (EST_JOURNAL(v)) return "journal";
  if (EST_THEORIE(v)) return "comprendre";
  return v;
}

function enregistrerChemin(chemin) {
  try {
    sessionStorage.setItem("big-jack-theory-chemin", JSON.stringify(chemin));
  } catch {
    /* sans conséquence */
  }
}

function poserEtape() {
  try {
    JALONS.restants += 1;
    history.pushState({ bjt: JALONS.restants }, "");
  } catch {
    /* sans conséquence */
  }
}
function poserRetour(cle, actif, fermer) {
  RETOUR.pile = RETOUR.pile.filter((x) => x.cle !== cle);
  if (actif) RETOUR.pile.push({ cle, fermer });
}
function consommerRetour() {
  const dernier = RETOUR.pile[RETOUR.pile.length - 1];
  if (!dernier) return false;
  RETOUR.pile = RETOUR.pile.filter((x) => x !== dernier);
  dernier.fermer();
  return true;
}

/* Même présentation que les sous-onglets du journal : colonnes égales, trait
   sous l'onglet actif. Le balayage latéral passe d'un onglet au suivant. */

export { EST_STRATEGIE, EST_THEORIE, GROUPE_STRATEGIE, GROUPE_THEORIE, HAUTEUR_SOUSNAV, JALONS, PAGE_MERE, RETOUR, consommerRetour, enregistrerChemin, groupeDe, poserEtape, poserRetour , GROUPE_JOURNAL, EST_JOURNAL};
