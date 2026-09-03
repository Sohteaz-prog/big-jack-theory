/* Le moteur de stratégie : probabilités du croupier, espérance de chaque
   décision, et construction des trois tableaux selon les règles de la
   table. C'est la partie vérifiable de l'application — elle ne dépend
   d'aucun composant et se teste isolément. */

function compositionSabot(paquets, retirees) {
  const c = Array(11).fill(0);
  for (let i = 1; i <= 9; i++) c[i] = 4 * paquets;
  c[10] = 16 * paquets;
  for (const r of retirees) if (c[r] > 0) c[r]--;
  let tot = 0;
  for (let i = 1; i <= 10; i++) tot += c[i];
  const p = Array(11).fill(0);
  for (let i = 1; i <= 10; i++) p[i] = c[i] / tot;
  return p;
}

/** Valeur d'une main décrite par son total « dur » (As comptés 1) et la présence d'un As. */
function valeurMain(dur, as) {
  const souple = as && dur + 10 <= 21;
  return [souple ? dur + 10 : dur, souple];
}

/** Distribution finale du croupier : [17,18,19,20,21,crève], après vérification du blackjack. */
function distCroupier(hauteur, p, h17) {
  const memo = new Map();
  const rec = (dur, as) => {
    const k = dur * 2 + (as ? 1 : 0);
    if (memo.has(k)) return memo.get(k);
    const [total, souple] = valeurMain(dur, as);
    let res;
    if (total > 21) res = [0, 0, 0, 0, 0, 1];
    else if (total >= 18 || (total === 17 && !(souple && h17))) {
      res = [0, 0, 0, 0, 0, 0];
      res[total - 17] = 1;
    } else {
      res = [0, 0, 0, 0, 0, 0];
      for (let c = 1; c <= 10; c++) {
        if (!p[c]) continue;
        const sub = rec(dur + (c === 1 ? 1 : c), as || c === 1);
        for (let i = 0; i < 6; i++) res[i] += p[c] * sub[i];
      }
    }
    memo.set(k, res);
    return res;
  };

  // Carte cachée : le blackjack est exclu, le croupier l'a déjà vérifié.
  const pt = p.slice();
  if (hauteur === 1) pt[10] = 0;
  else if (hauteur === 10) pt[1] = 0;
  let somme = 0;
  for (let i = 1; i <= 10; i++) somme += pt[i];

  const durDepart = hauteur === 1 ? 1 : hauteur;
  const res = [0, 0, 0, 0, 0, 0];
  for (let c = 1; c <= 10; c++) {
    if (!pt[c]) continue;
    const sub = rec(durDepart + (c === 1 ? 1 : c), hauteur === 1 || c === 1);
    for (let i = 0; i < 6; i++) res[i] += (pt[c] / somme) * sub[i];
  }
  return res;
}

function analyserMain(cartes, hauteur, h17, paquets = 6, sansCarteCachee = false) {
  const p = compositionSabot(paquets, [...cartes, hauteur]);
  const dist = distCroupier(hauteur, p, h17);

  const evRester = (total) => {
    if (total > 21) return -1;
    let ev = dist[5];
    for (let d = 17; d <= 21; d++) {
      const pd = dist[d - 17];
      if (total > d) ev += pd;
      else if (total < d) ev -= pd;
    }
    return ev;
  };

  const memoT = new Map();
  const evTirer = (dur, as) => {
    const k = dur * 2 + (as ? 1 : 0);
    if (memoT.has(k)) return memoT.get(k);
    let ev = 0;
    for (let c = 1; c <= 10; c++) {
      if (!p[c]) continue;
      const nDur = dur + (c === 1 ? 1 : c);
      const nAs = as || c === 1;
      const [t] = valeurMain(nDur, nAs);
      ev += p[c] * (t > 21 ? -1 : Math.max(evRester(t), evTirer(nDur, nAs)));
    }
    memoT.set(k, ev);
    return ev;
  };

  const evDoubler = (dur, as) => {
    let ev = 0;
    for (let c = 1; c <= 10; c++) {
      if (!p[c]) continue;
      const [t] = valeurMain(dur + (c === 1 ? 1 : c), as || c === 1);
      ev += p[c] * 2 * (t > 21 ? -1 : evRester(t));
    }
    return ev;
  };

  const evSeparer = (carte) => {
    let une = 0;
    for (let c = 1; c <= 10; c++) {
      if (!p[c]) continue;
      const nDur = (carte === 1 ? 1 : carte) + (c === 1 ? 1 : c);
      const nAs = carte === 1 || c === 1;
      const [t] = valeurMain(nDur, nAs);
      une += p[c] * (carte === 1 ? evRester(t) : Math.max(evRester(t), evTirer(nDur, nAs), evDoubler(nDur, nAs)));
    }
    return 2 * une;
  };

  let dur = 0, as = false;
  for (const c of cartes) { dur += c === 1 ? 1 : c; as = as || c === 1; }
  const [total, souple] = valeurMain(dur, as);

  let pCreve = 0;
  for (let c = 1; c <= 10; c++) {
    if (!p[c]) continue;
    const [t] = valeurMain(dur + (c === 1 ? 1 : c), as || c === 1);
    if (t > 21) pCreve += p[c];
  }

  const ev = {
    R: evRester(total),
    T: evTirer(dur, as),
    D: evDoubler(dur, as),
    A: -0.5,
    S: cartes[0] === cartes[1] ? evSeparer(cartes[0]) : null,
  };

  // Sans carte cachée (règle française) : le croupier prend sa seconde carte après
  // le tour des joueurs, donc les mises de doublement et de séparation sont perdues
  // elles aussi s'il abat un blackjack.
  const pBJ = !sansCarteCachee ? 0 : hauteur === 1 ? p[10] : hauteur === 10 ? p[1] : 0;
  if (pBJ > 0) {
    ev.R = (1 - pBJ) * ev.R + pBJ * -1;
    ev.T = (1 - pBJ) * ev.T + pBJ * -1;
    ev.D = (1 - pBJ) * ev.D + pBJ * -2;
    if (ev.S !== null) ev.S = (1 - pBJ) * ev.S + pBJ * -2;
  }

  return { total, soft: souple, creveCroupier: dist[5], creveJoueur: pCreve, pBJ, ev };
}

/** Main représentative utilisée pour chaque ligne du tableau. */
const MAINS = {
  "5 à 8": [3, 5], "9": [4, 5], "10": [4, 6], "11": [5, 6],
  "12": [10, 2], "13": [10, 3], "14": [10, 4], "15": [10, 5], "16": [10, 6],
  "17": [10, 7], "18 à 21": [10, 8],
  "A,2": [1, 2], "A,3": [1, 3], "A,4": [1, 4], "A,5": [1, 5],
  "A,6": [1, 6], "A,7": [1, 7], "A,8": [1, 8], "A,9": [1, 9],
  "A,A": [1, 1], "10,10": [10, 10], "9,9": [9, 9], "8,8": [8, 8], "7,7": [7, 7],
  "6,6": [6, 6], "5,5": [5, 5], "4,4": [4, 4], "3,3": [3, 3], "2,2": [2, 2],
};

/* Deux cartes formant un total dur donné, pour calculer l'espérance du total
   réellement demandé plutôt que celle du représentant de sa ligne. */
function compositionDure(total) {
  if (total >= 5 && total <= 11) return [2, total - 2];
  if (total >= 12 && total <= 20) return [10, total - 10];
  return null; // 21 ne se compose pas en deux cartes hors blackjack
}

const nomCarte = (c) => (c === 1 ? "As" : c === 10 ? "10" : String(c));
const pct = (x, signe = true) => {
  const v = x * 100;
  const s = Math.abs(v).toFixed(1).replace(".", ",");
  if (!signe) return s + " %";
  return (v < -0.05 ? "−" : v > 0.05 ? "+" : "") + s + " %";
};

/* ============================================================
   VUE — STRATÉGIE DE BASE
   ============================================================ */

const HAUTEURS = ["2", "3", "4", "5", "6", "7", "8", "9", "10", "A"];

const ACTIONS = {
  T: { nom: "Tirer", phrase: "tirer une carte", fond: "transparent", teinte: "var(--encre2)" },
  R: { nom: "Rester", phrase: "rester", fond: "var(--rouge)", teinte: "var(--rouge)" },
  D: { nom: "Doubler, sinon tirer", phrase: "doubler — et si le doublement est interdit, tirer", fond: "var(--bleu)", teinte: "var(--bleu)" },
  Dr: { nom: "Doubler, sinon rester", phrase: "doubler — et si le doublement est interdit, rester", fond: "var(--bleu)", teinte: "var(--bleu)" },
  S: { nom: "Séparer", phrase: "séparer la paire", fond: "var(--or)", teinte: "var(--or)" },
  A: { nom: "Abandonner, sinon tirer", phrase: "abandonner — et si l'abandon n'est pas proposé, tirer", fond: "var(--encre)", teinte: "var(--encre)" },
};

function construireTables(h17, abandon, sansCarteCachee, paquets, das = true) {
  const rep = (v) => Array(10).fill(v);
  const a = (i, code, tab) => { if (abandon) tab[i] = code; return tab; };

  const dur = [
    ["5 à 8", rep("T")],
    ["9", ["T", "D", "D", "D", "D", "T", "T", "T", "T", "T"]],
    ["10", ["D", "D", "D", "D", "D", "D", "D", "D", "T", "T"]],
    ["11", ["D", "D", "D", "D", "D", "D", "D", "D", "D", h17 ? "D" : "T"]],
    ["12", ["T", "T", "R", "R", "R", "T", "T", "T", "T", "T"]],
    ["13", ["R", "R", "R", "R", "R", "T", "T", "T", "T", "T"]],
    ["14", ["R", "R", "R", "R", "R", "T", "T", "T", "T", "T"]],
    ["15", (() => { const t = ["R", "R", "R", "R", "R", "T", "T", "T", "T", "T"]; a(8, "A", t); if (h17) a(9, "A", t); return t; })()],
    ["16", (() => { const t = ["R", "R", "R", "R", "R", "T", "T", "T", "T", "T"]; a(7, "A", t); a(8, "A", t); a(9, "A", t); return t; })()],
    ["17", (() => { const t = rep("R"); if (h17) a(9, "A", t); return t; })()],
    ["18 à 21", rep("R")],
  ];

  const mou = [
    ["A,2", ["T", "T", "T", paquets >= 8 && !h17 ? "T" : "D", "D", "T", "T", "T", "T", "T"]],
    ["A,3", ["T", "T", "T", "D", "D", "T", "T", "T", "T", "T"]],
    ["A,4", ["T", "T", "D", "D", "D", "T", "T", "T", "T", "T"]],
    ["A,5", ["T", "T", "D", "D", "D", "T", "T", "T", "T", "T"]],
    ["A,6", ["T", "D", "D", "D", "D", "T", "T", "T", "T", "T"]],
    ["A,7", [h17 ? "Dr" : "R", "Dr", "Dr", "Dr", "Dr", "R", "R", "T", "T", "T"]],
    ["A,8", ["R", "R", "R", "R", h17 ? "Dr" : "R", "R", "R", "R", "R", "R"]],
    ["A,9", rep("R")],
  ];

  const paires = [
    ["A,A", rep("S")],
    ["10,10", rep("R")],
    ["9,9", ["S", "S", "S", "S", "S", "R", "S", "S", "R", "R"]],
    ["8,8", (() => { const t = rep("S"); if (h17 && abandon) t[9] = "A"; return t; })()],
    ["7,7", ["S", "S", "S", "S", "S", "S", "T", "T", "T", "T"]],
    ["6,6", ["S", "S", "S", "S", "S", "T", "T", "T", "T", "T"]],
    ["5,5", ["D", "D", "D", "D", "D", "D", "D", "D", "T", "T"]],
    ["4,4", ["T", "T", "T", "S", "S", "T", "T", "T", "T", "T"]],
    ["3,3", ["S", "S", "S", "S", "S", "S", "T", "T", "T", "T"]],
    ["2,2", ["S", "S", "S", "S", "S", "S", "T", "T", "T", "T"]],
  ];

  if (!das) {
    // Sans doublement après séparation, séparer rapporte moins : quatre lignes
    // de paires se jouent alors comme des mains ordinaires.
    const pose = (nom, indices, code) => {
      const l = paires.find((x) => x[0] === nom);
      if (l) for (const i of indices) if (l[1][i] !== "A") l[1][i] = code;
    };
    pose("2,2", [0, 1], "T");           // contre 2 et 3
    pose("3,3", [0, 1], "T");           // contre 2 et 3
    pose("4,4", [3, 4], "T");           // ne se sépare plus du tout
    pose("6,6", [0], "T");              // contre 2
  }

  if (sansCarteCachee) {
    // Le doublement et la séparation exposent la mise supplémentaire au blackjack
    // du croupier : quatre décisions basculent vers le simple tirage.
    const pose = (tab, nom, i, code) => {
      const l = tab.find((x) => x[0] === nom);
      if (l && l[1][i] !== "A") l[1][i] = code;
    };
    pose(dur, "11", 8, "T");
    pose(paires, "A,A", 9, "T");
    pose(paires, "8,8", 8, "T");
    pose(paires, "8,8", 9, "T");
  }

  return { dur, mou, paires };
}

export { compositionSabot, valeurMain, distCroupier, analyserMain, MAINS, compositionDure, nomCarte, pct, HAUTEURS, ACTIONS, construireTables };
