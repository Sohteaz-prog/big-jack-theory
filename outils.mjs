/* Outils communs aux tests. Un navigateur simulé, une application chargée, et
   de quoi observer ce qu'un utilisateur verrait vraiment. */
import fs from "fs";
import { JSDOM, VirtualConsole } from "jsdom";

export const PAGE = "/mnt/user-data/outputs/big-jack-theory.html";

export const jour = (n) => {
  const d = new Date();
  d.setDate(d.getDate() - n);
  d.setHours(20, 0, 0, 0);
  return d.toISOString();
};

/** Lance l'application. Rend le document, la fenêtre, et l'état de l'historique. */
export function lancer({ mobile = true, donnees = {}, session = {}, large = false } = {}) {
  const erreurs = [];
  const vc = new VirtualConsole().on("jsdomError", (e) => {
    const m = (e.message || "").split("\n")[0];
    if (!m.includes("scrollTo")) erreurs.push(m);
  });
  const hist = { jalons: 0, sortie: 0 };
  const mouvements = [];
  let posY = 0;

  const dom = new JSDOM(fs.readFileSync(PAGE, "utf8"), {
    runScripts: "dangerously",
    pretendToBeVisual: true,
    url: "https://x.test/",
    virtualConsole: vc,
    beforeParse(w) {
      w.matchMedia = (q) => ({
        matches: large ? false : /max-width:\s*719/.test(q),
        addEventListener() {}, removeEventListener() {}, addListener() {}, removeListener() {},
      });
      w.localStorage.setItem("big-jack-theory", JSON.stringify({ codeVu: true, ...donnees }));
      for (const [k, v] of Object.entries(session)) if (v) w.sessionStorage.setItem(k, v);
      Object.defineProperty(w, "scrollY", { get: () => posY, configurable: true });
      w.scrollTo = (x, y) => { const v = typeof x === "object" ? x.top : y; mouvements.push(v); posY = v; };
      w.URL.createObjectURL = () => "blob:x";
      w.URL.revokeObjectURL = () => {};
      w.AudioContext = function () {
        return { createOscillator: () => ({ connect() {}, start() {}, stop() {}, frequency: { setValueAtTime() {} }, type: "" }),
                 createGain: () => ({ connect() {}, gain: { setValueAtTime() {}, exponentialRampToValueAtTime() {}, linearRampToValueAtTime() {} } }),
                 currentTime: 0, destination: {}, state: "running", resume() {} };
      };
      /* L'historique est simulé fidèlement : un navigateur mobile ignore les
         jalons posés pendant le traitement du retour. */
      const push = w.history.pushState.bind(w.history);
      let dansRetour = false;
      w.history.pushState = (...a) => { if (dansRetour) return; hist.jalons++; push(...a); };
      w.history.replaceState = () => { hist.jalons = 0; };
      w.history.go = (n) => { hist.jalons += n; if (hist.jalons < 0) hist.sortie++; };
      w.history.back = () => { hist.jalons--; if (hist.jalons < 0) hist.sortie++; };
      w.__retour = () => {
        if (hist.jalons <= 0) { hist.sortie++; return; }
        hist.jalons--; dansRetour = true;
        w.dispatchEvent(new w.PopStateEvent("popstate", { state: { bjt: 0 } }));
        setTimeout(() => { dansRetour = false; }, 0);
      };
    },
  });

  const d = dom.window.document;
  const w = dom.window;
  const dormir = (ms) => new Promise((r) => setTimeout(r, ms));

  return {
    dom, d, w, erreurs, hist, mouvements,
    dormir,
    poser: (y) => { posY = y; mouvements.length = 0; },
    position: () => posY,

    boutons: () => [...d.querySelectorAll("#racine button")],
    parTexte: (t) => [...d.querySelectorAll("#racine button")].find((x) => x.textContent.trim() === t),
    sousOnglet: (t) => [...d.querySelectorAll("#racine button")]
      .find((x) => x.hasAttribute("aria-current") && x.textContent.trim().startsWith(t)),
    parametres: () => d.querySelector("#racine button[data-superpose]"),
    champ: (label) => d.querySelector(`#racine input[aria-label="${label}"]`),

    saisir(el, v) {
      const p = Object.getPrototypeOf(el);
      Object.getOwnPropertyDescriptor(p, "value").set.call(el, v);
      el.dispatchEvent(new w.Event("input", { bubbles: true }));
    },

    retour: async () => { w.__retour(); await dormir(480); },

    /** Où l'on se trouve, du point de vue de l'utilisateur. */
    ou() {
      const t = d.getElementById("racine").textContent;
      if (this.affiche(/Vos réglages/)) return "paramètres";
      if (d.querySelector('#racine svg[aria-label="Big Jack Theory"]')) return "accueil";
      const h = d.querySelector("#racine h1")?.textContent.trim();
      if (h === "Cinq exercices") return "menu exercices";
      if (t.includes("Commencer") && h !== "Cinq exercices" && !d.querySelector("#racine [data-systeme]")) return "consignes";
      return h ?? "?";
    },

    /** Vrai seulement si le texte est RÉELLEMENT visible : un ancêtre masqué
        suffit à le rendre invisible, ce que textContent ne dit pas. */
    affiche(motif) {
      const noeuds = [...d.querySelectorAll("#racine h1, #racine h2, #racine p, #racine div, #racine span")];
      return noeuds.some((n) => {
        if (!motif.test(n.textContent)) return false;
        let el = n;
        while (el && el.id !== "racine") {
          if (el.style && (el.style.display === "none" || el.style.visibility === "hidden")) return false;
          el = el.parentElement;
        }
        return true;
      });
    },
  };
}

let reussis = 0, echecs = [];
export function verifier(nom, condition, detail = "") {
  if (condition) { reussis++; console.log("  ✓ " + nom); }
  else { echecs.push(nom + (detail ? " — " + detail : "")); console.log("  ← " + nom + (detail ? " — " + detail : "")); }
}
export function bilan() {
  console.log("\n" + "─".repeat(58));
  console.log(reussis + " vérifications passées, " + echecs.length + " échouées");
  echecs.forEach((e) => console.log("   ← " + e));
  return echecs.length;
}
