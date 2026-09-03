/* Lecture, écriture, export et restauration des données locales. */

import { VERSION } from "./version.js";
import { jourCourt } from "./dates.js";

const CLE_SECOURS = "4270";

const CLE_STOCKAGE = "big-jack-theory";
function lireStockage() {
  try {
    const brut = window.localStorage.getItem(CLE_STOCKAGE);
    return brut ? JSON.parse(brut) : null;
  } catch {
    return null;
  }
}
function ecrireStockage(donnees) {
  try {
    window.localStorage.setItem(CLE_STOCKAGE, JSON.stringify(donnees));
    return true;
  } catch {
    return false;
  }
}
/* Instantané interne : une copie des données dans le navigateur, sous une clé
   distincte pour qu'elle ne se contienne pas elle-même. Restaurable en un clic.
   Elle protège d'une suppression accidentelle, pas d'un changement d'adresse ni
   d'un vidage du navigateur — seul le fichier exporté couvre ces cas. */
const CLE_INSTANTANE = "big-jack-theory-instantane";

/* Au-delà de deux semaines, la sauvegarde est jugée trop ancienne : on le
   signale sur l'engrenage et dans les paramètres. L'application ne sait pas si
   le fichier existe encore, seulement quand vous avez appuyé sur Sauvegarder. */
const JOURS_RAPPEL_SAUVEGARDE = 14;
function ageSauvegarde() {
  try {
    const brut = localStorage.getItem(CLE_INSTANTANE);
    if (!brut) return null;
    const d = new Date(JSON.parse(brut)?.date);
    if (isNaN(d.getTime())) return null;
    return Math.floor((Date.now() - d.getTime()) / 86400000);
  } catch {
    return null;
  }
}
const sauvegardeAgee = () => {
  const j = ageSauvegarde();
  return j === null || j >= JOURS_RAPPEL_SAUVEGARDE;
};

function lireInstantane() {
  try {
    const b = window.localStorage.getItem(CLE_INSTANTANE);
    return b ? JSON.parse(b) : null;
  } catch {
    return null;
  }
}

function effacerInstantane() {
  try {
    window.localStorage.removeItem(CLE_INSTANTANE);
    return true;
  } catch {
    return false;
  }
}

function ecrireInstantane(donnees) {
  try {
    window.localStorage.setItem(CLE_INSTANTANE, JSON.stringify({ date: new Date().toISOString(), donnees }));
    return true;
  } catch {
    return false;
  }
}

/** « 29 août 2026 à 17:48 » */
function dateLisible(iso) {
  try {
    const d = new Date(iso);
    const mois = ["janvier", "février", "mars", "avril", "mai", "juin", "juillet", "août", "septembre", "octobre", "novembre", "décembre"];
    return `${d.getDate()} ${mois[d.getMonth()]} ${d.getFullYear()} à ${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
  } catch {
    return "date inconnue";
  }
}

/** Dépose un contenu en téléchargement. Commune aux deux exports. */
function telecharger(contenu, type, nom) {
  try {
    const blob = new Blob([contenu], { type });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = nom;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    return true;
  } catch {
    return false;
  }
}

/** Exporte l'intégralité des données dans un fichier JSON. */
function exporterTout(donnees) {
  try {
    const contenu = JSON.stringify({ application: "Big Jack Theory", version: VERSION, exporte: new Date().toISOString(), donnees }, null, 2);
    return telecharger(contenu, "application/json", `big-jack-theory-sauvegarde-${jourCourt(new Date())}.json`);
  } catch {
    return false;
  }
}

/** Relit un fichier de sauvegarde et en valide la structure. */
function analyserSauvegarde(texte) {
  try {
    const o = JSON.parse(texte);
    const d = o.donnees ?? o;
    if (!d || typeof d !== "object") return { erreur: "Fichier illisible." };
    if (!d.defauts && !d.sessions && !d.entrainement) return { erreur: "Ce fichier ne contient aucune donnée de l'application." };
    return {
      donnees: d,
      resume: [
        d.sessions ? `${d.sessions.length} session${d.sessions.length > 1 ? "s" : ""}` : null,
        d.entrainement?.bilans ? `${d.entrainement.bilans.length} série${d.entrainement.bilans.length > 1 ? "s" : ""}` : null,
        d.defauts ? "réglages" : null,
      ].filter(Boolean).join(", "),
      version: o.version ?? "inconnue",
    };
  } catch {
    return { erreur: "Fichier JSON invalide." };
  }
}

/* Code de protection. Le code n'est pas conservé en clair : seule son empreinte
   l'est. Cela empêche de le lire d'un coup d'œil, sans prétendre à une sécurité
   réelle — qui aurait accès au stockage pourrait de toute façon tout effacer. */
function empreinte(txt) {
  let h = 2166136261;
  for (let i = 0; i < txt.length; i++) {
    h ^= txt.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return (h >>> 0).toString(36);
}

/** Saisie d'un code à quatre chiffres. */

export { CLE_INSTANTANE, CLE_SECOURS, CLE_STOCKAGE, JOURS_RAPPEL_SAUVEGARDE, ageSauvegarde, analyserSauvegarde, dateLisible, ecrireInstantane, ecrireStockage, effacerInstantane, empreinte, exporterTout, lireInstantane, lireStockage, sauvegardeAgee, telecharger };
