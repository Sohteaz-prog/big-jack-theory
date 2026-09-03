/* Suivi de la progression : bilans, taux récents, séries. */

const ENTRAINEMENT_VIDE = {
  jours: [],
  // « recents » : les N dernières réponses, qui servent aux critères.
  // « total » et « bon » gardent l'historique complet, pour information.
  strategie: { total: 0, bon: 0, maitrise: {}, recents: [] },
  valeur: { total: 0, bon: 0, tempsTotal: 0, recents: [], tempsRecents: [] },
  sabot: { essais: 0, reussis: 0, meilleureVitesse: null, recents: [] },
  tc: { total: 0, bon: 0, recents: [] },
  indices: { total: 0, bon: 0, recents: [] },
  bilans: [],
};

const MAX_BILANS = 100;

/** Ramène la liste à MAX_BILANS en sacrifiant d'abord les séries non conservées. */
function rognerBilans(liste) {
  if (liste.length <= MAX_BILANS) return liste;
  let trop = liste.length - MAX_BILANS;
  const restant = [];
  for (const b of liste) {
    if (trop > 0 && !b.garde) { trop--; continue; }
    restant.push(b);
  }
  // Cas limite : tout est conservé, on retire quand même les plus anciennes.
  return trop > 0 ? restant.slice(trop) : restant;
}
const NOMS_EXERCICE = {
  strategie: "Stratégie de base",
  valeur: "Valeur de carte",
  sabot: "Défilé chronométré",
  tc: "Vrai compte",
  indices: "Indices de déviation",
};

const FENETRES = { strategie: 100, valeur: 100, sabot: 5, tc: 30, indices: 30 };
const dernieres = (liste, n) => (liste ?? []).slice(-n);
const tauxRecent = (liste, n) => {
  const d = dernieres(liste, n);
  return d.length ? d.reduce((a, b) => a + b, 0) / d.length : 0;
};

/* Date du jour au format AAAA-MM-JJ, en heure locale. L'heure universelle
   ferait basculer les séances de fin de soirée au jour suivant. */
/** Échéance exprimée en délai, plus parlante qu'une date seule. */
function quandTexte(date, maintenant) {
  const h = String(date.getHours()).padStart(2, "0") + ":" + String(date.getMinutes()).padStart(2, "0");
  const reste = date.getTime() - maintenant;
  const heures = Math.floor(reste / 3600000);
  if (reste <= 0) return "à l'instant";
  if (heures < 1) return `dans ${Math.max(1, Math.round(reste / 60000))} min`;
  if (heures < 24) return `dans ${heures} h, à ${h}`;
  const jours = Math.round(heures / 24);
  const d = `${String(date.getDate()).padStart(2, "0")}/${String(date.getMonth() + 1).padStart(2, "0")}`;
  return jours === 1 ? `demain à ${h}` : `dans ${jours} jours, le ${d} à ${h}`;
}

/** Date au format 12/08/26, pour les récapitulatifs compacts. */
/* Un résultat nul n'est ni un gain ni une perte : il reste neutre. */
/** « 3 sur 5 · 60 % » — les sessions nulles ne sont montrées que s'il y en a. */
const repartition = (n, total) => (total ? `${n} sur ${total} · ${Math.round((n / total) * 100)} %` : "—");

export { ENTRAINEMENT_VIDE, FENETRES, MAX_BILANS, NOMS_EXERCICE, dernieres, quandTexte, repartition, rognerBilans, tauxRecent };
