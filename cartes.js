/* Rangs, enseignes, valeur d une carte, fabrication d un sabot neuf. */

import { T } from "./systemes.js";

const RANGS = ["A", "2", "3", "4", "5", "6", "7", "8", "9", "10", "V", "D", "R"];
const ENSEIGNES = [
  { s: "♠", couleur: "noir" },
  { s: "♥", couleur: "rouge" },
  { s: "♦", couleur: "rouge" },
  { s: "♣", couleur: "noir" },
];

const cle = (rang) => (["10", "V", "D", "R"].includes(rang) ? T : rang);

function valeurCarte(sys, rang, couleur) {
  const k = cle(rang);
  if (sys.valeurSpeciale && Number(k) === sys.valeurSpeciale.rang) {
    return couleur === "rouge" ? sys.valeurSpeciale.rouge : sys.valeurSpeciale.noir;
  }
  return sys.valeurs[k] ?? 0;
}

function fmt(n, signe = true) {
  if (n === null || n === undefined || Number.isNaN(n)) return "—";
  const a = Math.round(n * 100) / 100;
  const s = String(Math.abs(a)).replace(".", ",");
  if (!signe) return (a < 0 ? "−" : "") + s;
  if (a > 0) return "+" + s;
  if (a < 0) return "−" + s;
  return "0";
}

function sabotNeuf(nbPaquets) {
  const c = [];
  for (let d = 0; d < nbPaquets; d++)
    for (const r of RANGS) for (const e of ENSEIGNES) c.push({ rang: r, ...e });
  for (let i = c.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [c[i], c[j]] = [c[j], c[i]];
  }
  return c;
}

/* Sauvegarde locale. Silencieuse si le stockage est indisponible
   (aperçu en bac à sable, navigation privée stricte, quota plein). */
/* Version de l'application, affichée en pied de page et dans les paramètres.
   Elle sert à vérifier qu'une mise à jour publiée a bien été prise en compte.

   Règle de numérotation, sur trois niveaux, dans l'ordre chronologique :
     1.29.1 → 1.29.2     on retouche la même partie de l'application, le
                         troisième nombre avance
     1.29.2 → 1.30.1     on passe à une autre partie, le deuxième avance et
                         le troisième repart à 1
     2.0.1               ajout majeur : nouvel écran, nouvel exercice, nouveau
                         moteur de calcul

   Le nom du cache dans sw.js doit reprendre le même numéro, sans quoi le
   service worker ne se réinstalle pas. */

export { ENSEIGNES, RANGS, cle, fmt, sabotNeuf, valeurCarte };
