/* Simulation de séances : ruine, unités requises, mains tenables. */

const RESULTATS = [
  [-2, 0.083], [-1, 0.36625], [0, 0.087], [1, 0.37875], [1.5, 0.045], [2, 0.04],
];
const CUMUL = (() => { let c = 0; return RESULTATS.map(([k, p]) => { c += p; return [k, c]; }); })();
const tirerMain = () => {
  const u = Math.random();
  for (const [k, q] of CUMUL) if (u < q) return k;
  return 2;
};

const MISEURS = {
  plate: { sens: "Ne varie pas", nom: "Mise plate", f: () => 1 },
  douce: {
    sens: "Monte après un gain",
    nom: "Progression douce (1 – 2 – 2,5)",
    f: (e) => { if (e.d !== 1) e.i = 0; else e.i = Math.min((e.i ?? 0) + 1, 2); return [1, 2, 2.5][e.i]; },
  },
  paroli: {
    sens: "Monte après un gain",
    nom: "Paroli (1-3-2-6)",
    f: (e) => { const t = [1, 3, 2, 6]; e.i = e.d === 1 ? Math.min((e.i ?? -1) + 1, 3) : -1; return t[Math.max(e.i, 0)]; },
  },
  fibonacci: {
    sens: "Monte après une perte",
    nom: "Fibonacci",
    f: (e) => { e.a = e.a ?? 1; e.b = e.b ?? 1; if (e.d === -1) { const n = e.a + e.b; e.a = e.b; e.b = n; } else { e.a = 1; e.b = 1; } return e.b; },
  },
  alembert: {
    sens: "Monte après une perte",
    nom: "d'Alembert",
    f: (e) => { e.m = e.d === -1 ? (e.m || 1) + 1 : Math.max(1, (e.m || 1) - 1); return e.m; },
  },
  martingale: {
    sens: "Monte après une perte",
    nom: "Martingale",
    f: (e) => { e.m = e.d === -1 ? (e.m || 1) * 2 : 1; return e.m; },
  },
};

function simulerSeances(cle, unites, mains, plafondU, N = 8000) {
  const faire = MISEURS[cle].f;
  let ruine = 0, gagnantes = 0, total = 0, maxMise = 0;
  const res = [];
  for (let i = 0; i < N; i++) {
    let solde = 0, e = {}, perdu = false;
    for (let k = 0; k < mains; k++) {
      const m = Math.min(faire(e), plafondU, unites + solde);
      if (m < 1) { perdu = true; break; }
      if (m > maxMise) maxMise = m;
      const r = tirerMain() * m;
      solde += r;
      e.d = r > 0 ? 1 : r < 0 ? -1 : 0;
      if (unites + solde <= 0) { perdu = true; solde = -unites; break; }
    }
    if (perdu) ruine++;
    if (solde > 0) gagnantes++;
    total += solde;
    res.push(solde);
  }
  res.sort((a, b) => a - b);
  return {
    ruine: (ruine / N) * 100,
    gagnantes: (gagnantes / N) * 100,
    moyen: total / N,
    pire: res[Math.floor(N * 0.05)],
    maxMise,
  };
}

/** Plus petits capitaux, en unités, tenant la ruine sous 5 % puis sous 1 %.
    Une seule passe sur les candidats : on s'arrête dès que les deux seuils sont trouvés. */
function unitesRequises(cle, mains, plafondEnUnites) {
  const candidats = [5, 10, 16, 22, 30, 40, 55, 75, 100, 140, 190];
  let confort = null;
  for (const u of candidats) {
    const r = simulerSeances(cle, u, mains, plafondEnUnites, 1800);
    if (confort === null && r.ruine <= 5) confort = u;
    if (r.ruine <= 1) return { confort: confort ?? u, sur: u };
  }
  return { confort, sur: null };
}

/** Plus longue session, en mains, qui garde la ruine sous le seuil voulu. */
function mainsTenables(cle, unites, plafondEnUnites, seuil = 5) {
  const paliers = [100, 200, 400, 800];
  let tenable = 0;
  for (const m of paliers) {
    if (simulerSeances(cle, unites, m, plafondEnUnites, 700).ruine <= seuil) tenable = m;
    else break;
  }
  return tenable;
}

const PALIERS = [0.5, 1, 2, 2.5, 5, 10, 20, 25, 50, 100];
const arrondirUnite = (v) => {
  let choix = PALIERS[0];
  for (const p of PALIERS) if (p <= v) choix = p;
  return choix;
};

export { CUMUL, MISEURS, PALIERS, RESULTATS, arrondirUnite, mainsTenables, simulerSeances, tirerMain, unitesRequises };
