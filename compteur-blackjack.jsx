import { T, SYSTEMS, ORDRE } from "./src/systemes.js";
import { THEMES } from "./src/themes.js";
import { LEXIQUE } from "./src/lexique.js";
import { LECTURES, SITES } from "./src/lectures.js";
import { CUMUL, MISEURS, PALIERS, RESULTATS, arrondirUnite, mainsTenables, simulerSeances, tirerMain, unitesRequises } from "./src/mises.js";
import { EST_STRATEGIE, EST_THEORIE, GROUPE_STRATEGIE, GROUPE_THEORIE, HAUTEUR_SOUSNAV, JALONS, PAGE_MERE, RETOUR, consommerRetour, enregistrerChemin, groupeDe, poserEtape, poserRetour , GROUPE_JOURNAL, EST_JOURNAL} from "./src/navigation.js";
import { CLE_INSTANTANE, CLE_SECOURS, CLE_STOCKAGE, JOURS_RAPPEL_SAUVEGARDE, ageSauvegarde, analyserSauvegarde, dateLisible, ecrireInstantane, ecrireStockage, effacerInstantane, empreinte, exporterTout, lireInstantane, lireStockage, sauvegardeAgee, telecharger } from "./src/stockage.js";
import { ENSEIGNES, RANGS, cle, fmt, sabotNeuf, valeurCarte } from "./src/cartes.js";
import { DATE_VERSION, VERSION } from "./src/version.js";
import { ENTRAINEMENT_VIDE, FENETRES, MAX_BILANS, NOMS_EXERCICE, dernieres, quandTexte, repartition, rognerBilans, tauxRecent } from "./src/entrainement.js";
import { dateCourte, jourCourt } from "./src/dates.js";
import { amener, glisserVers, hautCollé, replierSansSaut, teinte } from "./src/defilement.js";
import { JEUX_SONS, contexte, contexteAudio, jouerSon } from "./src/sons.js";
import { compositionSabot, valeurMain, distCroupier, analyserMain, MAINS, compositionDure, nomCarte, pct, HAUTEURS, ACTIONS, construireTables } from "./src/strategie.js";

import React, { useState, useEffect, useRef, useMemo, useCallback } from "react";

/* ============================================================
   DONNÉES : les systèmes de comptage
   ============================================================ */

function EcranCode({ mode, mobile, onValider, onAnnuler, erreur }) {
  const [saisie, setSaisie] = useState("");
  const [premier, setPremier] = useState(null);
  const definir = mode === "definir";
  const etape = definir && premier !== null ? "confirmation" : "saisie";

  const valider = (v) => {
    if (definir) {
      if (v === CLE_SECOURS) { setPremier(null); setSaisie(""); onValider(null, "Ce code est réservé au secours."); return; }
      if (premier === null) { setPremier(v); setSaisie(""); return; }
      if (premier !== v) { setPremier(null); setSaisie(""); onValider(null, "Les deux codes diffèrent."); return; }
      onValider(v);
    } else {
      onValider(v);
    }
    setSaisie("");
  };

  const taper = (c) => {
    const v = (saisie + c).slice(0, 4);
    setSaisie(v);
    if (v.length === 4) setTimeout(() => valider(v), 120);
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 100,
        background: "rgba(0,0,0,.62)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 16,
      }}
    >
      <div
        style={{
          ...S.panneau,
          maxWidth: 340,
          width: "100%",
          padding: mobile ? "22px 18px" : "28px 24px",
          textAlign: "center",
          boxShadow: "var(--ombre-forte)",
        }}
      >
        <div style={{ fontSize: 15.5, fontWeight: 700, marginBottom: 16 }}>
          {definir ? (etape === "confirmation" ? "Répétez le code" : "Nouveau code") : "Votre code"}
        </div>

        <div style={{ display: "flex", justifyContent: "center", gap: 12, marginBottom: 16 }}>
          {[0, 1, 2, 3].map((i) => (
            <div
              key={i}
              style={{
                width: 14,
                height: 14,
                borderRadius: 999,
                background: i < saisie.length ? "var(--encre)" : "transparent",
                border: "1px solid var(--regle)",
              }}
            />
          ))}
        </div>

        {erreur && <p style={{ fontSize: 13, color: "var(--rouge)", margin: "0 0 12px" }}>{erreur}</p>}

        <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 7, maxWidth: 250, margin: "0 auto" }}>
          {["1", "2", "3", "4", "5", "6", "7", "8", "9"].map((c) => (
            <button
              key={c}
              onClick={() => taper(c)}
              className="mono bjc-tap"
              style={{ height: 50, border: "1px solid var(--regle)", borderRadius: 3, fontSize: 20, fontWeight: 700, background: "var(--panneau)" }}
            >
              {c}
            </button>
          ))}
          <button
            onClick={onAnnuler}
            style={{ height: 50, borderRadius: 3, fontSize: 13, fontWeight: 600, color: "var(--encre2)" }}
          >
            Annuler
          </button>
          <button
            onClick={() => taper("0")}
            className="mono bjc-tap"
            style={{ height: 50, border: "1px solid var(--regle)", borderRadius: 3, fontSize: 20, fontWeight: 700, background: "var(--panneau)" }}
          >
            0
          </button>
          <button
            onClick={() => setSaisie((v) => v.slice(0, -1))}
            className="mono bjc-tap"
            style={{ height: 50, borderRadius: 3, fontSize: 18, color: "var(--encre2)" }}
            aria-label="Effacer"
          >
            ⌫
          </button>
        </div>
      </div>
    </div>
  );
}

function effacerStockage() {
  try {
    window.localStorage.removeItem(CLE_STOCKAGE);
    return true;
  } catch {
    return false;
  }
}

/* Sons des exercices : générés à la volée, aucun fichier externe.
   Le contexte audio n'est créé qu'au premier son, donc après un geste
   de l'utilisateur — ce que les navigateurs exigent. */
function calculerSerie(jours) {
  if (!jours || !jours.length) return 0;
  const set = new Set(jours);
  const aujourdhui = new Date();
  let curseur = new Date(aujourdhui);
  if (!set.has(jourCourt(curseur))) {
    curseur.setDate(curseur.getDate() - 1);
    if (!set.has(jourCourt(curseur))) return 0;
  }
  let n = 0;
  while (set.has(jourCourt(curseur))) {
    n++;
    curseur.setDate(curseur.getDate() - 1);
  }
  return n;
}

/** Les quatre conditions à remplir avant de compter en conditions réelles. */
function evaluerPrets(e) {
  const rStrat = dernieres(e.strategie.recents, FENETRES.strategie);
  const rVal = dernieres(e.valeur.recents, FENETRES.valeur);
  const tVal = dernieres(e.valeur.tempsRecents, FENETRES.valeur);
  const rSabot = dernieres(e.sabot.recents, FENETRES.sabot);
  const rTc = dernieres(e.tc.recents, FENETRES.tc);
  const tempsMoyen = tVal.length ? tVal.reduce((a, b) => a + b, 0) / tVal.length : null;

  return [
    {
      cle: "strategie",
      titre: "Stratégie de base",
      exigence: "98 % sur les 100 dernières mains",
      valeur: rStrat.length
        ? `${Math.round(tauxRecent(rStrat, 100) * 100)} % sur ${rStrat.length}`
        : "aucune main",
      atteint: rStrat.length >= 100 && tauxRecent(rStrat, 100) >= 0.98,
      part: Math.min(1, rStrat.length / 100),
    },
    {
      cle: "valeur",
      titre: "Valeur de carte",
      exigence: "0,6 s de moyenne et 95 %, sur les 100 dernières",
      valeur: tempsMoyen
        ? `${tempsMoyen.toFixed(2).replace(".", ",")} s, ${Math.round(tauxRecent(rVal, 100) * 100)} % sur ${rVal.length}`
        : "aucune carte",
      atteint: rVal.length >= 100 && tauxRecent(rVal, 100) >= 0.95 && tempsMoyen <= 0.6,
      part: Math.min(1, rVal.length / 100),
    },
    {
      cle: "sabot",
      titre: "Défilé chronométré",
      exigence: "3 sabots justes sur les 5 derniers",
      valeur: rSabot.length
        ? `${rSabot.reduce((a, b) => a + b, 0)} juste${rSabot.reduce((a, b) => a + b, 0) > 1 ? "s" : ""} sur ${rSabot.length}`
        : "aucun essai",
      atteint:
        rSabot.reduce((a, b) => a + b, 0) >= 3 &&
        e.sabot.meilleureVitesse !== null &&
        e.sabot.meilleureVitesse <= 550,
      part: Math.min(1, rSabot.reduce((a, b) => a + b, 0) / 3),
    },
    {
      cle: "tc",
      titre: "Vrai compte",
      exigence: "90 % sur les 30 dernières questions",
      valeur: rTc.length ? `${Math.round(tauxRecent(rTc, 30) * 100)} % sur ${rTc.length}` : "aucune question",
      atteint: rTc.length >= 30 && tauxRecent(rTc, 30) >= 0.9,
      part: Math.min(1, rTc.length / 30),
    },
  ];
}

function useMediaQuery(q) {
  const [match, setMatch] = useState(() =>
    typeof window !== "undefined" && window.matchMedia ? window.matchMedia(q).matches : false
  );
  useEffect(() => {
    if (typeof window === "undefined" || !window.matchMedia) return;
    const mq = window.matchMedia(q);
    const on = (e) => setMatch(e.matches);
    setMatch(mq.matches);
    mq.addEventListener ? mq.addEventListener("change", on) : mq.addListener(on);
    return () => (mq.removeEventListener ? mq.removeEventListener("change", on) : mq.removeListener(on));
  }, [q]);
  return match;
}

/* ============================================================
   STYLES
   ============================================================ */

const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Source+Serif+4:opsz,wght@8..60,600;8..60,700&family=Public+Sans:ital,wght@0,400;0,500;0,700;1,400&family=JetBrains+Mono:wght@400;700&display=swap');

.bjc {
  font-family:'Public Sans', ui-sans-serif, system-ui, -apple-system, sans-serif;
  color:var(--encre); background:var(--papier); min-height:100vh;
  -webkit-font-smoothing:antialiased; -webkit-tap-highlight-color:transparent;
  transition:background-color .2s ease, color .2s ease;
}
.bjc *, .bjc *::before, .bjc *::after { box-sizing:border-box; }
.bjc h1,.bjc h2,.bjc h3 { font-family:'Source Serif 4', Georgia, serif; margin:0; letter-spacing:-.008em; }
.bjc .mono { font-family:'JetBrains Mono', ui-monospace, SFMono-Regular, Menlo, monospace; font-variant-numeric:tabular-nums; }
.bjc button { font-family:inherit; cursor:pointer; border:none; background:none; color:inherit; touch-action:manipulation; }
/* touch-action évite que le navigateur attende un éventuel double-tap avant
   d'ouvrir le sélecteur. Les boutons l'avaient déjà, pas les champs. */
.bjc select, .bjc input, .bjc textarea, .bjc label { touch-action:manipulation; }
.bjc select { font-family:inherit; color:var(--encre); }
.bjc button:focus-visible, .bjc select:focus-visible, .bjc [tabindex]:focus-visible { outline:2px solid var(--or); outline-offset:2px; }

.bjc-nav button { position:relative; padding:14px 2px 12px; font-size:12px; font-weight:700;
  letter-spacing:.09em; text-transform:uppercase; color:var(--encre2); transition:color .15s; }
.bjc-nav button[data-actif="1"] { color:var(--encre); }
.bjc-nav button[data-actif="1"]::after { content:''; position:absolute; left:0; right:0; bottom:-1px; height:2px; background:var(--encre); }

.bjc-tap { transition:transform .08s ease; }
.bjc-tap:active { transform:scale(.96); }
.bjc-ligne:hover { background:var(--survol); }

.bjc-pop { animation:bjc-pop .14s ease-out; }
@keyframes bjc-pop { from { opacity:0; transform:translateY(4px); } to { opacity:1; transform:none; } }
.bjc-descend { animation:bjc-descend .15s cubic-bezier(.22,.8,.3,1); }
@keyframes bjc-descend { from { opacity:0; transform:translateY(-14px); } to { opacity:1; transform:none; } }
.bjc-remonte { animation:bjc-remonte .09s cubic-bezier(.4,0,.7,.2) forwards; }
@keyframes bjc-remonte { from { opacity:1; transform:none; } to { opacity:0; transform:translateY(-14px); } }
.bjc-flash { animation:bjc-flash .18s ease-out; }
@keyframes bjc-flash { from { opacity:0; transform:scale(.94); } to { opacity:1; transform:none; } }

@media (hover:hover) { .bjc-tap:hover { transform:translateY(-2px); } }
@media (prefers-reduced-motion: reduce) {
  .bjc *, .bjc *::before, .bjc *::after { animation:none !important; transition:none !important; }
  .bjc-tap:hover, .bjc-tap:active { transform:none; }
}
`;

const S = {
  titreChoix: {
    fontSize: 12,
    fontWeight: 700,
    letterSpacing: ".02em",
    color: "var(--encre)",
    marginBottom: 7,
  },
  panneau: { background: "var(--panneau)", border: "1px solid var(--regle)", borderRadius: 3 },
  eyebrow: {
    fontSize: 11,
    fontWeight: 700,
    letterSpacing: ".12em",
    textTransform: "uppercase",
    color: "var(--encre2)",
  },
};

/* ============================================================
   PETITS COMPOSANTS
   ============================================================ */

function Pips({ n, total = 5, couleur }) {
  return (
    <span style={{ display: "inline-flex", gap: 3, verticalAlign: "middle" }}>
      {Array.from({ length: total }, (_, i) => (
        <span
          key={i}
          style={{
            width: 7,
            height: 7,
            borderRadius: "50%",
            background: i < n ? couleur : "transparent",
            border: `1px solid ${i < n ? couleur : "var(--regle)"}`,
          }}
        />
      ))}
    </span>
  );
}

function CarteFace({ rang, enseigne, couleur, taille = 1, anime = true }) {
  const l = 92 * taille;
  const h = 128 * taille;
  return (
    <div
      className={anime ? "bjc-flash" : undefined}
      style={{
        width: l,
        height: h,
        background: "var(--carte)",
        border: "1px solid var(--regle)",
        borderRadius: 6 * taille,
        boxShadow: "var(--ombre)",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        padding: 9 * taille,
        color: couleur === "rouge" ? "#B01F32" : "#14171A",
        flexShrink: 0,
      }}
    >
      {/* Enseignes aux deux coins, rang au centre — comme sur une vraie carte.
          Un plancher de 11 px les garde lisibles sur les cartes miniatures. */}
      <div style={{ fontSize: Math.max(11, 26 * taille), lineHeight: 1 }}>{enseigne}</div>
      <div
        className="mono"
        style={{
          fontSize: (rang.length > 1 ? 34 : 42) * taille,
          fontWeight: 700,
          textAlign: "center",
          lineHeight: 1,
        }}
      >
        {rang}
      </div>
      {/* La rotation de 180° inverse aussi l'alignement : aligné à gauche, le
          symbole se retrouve donc bien en bas à droite, tête en bas. */}
      <div style={{ fontSize: Math.max(11, 26 * taille), lineHeight: 1, textAlign: "left", transform: "rotate(180deg)" }}>
        {enseigne}
      </div>
    </div>
  );
}

function Segments({ options, valeur, onChange, plein }) {
  return (
    <div
      style={{
        display: plein ? "grid" : "inline-flex",
        gridTemplateColumns: plein ? "repeat(auto-fit,minmax(96px,1fr))" : undefined,
        border: "1px solid var(--regle)",
        borderRadius: 3,
        overflow: "hidden",
      }}
    >
      {options.map((o) => (
        <button
          key={String(o.v)}
          onClick={() => onChange(o.v)}
          style={{
            padding: "11px 14px",
            fontSize: 13,
            fontWeight: 600,
            background: valeur === o.v ? "var(--encre)" : "var(--panneau)",
            color: valeur === o.v ? "var(--panneau)" : "var(--encre2)",
            borderRight: "1px solid var(--regle)",
          }}
        >
          {o.l}
        </button>
      ))}
    </div>
  );
}

/* ============================================================
   VUE 1 — RÉCAPITULATIF
   ============================================================ */

function LigneMobile({ sy, actif, ouvert, basculer, choisir }) {
  return (
    <div
      data-systeme="1"
      style={{
        ...S.panneau,
        padding: "14px 15px",
        borderLeft: `3px solid ${actif ? "var(--rouge)" : "var(--regle)"}`,
      }}
    >
      <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
        <button onClick={choisir} style={{ flex: 1, textAlign: "left" }}>
          <div style={{ fontWeight: 700, fontSize: 16.5 }}>{sy.nom}</div>
          <div style={{ fontSize: 13, color: "var(--encre2)", marginTop: 1 }}>{sy.sous}</div>
          {/* Le barème sur dix cartes : on lit ce que fait le système avant de
              lire ses corrélations. */}
          <div style={{ display: "flex", gap: 2, marginTop: 8 }}>
            {["2", "3", "4", "5", "6", "7", "8", "9", "10", "A"].map((r) => {
              const v = valeurCarte(sy, r, "p");
              const fond =
                v > 0 ? "color-mix(in srgb, var(--rouge) 34%, var(--panneau))"
                : v < 0 ? "color-mix(in srgb, var(--bleu) 34%, var(--panneau))"
                : "var(--panneau)";
              return (
                <span
                  key={r}
                  className="mono"
                  style={{
                    flex: 1,
                    textAlign: "center",
                    fontSize: 9.5,
                    fontWeight: 700,
                    padding: "3px 0 4px",
                    borderRadius: 2,
                    background: fond,
                    border: "1px solid var(--regle)",
                    lineHeight: 1.15,
                  }}
                >
                  {r}
                  <span style={{ display: "block", color: "var(--encre2)", fontWeight: 400 }}>
                    {v > 0 ? "+" : ""}
                    {String(v).replace(".", ",")}
                  </span>
                </span>
              );
            })}
          </div>
        </button>
        <button
          onClick={basculer}
          aria-expanded={ouvert}
          aria-label={`Résumé du système ${sy.nom}`}
          style={{
            width: 34,
            height: 34,
            borderRadius: "50%",
            flexShrink: 0,
            border: `1px solid ${ouvert ? "var(--encre)" : "var(--regle)"}`,
            background: ouvert ? "var(--encre)" : "transparent",
            color: ouvert ? "var(--panneau)" : "var(--encre2)",
            fontSize: 13,
            fontWeight: 700,
            fontStyle: "italic",
          }}
        >
          i
        </button>
      </div>

      <div style={{ display: "flex", gap: 18, marginTop: 12, flexWrap: "wrap", fontSize: 12 }}>
        <span style={{ display: "flex", alignItems: "center", gap: 6, color: "var(--encre2)" }}>
          Précision <Pips n={sy.precision} couleur="var(--bleu)" />
        </span>
        <span style={{ display: "flex", alignItems: "center", gap: 6, color: "var(--encre2)" }}>
          Complexité <Pips n={sy.complexite} couleur="var(--rouge)" />
        </span>
      </div>

      {/* Les trois indicateurs deviennent des jauges : trois nombres entre 0,5
          et 1 ne se comparent pas à l'œil, trois barres si. Le nom complet
          remplace le sigle, qu'il fallait aller chercher en haut de page. */}
      <div style={{ display: "grid", gap: 6, marginTop: 11 }}>
        {[
          ["Mise", sy.bc, "var(--bleu)", "savoir quand miser gros"],
          ["Jeu", sy.pe, "var(--or)", "savoir quand dévier du tableau"],
          ["Assurance", sy.ic, "var(--ok)", "savoir quand assurer"],
        ].map(([nom, v, couleur, quoi]) => (
          <div key={nom} style={{ display: "flex", alignItems: "center", gap: 9 }}>
            <span style={{ fontSize: 11.5, color: "var(--encre2)", width: 66, flexShrink: 0 }} title={quoi}>
              {nom}
            </span>
            <span
              style={{
                flex: 1,
                height: 5,
                borderRadius: 999,
                background: "var(--regle)",
                position: "relative",
                overflow: "hidden",
                minWidth: 40,
              }}
            >
              <span
                style={{
                  position: "absolute",
                  inset: 0,
                  /* L'échelle part de 0,5 : sous cette valeur un indicateur
                     n'a plus d'intérêt pratique, et l'étirement rend les
                     écarts entre systèmes lisibles. */
                  width: `${Math.max(0, Math.min(1, (v - 0.5) / 0.5)) * 100}%`,
                  background: couleur,
                  opacity: 0.8,
                }}
              />
            </span>
            <span className="mono" style={{ fontSize: 12, fontWeight: 700, width: 32, textAlign: "right", flexShrink: 0 }}>
              {String(v).replace(".", ",")}
            </span>
          </div>
        ))}
      </div>
      <div style={{ ...S.eyebrow, fontSize: 9.5, color: "var(--encre2)", marginTop: 8 }}>
        {sy.tc ? "vrai compte requis" : "sans division"}
      </div>

      {ouvert && (
        <div
          className="bjc-pop"
          style={{
            marginTop: 12,
            background: "var(--ecran)",
              border: "1px solid var(--ecran-bord)",
            color: "var(--ecran-texte)",
            padding: "13px 14px",
            borderRadius: 3,
            fontSize: 13.5,
            lineHeight: 1.55,
          }}
        >
          <div className="mono" style={{ fontSize: 10, letterSpacing: ".1em", color: "var(--ecran-sourd)", marginBottom: 6 }}>
            {sy.equilibre ? "ÉQUILIBRÉ" : "DÉSÉQUILIBRÉ"}
            {sy.asSepare ? " · COMPTAGE D'AS" : ""}
            {sy.couleurRequise ? " · COULEURS" : ""}
          </div>
          {sy.resume}
          <button
            onClick={choisir}
            style={{
              marginTop: 12,
              width: "100%",
              padding: "10px 0",
              borderRadius: 3,
              background: "var(--ecran-texte)",
              color: "var(--ecran)",
              fontWeight: 700,
              fontSize: 13.5,
            }}
          >
            Ouvrir la fiche
          </button>
        </div>
      )}
    </div>
  );
}

function VueMenu({ systemeId, setSysteme, allerA, mobile, wrap }) {
  const [info, setInfo] = useState(null);

  /* Le détail se referme dès qu'on agit ailleurs, comme les panneaux du journal
     et des paramètres. */
  useEffect(() => {
    if (info === null) return;
    const dehors = (e) => {
      if (e.target.closest?.("[data-systeme]")) return;
      if (e.target.closest?.("[role='dialog'], [data-superpose]")) return;
      if (!e.target.closest?.("button, a, input, select, textarea, label")) return;
      setInfo(null);
    };
    document.addEventListener("click", dehors, true);
    return () => document.removeEventListener("click", dehors, true);
  }, [info]);

  return (
    <div style={wrap}>
      <div style={{ padding: mobile ? "22px 0 18px" : "44px 0 20px", maxWidth: 660 }}>
        <div style={S.eyebrow}>Récapitulatif comparatif</div>
        <h1
          style={{
            fontSize: "clamp(26px,6.4vw,44px)",
            lineHeight: 1.03,
            margin: "10px 0 12px",
            fontWeight: 700,
          }}
        >
          Systèmes de comptage
        </h1>
        <p style={{ fontSize: mobile ? 15 : 16.5, lineHeight: 1.62, color: "var(--encre2)", margin: 0 }}>
          {mobile ? "Touchez le bouton d'info" : "Survolez le bouton d'info"} d'une ligne pour le résumé, ou
          choisissez un système pour ouvrir sa fiche, son compteur et ses exercices. Les trois jauges viennent des
          simulations publiées : <b style={{ color: "var(--encre)" }}>mise</b> pour savoir quand miser gros,{" "}
          <b style={{ color: "var(--encre)" }}>jeu</b> pour savoir quand dévier du tableau, et{" "}
          <b style={{ color: "var(--encre)" }}>assurance</b>. Plus la barre est longue, mieux c'est.
        </p>
      </div>

      {mobile ? (
        <div style={{ display: "grid", gap: 10 }}>
          {ORDRE.map((id) => (
            <LigneMobile
              key={id}
              sy={SYSTEMS[id]}
              actif={id === systemeId}
              ouvert={info === id}
              basculer={(e) => {
                const o = info === id ? null : id;
                setInfo(o);
                if (o) amener(e.currentTarget.closest("[data-systeme]"));
              }}
              choisir={() => {
                /* Remontée avant le rendu, comme partout ailleurs : la fiche
                   s'ouvre en haut, sans image intermédiaire. */
                window.scrollTo(0, 0);
                setSysteme(id);
                allerA("fiche");
              }}
            />
          ))}
        </div>
      ) : (
        <div style={{ ...S.panneau, overflowX: "auto" }}>
          <table style={{ borderCollapse: "collapse", width: "100%", minWidth: 720 }}>
            <thead>
              <tr style={{ borderBottom: "1px solid var(--encre)" }}>
                {["Système", "Niv.", "Précision", "Complexité", "CM", "EJ", "CA", "Vrai compte", ""].map((t, i) => (
                  <th
                    key={i}
                    style={{ ...S.eyebrow, textAlign: i === 0 ? "left" : "center", padding: "12px 14px", fontSize: 10 }}
                  >
                    {t}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {ORDRE.map((id) => {
                const sy = SYSTEMS[id];
                const actif = id === systemeId;
                return (
                  <tr
                    key={id}
                    className="bjc-ligne"
                    style={{ borderBottom: "1px solid var(--regle)", background: actif ? "var(--survol)" : "transparent" }}
                  >
                    <td style={{ padding: "13px 14px" }}>
                      <button
                        onClick={() => {
                          setSysteme(id);
                          allerA("fiche");
                        }}
                        style={{ textAlign: "left" }}
                      >
                        <div style={{ fontWeight: 700, fontSize: 15.5, display: "flex", alignItems: "center", gap: 8 }}>
                          {actif && <span style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--rouge)" }} />}
                          {sy.nom}
                        </div>
                        <div style={{ fontSize: 12.5, color: "var(--encre2)" }}>{sy.sous}</div>
                      </button>
                    </td>
                    <td className="mono" style={{ textAlign: "center", fontSize: 13 }}>{sy.niveau}</td>
                    <td style={{ textAlign: "center" }}><Pips n={sy.precision} couleur="var(--bleu)" /></td>
                    <td style={{ textAlign: "center" }}><Pips n={sy.complexite} couleur="var(--rouge)" /></td>
                    <td className="mono" style={{ textAlign: "center", fontSize: 13 }}>{sy.bc}</td>
                    <td className="mono" style={{ textAlign: "center", fontSize: 13 }}>{sy.pe}</td>
                    <td className="mono" style={{ textAlign: "center", fontSize: 13 }}>{sy.ic}</td>
                    <td style={{ textAlign: "center", fontSize: 12.5, color: "var(--encre2)" }}>
                      {sy.tc ? "requis" : "non"}
                    </td>
                    <td style={{ textAlign: "center", padding: "0 12px", position: "relative" }}>
                      <button
                        aria-label={`Résumé du système ${sy.nom}`}
                        onMouseEnter={() => setInfo(id)}
                        onMouseLeave={() => setInfo(null)}
                        onFocus={() => setInfo(id)}
                        onBlur={() => setInfo(null)}
                        onClick={() => setInfo(info === id ? null : id)}
                        style={{
                          width: 26,
                          height: 26,
                          borderRadius: "50%",
                          border: `1px solid ${info === id ? "var(--encre)" : "var(--regle)"}`,
                          background: info === id ? "var(--encre)" : "transparent",
                          color: info === id ? "var(--panneau)" : "var(--encre2)",
                          fontSize: 12,
                          fontWeight: 700,
                          fontStyle: "italic",
                          lineHeight: 1,
                        }}
                      >
                        i
                      </button>
                      {info === id && (
                        <div
                          className="bjc-pop"
                          role="tooltip"
                          style={{
                            position: "absolute",
                            right: 8,
                            top: "100%",
                            zIndex: 30,
                            width: 320,
                            background: "var(--ecran)",
              border: "1px solid var(--ecran-bord)",
                            color: "var(--ecran-texte)",
                            padding: "14px 16px",
                            borderRadius: 4,
                            textAlign: "left",
                            fontSize: 13.5,
                            lineHeight: 1.55,
                            boxShadow: "var(--ombre-forte)",
                          }}
                        >
                          <div
                            className="mono"
                            style={{ fontSize: 10.5, letterSpacing: ".1em", color: "var(--ecran-sourd)", marginBottom: 7 }}
                          >
                            {sy.equilibre ? "ÉQUILIBRÉ" : "DÉSÉQUILIBRÉ"}
                            {sy.asSepare ? " · COMPTAGE D'AS" : ""}
                            {sy.couleurRequise ? " · COULEURS" : ""}
                          </div>
                          {sy.resume}
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <div style={{ marginTop: 18, display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(210px,1fr))", gap: 10 }}>
        {[
          ["Si vous débutez", "Hi-Lo. Aucune exception raisonnable.", "hilo"],
          ["Si la division vous bloque", "KO ou Red 7 : le compte se lit tel quel.", "ko"],
          ["Après le Hi-Lo", "Zen Count : plus précis, sans second compteur.", "zen"],
          ["Pour jouer sans effort", "Ace-Five : gain minime, erreur quasi nulle.", "ace5"],
        ].map(([titre, texte, id]) => (
          <button
            key={id}
            onClick={() => {
              setSysteme(id);
              allerA("fiche");
            }}
            style={{ ...S.panneau, padding: "15px 16px", textAlign: "left" }}
          >
            <div style={{ ...S.eyebrow, marginBottom: 6 }}>{titre}</div>
            <div style={{ fontSize: 14.5, lineHeight: 1.5 }}>{texte}</div>
          </button>
        ))}
      </div>
    </div>
  );
}

/* ============================================================
   VUE 2 — FICHE
   ============================================================ */

function TableValeurs({ sys, mobile }) {
  // Les enseignes sont tirées au hasard, sauf celles dont la
  // couleur porte une information — le sept du Red 7.
  /* Une enseigne au hasard par rang : le tableau n'est plus lié au logo. */
  const tirage = () => {
    const e = ENSEIGNES_LOGO[Math.floor(Math.random() * ENSEIGNES_LOGO.length)];
    return { glyphe: e.glyphe, couleur: e.rouge ? "rouge" : "noir" };
  };
  const cols = sys.couleurRequise
    ? ["A", "2", "3", "4", "5", "6", "7♥", "7♠", "8", "9", "10 V D R"]
    : ["A", "2", "3", "4", "5", "6", "7", "8", "9", "10 V D R"];

  const val = (c) => {
    if (c === "7♥") return sys.valeurSpeciale.rouge;
    if (c === "7♠") return sys.valeurSpeciale.noir;
    if (c.startsWith("10")) return sys.valeurs[T] ?? 0;
    return sys.valeurs[c] ?? 0;
  };

  /* Les rangs sont regroupés par valeur : c'est ainsi qu'on retient un
     système, pas rang par rang. */
  const groupes = useMemo(() => {
    const m = new Map();
    for (const c of cols) {
      const v = val(c);
      if (!m.has(v)) m.set(v, []);
      m.get(v).push(c);
    }
    return [...m.entries()].sort((a, b) => b[0] - a[0]);
  }, [sys]);

  /* Un rang peut représenter plusieurs cartes : « 10 V D R » en dessine quatre. */
  const cartes = (c) => {
    if (c === "7♥") return [{ rang: "7", enseigne: "♥", couleur: "rouge" }];
    if (c === "7♠") return [{ rang: "7", enseigne: "♠", couleur: "noir" }];
    if (c.startsWith("10"))
      return ["10", "V", "D", "R"].map((r) => {
        const t = tirage();
        return { rang: r, enseigne: t.glyphe, couleur: t.couleur };
      });
    const t = tirage();
    return [{ rang: c, enseigne: t.glyphe, couleur: t.couleur }];
  };

  return (
    <div style={{ display: "grid", gap: 10 }}>
      {sys.couleurRequise && (
        <p style={{ fontSize: 13, lineHeight: 1.55, color: "var(--encre2)", margin: 0 }}>
          Le sept est le seul rang dont la couleur compte : les deux rouges valent {fmt(sys.valeurSpeciale.rouge)}, les
          deux noirs {fmt(sys.valeurSpeciale.noir)}. Les autres cartes gardent leur valeur quelle que soit l'enseigne.
        </p>
      )}
      {groupes.map(([v, rangs]) => {
        const teinte = v > 0 ? "var(--rouge)" : v < 0 ? "var(--bleu)" : "var(--encre2)";
        return (
          <div
            key={v}
            style={{
              display: "flex",
              alignItems: "center",
              gap: mobile ? 10 : 16,
              border: `1px solid ${v === 0 ? "var(--regle)" : teinte}`,
              borderLeft: `3px solid ${teinte}`,
              borderRadius: 3,
              padding: mobile ? "10px 11px" : "12px 15px",
            }}
          >
            <div
              className="mono"
              style={{ fontSize: mobile ? 26 : 32, fontWeight: 700, color: teinte, minWidth: mobile ? 42 : 54, flexShrink: 0 }}
            >
              {fmt(v)}
            </div>
            <div style={{ display: "flex", gap: mobile ? 3 : 5, flexWrap: "wrap", alignItems: "center" }}>
              {rangs.flatMap((c) =>
                cartes(c).map((f) => (
                  <CarteFace key={c + f.rang + f.enseigne} {...f} taille={mobile ? 0.4 : 0.46} anime={false} />
                ))
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function Bloc({ titre, children }) {
  return (
    <div style={{ marginTop: 28 }}>
      <div style={{ ...S.eyebrow, borderTop: "1px solid var(--encre)", paddingTop: 10, marginBottom: 12 }}>{titre}</div>
      {children}
    </div>
  );
}

function Liste({ items, marque, signe }) {
  return (
    <ul style={{ margin: 0, padding: 0, listStyle: "none", display: "grid", gap: 9 }}>
      {items.map((t, i) => (
        <li key={i} style={{ display: "flex", gap: 11, fontSize: 15, lineHeight: 1.58 }}>
          <span className="mono" style={{ color: marque, flexShrink: 0, fontWeight: 700 }}>{signe}</span>
          <span>{t}</span>
        </li>
      ))}
    </ul>
  );
}

function VueFiche({ sys, allerA, mobile, wrap, reglages }) {
  return (
    <div style={wrap}>
      <div style={{ padding: mobile ? "22px 0 18px" : "44px 0 20px" }}>
        {/* La fiche n'a plus son onglet : elle s'ouvre depuis la liste, donc
            elle porte son propre retour, comme un exercice. */}
        <button
          onClick={() => {
            window.scrollTo(0, 0);
            allerA("recap");
          }}
          style={{ fontSize: 13, fontWeight: 600, color: "var(--encre2)", marginBottom: 12, display: "block" }}
        >
          <span className="mono" aria-hidden="true">←</span> Tous les systèmes
        </button>
        <div style={S.eyebrow}>Fiche — niveau {sys.niveau}</div>
        <h1 style={{ fontSize: "clamp(26px,6.4vw,44px)", lineHeight: 1.03, margin: "10px 0 6px", fontWeight: 700 }}>
          {sys.nom}
        </h1>
        <div style={{ fontSize: 16.5, color: "var(--encre2)" }}>{sys.sous}</div>
        <div style={{ display: "flex", gap: 9, marginTop: 18, flexWrap: "wrap" }}>
          <button
            onClick={() => allerA("compteur")}
            className="bjc-tap"
            style={{
              flex: mobile ? "1 1 140px" : "0 0 auto",
              background: "var(--encre)",
              color: "var(--panneau)",
              padding: "13px 20px",
              borderRadius: 3,
              fontWeight: 700,
              fontSize: 14.5,
            }}
          >
            Ouvrir le compteur
          </button>
          <button
            onClick={() => allerA("entrainement")}
            className="bjc-tap"
            style={{
              flex: mobile ? "1 1 140px" : "0 0 auto",
              border: "1px solid var(--encre)",
              padding: "13px 20px",
              borderRadius: 3,
              fontWeight: 700,
              fontSize: 14.5,
            }}
          >
            S'entraîner
          </button>
        </div>
      </div>

      <div style={{ ...S.panneau, marginTop: 24, padding: mobile ? "16px 15px 18px" : "22px" }}>
        <div style={{ ...S.eyebrow, marginBottom: 12 }}>Table des valeurs</div>
        <TableValeurs sys={sys} mobile={mobile} />
        {/* Trois colonnes fixes : les six caractéristiques tombent en deux
            lignes pleines, au lieu de 4 + 2 avec une rangée à moitié vide. */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: mobile ? "repeat(3,1fr)" : "repeat(6,1fr)",
            gap: 1,
            marginTop: 18,
            background: "var(--regle)",
            border: "1px solid var(--regle)",
          }}
        >
          {[
            ["Mise", sys.bc, "Corrélation de mise"],
            ["Jeu", sys.pe, "Efficacité de jeu"],
            ["Assurance", sys.ic, "Corrélation d'assurance"],
            ["Compte", sys.equilibre ? "équilibré" : "déséquilibré", "Compte équilibré ou non"],
            ["Vrai compte", sys.tc ? "requis" : "non utilisé", "Division par les paquets restants"],
            ["As", sys.asSepare ? "à part" : "non", "Comptage des As sur un compteur séparé"],
          ].map(([k, v, aide]) => (
            <div key={k} title={aide} style={{ background: "var(--panneau)", padding: mobile ? "9px 8px" : "10px 12px" }}>
              <div style={{ fontSize: 9.5, letterSpacing: ".07em", textTransform: "uppercase", color: "var(--encre2)" }}>{k}</div>
              <div className="mono" style={{ fontSize: mobile ? 14 : 15.5, fontWeight: 700, marginTop: 3, lineHeight: 1.2 }}>{v}</div>
            </div>
          ))}
        </div>

        <p style={{ fontSize: 12.5, lineHeight: 1.6, color: "var(--encre2)", margin: "10px 0 0" }}>
          Les trois premiers sont des corrélations, de 0 à 1. <b>Mise</b> : le compte prédit-il bien l'avantage, donc
          le moment de miser gros. <b>Jeu</b> : aide-t-il à décider des mains. <b>Assurance</b> : repère-t-il les
          sabots où l'assurance devient rentable.
        </p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: mobile ? "1fr" : "repeat(auto-fit,minmax(320px,1fr))", gap: mobile ? 0 : 34 }}>
        <div>
          <Bloc titre="Fonctionnement">
            <p style={{ fontSize: 15.5, lineHeight: 1.68, margin: 0 }}>{sys.fonctionnement}</p>
            {!sys.equilibre && (
              <div
                style={{
                  marginTop: 14,
                  padding: "12px 14px",
                  background: "var(--ecran)",
              border: "1px solid var(--ecran-bord)",
                  color: "var(--ecran-texte)",
                  borderRadius: 3,
                  fontSize: 14,
                  lineHeight: 1.55,
                }}
              >
                <span className="mono" style={{ fontSize: 10.5, letterSpacing: ".1em", color: "var(--ecran-sourd)" }}>
                  COMPTE INITIAL
                </span>
                <div style={{ marginTop: 6, display: "flex", flexWrap: "wrap", gap: "4px 16px" }}>
                  {[1, 2, 6, 8].map((d) => (
                    <span key={d} className="mono" style={{ fontSize: 13.5 }}>
                      {d} paquet{d > 1 ? "s" : ""} : <b>{fmt(sys.irc(d))}</b>
                    </span>
                  ))}
                </div>
                <div style={{ marginTop: 8, color: "var(--ecran-sourd)" }}>Pivot : {fmt(sys.pivot)}</div>
              </div>
            )}
          </Bloc>

          <Bloc titre="Avantages">
            <Liste items={sys.avantages} marque="var(--bleu)" signe="+" />
          </Bloc>

          <Bloc titre="Inconvénients">
            <Liste items={sys.inconvenients} marque="var(--rouge)" signe="−" />
          </Bloc>
        </div>

        <div>
          <Bloc titre="Pour qui">
            <p style={{ fontSize: 15.5, lineHeight: 1.68, margin: 0 }}>{sys.pourQui}</p>
          </Bloc>

          <Bloc titre="Conseils d'apprentissage">
            <ol style={{ margin: 0, padding: 0, listStyle: "none", display: "grid", gap: 12 }}>
              {sys.conseils.map((c, i) => (
                <li key={i} style={{ display: "flex", gap: 12, fontSize: 15, lineHeight: 1.58 }}>
                  <span className="mono" style={{ color: "var(--or)", fontWeight: 700, flexShrink: 0 }}>
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span>{c}</span>
                </li>
              ))}
            </ol>
          </Bloc>

          {sys.indices && (
            <Bloc titre="Indices de déviation — les Illustrious 18">
              <p style={{ fontSize: 14, lineHeight: 1.6, color: "var(--encre2)", marginTop: 0 }}>
                Écarts à la stratégie de base établis par Don Schlesinger, classés par valeur. L'assurance à elle seule
                pèse environ un tiers du gain, et les trois premiers près de 60 %. Lisez chaque ligne ainsi : dès que le
                vrai compte atteint l'indice, vous remplacez le jeu de base par la déviation.
              </p>
              <div style={{ ...S.panneau, padding: "2px 0" }}>
                {sys.indices.map(([main, base, dev, seuil], i) => (
                  <div
                    key={i}
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "baseline",
                      gap: 10,
                      padding: "9px 13px",
                      borderBottom: i < sys.indices.length - 1 ? "1px solid var(--regle)" : "none",
                      fontSize: 14,
                    }}
                  >
                    <span style={{ flex: 1 }}>
                      <b>{main}</b>
                      <span style={{ color: "var(--encre2)" }}>
                        {" "}
                        — {base} <span style={{ color: "var(--or)" }}>→</span> {dev}
                      </span>
                    </span>
                    <span className="mono" style={{ fontWeight: 700, color: "var(--bleu)", flexShrink: 0 }}>
                      {seuil}
                    </span>
                  </div>
                ))}
              </div>

              <div style={{ ...S.eyebrow, marginTop: 20, marginBottom: 8 }}>Les Fab 4 — abandons</div>
              <p style={{ fontSize: 14, lineHeight: 1.6, color: "var(--encre2)", marginTop: 0 }}>
                Quatre abandons supplémentaires, à ajouter seulement si votre table propose l'abandon tardif.
              </p>
              <div style={{ ...S.panneau, padding: "2px 0" }}>
                {sys.fab4.map(([main, seuil], i) => (
                  <div
                    key={i}
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      gap: 10,
                      padding: "9px 13px",
                      borderBottom: i < sys.fab4.length - 1 ? "1px solid var(--regle)" : "none",
                      fontSize: 14,
                    }}
                  >
                    <span>
                      <b>{main}</b> <span style={{ color: "var(--encre2)" }}>— abandonner</span>
                    </span>
                    <span className="mono" style={{ fontWeight: 700, color: "var(--bleu)", flexShrink: 0 }}>
                      {seuil}
                    </span>
                  </div>
                ))}
              </div>

              <p style={{ fontSize: 13, lineHeight: 1.6, color: "var(--encre2)", marginTop: 14 }}>
                Ces indices valent pour le Hi-Lo en six paquets. Ils se décalent d'un point ou deux selon les règles et
                le nombre de paquets, et les tables publiées diffèrent légèrement selon les conventions d'arrondi
                retenues au moment du calcul. Un autre système de comptage exige ses propres indices : ceux-ci ne se
                transposent pas.
              </p>
            </Bloc>
          )}
        </div>
      </div>
    </div>
  );
}

/* Gain horaire simulé au Hi-Lo, écart de mise 1 à 12, unité de 10 €, 60 tours par heure.
   Trois millions de tours par valeur. Sert de repère pour juger une pénétration. */
const GAIN_PAR_PENETRATION = {
  2: { 50: 6.76, 60: 10.95, 70: 16.33, 75: 16.31, 80: 22.98 },
  4: { 50: 0.52, 60: 2.72, 70: 5.9, 75: 7.56, 80: 9.93 },
  6: { 50: -1.28, 60: 0.01, 70: 2.03, 75: 3.87, 80: 4.97 },
  8: { 50: -2.08, 60: -1.19, 70: 0.53, 75: 1.62, 80: 2.88 },
};
const gainsPour = (paquets) => {
  const dispo = [2, 4, 6, 8];
  const proche = dispo.reduce((a, b) => (Math.abs(b - paquets) < Math.abs(a - paquets) ? b : a));
  return { paquets: proche, table: GAIN_PAR_PENETRATION[proche] };
};

/* ============================================================
   VUE 3 — COMPTEUR
   ============================================================ */

/* Le chiffre reste toujours en encre pleine — un chiffre coloré sur fond
   d'instrument plafonne à 4,5:1 de contraste. La couleur descend ici, dans un
   cartouche à fond plein, où elle est lue sans être déchiffrée. */
function Cartouche({ mot, fond }) {
  if (!mot) return null;
  return (
    <span
      className="mono"
      style={{
        display: "inline-block",
        background: fond,
        color: "#F7F8F4",
        borderRadius: 2,
        padding: "3px 6px",
        fontSize: 9,
        fontWeight: 700,
        letterSpacing: ".08em",
        textTransform: "uppercase",
        verticalAlign: "middle",
      }}
    >
      {mot}
    </span>
  );
}

function Stat({ k, v, mobile }) {
  return (
    <div>
      <div style={{ ...S.eyebrow, fontSize: 10, color: "var(--ecran-sourd)" }}>{k}</div>
      <div className="mono" style={{ fontSize: mobile ? 15 : 19, fontWeight: 700, marginTop: 2 }}>{v}</div>
    </div>
  );
}

function VueCompteur({ sys, nbPaquets, setNbPaquets, historique, setHistorique, mobile, wrap, hauteurEntete, hauteurSousNav, reglages, majReglage, sabotRepris }) {
  const [repriseVue, setRepriseVue] = useState(false);
  const [gainsOuverts, setGainsOuverts] = useState(false);
  const irc = sys.equilibre ? 0 : sys.irc(nbPaquets);
  const rc = historique.reduce((a, c) => a + c.v, irc);
  /* Les paquets restants se déduisent des cartes comptées. L'ajustement permet
     de corriger à la main quand des cartes vous ont échappé — un joueur qui
     cache son jeu, une main terminée trop vite. */
  const [ajustement, setAjustement] = useState(0);
  const neutres = reglages.neutres;
  const setNeutres = (f) => majReglage("neutres", typeof f === "function" ? f(neutres) : f);
  const coupe = reglages.coupe == null ? null : Math.min(reglages.coupe, nbPaquets - 0.5);
  const setCoupe = (v) => majReglage("coupe", v);
  useEffect(() => setAjustement(0), [nbPaquets]);
  /* Le décompte n'est automatique que si les cartes neutres sont saisies :
     sinon un tiers du sabot passe sans être compté et l'estimation serait
     fausse. Dans ce cas on repasse à un réglage entièrement manuel. */
  const [manuel, setManuel] = useState(nbPaquets);
  useEffect(() => setManuel(nbPaquets), [nbPaquets]);
  const auto = reglages.neutres;
  const restants = auto
    ? Math.max(0, Math.min(nbPaquets, nbPaquets - historique.length / 52 + ajustement))
    : manuel;
  const paquetsRestants = restants;
  const coupeConnue = coupe != null;
  const penetration = coupeConnue ? ((nbPaquets - coupe) / nbPaquets) * 100 : null;
  const sabotFini = coupeConnue && restants <= coupe;
  const qualitePen = !coupeConnue
    ? { mot: "inconnue", couleur: "var(--ecran-sourd)" }
    : penetration >= 75
      ? { mot: "excellente", couleur: "var(--ok)" }
      : penetration >= 68
      ? { mot: "correcte", couleur: "#8FBF7F" }
      : penetration >= 60
      ? { mot: "juste", couleur: "var(--or)" }
      : { mot: "trop faible", couleur: "var(--ecran-rouge)" };
  const tc = sys.tc ? rc / Math.max(paquetsRestants, 0.5) : null;
  const asVus = historique.filter((c) => c.rang === "A").length;
  const asAttendus = 4 * Math.max(nbPaquets - restants, 0);

  const ajouter = useCallback(
    (rang, couleur) => {
      if (navigator.vibrate) navigator.vibrate(8);
      setHistorique((h) => [...h, { rang, couleur, v: valeurCarte(sys, rang, couleur) }]);
    },
    [sys, setHistorique]
  );
  const annuler = useCallback(() => setHistorique((h) => h.slice(0, -1)), [setHistorique]);

  useEffect(() => {
    if (mobile) return;
    const onKey = (e) => {
      if (["INPUT", "SELECT", "TEXTAREA"].includes(e.target.tagName)) return;
      const k = e.key.toLowerCase();
      if (k === "backspace") { e.preventDefault(); return annuler(); }
      if (k === "a") return ajouter("A", "noir");
      if (k === "0" || k === "t") return ajouter("10", "noir");
      if (/^[2-9]$/.test(k)) {
        if (k === "7" && sys.couleurRequise) return;
        return ajouter(k, "noir");
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [ajouter, annuler, sys.couleurRequise, mobile]);

  // Un bouton par valeur de comptage plutôt qu'un bouton par rang.
  const boutons = (() => {
    const parValeur = new Map();
    const ajouterAuGroupe = (v, label, rang, couleur) => {
      if (!parValeur.has(v)) parValeur.set(v, { v, labels: [], rang, couleur });
      parValeur.get(v).labels.push(label);
    };

    if (!sys.asSepare) ajouterAuGroupe(valeurCarte(sys, "A", "noir"), "A", "A", "noir");
    for (let r = 2; r <= 9; r++) {
      if (r === 7 && sys.couleurRequise) {
        ajouterAuGroupe(sys.valeurSpeciale.rouge, "7♥♦", "7", "rouge");
        ajouterAuGroupe(sys.valeurSpeciale.noir, "7♠♣", "7", "noir");
      } else ajouterAuGroupe(valeurCarte(sys, String(r), "noir"), String(r), String(r), "noir");
    }
    ajouterAuGroupe(valeurCarte(sys, "10", "noir"), "10 V D R", "10", "noir");

    // Regroupe les rangs consécutifs : 2, 3, 4, 5, 6 devient 2–6
    const compacter = (labels) => {
      const nombres = labels.filter((l) => /^[2-9]$/.test(l)).map(Number).sort((a, b) => a - b);
      const autres = labels.filter((l) => !/^[2-9]$/.test(l));
      const morceaux = [];
      let i = 0;
      while (i < nombres.length) {
        let j = i;
        while (j + 1 < nombres.length && nombres[j + 1] === nombres[j] + 1) j++;
        morceaux.push(j - i >= 2 ? `${nombres[i]}–${nombres[j]}` : nombres.slice(i, j + 1).join(" "));
        i = j + 1;
      }
      return [...morceaux, ...autres].join(" ");
    };

    const liste = [...parValeur.values()]
      .sort((a, b) => b.v - a.v)
      .map((g) => ({ ...g, label: compacter(g.labels) }));

    const rangee = {
      positifs: liste.filter((g) => g.v > 0),
      neutres: neutres ? liste.filter((g) => g.v === 0) : [],
      negatifs: liste.filter((g) => g.v < 0),
    };

    if (sys.asSepare) {
      rangee.neutres = [
        ...rangee.neutres,
        { v: valeurCarte(sys, "A", "noir"), label: "As", rang: "A", couleur: "noir" },
      ];
    }
    return rangee;
  })();

  const chaud = sys.tc ? tc ?? 0 : rc - (sys.pivot ?? 0);
  const teinteEcran = chaud > 0.5 ? "var(--ecran-rouge)" : chaud < -0.5 ? "var(--ecran-bleu)" : "var(--ecran-texte)";

  const unites = (() => {
    if (sys.id === "ace5") return rc >= 2 ? Math.min(2 ** (rc - 1), 32) : 1;
    const base = sys.tc ? tc ?? 0 : rc - (sys.pivot ?? 0) + 1;
    return Math.max(1, Math.min(12, Math.round(base - 1)));
  })();

  return (
    <div style={wrap}>
      <div
        style={{
          padding: mobile ? "22px 0 18px" : "44px 0 20px",
          display: "flex",
          flexWrap: "wrap",
          gap: 14,
          alignItems: "flex-end",
        }}
      >
        <div style={{ flex: "1 1 200px" }}>
          <div style={S.eyebrow}>Compteur en direct</div>
          <h1 style={{ fontSize: "clamp(26px,6.4vw,44px)", margin: "10px 0 12px", fontWeight: 700 }}>{sys.nom}</h1>
        </div>
        <label style={{ display: "flex", alignItems: "center", gap: 9, fontSize: 13 }}>
          <span style={S.eyebrow}>Paquets</span>
          <select
            value={nbPaquets}
            onChange={(e) => { setNbPaquets(Number(e.target.value)); setHistorique([]); }}
            className="mono"
            style={{
              border: "1px solid var(--regle)",
              background: "var(--panneau)",
              padding: "9px 10px",
              borderRadius: 3,
              fontSize: 14,
            }}
          >
            {[4, 6, 8].map((d) => <option key={d} value={d}>{d}</option>)}
          </select>
        </label>
        <label style={{ display: "flex", alignItems: "center", gap: 9, fontSize: 13 }}>
          <span style={S.eyebrow}>Coupe à</span>
          <select
            value={coupeConnue ? coupe : ""}
            onChange={(e) => setCoupe(e.target.value === "" ? null : Number(e.target.value))}
            className="mono"
            style={{
              border: "1px solid var(--regle)",
              background: "var(--panneau)",
              padding: "9px 10px",
              borderRadius: 3,
              fontSize: 14,
            }}
          >
            <option value="">inconnue</option>
            {Array.from({ length: nbPaquets * 2 }, (_, i) => (i + 1) / 2)
              .filter((v) => v < nbPaquets)
              .map((v) => (
                <option key={v} value={v}>
                  {v.toFixed(1).replace(".", ",")} paquet{v > 1 ? "s" : ""}
                </option>
              ))}
          </select>
        </label>
      </div>

      {/* ÉCRAN — collant sur mobile pour rester visible pendant la saisie */}
      <div
        style={{
          background: "var(--ecran)",
              border: "1px solid var(--ecran-bord)",
          borderRadius: 4,
          padding: mobile ? "12px 14px 11px" : "26px 24px 20px",
          color: "var(--ecran-texte)",
          position: mobile ? "sticky" : "static",
          /* Juste sous la barre des sous-onglets, sans marge : plus bas, il
             mangeait de la hauteur pour rien. */
          top: hauteurEntete + (hauteurSousNav ?? HAUTEUR_SOUSNAV),
          zIndex: 10,
          boxShadow: mobile ? "var(--ombre)" : "none",
        }}
      >
        <div style={{ display: "flex", flexWrap: "wrap", gap: mobile ? 14 : 30, alignItems: "flex-end" }}>
          <div>
            <div style={{ ...S.eyebrow, fontSize: 10, color: "var(--ecran-sourd)" }}>COMPTE COURANT</div>
            <div
              className="mono"
              style={{
                fontSize: mobile ? 46 : "clamp(52px,11vw,86px)",
                fontWeight: 700,
                lineHeight: 1,
                letterSpacing: "-.04em",
                /* Le signe suffit à dire le sens : la couleur le double, une
                   étiquette en plus n'apprenait rien. */
                color: teinteEcran,
              }}
            >
              {fmt(rc)}
            </div>
          </div>
          <div>
            <div className="mono" style={{ ...S.eyebrow, fontSize: 10, color: "var(--ecran-sourd)" }}>
              {sys.tc ? "VRAI COMPTE" : `ÉCART AU PIVOT (${fmt(sys.pivot ?? 0)})`}
            </div>
            <div className="mono" style={{ fontSize: mobile ? 34 : "clamp(34px,7vw,54px)", fontWeight: 700, lineHeight: 1.1 }}>
              {sys.tc ? (tc === null ? "—" : fmt(Math.round(tc * 10) / 10)) : fmt(rc - (sys.pivot ?? 0))}
            </div>
          </div>
          <div style={{ marginLeft: mobile ? 0 : "auto", display: "flex", gap: mobile ? 18 : 26, flexWrap: "wrap" }}>
            <div>
              <div className="mono" style={{ ...S.eyebrow, fontSize: 10, color: "var(--ecran-sourd)" }}>
                PAQUETS RESTANTS {auto ? "" : "· À RÉGLER"}
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 7, marginTop: 2 }}>
                <button
                  onClick={() => (auto ? setAjustement((a) => a - 0.5) : setManuel((v) => Math.max(0, Math.round((v - 0.5) * 2) / 2)))}
                  aria-label="Retirer un demi-paquet"
                  className="mono"
                  style={{
                    width: 28, height: 28, borderRadius: 3, fontSize: 16, lineHeight: 1,
                    border: "1px solid var(--ecran-regle)", color: "var(--ecran-texte)",
                  }}
                >
                  −
                </button>
                <span
                  className="mono"
                  style={{
                    fontSize: mobile ? 17 : 20,
                    fontWeight: 700,
                    minWidth: 28,
                    textAlign: "center",
                    color: auto && ajustement ? "var(--ecran-or)" : "var(--ecran-texte)",
                  }}
                  title={
                    !auto
                      ? "À régler vous-même : les cartes neutres ne sont pas comptées"
                      : ajustement
                      ? `Calculé sur les cartes comptées, corrigé de ${ajustement > 0 ? "+" : ""}${ajustement}`
                      : "Calculé sur les cartes comptées"
                  }
                >
                  {paquetsRestants.toFixed(1).replace(".", ",")}
                </span>
                <button
                  onClick={() => (auto ? setAjustement((a) => a + 0.5) : setManuel((v) => Math.min(nbPaquets, Math.round((v + 0.5) * 2) / 2)))}
                  aria-label="Ajouter un demi-paquet"
                  className="mono"
                  style={{
                    width: 28, height: 28, borderRadius: 3, fontSize: 16, lineHeight: 1,
                    border: "1px solid var(--ecran-regle)", color: "var(--ecran-texte)",
                  }}
                >
                  +
                </button>
              </div>
            </div>
            {/* La pénétration ne figure plus ici : elle est fixée par la table
                et ne bouge pas d'une carte à l'autre. Elle est rappelée plus bas,
                avec sa jauge. */}
            <Stat mobile={mobile} k="MISE INDIC." v={`${unites} u`} />
          </div>
        </div>

        {!mobile && (
          <div style={{ marginTop: 22 }}>
            <div className="mono" style={{ fontSize: 10.5, letterSpacing: ".14em", color: "var(--ecran-sourd)", marginBottom: 7 }}>
              RÉGLETTE DE SABOT
            </div>
            <div
              style={{
                display: "flex",
                gap: 1,
                height: 34,
                background: "var(--ecran-fond2)",
                borderRadius: 2,
                padding: 3,
                overflow: "hidden",
              }}
            >
              {historique.length === 0 && (
                <div style={{ fontSize: 12.5, color: "var(--ecran-sourd)", alignSelf: "center", paddingLeft: 8 }}>
                  Chaque carte saisie laisse une marque ici — rouge si elle fait monter le compte, bleue si elle le fait
                  descendre.
                </div>
              )}
              {historique.slice(-160).map((c, i) => (
                <div
                  key={i}
                  title={`${c.rang} ${fmt(c.v)}`}
                  style={{
                    flex: "1 1 2px",
                    minWidth: 2,
                    maxWidth: 7,
                    background: c.v > 0 ? "var(--ecran-rouge)" : c.v < 0 ? "var(--ecran-bleu)" : "var(--ecran-neutre)",
                    alignSelf: c.v > 0 ? "flex-start" : c.v < 0 ? "flex-end" : "center",
                    height: c.v === 0 ? "34%" : `${Math.min(100, 55 + Math.abs(c.v) * 22)}%`,
                    borderRadius: 1,
                  }}
                />
              ))}
            </div>
          </div>
        )}

        {mobile && historique.length > 0 && (
          <div style={{ display: "flex", gap: 1, height: 12, marginTop: 12, overflow: "hidden" }}>
            {historique.slice(-90).map((c, i) => (
              <div
                key={i}
                style={{
                  flex: "1 1 2px",
                  minWidth: 2,
                  background: c.v > 0 ? "var(--ecran-rouge)" : c.v < 0 ? "var(--ecran-bleu)" : "var(--ecran-neutre)",
                  alignSelf: c.v > 0 ? "flex-start" : c.v < 0 ? "flex-end" : "center",
                  height: c.v === 0 ? "40%" : "100%",
                }}
              />
            ))}
          </div>
        )}

        {sys.asSepare && (
          <div
            style={{
              marginTop: 14,
              paddingTop: 12,
              borderTop: "1px solid var(--ecran-regle)",
              display: "flex",
              gap: mobile ? 12 : 26,
              flexWrap: "wrap",
              alignItems: "center",
            }}
          >
            <div className="mono" style={{ ...S.eyebrow, fontSize: 10, color: "var(--ecran-sourd)" }}>
              COMPTAGE D'AS
            </div>
            <div className="mono" style={{ fontSize: 15 }}>
              vus <b>{asVus}</b> · attendus <b>{asAttendus.toFixed(1).replace(".", ",")}</b> · restants{" "}
              <b>{4 * nbPaquets - asVus}</b>
            </div>
            <div style={{ fontSize: 12.5, color: asVus < asAttendus - 0.7 ? "var(--ok)" : "var(--ecran-sourd)" }}>
              {asVus < asAttendus - 0.7
                ? "Sabot riche en As : montez le vrai compte pour la mise."
                : asVus > asAttendus + 0.7
                ? "Sabot pauvre en As : baissez le vrai compte pour la mise."
                : "Proportion d'As conforme à l'attendu."}
            </div>
          </div>
        )}
      </div>

      {sabotRepris && !repriseVue && historique.length > 0 && (
        <div
          style={{
            ...S.panneau,
            borderLeft: "3px solid var(--or)",
            padding: mobile ? "12px 14px" : "14px 18px",
            marginTop: 10,
            display: "flex",
            alignItems: "center",
            gap: 10,
            flexWrap: "wrap",
          }}
        >
          <span style={{ fontSize: 13.5, lineHeight: 1.5, flex: "1 1 200px" }}>
            Sabot repris là où vous l'aviez laissé, {historique.length} carte{historique.length > 1 ? "s" : ""} déjà
            comptée{historique.length > 1 ? "s" : ""}. Vérifiez qu'il s'agit bien de la même table.
          </span>
          <button
            onClick={() => { setHistorique([]); setRepriseVue(true); }}
            style={{ border: "1px solid var(--encre)", padding: "8px 13px", borderRadius: 3, fontSize: 13, fontWeight: 700 }}
          >
            Nouveau sabot
          </button>
          <button
            onClick={() => setRepriseVue(true)}
            style={{ fontSize: 13, fontWeight: 600, color: "var(--encre2)", textDecoration: "underline", textUnderlineOffset: 2 }}
          >
            Continuer
          </button>
        </div>
      )}

      {coupeConnue ? (
        <>
      <div style={{ marginTop: 10, display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
        {/* Même jauge que « prêt pour la table » : la barre se remplit jusqu'à
            la valeur atteinte, un cran marque le seuil au-delà duquel le
            comptage devient réellement payant. */}
        <div
          style={{
            flex: "1 1 200px",
            height: 7,
            borderRadius: 999,
            background: "var(--regle)",
            position: "relative",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              position: "absolute",
              inset: 0,
              width: `${Math.min(coupeConnue ? penetration : 0, 100)}%`,
              background: qualitePen.couleur,
              opacity: 0.85,
            }}
          />
          <div
            style={{
              position: "absolute",
              top: 0,
              bottom: 0,
              left: "75%",
              width: 2,
              background: "var(--encre)",
            }}
          />
        </div>
        {/* Le pourcentage vit ici depuis qu'il a quitté le cadre collé : la
            jauge seule ne disait plus la valeur. */}
        <span style={{ display: "flex", alignItems: "baseline", gap: 7, flexWrap: "wrap" }}>
          <span className="mono" style={{ fontSize: 15, fontWeight: 700, color: qualitePen.couleur }}>
            {coupeConnue ? `${penetration.toFixed(0)} %` : "—"}
          </span>
          <span style={{ fontSize: 12.5, color: qualitePen.couleur }}>{qualitePen.mot}</span>
          <span style={{ fontSize: 13, color: "var(--encre2)" }}>
            cible 75 % — au-delà, le comptage rapporte vraiment.
          </span>
        </span>
      </div>

      {(() => {
        const g = gainsPour(nbPaquets);
        return (
          <div style={{ ...S.panneau, padding: mobile ? "13px 14px" : "15px 18px", marginTop: 10 }}>
            {/* Replié : ce barème se consulte une fois, pas à chaque sabot. */}
            <button
              onClick={() => setGainsOuverts((o) => !o)}
              aria-expanded={gainsOuverts}
              style={{ width: "100%", display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10, textAlign: "left" }}
            >
              <span style={S.eyebrow}>Ce que rapporte la pénétration — {g.paquets} paquets</span>
              <span className="mono" aria-hidden="true" style={{ fontSize: 15, color: "var(--encre2)", flexShrink: 0 }}>
                {gainsOuverts ? "−" : "+"}
              </span>
            </button>
            {gainsOuverts && (
            <div style={{ marginTop: 9 }}>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(5,1fr)", gap: 4 }}>
              {[50, 60, 70, 75, 80].map((pct) => {
                const v = g.table[pct];
                const proche = Math.abs(penetration - pct) < 3;
                return (
                  <div
                    key={pct}
                    style={{
                      textAlign: "center",
                      padding: "7px 2px",
                      borderRadius: 3,
                      border: `1px solid ${proche ? "var(--encre)" : "transparent"}`,
                      background: proche ? "var(--survol)" : "transparent",
                    }}
                  >
                    <div className="mono" style={{ fontSize: 12, color: "var(--encre2)" }}>{pct} %</div>
                    <div
                      className="mono"
                      style={{
                        fontSize: mobile ? 12.5 : 14,
                        fontWeight: 700,
                        marginTop: 2,
                        color: v > 0 ? "var(--ok)" : "var(--rouge)",
                      }}
                    >
                      {(v >= 0 ? "+" : "−") + Math.abs(v).toFixed(2).replace(".", ",")}
                    </div>
                  </div>
                );
              })}
            </div>
            <p style={{ fontSize: 12.5, lineHeight: 1.55, color: "var(--encre2)", margin: "9px 0 0" }}>
              Gain horaire simulé au Hi-Lo : unité de 10 €, écart de mise de 1 à 12, soixante tours par heure,
              blackjack payé 3:2.
              {reglages.paiement === "6:5"
                ? " Votre table est relevée en 6:5 : retranchez environ 1,4 % à ces montants, qui deviennent tous négatifs."
                : reglages.paiement === "?"
                ? " Le paiement de votre table n'est pas relevé. En 6:5, tous ces montants deviennent négatifs."
                : ""}
            </p>
            </div>
            )}
          </div>
        );
      })()}
        </>
      ) : (
        <div
          style={{
            ...S.panneau,
            padding: mobile ? "13px 14px" : "15px 18px",
            marginTop: 10,
            borderLeft: "3px solid var(--regle)",
            fontSize: 14, 
            lineHeight: 1.55,
            color: "var(--encre2)",
          }}
        >
          Carte de coupe inconnue : la pénétration ne peut pas être calculée, et c'est le chiffre qui décide si le
          comptage vaut quelque chose à cette table. Comptez les tours entre deux mélanges, multipliez par le nombre de
          cartes distribuées par tour, puis renseignez la valeur.
        </div>
      )}

      {sabotFini && (
        <div
          style={{
            marginTop: 12,
            padding: "12px 15px",
            borderRadius: 3,
            background: "var(--err-fond)",
            border: "1px solid var(--rouge)",
            fontSize: 14.5,
            lineHeight: 1.55,
          }}
        >
          <b>Carte de coupe atteinte.</b> Le croupier mélange : le compte repart de{" "}
          {sys.equilibre ? "zéro" : fmt(irc)}. Sur ce sabot, votre diviseur n'est jamais descendu sous{" "}
          {coupe.toFixed(1).replace(".", ",")} — c'est ce qui limite le vrai compte atteignable, et donc tout ce que
          le comptage peut rapporter ici.
        </div>
      )}

      {/* CLAVIER — trois colonnes plutôt que trois rangées : le pouce parcourt
          une famille de haut en bas, et les trois familles restent côte à côte. */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: `repeat(${["negatifs", "neutres", "positifs"].filter((r) => boutons[r].length).length},1fr)`,
          gap: mobile ? 8 : 9,
          marginTop: mobile ? 12 : 18,
          /* Les colonnes s'alignent sur la plus haute, et leurs boutons se
             partagent cette hauteur : trois blocs de même encombrement. */
          alignItems: "stretch",
        }}
      >
        {["negatifs", "neutres", "positifs"].map((rangee) => {
          /* Les négatifs se lisent de bas en haut : la valeur la plus forte
             tombe sous le pouce, comme dans les deux autres colonnes. */
          const groupe = rangee === "negatifs" ? [...boutons[rangee]].reverse() : boutons[rangee];
          if (!groupe.length) return null;
          return (
            <div
              key={rangee}
              style={{
                display: "grid",
                gridTemplateColumns: "1fr",
                gridAutoRows: "1fr",
                gap: mobile ? 8 : 9,
              }}
            >
              {groupe.map((b, i) => {
                const v = b.v;
                const teinte = v > 0 ? "var(--rouge)" : v < 0 ? "var(--bleu)" : "var(--encre2)";
                return (
                  <button
                    key={i}
                    className="bjc-tap"
                    onClick={() => ajouter(b.rang, b.couleur)}
                    style={{
                      minHeight: mobile ? 56 : 64,
                      padding: "9px 6px",
                      background: "var(--panneau)",
                      border: `1px solid ${v === 0 ? "var(--regle)" : teinte}`,
                      borderTop: `3px solid ${v === 0 ? "var(--regle)" : teinte}`,
                      borderRadius: 3,
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 5,
                    }}
                  >
                    <div
                      className="mono"
                      style={{ fontSize: mobile ? 26 : 30, fontWeight: 700, color: teinte, lineHeight: 1 }}
                    >
                      {fmt(v)}
                    </div>
                    <div
                      className="mono"
                      style={{
                        fontSize: b.label.length > 8 ? 11 : 12.5,
                        color: "var(--encre2)",
                        lineHeight: 1.2,
                        textAlign: "center",
                      }}
                    >
                      {b.label}
                    </div>
                  </button>
                );
              })}
            </div>
          );
        })}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: mobile ? "1fr 1fr" : "auto auto auto 1fr", gap: 9, marginTop: 10, alignItems: "center" }}>
        <button
          onClick={annuler}
          disabled={!historique.length}
          className="bjc-tap"
          style={{
            border: "1px solid var(--encre)",
            padding: "13px 18px",
            borderRadius: 3,
            fontWeight: 700,
            fontSize: 14,
            opacity: historique.length ? 1 : 0.35,
          }}
        >
          Annuler
        </button>
        <button
          onClick={() => { setHistorique([]); setAjustement(0); setManuel(nbPaquets); }}
          className="bjc-tap"
          style={{
            background: "var(--encre)",
            color: "var(--panneau)",
            padding: "13px 18px",
            borderRadius: 3,
            fontWeight: 700,
            fontSize: 14,
          }}
        >
          Nouveau sabot
        </button>
        <button
          onClick={() => setNeutres((n) => !n)}
          style={{
            gridColumn: mobile ? "span 2" : "auto",
            border: "1px dashed var(--regle)",
            padding: "11px 16px",
            borderRadius: 3,
            fontWeight: 600,
            fontSize: 13.5,
            color: "var(--encre2)",
          }}
        >
          {neutres ? "Masquer les cartes neutres" : "Afficher les cartes neutres"}
        </button>
        {!mobile && (
          <span style={{ fontSize: 13, color: "var(--encre2)" }}>
            Clavier : <b className="mono">2</b>–<b className="mono">9</b>, <b className="mono">0</b> pour les dix,{" "}
            <b className="mono">A</b> pour l'As, <b className="mono">retour arrière</b> pour annuler.
          </span>
        )}
      </div>

      {sys.equilibre && restants <= 0 && (
        <div
          style={{
            marginTop: 14,
            padding: "14px 16px",
            borderRadius: 3,
            background: rc === 0 ? "var(--ok-fond)" : "var(--err-fond)",
            border: `1px solid ${rc === 0 ? "var(--ok-bord)" : "var(--rouge)"}`,
            fontSize: 15,
          }}
        >
          {rc === 0
            ? "Sabot terminé, compte à zéro : votre comptage est juste."
            : `Sabot terminé sur ${fmt(rc)} au lieu de 0 : une erreur s'est glissée quelque part.`}
        </div>
      )}
    </div>
  );
}

/* ============================================================
   VUE 4 — ENTRAÎNEMENT
   ============================================================ */

/* Exercice de stratégie de base : une main réelle, la décision attendue. */
function tirerMainExercice() {
  const enseigne = () => ENSEIGNES[Math.floor(Math.random() * 4)];
  const carte = (v) => ({ rang: v === 1 ? "A" : v === 10 ? ["10", "V", "D", "R"][Math.floor(Math.random() * 4)] : String(v), ...enseigne(), v });
  const famille = Math.random();

  if (famille < 0.25) {
    // Paire
    const v = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 10, 10][Math.floor(Math.random() * 12)];
    const label = v === 1 ? "A,A" : `${v},${v}`;
    return { cartes: [carte(v), carte(v)], valeurs: [v, v], label };
  }
  if (famille < 0.5) {
    // Main souple
    const x = 2 + Math.floor(Math.random() * 8); // 2 à 9
    return { cartes: [carte(1), carte(x)], valeurs: [1, x], label: `A,${x}` };
  }
  // Main dure, sans paire
  const cible = [5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19][Math.floor(Math.random() * 15)];
  const combos = [];
  for (let a = 2; a <= 10; a++) {
    const b = cible - a;
    if (b >= 2 && b <= 10 && a !== b) combos.push([a, b]);
  }
  if (!combos.length) return tirerMainExercice();
  const [a, b] = combos[Math.floor(Math.random() * combos.length)];
  const label = cible <= 8 ? "5 à 8" : cible >= 18 ? "18 à 21" : String(cible);
  return { cartes: [carte(a), carte(b)], valeurs: [a, b], label };
}

/** Bilan commun aux exercices à série fixe. */
const styleChamp = {
  width: "100%",
  padding: "11px 12px",
  fontSize: 15,
  fontFamily: "inherit",
  color: "var(--encre)",
  background: "var(--panneau)",
  border: "1px solid var(--regle)",
  borderRadius: 3,
};

/** Renvoi vers la fiche du système, depuis un exercice. */
function BilanSerie({ mobile, score, seuil, titre, lignes, conseil, recommencer }) {
  const reussite = score.total ? Math.round((score.bon / score.total) * 100) : 0;
  return (
    <div style={{ ...S.panneau, padding: mobile ? "26px 18px" : "38px 26px", textAlign: "center" }}>
      <div style={{ ...S.eyebrow, marginBottom: 8 }}>{titre}</div>
      <div
        className="mono"
        style={{ fontSize: mobile ? 44 : 56, fontWeight: 700, lineHeight: 1.05, color: reussite >= seuil ? "var(--ok)" : "var(--rouge)" }}
      >
        {reussite} %
      </div>
      <div style={{ fontSize: 14.5, color: "var(--encre2)", marginTop: 4 }}>
        {score.bon} bonnes réponses sur {score.total}
      </div>

      {lignes && lignes.length > 0 && (
        <div style={{ display: "flex", justifyContent: "center", gap: mobile ? 22 : 34, marginTop: 20, flexWrap: "wrap" }}>
          {lignes.map(([k, v]) => (
            <div key={k}>
              <div style={S.eyebrow}>{k}</div>
              <div className="mono" style={{ fontSize: 20, fontWeight: 700, marginTop: 2 }}>{v}</div>
            </div>
          ))}
        </div>
      )}

      {conseil && (
        <p style={{ fontSize: 13.5, lineHeight: 1.6, color: "var(--encre2)", margin: "18px auto 20px", maxWidth: 440 }}>
          {conseil}
        </p>
      )}

      <button
        onClick={recommencer}
        className="bjc-tap"
        style={{ background: "var(--encre)", color: "var(--panneau)", padding: "13px 30px", borderRadius: 3, fontWeight: 700, fontSize: 15 }}
      >
        Refaire une série
      </button>
    </div>
  );
}

/** Sélecteur de longueur, commun aux exercices. */
function ChoixLongueur({ valeur, onChange, options = [25, 50, 100], onTerminer, actif, nu }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap", marginBottom: nu ? 0 : 14 }}>
      {!nu && <span style={S.titreChoix}>Série de</span>}
      <select
        value={valeur}
        onChange={(e) => onChange(Number(e.target.value))}
        style={{ ...styleChamp, width: "auto", flex: "0 1 150px" }}
      >
        {options.map((n) => (
          <option key={n} value={n}>{n} réponses</option>
        ))}
        <option value={0}>Sans fin</option>
      </select>
      {valeur === 0 && onTerminer && actif && (
        <button
          onClick={onTerminer}
          className="bjc-tap"
          style={{
            border: "1px solid var(--encre)",
            background: "var(--panneau)",
            padding: "8px 15px",
            borderRadius: 3,
            fontSize: 13.5,
            fontWeight: 700,
          }}
        >
          Terminer maintenant
        </button>
      )}
    </div>
  );
}

/* Accueil commun aux cinq exercices : même ordre partout — le texte, le renvoi
   vers la théorie, les réglages sur une grille compacte, puis le départ. Les
   explications longues passent dans un repli, pour que les cinq écrans
   s'ouvrent sur la même forme. */
/* Vrai dès qu'une série est lancée, faux tant qu'on lit les consignes. Sert à
   savoir s'il y a quelque chose à perdre en quittant. */
const SERIE = { engagee: false };

/* Hauteur de la liste des exercices, retenue pour y revenir : parcourir les
   cinq exercices ne doit pas repartir du haut à chaque retour. */
let hauteurMenuExercices = 0;

function AccueilExercice({ mobile, texte, renvoi, renvoiLabel, details, detailsTitre, reglages, onCommencer }) {
  const [ouvert, setOuvert] = useState(false);
  /* Tant que cet écran est affiché, rien n'est engagé. */
  useEffect(() => {
    SERIE.engagee = false;
  }, []);
  return (
    <div style={{ paddingBottom: 24 }}>
      <p style={{ fontSize: mobile ? 15 : 16, lineHeight: 1.6, color: "var(--encre2)", margin: "0 0 14px" }}>{texte}</p>

      {details && (
        <div style={{ marginBottom: 14 }}>
          {/* Un cartouche encadré, pas un lien souligné : le renvoi vers la
              théorie quitte l'écran, ceci ne fait que déplier. */}
          <button
            onClick={(e) => {
              /* Ce qui s'ouvre vient sous les yeux, comme les sections des
                 paramètres et les panneaux du journal. */
              const o = !ouvert;
              setOuvert(o);
              if (o) amener(e.currentTarget.parentElement);
            }}
            aria-expanded={ouvert}
            style={{
              width: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 10,
              textAlign: "left",
              padding: mobile ? "11px 13px" : "12px 15px",
              border: "1px solid var(--regle)",
              borderRadius: 3,
              background: "var(--panneau)",
              fontSize: 13,
              fontWeight: 700,
              color: "var(--encre)",
            }}
          >
            <span>{detailsTitre ?? "Le détail"}</span>
            <span className="mono" aria-hidden="true" style={{ fontSize: 15, color: "var(--encre2)" }}>
              {ouvert ? "−" : "+"}
            </span>
          </button>
          {ouvert && (
            <div className="bjc-pop" style={{ ...S.panneau, padding: mobile ? "13px 14px" : "15px 18px", marginTop: 10 }}>
              {details}
            </div>
          )}
        </div>
      )}

      {renvoi && (
        <button
          onClick={renvoi}
          style={{
            fontSize: 13,
            fontWeight: 600,
            color: "var(--encre2)",
            textDecoration: "underline",
            textUnderlineOffset: 2,
            marginBottom: 16,
            display: "block",
          }}
        >
          {renvoiLabel} <span className="mono" aria-hidden="true">→</span>
        </button>
      )}

      {reglages && (
        <div
          style={{
            ...S.panneau,
            padding: mobile ? "13px 14px" : "15px 18px",
            marginBottom: 16,
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: mobile ? 10 : 14,
            alignItems: "start",
          }}
        >
          {reglages}
        </div>
      )}

      <button
        onClick={() => {
          SERIE.engagee = true;
          poserEtape();
          onCommencer();
        }}
        className="bjc-tap"
        style={{
          width: "100%",
          maxWidth: 300,
          margin: "0 auto",
          display: "block",
          background: "var(--encre)",
          color: "var(--panneau)",
          padding: "14px 26px",
          borderRadius: 3,
          fontWeight: 700,
          fontSize: 15.5,
        }}
      >
        Commencer
      </button>
    </div>
  );
}

function DrillStrategie({ mobile, reglages, majReglage, noter, noterBilan, allerStrategie }) {
  const sons = reglages?.sons !== false;
  const jeuSons = reglages?.jeuSons ?? "marque";
  const paquets = reglages.nbPaquets >= 7 ? 8 : 6;
  const sansCarteCachee = reglages.regle === "enhc";
  const tables = useMemo(
    () => construireTables(reglages.h17, reglages.abandon, sansCarteCachee, paquets),
    [reglages.h17, reglages.abandon, sansCarteCachee, paquets]
  );
  const parLabel = useMemo(() => {
    const m = new Map();
    for (const bloc of [tables.dur, tables.mou, tables.paires]) for (const [l, codes] of bloc) m.set(l, codes);
    return m;
  }, [tables]);

  const [q, setQ] = useState(null);
  const [retour, setRetour] = useState(null);
  const [score, setScore] = useState({ bon: 0, total: 0, serie: 0, record: 0 });
  const [erreurs, setErreurs] = useState([]);
  const [longueur, setLongueur] = useState(50);
  const [fini, setFini] = useState(false);
  const [commence, setCommence] = useState(false);
  const t0 = useRef(0);

  const tirer = useCallback(() => {
    let main, codes, essais = 0;
    do {
      main = tirerMainExercice();
      codes = parLabel.get(main.label);
    } while (!codes && ++essais < 30);
    if (!codes) return;
    const poids = [2, 3, 4, 5, 6, 7, 8, 9, 10, 10, 10, 10, 1];
    const h = poids[Math.floor(Math.random() * poids.length)];
    const i = h === 1 ? 9 : h === 10 ? 8 : h - 2;
    setQ({ ...main, hauteur: h, indice: i, code: codes[i] });
    setRetour(null);
    t0.current = performance.now();
  }, [parLabel]);

  useEffect(() => { tirer(); }, [tirer]);

  const options = [
    { c: "T", l: "Tirer" },
    { c: "R", l: "Rester" },
    { c: "D", l: "Doubler" },
    ...(q && q.valeurs[0] === q.valeurs[1] ? [{ c: "S", l: "Séparer" }] : []),
    ...(reglages.abandon ? [{ c: "A", l: "Abandonner" }] : []),
  ];

  const nomAction = (c) => ({ T: "Tirer", R: "Rester", D: "Doubler", Dr: "Doubler", S: "Séparer", A: "Abandonner" }[c]);
  const evDe = (c, stats) => (c === "A" ? -0.5 : stats.ev[c === "Dr" ? "D" : c]);

  const repondre = (choix) => {
    if (retour || !q) return;
    const attendu = q.code === "Dr" ? "D" : q.code;
    const ok = choix === attendu;
    setScore((s) => {
      const serie = ok ? s.serie + 1 : 0;
      return { bon: s.bon + (ok ? 1 : 0), total: s.total + 1, serie, record: Math.max(s.record, serie) };
    });
    const stats = analyserMain(
      [q.valeurs[0], q.valeurs[1]],
      q.hauteur,
      reglages.h17,
      paquets,
      sansCarteCachee
    );
    if (!ok) {
      const cout = Math.abs(evDe(attendu, stats) - evDe(choix, stats));
      setErreurs((liste) => {
        const cle = `${q.label}|${q.hauteur}`;
        const i = liste.findIndex((e) => e.cle === cle);
        if (i >= 0) {
          const copie = [...liste];
          copie[i] = { ...copie[i], n: copie[i].n + 1, cout: Math.max(copie[i].cout, cout) };
          return copie;
        }
        return [...liste, { cle, main: q.label, hauteur: q.hauteur, attendu, n: 1, cout }];
      });
    }
    jouerSon(ok ? "juste" : "faux", sons, jeuSons);
    noter && noter("strategie", { ok, cle: `${q.label}|${q.hauteur}` });
    setRetour({ ok, attendu, stats, choix });
    if (longueur && score.total + 1 >= longueur) {
      setTimeout(() => setFini(true), ok ? 900 : 3200);
    } else {
      setTimeout(tirer, ok ? 900 : 3200);
    }
  };



  // Le bilan est enregistré une fois la série close.
  const bilanEnvoye = useRef(false);
  useEffect(() => {
    if (fini && !bilanEnvoye.current && score.total > 0) {
      bilanEnvoye.current = true;
      noterBilan && noterBilan({ type: "strategie", total: score.total, bon: score.bon, record: score.record ?? 0 });
    }
    if (!(fini)) bilanEnvoye.current = false;
  }, [fini]);

  if (fini) {
    const pire = [...erreurs].sort((a, b) => b.cout * b.n - a.cout * a.n)[0];
    return (
      <BilanSerie
        mobile={mobile}
        score={score}
        seuil={98}
        titre="Série terminée"
        lignes={[["Meilleure série", String(score.record)], ["Situations ratées", String(erreurs.length)]]}
        conseil={
          score.total && score.bon / score.total >= 0.98
            ? "Au-dessus de 98 %. C'est le niveau attendu avant de jouer en conditions réelles."
            : pire
            ? `L'erreur la plus coûteuse : ${pire.main} contre ${pire.hauteur}, où il fallait ${nomAction(pire.attendu).toLowerCase()}. La liste complète est en dessous.`
            : "Continuez : le tableau ne s'apprend pas en une série."
        }
        recommencer={() => { setScore({ bon: 0, total: 0, serie: 0, record: 0 }); setFini(false); tirer(); }}
      />
    );
  }

  if (!commence) {
    return (
      <AccueilExercice
        mobile={mobile}
        texte="Une main, une hauteur de croupier, une décision. Le tableau appliqué est celui des règles ci-dessous."
        renvoi={allerStrategie}
        renvoiLabel="Revoir le tableau de stratégie"
        reglages={
          <>
            <label>
              <div style={{ ...S.eyebrow, marginBottom: 5 }}>Paquets</div>
              <Segments plein options={[{ v: 6, l: "6" }, { v: 8, l: "8" }]} valeur={paquets} onChange={(v) => majReglage("nbPaquets", v)} />
            </label>
            <label>
              <div style={{ ...S.eyebrow, marginBottom: 5 }}>17 souple</div>
              <Segments plein options={[{ v: false, l: "Reste" }, { v: true, l: "Tire" }]} valeur={reglages.h17} onChange={(v) => majReglage("h17", v)} />
            </label>
            <label>
              <div style={{ ...S.eyebrow, marginBottom: 5 }}>Abandon</div>
              <Segments plein options={[{ v: true, l: "Oui" }, { v: false, l: "Non" }]} valeur={reglages.abandon} onChange={(v) => majReglage("abandon", v)} />
            </label>
            <label>
              <div style={{ ...S.eyebrow, marginBottom: 5 }}>Série de</div>
              <ChoixLongueur valeur={longueur} onChange={setLongueur} onTerminer={() => setFini(true)} actif={score.total > 0} nu />
            </label>
            <label style={{ gridColumn: "1 / -1" }}>
              <div style={{ ...S.eyebrow, marginBottom: 5 }}>Blackjack du croupier</div>
              <Segments
                plein
                options={[
                  { v: "cachee", l: "Carte cachée" },
                  { v: "obo", l: "Mise rendue" },
                  { v: "enhc", l: "Tout perdu" },
                ]}
                valeur={reglages.regle}
                onChange={(v) => majReglage("regle", v)}
              />
            </label>
          </>
        }
        onCommencer={() => setCommence(true)}
      />
    );
  }

  return (
    <div>
      <div
        style={{
          ...S.panneau,
          padding: mobile ? "20px 14px" : "28px 20px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: mobile ? 16 : 20,
        }}
      >
        {q && (
          <>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 14, width: "100%" }}>
              <div style={{ textAlign: "center" }}>
                <div style={{ ...S.eyebrow, marginBottom: 7 }}>Croupier</div>
                <div style={{ display: "flex", justifyContent: "center" }}>
                  <CarteFace rang={q.rangHauteur ?? (q.hauteur === 1 ? "A" : q.hauteur === 10 ? "10" : String(q.hauteur))} enseigne="♠" couleur="noir" taille={mobile ? 0.66 : 0.78} />
                </div>
              </div>
              <div style={{ textAlign: "center" }}>
                <div style={{ ...S.eyebrow, marginBottom: 7 }}>Votre main</div>
                <div style={{ display: "flex", gap: 10, justifyContent: "center" }}>
                  {q.cartes.map((c, i) => (
                    <CarteFace key={i} rang={c.rang} enseigne={c.s} couleur={c.couleur} taille={mobile ? 0.78 : 0.9} />
                  ))}
                </div>
              </div>
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: `repeat(${Math.min(options.length, mobile ? 3 : 5)},1fr)`,
                gap: 8,
                width: "100%",
                maxWidth: 520,
              }}
            >
              {options.map((o) => (
                <button
                  key={o.c}
                  onClick={() => repondre(o.c)}
                  className="bjc-tap"
                  style={{
                    minHeight: 54,
                    fontSize: mobile ? 13.5 : 15,
                    fontWeight: 700,
                    border: "1px solid var(--encre)",
                    borderRadius: 3,
                    background: "var(--panneau)",
                  }}
                >
                  {o.l}
                </button>
              ))}
            </div>

            <div style={{ minHeight: 54, textAlign: "center", width: "100%" }}>
              {retour && (
                <div className="bjc-pop">
                  <div style={{ fontSize: 16, fontWeight: 700, color: retour.ok ? "var(--ok)" : "var(--rouge)" }}>
                    {retour.ok ? "Juste." : `Non — il fallait ${nomAction(retour.attendu).toLowerCase()}.`}
                  </div>
                  {!retour.ok && (
                    <div className="mono" style={{ fontSize: 13, color: "var(--encre2)", marginTop: 5 }}>
                      {nomAction(retour.attendu)} {pct(evDe(retour.attendu, retour.stats))} · {nomAction(retour.choix)}{" "}
                      {pct(evDe(retour.choix, retour.stats))} — soit{" "}
                      {pct(evDe(retour.attendu, retour.stats) - evDe(retour.choix, retour.stats))} de différence
                    </div>
                  )}
                </div>
              )}
            </div>
          </>
        )}
      </div>

      {erreurs.length > 0 && (
        <div style={{ ...S.panneau, padding: mobile ? "15px 15px" : "18px 20px", marginTop: 16, borderLeft: "3px solid var(--rouge)" }}>
          <div style={{ ...S.eyebrow, marginBottom: 4 }}>À réviser</div>
          <p style={{ fontSize: 13, lineHeight: 1.5, color: "var(--encre2)", margin: "0 0 11px" }}>
            Vos erreurs, classées par ce qu'elles coûtent. Une erreur à 30 points mérite votre attention avant une
            erreur à 1 point, même si vous la faites moins souvent.
          </p>
          <div style={{ display: "grid", gap: 3 }}>
            {[...erreurs].sort((a, b) => b.cout * b.n - a.cout * a.n).slice(0, 8).map((e) => (
              <div
                key={e.cle}
                style={{ display: "flex", alignItems: "baseline", gap: 10, padding: "7px 9px", borderRadius: 2, background: "var(--survol)" }}
              >
                <span style={{ flex: 1, fontSize: 13.5, minWidth: 0 }}>
                  <b>{e.main}</b> contre {e.hauteur} — {nomAction(e.attendu).toLowerCase()}
                </span>
                {e.n > 1 && (
                  <span className="mono" style={{ fontSize: 11.5, color: "var(--encre2)", flexShrink: 0 }}>
                    ×{e.n}
                  </span>
                )}
                <span className="mono" style={{ fontSize: 12.5, fontWeight: 700, color: "var(--rouge)", flexShrink: 0, width: 62, textAlign: "right" }}>
                  {pct(-e.cout)}
                </span>
              </div>
            ))}
          </div>
          <button
            onClick={() => setErreurs([])}
            style={{ marginTop: 11, border: "1px solid var(--regle)", padding: "8px 13px", borderRadius: 3, fontSize: 13, fontWeight: 600, color: "var(--encre2)" }}
          >
            Effacer la liste
          </button>
        </div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(90px,1fr))", gap: 14, marginTop: 16 }}>
        {[
          ["Réussite", score.total ? `${Math.round((score.bon / score.total) * 100)} %` : "—"],
          ["Série", String(score.serie)],
          ["Record", String(score.record)],
          ["Mains", String(score.total)],
        ].map(([k, v]) => (
          <div key={k}>
            <div style={S.eyebrow}>{k}</div>
            <div className="mono" style={{ fontSize: 21, fontWeight: 700 }}>{v}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* Exercice sur les indices de déviation : décider selon le vrai compte. */
function DrillIndices({ sys, mobile, noter, noterBilan, sons, jeuSons, allerTheorie }) {
  const [q, setQ] = useState(null);
  const [retour, setRetour] = useState(null);
  const [score, setScore] = useState({ bon: 0, total: 0, serie: 0, record: 0 });
  const [longueur, setLongueur] = useState(25);
  const [fini, setFini] = useState(false);
  const [commence, setCommence] = useState(false);

  const lignes = useMemo(() => {
    const base = (sys.indices ?? []).map(([main, jeuBase, deviation, seuil]) => ({
      main, jeuBase, deviation, seuil: parseFloat(String(seuil).replace("−", "-").replace("+", "")) || 0,
    }));
    const fab = (sys.fab4 ?? []).map(([main, seuil]) => ({
      main, jeuBase: "jeu normal", deviation: "abandonner",
      seuil: parseFloat(String(seuil).replace("−", "-").replace("+", "")) || 0,
    }));
    return [...base, ...fab];
  }, [sys]);

  const tirer = useCallback(() => {
    if (!lignes.length) return;
    const l = lignes[Math.floor(Math.random() * lignes.length)];
    // Vrai compte tiré autour du seuil pour que la décision soit serrée
    const tc = l.seuil + [-3, -2, -1, -1, 0, 0, 1, 1, 2, 3][Math.floor(Math.random() * 10)];
    setQ({ ...l, tc, attendu: tc >= l.seuil ? "deviation" : "base" });
    setRetour(null);
  }, [lignes]);

  useEffect(() => { tirer(); }, [tirer]);


  // Le bilan est enregistré une fois la série close.
  const bilanEnvoye = useRef(false);
  useEffect(() => {
    if (fini && !bilanEnvoye.current && score.total > 0) {
      bilanEnvoye.current = true;
      noterBilan && noterBilan({ type: "indices", total: score.total, bon: score.bon, record: score.record ?? 0 });
    }
    if (!(fini)) bilanEnvoye.current = false;
  }, [fini]);

  if (!lignes.length) {
    return (
      <div style={{ ...S.panneau, padding: mobile ? "22px 16px" : "30px 24px" }}>
        <h3 style={{ fontSize: 18.5, marginBottom: 10 }}>Pas d'indices publiés pour le {sys.nom}.</h3>
        <p style={{ fontSize: 15, lineHeight: 1.65, color: "var(--encre2)", margin: 0 }}>
          Les Illustrious 18 et les Fab 4 valent pour le Hi-Lo. Les indices ne se transposent pas d'un système à
          l'autre : basculez sur le Hi-Lo pour travailler cet exercice, ou procurez-vous les tables de votre système.
        </p>
      </div>
    );
  }

  const repondre = (choix) => {
    if (retour || !q) return;
    const ok = choix === q.attendu;
    jouerSon(ok ? "juste" : "faux", sons, jeuSons);
    noter && noter("indices", { ok });
    setScore((s) => {
      const serie = ok ? s.serie + 1 : 0;
      return { bon: s.bon + (ok ? 1 : 0), total: s.total + 1, serie, record: Math.max(s.record, serie) };
    });
    setRetour({ ok });
    if (longueur && score.total + 1 >= longueur) {
      setTimeout(() => setFini(true), ok ? 850 : 2600);
    } else {
      setTimeout(tirer, ok ? 850 : 2600);
    }
  };

  if (fini) {
    return (
      <BilanSerie
        mobile={mobile}
        score={score}
        seuil={90}
        titre="Série terminée"
        lignes={[["Meilleure série", String(score.record)]]}
        conseil={
          score.total && score.bon / score.total >= 0.9
            ? "Les seuils sont acquis. Rappelez-vous qu'ils valent pour le Hi-Lo en six paquets et se décalent selon les règles."
            : "Les indices ne se devinent pas : ils se mémorisent. Reprenez la liste dans la fiche du système avant de recommencer."
        }
        recommencer={() => { setScore({ bon: 0, total: 0, serie: 0, record: 0 }); setFini(false); tirer(); }}
      />
    );
  }

  if (!commence) {
    return (
      <AccueilExercice
        mobile={mobile}
        texte="Une main et un vrai compte vous sont donnés, jamais le seuil : c'est lui qu'il faut connaître. À vous de dire laquelle des deux décisions s'applique."
        detailsTitre="Comment fonctionne un seuil"
        details={
          <p style={{ fontSize: 14, lineHeight: 1.65, margin: 0, color: "var(--encre2)" }}>
            Chaque écart a un seuil : à partir d'un certain vrai compte, la meilleure décision change. En dessous, on
            joue la stratégie de base ; au-dessus, on dévie. Les {lignes.length} écarts les plus rentables du {sys.nom}{" "}
            sont couverts.
          </p>
        }
        renvoi={allerTheorie}
        renvoiLabel="Revoir les seuils du système"
        reglages={
          <ChoixLongueur
            valeur={longueur}
            onChange={setLongueur}
            options={[15, 25, 50]}
            onTerminer={() => setFini(true)}
            actif={score.total > 0}
          />
        }
        onCommencer={() => setCommence(true)}
      />
    );
  }

  return (
    <div>
      <div style={{ ...S.panneau, padding: mobile ? "24px 15px" : "32px 22px", textAlign: "center" }}>
        {q && (
          <>
            <div style={{ ...S.eyebrow, marginBottom: 8 }}>Situation</div>
            <div style={{ fontFamily: "'Source Serif 4', Georgia, serif", fontWeight: 700, fontSize: mobile ? 24 : 30, letterSpacing: "-.008em" }}>
              {q.main}
            </div>
            <div style={{ ...S.eyebrow, marginTop: 18, marginBottom: 4 }}>Vrai compte</div>
            <div className="mono" style={{ fontSize: mobile ? 42 : 52, fontWeight: 700, color: q.tc >= 0 ? "var(--rouge)" : "var(--bleu)", lineHeight: 1 }}>
              {fmt(q.tc)}
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 9, maxWidth: 420, margin: "22px auto 0" }}>
              {[
                ["base", q.jeuBase],
                ["deviation", q.deviation],
              ].map(([c, l]) => (
                <button
                  key={c}
                  onClick={() => repondre(c)}
                  className="bjc-tap"
                  style={{
                    minHeight: 58,
                    fontSize: mobile ? 14 : 15,
                    fontWeight: 700,
                    border: "1px solid var(--encre)",
                    borderRadius: 3,
                    background: "var(--panneau)",
                    padding: "10px 8px",
                  }}
                >
                  {l.charAt(0).toUpperCase() + l.slice(1)}
                </button>
              ))}
            </div>

            <div style={{ minHeight: 46, marginTop: 14 }}>
              {retour && (
                <div className="bjc-pop">
                  <div style={{ fontSize: 16, fontWeight: 700, color: retour.ok ? "var(--ok)" : "var(--rouge)" }}>
                    {retour.ok ? "Juste." : "Non."}
                  </div>
                  <div style={{ fontSize: 13.5, lineHeight: 1.55, color: "var(--encre2)", marginTop: 5 }}>
                    {q.main} : le seuil est {fmt(q.seuil)}. Le vrai compte vaut {fmt(q.tc)}, donc{" "}
                    {q.attendu === "deviation"
                      ? `on atteint le seuil et l'on dévie : ${q.deviation}.`
                      : `on reste en dessous et l'on garde la stratégie de base : ${q.jeuBase}.`}
                  </div>
                </div>
              )}
            </div>
          </>
        )}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(90px,1fr))", gap: 14, marginTop: 16 }}>
        {[
          ["Réussite", score.total ? `${Math.round((score.bon / score.total) * 100)} %` : "—"],
          ["Série", String(score.serie)],
          ["Record", String(score.record)],
          ["Situations", String(score.total)],
        ].map(([k, v]) => (
          <div key={k}>
            <div style={S.eyebrow}>{k}</div>
            <div className="mono" style={{ fontSize: 21, fontWeight: 700 }}>{v}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function DrillValeur({ sys, mobile, noter, noterBilan, sons, jeuSons, allerTheorie }) {
  const [carte, setCarte] = useState(null);
  const [score, setScore] = useState({ bon: 0, total: 0, serie: 0, record: 0 });
  const [retour, setRetour] = useState(null);
  const [temps, setTemps] = useState([]);
  const [demarre, setDemarre] = useState(false);
  const [longueur, setLongueur] = useState(50);
  const t0 = useRef(0);

  const tirer = useCallback(() => {
    const rang = RANGS[Math.floor(Math.random() * RANGS.length)];
    const e = ENSEIGNES[Math.floor(Math.random() * ENSEIGNES.length)];
    setCarte({ rang, ...e });
    setRetour(null);
    t0.current = performance.now();
  }, []);

  useEffect(() => { if (demarre === true) tirer(); }, [tirer, sys.id, demarre]);

  const valeursPossibles = useMemo(() => {
    const s = new Set(Object.values(sys.valeurs));
    if (sys.valeurSpeciale) { s.add(sys.valeurSpeciale.rouge); s.add(sys.valeurSpeciale.noir); }
    return [...s].sort((a, b) => b - a);
  }, [sys]);

  const repondre = (v) => {
    if (retour || !carte) return;
    const attendu = valeurCarte(sys, carte.rang, carte.couleur);
    const ok = v === attendu;
    const duree = (performance.now() - t0.current) / 1000;
    jouerSon(ok ? "juste" : "faux", sons, jeuSons);
    noter && noter("valeur", { ok, temps: duree });
    setTemps((t) => [...t.slice(-19), duree]);
    setScore((s) => {
      const serie = ok ? s.serie + 1 : 0;
      return { bon: s.bon + (ok ? 1 : 0), total: s.total + 1, serie, record: Math.max(s.record, serie) };
    });
    setRetour({ ok, attendu });
    if (longueur && score.total + 1 >= longueur) {
      setTimeout(() => setDemarre("fini"), ok ? 380 : 1250);
    } else {
      setTimeout(tirer, ok ? 380 : 1250);
    }
  };


  // Le bilan est enregistré une fois la série close.
  const bilanEnvoye = useRef(false);
  useEffect(() => {
    if (demarre === "fini" && !bilanEnvoye.current && score.total > 0) {
      bilanEnvoye.current = true;
      noterBilan && noterBilan({ type: "valeur", total: score.total, bon: score.bon, record: score.record ?? 0, temps: temps.length ? temps.reduce((a, b) => a + b, 0) / temps.length : null });
    }
    if (!(demarre === "fini")) bilanEnvoye.current = false;
  }, [demarre === "fini"]);

  if (demarre === "fini") {
    const m = temps.length ? temps.reduce((a, b) => a + b, 0) / temps.length : 0;
    const meilleur = temps.length ? Math.min(...temps) : 0;
    const reussite = score.total ? Math.round((score.bon / score.total) * 100) : 0;
    return (
      <div style={{ ...S.panneau, padding: mobile ? "26px 18px" : "38px 26px", textAlign: "center" }}>
        <div style={{ ...S.eyebrow, marginBottom: 8 }}>Série terminée</div>
        <div
          className="mono"
          style={{ fontSize: mobile ? 44 : 56, fontWeight: 700, lineHeight: 1.05, color: reussite >= 95 ? "var(--ok)" : "var(--rouge)" }}
        >
          {reussite} %
        </div>
        <div style={{ fontSize: 14.5, color: "var(--encre2)", marginTop: 4 }}>
          {score.bon} bonnes réponses sur {score.total}
        </div>

        <div style={{ display: "flex", justifyContent: "center", gap: mobile ? 22 : 34, marginTop: 20, flexWrap: "wrap" }}>
          {[
            ["Temps moyen", `${m.toFixed(2).replace(".", ",")} s`],
            ["Meilleur", `${meilleur.toFixed(2).replace(".", ",")} s`],
            ["Meilleure série", String(score.record)],
          ].map(([k, v]) => (
            <div key={k}>
              <div style={S.eyebrow}>{k}</div>
              <div className="mono" style={{ fontSize: 20, fontWeight: 700, marginTop: 2 }}>{v}</div>
            </div>
          ))}
        </div>

        <p style={{ fontSize: 13.5, lineHeight: 1.6, color: "var(--encre2)", margin: "18px auto 20px", maxWidth: 420 }}>
          {m <= 0.6 && reussite >= 95
            ? "Vitesse et justesse suffisantes. Passez au défilé chronométré."
            : m > 0.6 && reussite >= 95
            ? "Justesse acquise, vitesse encore courte. Visez 0,6 seconde de moyenne."
            : "Travaillez la justesse avant la vitesse : une valeur fausse coûte plus qu'une réponse lente."}
        </p>

        <button
          onClick={() => { setScore({ bon: 0, total: 0, serie: 0, record: 0 }); setTemps([]); setDemarre(true); }}
          className="bjc-tap"
          style={{ background: "var(--encre)", color: "var(--panneau)", padding: "13px 30px", borderRadius: 3, fontWeight: 700, fontSize: 15 }}
        >
          Refaire une série
        </button>
      </div>
    );
  }

  if (!demarre) {
    return (
      <AccueilExercice
        mobile={mobile}
        texte="Une carte s'affiche, vous donnez sa valeur. Chaque réponse est chronométrée et compte dans votre profil."
        renvoi={allerTheorie}
        renvoiLabel="Revoir les valeurs du système"
        reglages={
          <label>
            <div style={{ ...S.eyebrow, marginBottom: 5 }}>Longueur de la série</div>
            <select value={longueur} onChange={(e) => setLongueur(Number(e.target.value))} style={styleChamp}>
              <option value={25}>25 cartes</option>
              <option value={50}>50 cartes</option>
              <option value={100}>100 cartes</option>
              <option value={0}>Sans fin</option>
            </select>
          </label>
        }
        onCommencer={() => {
          contexte();
          setScore({ bon: 0, total: 0, serie: 0, record: 0 });
          setTemps([]);
          setDemarre(true);
        }}
      />
    );
  }

  const moy = temps.length ? temps.reduce((a, b) => a + b, 0) / temps.length : null;

  return (
    <div>
      <p style={{ fontSize: 15, lineHeight: 1.6, color: "var(--encre2)", marginTop: 0 }}>
        Une carte, sa valeur. L'objectif n'est pas d'avoir juste, c'est d'avoir juste <i>sans réfléchir</i> — visez une
        moyenne sous 0,6 seconde avant de passer à la suite.
      </p>

      <div
        style={{
          ...S.panneau,
          padding: mobile ? "22px 14px" : "34px 20px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: mobile ? 18 : 24,
        }}
      >
        {carte && (
          <CarteFace
            anime={false}
            key={score.total + carte.rang + carte.s}
            rang={carte.rang}
            enseigne={carte.s}
            couleur={carte.couleur}
            taille={mobile ? 0.86 : 1}
          />
        )}

        <div
          style={{
            display: "grid",
            gridTemplateColumns: `repeat(${Math.min(valeursPossibles.length, mobile ? 3 : 6)},1fr)`,
            gap: 8,
            width: "100%",
            maxWidth: 420,
          }}
        >
          {valeursPossibles.map((v) => (
            <button
              key={v}
              onClick={() => repondre(v)}
              className="mono bjc-tap"
              style={{
                minHeight: 56,
                fontSize: 19,
                fontWeight: 700,
                border: "1px solid var(--encre)",
                borderRadius: 3,
                background: "var(--panneau)",
              }}
            >
              {fmt(v)}
            </button>
          ))}
        </div>

        <div style={{ minHeight: 24, textAlign: "center" }}>
          {retour && (
            <div className="bjc-pop" style={{ fontSize: 15.5, fontWeight: 600, color: retour.ok ? "var(--ok)" : "var(--rouge)" }}>
              {retour.ok ? "Juste." : `Non — cette carte vaut ${fmt(retour.attendu)}.`}
            </div>
          )}
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(90px,1fr))", gap: 14, marginTop: 16 }}>
        {[
          ["Réussite", score.total ? `${Math.round((score.bon / score.total) * 100)} %` : "—"],
          ["Série", String(score.serie)],
          ["Record", String(score.record)],
          ["Temps moyen", moy ? `${moy.toFixed(2).replace(".", ",")} s` : "—"],
        ].map(([k, v]) => (
          <div key={k}>
            <div style={S.eyebrow}>{k}</div>
            <div className="mono" style={{ fontSize: 21, fontWeight: 700 }}>{v}</div>
          </div>
        ))}
      </div>

      {longueur === 0 && score.total > 0 && (
        <button
          onClick={() => setDemarre("fini")}
          className="bjc-tap"
          style={{
            marginTop: 16,
            border: "1px solid var(--encre)",
            background: "var(--panneau)",
            padding: "10px 18px",
            borderRadius: 3,
            fontSize: 13.5,
            fontWeight: 700,
          }}
        >
          Terminer maintenant
        </button>
      )}
    </div>
  );
}

function DrillSabot({ sys, mobile, noter, noterBilan, sons, jeuSons, tic, allerTheorie }) {
  const [taille, setTaille] = useState(26);
  const [vitesse, setVitesse] = useState(900);
  const [paires, setPaires] = useState(false);
  const [etat, setEtat] = useState("pret");
  const [pile, setPile] = useState([]);
  const [idx, setIdx] = useState(0);
  const [saisie, setSaisie] = useState("0");
  const reponse = Number(String(saisie).replace(",", ".")) || 0;
  const [resultat, setResultat] = useState(null);

  const nbPaquets = Math.max(1, Math.ceil(taille / 52));
  const irc = sys.equilibre ? 0 : sys.irc(nbPaquets);
  const pas = paires ? 2 : 1;

  const lancer = () => {
    setPile(sabotNeuf(nbPaquets).slice(0, taille));
    setIdx(0);
    setResultat(null);
    // Un système déséquilibré part de son compte initial, pas de zéro.
    setSaisie(String(irc).replace(".", ","));
    setEtat("defile");
  };

  useEffect(() => {
    if (etat !== "defile") return;
    if (idx >= pile.length) { setEtat("question"); return; }
    jouerSon("tic", tic);
    const t = setTimeout(() => setIdx((i) => i + pas), vitesse);
    return () => clearTimeout(t);
  }, [etat, idx, pile.length, vitesse, pas, tic]);

  const valider = () => {
    const correct = pile.reduce((a, c) => a + valeurCarte(sys, c.rang, c.couleur), irc);
    const juste = Math.abs(correct - reponse) < 0.001;
    jouerSon(juste ? "juste" : "faux", sons, jeuSons);
    noter && noter("sabot", { ok: juste, vitesse });
    /* Un sabot compté vaut une série : il s'inscrit dans l'historique comme
       les autres exercices. */
    noterBilan && noterBilan({ type: "sabot", total: 1, bon: juste ? 1 : 0, record: juste ? 1 : 0 });
    setResultat({ correct, reponse, ok: juste });
    setEtat("resultat");
  };

  const visibles = pile.slice(idx, idx + pas);
  const incr = sys.id === "halves" ? 0.5 : 1;

  return (
    <div>
      <p style={{ fontSize: 15, lineHeight: 1.6, color: "var(--encre2)", marginTop: 0 }}>
        Les cartes défilent, vous suivez le compte de tête, et vous l'annoncez à la fin. C'est l'exercice qui reproduit
        le mieux la table. Montez la vitesse jusqu'à ce que ce soit inconfortable, puis restez-y.
        {!sys.equilibre && ` Le compte démarre à ${fmt(irc)} pour ${nbPaquets} paquet${nbPaquets > 1 ? "s" : ""}.`}
      </p>

      {etat === "pret" && (
        <AccueilExercice
          mobile={mobile}
          texte={`Les cartes défilent, vous suivez le compte de tête, et vous l'annoncez à la fin. Montez la vitesse jusqu'à ce que ce soit inconfortable, puis restez-y.${
            !sys.equilibre ? ` Le compte démarre à ${fmt(irc)} pour ${nbPaquets} paquet${nbPaquets > 1 ? "s" : ""}.` : ""
          }`}
          detailsTitre="Vitesse et affichage"
          details={
            <>
              <p className="mono" style={{ fontSize: 12.5, lineHeight: 1.55, margin: 0, color: "var(--encre2)" }}>
                {(vitesse / 1000).toFixed(2).replace(".", ",")} s par carte · {Math.round(60000 / vitesse)} cartes par
                minute
                {vitesse === 330 && " — la cadence d'un croupier qui distribue sans traîner"}
                {vitesse === 200 && " — plus rapide qu'aucune table réelle"}
                {vitesse === 1400 && " — pour apprendre les valeurs, pas pour s'entraîner"}
              </p>
              <p style={{ fontSize: 14, lineHeight: 1.65, margin: "10px 0 0", color: "var(--encre2)" }}>
                Par paires, vous apprenez à additionner deux cartes d'un coup et à laisser s'annuler celles qui se
                compensent. C'est ce que font les joueurs rapides.
              </p>
            </>
          }
          renvoi={allerTheorie}
          renvoiLabel="Revoir les valeurs du système"
          reglages={
            <>
              <label>
                <div style={{ ...S.eyebrow, marginBottom: 5 }}>Nombre de cartes</div>
                <select value={taille} onChange={(e) => setTaille(Number(e.target.value))} style={styleChamp}>
                  <option value={13}>13 — un quart</option>
                  <option value={26}>26 — un demi</option>
                  <option value={52}>52 — un paquet</option>
                  <option value={104}>104 — deux paquets</option>
                </select>
              </label>
              <label>
                <div style={{ ...S.eyebrow, marginBottom: 5 }}>Vitesse</div>
                <select value={vitesse} onChange={(e) => setVitesse(Number(e.target.value))} style={styleChamp}>
                  <option value={1400}>Lente</option>
                  <option value={900}>Normale</option>
                  <option value={550}>Rapide</option>
                  <option value={330}>Table réelle</option>
                  <option value={200}>Extrême</option>
                </select>
              </label>
              <label style={{ gridColumn: "1 / -1" }}>
                <div style={{ ...S.eyebrow, marginBottom: 5 }}>Affichage</div>
                <Segments
                  plein
                  options={[{ v: false, l: "Une carte" }, { v: true, l: "Par paires" }]}
                  valeur={paires}
                  onChange={setPaires}
                />
              </label>
            </>
          }
          onCommencer={lancer}
        />
      )}

      {etat === "defile" && (
        <>
        <div
          className="mono"
          style={{ fontSize: 11, color: "var(--encre2)", textAlign: "center", marginBottom: 8 }}
        >
          {(vitesse / 1000).toFixed(2).replace(".", ",")} s par carte · carte {Math.min(idx + pas, pile.length)} sur{" "}
          {pile.length}
        </div>
        <div
          style={{
            ...S.panneau,
            padding: mobile ? "26px 14px" : "40px 20px",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 20,
            minHeight: 260,
            justifyContent: "center",
          }}
        >
          <div style={{ display: "flex", gap: 12 }}>
            {visibles.map((c, i) => (
              <CarteFace key={idx + "-" + i} rang={c.rang} enseigne={c.s} couleur={c.couleur} taille={mobile ? 0.86 : 1} />
            ))}
          </div>
          <div style={{ width: "100%", maxWidth: 420 }}>
            <div style={{ height: 3, background: "var(--regle)" }}>
              <div style={{ height: "100%", width: `${(idx / pile.length) * 100}%`, background: "var(--encre)" }} />
            </div>
            <div className="mono" style={{ fontSize: 12.5, color: "var(--encre2)", marginTop: 7, textAlign: "center" }}>
              {Math.min(idx + pas, pile.length)} / {pile.length}
            </div>
          </div>
          <button onClick={() => setEtat("pret")} style={{ fontSize: 13.5, color: "var(--encre2)", textDecoration: "underline" }}>
            Arrêter
          </button>
        </div>
        </>
      )}

      {etat === "question" && (
        <div style={{ ...S.panneau, padding: mobile ? "22px 15px" : "30px 22px", textAlign: "center" }}>
          <div style={{ ...S.eyebrow, marginBottom: 12 }}>Quel est le compte courant ?</div>

          <div
            className="mono"
            style={{
              fontSize: mobile ? 46 : 56,
              fontWeight: 700,
              lineHeight: 1.1,
              minHeight: mobile ? 54 : 64,
              color: reponse > 0 ? "var(--rouge)" : reponse < 0 ? "var(--bleu)" : "var(--encre)",
            }}
          >
            {saisie.startsWith("-") ? "−" + saisie.slice(1) : saisie === "0" ? "0" : "+" + saisie}
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(3,1fr)",
              gap: 7,
              maxWidth: 300,
              margin: "16px auto 0",
            }}
          >
            {["7", "8", "9", "4", "5", "6", "1", "2", "3"].map((c) => (
              <button
                key={c}
                onClick={() => setSaisie((v) => (v === "0" ? c : v === "-0" ? "-" + c : v + c))}
                className="mono bjc-tap"
                style={{ height: 52, border: "1px solid var(--regle)", borderRadius: 3, fontSize: 21, fontWeight: 700, background: "var(--panneau)" }}
              >
                {c}
              </button>
            ))}

            <button
              onClick={() => setSaisie((v) => (v.startsWith("-") ? v.slice(1) : "-" + v))}
              className="mono bjc-tap"
              style={{ height: 52, border: "1px solid var(--encre)", borderRadius: 3, fontSize: 19, fontWeight: 700, background: "var(--panneau)" }}
              aria-label="Changer le signe"
            >
              ±
            </button>
            <button
              onClick={() => setSaisie((v) => (v === "0" ? v : v + "0"))}
              className="mono bjc-tap"
              style={{ height: 52, border: "1px solid var(--regle)", borderRadius: 3, fontSize: 21, fontWeight: 700, background: "var(--panneau)" }}
            >
              0
            </button>
            <button
              onClick={() => setSaisie((v) => (v.length <= 1 || (v.length === 2 && v.startsWith("-")) ? "0" : v.slice(0, -1)))}
              className="mono bjc-tap"
              style={{ height: 52, border: "1px solid var(--regle)", borderRadius: 3, fontSize: 19, background: "var(--panneau)", color: "var(--encre2)" }}
              aria-label="Effacer le dernier chiffre"
            >
              ⌫
            </button>

            {incr === 0.5 && (
              <button
                onClick={() => setSaisie((v) => (v.includes(",") ? v.replace(",5", "") : v + ",5"))}
                className="mono bjc-tap"
                style={{
                  gridColumn: "span 3",
                  height: 46,
                  border: "1px solid var(--regle)",
                  borderRadius: 3,
                  fontSize: 17,
                  fontWeight: 700,
                  background: saisie.includes(",") ? "var(--survol)" : "var(--panneau)",
                }}
              >
                ,5
              </button>
            )}
          </div>

          <button
            onClick={valider}
            className="bjc-tap"
            style={{
              marginTop: 18,
              width: mobile ? "100%" : "auto",
              background: "var(--encre)",
              color: "var(--panneau)",
              padding: "14px 34px",
              borderRadius: 3,
              fontWeight: 700,
              fontSize: 15,
            }}
          >
            Valider
          </button>
        </div>
      )}

      {etat === "resultat" && resultat && (
        <div
          style={{
            ...S.panneau,
            padding: mobile ? "24px 16px" : "30px 24px",
            textAlign: "center",
            borderColor: resultat.ok ? "var(--ok-bord)" : "var(--rouge)",
            background: resultat.ok ? "var(--ok-fond)" : "var(--err-fond)",
          }}
        >
          <div style={{ fontSize: 20, fontWeight: 700, marginBottom: 10 }}>
            {resultat.ok ? "Compte exact." : `Écart de ${fmt(Math.abs(resultat.correct - resultat.reponse), false)}.`}
          </div>
          <div className="mono" style={{ fontSize: 15 }}>
            Votre réponse {fmt(resultat.reponse)} · compte réel {fmt(resultat.correct)}
          </div>
          <p style={{ fontSize: 14.5, lineHeight: 1.6, maxWidth: 460, margin: "16px auto 0", color: "var(--encre2)" }}>
            {resultat.ok
              ? "Refaites-le à la vitesse supérieure. Un compte juste à vitesse lente ne prouve rien."
              : "Un écart de 1 ou 2 vient presque toujours d'une carte sautée, pas d'une valeur mal apprise. Ralentissez d'un cran avant de remonter."}
          </p>
          <button
            onClick={() => setEtat("pret")}
            className="bjc-tap"
            style={{
              marginTop: 18,
              width: mobile ? "100%" : "auto",
              background: "var(--encre)",
              color: "var(--panneau)",
              padding: "13px 24px",
              borderRadius: 3,
              fontWeight: 700,
              fontSize: 14.5,
            }}
          >
            Recommencer
          </button>
        </div>
      )}
    </div>
  );
}

function DrillVraiCompte({ sys, mobile, noter, noterBilan, sons, jeuSons, allerTheorie }) {
  const [q, setQ] = useState(null);
  const [choix, setChoix] = useState(null);
  const [score, setScore] = useState({ bon: 0, total: 0, serie: 0, record: 0 });
  const [longueur, setLongueur] = useState(20);
  const [fini, setFini] = useState(false);
  const [commence, setCommence] = useState(false);

  const tirer = useCallback(() => {
    const rc = Math.floor(Math.random() * 25) - 8;
    const restant = [0.5, 1, 1.5, 2, 2.5, 3, 4, 5, 6][Math.floor(Math.random() * 9)];
    const tc = Math.round((rc / restant) * 2) / 2;
    const opts = new Set([tc]);
    let garde = 0;
    while (opts.size < 4 && garde++ < 40) {
      const d = tc + (Math.random() < 0.5 ? -1 : 1) * [0.5, 1, 1.5, 2, 3][Math.floor(Math.random() * 5)];
      opts.add(Math.round(d * 2) / 2);
    }
    setQ({ rc, restant, tc, options: [...opts].sort((a, b) => a - b) });
    setChoix(null);
  }, []);

  useEffect(() => { tirer(); }, [tirer]);


  // Le bilan est enregistré une fois la série close.
  const bilanEnvoye = useRef(false);
  useEffect(() => {
    if (fini && !bilanEnvoye.current && score.total > 0) {
      bilanEnvoye.current = true;
      noterBilan && noterBilan({ type: "tc", total: score.total, bon: score.bon, record: score.record ?? 0 });
    }
    if (!(fini)) bilanEnvoye.current = false;
  }, [fini]);

  if (!sys.tc) {
    return (
      <div style={{ ...S.panneau, padding: mobile ? "22px 16px" : "30px 24px" }}>
        <h3 style={{ fontSize: 18.5, marginBottom: 10 }}>Le {sys.nom} n'utilise pas de vrai compte.</h3>
        <p style={{ fontSize: 15, lineHeight: 1.65, color: "var(--encre2)", margin: 0 }}>
          {sys.equilibre
            ? "Ce système déclenche la mise sur le compte courant seul, sans conversion."
            : `C'est précisément l'intérêt d'un système déséquilibré : le compte courant se lit tel quel, et le pivot fixe à ${fmt(
                sys.pivot
              )} remplace la division. Travaillez plutôt le défilé de sabot, et passez au Hi-Lo ou au Zen si vous voulez vous exercer à la conversion.`}
        </p>
      </div>
    );
  }

  const bon = choix !== null && q && choix === q.tc;

  if (fini) {
    return (
      <BilanSerie
        mobile={mobile}
        score={score}
        seuil={90}
        titre="Série terminée"
        conseil={
          score.total && score.bon / score.total >= 0.9
            ? "La conversion est acquise. À la table, l'estimation des paquets restants sera la partie difficile, pas la division."
            : "Rappel : on divise par les paquets restants dans le sabot, cartes derrière la carte de coupe comprises. Une estimation au demi-paquet près suffit."
        }
        lignes={[["Meilleure série", String(score.record)]]}
        recommencer={() => { setScore({ bon: 0, total: 0, serie: 0, record: 0 }); setFini(false); tirer(); }}
      />
    );
  }

  if (!commence) {
    return (
      <AccueilExercice
        mobile={mobile}
        texte="Le vrai compte s'obtient en divisant le compte courant par les paquets restants. C'est lui qui pilote la mise et les déviations — le compte courant seul ne dit rien."
        detailsTitre="Comment estimer les paquets restants"
        details={
          <>
            <p style={{ fontSize: 14, lineHeight: 1.65, margin: 0 }}>
              Vous ne comptez pas les cartes sorties : vous regardez la pile de cartes jouées, à côté du croupier. Avant
              de jouer, posez chez vous un paquet, deux, trois à plat et mémorisez les épaisseurs. À la table, vous
              comparez la pile à ces images.
            </p>
            <p style={{ fontSize: 14, lineHeight: 1.65, margin: "10px 0 0", color: "var(--encre2)" }}>
              Estimez au demi-paquet près, jamais plus fin. En cas d'hésitation, retenez la plus grande valeur : cela
              donne un vrai compte trop bas, donc une mise trop prudente. L'erreur inverse vous fait miser gros sur un
              avantage qui n'existe pas.
            </p>
            <p style={{ fontSize: 14, lineHeight: 1.65, margin: "10px 0 0", color: "var(--encre2)" }}>
              Deux pièges : la pile ne contient ni les cartes brûlées, ni celles restées derrière la carte de coupe —
              c'est le sabot qu'il faut estimer. Et sur huit paquets, une erreur d'un demi-paquet déplace peu le vrai
              compte ; sur deux paquets, elle le déplace énormément.
            </p>
          </>
        }
        renvoi={allerTheorie}
        renvoiLabel="Revoir la fiche du système"
        reglages={
          <ChoixLongueur
            valeur={longueur}
            onChange={setLongueur}
            options={[10, 20, 40]}
            onTerminer={() => setFini(true)}
            actif={score.total > 0}
          />
        }
        onCommencer={() => setCommence(true)}
      />
    );
  }

  return (
    <div>
      <div style={{ ...S.panneau, padding: mobile ? "24px 15px" : "30px 24px", textAlign: "center" }}>
        <div style={{ display: "flex", gap: mobile ? 26 : 40, justifyContent: "center", flexWrap: "wrap", marginBottom: 24 }}>
          <div>
            <div style={S.eyebrow}>Compte courant</div>
            <div className="mono" style={{ fontSize: mobile ? 38 : 44, fontWeight: 700 }}>{fmt(q?.rc)}</div>
          </div>
          <div>
            <div style={S.eyebrow}>Paquets restants</div>
            <div className="mono" style={{ fontSize: mobile ? 38 : 44, fontWeight: 700 }}>
              {String(q?.restant).replace(".", ",")}
            </div>
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: mobile ? "1fr 1fr" : "repeat(4,1fr)", gap: 8, maxWidth: 420, margin: "0 auto" }}>
          {q?.options.map((o) => {
            const estBon = o === q.tc;
            const choisi = choix === o;
            const revele = choix !== null;
            return (
              <button
                key={o}
                onClick={() => {
                  if (choix !== null) return;
                  setChoix(o);
                  jouerSon(o === q.tc ? "juste" : "faux", sons, jeuSons);
                  noter && noter("tc", { ok: o === q.tc });
                  setScore((s) => {
                    const juste = o === q.tc;
                    const serie = juste ? s.serie + 1 : 0;
                    return {
                      bon: s.bon + (juste ? 1 : 0),
                      total: s.total + 1,
                      serie,
                      record: Math.max(s.record, serie),
                    };
                  });
                  if (longueur && score.total + 1 >= longueur) setTimeout(() => setFini(true), 1800);
                }}
                className="mono bjc-tap"
                style={{
                  minHeight: 56,
                  fontSize: 19,
                  fontWeight: 700,
                  borderRadius: 3,
                  border: `1px solid ${revele && estBon ? "var(--ok-bord)" : choisi ? "var(--rouge)" : "var(--encre)"}`,
                  background: revele && estBon ? "var(--ok-fond)" : choisi ? "var(--err-fond)" : "var(--panneau)",
                }}
              >
                {fmt(o)}
              </button>
            );
          })}
        </div>

        {choix !== null && q && (
          <div className="bjc-pop" style={{ marginTop: 20 }}>
            <div style={{ fontSize: 16, fontWeight: 700, color: bon ? "var(--ok)" : "var(--rouge)" }}>
              {bon ? "Juste." : `Le vrai compte est ${fmt(q.tc)}.`}
            </div>
            <div className="mono" style={{ fontSize: 14, color: "var(--encre2)", marginTop: 6 }}>
              {fmt(q.rc)} ÷ {String(q.restant).replace(".", ",")} = {fmt(q.tc)}
            </div>
            <button
              onClick={tirer}
              className="bjc-tap"
              style={{
                marginTop: 16,
                width: mobile ? "100%" : "auto",
                background: "var(--encre)",
                color: "var(--panneau)",
                padding: "13px 22px",
                borderRadius: 3,
                fontWeight: 700,
                fontSize: 14,
              }}
            >
              Suivante
            </button>
          </div>
        )}
      </div>

      <div style={{ marginTop: 16 }}>
        <div style={S.eyebrow}>Réussite</div>
        <div className="mono" style={{ fontSize: 21, fontWeight: 700 }}>
          {score.total ? `${Math.round((score.bon / score.total) * 100)} %` : "—"}{" "}
          <span style={{ fontSize: 14, color: "var(--encre2)" }}>({score.total} questions)</span>
        </div>
      </div>
    </div>
  );
}

function VueEntrainement({ sys, mobile, wrap, reglages, majReglage, entr, noter, noterBilan, effacerBilans, basculerGarde, supprimerBilan, reinitEntr, allerTheorie, allerStrategie, gardeExercice, sabotRepris }) {
  /* L'exercice survit au rafraîchissement, pas au changement de page : quitter
     interrompt la série et ramène au menu. */
  const [mode, setModeBrut] = useState(() => {
    try {
      return localStorage.getItem("big-jack-theory-exercice") || null;
    } catch {
      return null;
    }
  });

  /* Le retour matériel referme l'exercice avant de quitter la page : il se
     comporte comme le bouton « Tous les exercices ». */
  /* Sans série engagée, le retour ramène simplement au menu. */
  useEffect(() => {
    poserRetour("exercice", mode !== null, () => {
      SERIE.engagee = false;
      setMode(null);
      requestAnimationFrame(() => window.scrollTo(0, hauteurMenuExercices));
    });
    if (mode !== null) poserEtape();
    return () => poserRetour("exercice", false, () => {});
  }, [mode]);

  /* Signale qu'une série est engagée, et remet tout à plat en quittant. */
  useEffect(() => {
    if (gardeExercice) {
      gardeExercice.current = mode !== null;
      /* Engagé seulement après « Commencer » : lire les consignes ne coûte
         rien, il n'y a pas à confirmer pour les quitter. */
      gardeExercice.engage = () => mode !== null && SERIE.engagee;
      /* Revenir aux consignes : on remonte l'exercice à neuf, ce qui l'arrête
         sans quitter la page. */
      gardeExercice.consignes = () => {
        SERIE.engagee = false;
        window.scrollTo(0, 0);
        setRedemarrage((n) => n + 1);
      };
      gardeExercice.fermer = () => {
        SERIE.engagee = false;
        setMode(null);
        requestAnimationFrame(() => window.scrollTo(0, hauteurMenuExercices));
      };
    }
    return () => {
      if (gardeExercice) gardeExercice.current = false;
      try {
        localStorage.removeItem("big-jack-theory-exercice");
      } catch {
        /* stockage indisponible */
      }
    };
  }, [mode, gardeExercice]);
  const setMode = (v) => {
    setModeBrut(v);
    try {
      if (v) localStorage.setItem("big-jack-theory-exercice", v);
      else localStorage.removeItem("big-jack-theory-exercice");
    } catch {
      /* stockage indisponible */
    }
  };
  const modes = [
    {
      v: "strategie",
      l: "Stratégie de base",
      d: "Décider sans hésiter",
      texte: "Une main, une hauteur de croupier, une décision. Le tableau appliqué est celui de vos réglages de table. À maîtriser avant toute chose : une erreur de jeu coûte plusieurs fois ce que le comptage rapporte.",
    },
    {
      v: "valeur",
      l: "Valeur de carte",
      d: "Donner la valeur d'une carte",
      texte: "Une carte s'affiche, vous donnez sa valeur. Chronométré. À travailler jusqu'à ce que la réponse vienne sans réfléchir.",
    },
    {
      v: "sabot",
      l: "Défilé chronométré",
      d: "Compter un sabot entier",
      texte: "Les cartes défilent à la vitesse que vous choisissez, vous annoncez le compte à la fin. C'est l'exercice le plus proche de la table.",
    },
    {
      v: "indices",
      l: "Indices de déviation",
      d: "Savoir quand quitter le tableau",
      texte: "Une situation, un vrai compte, et la question de savoir s'il faut s'écarter du tableau. Les Illustrious 18 et les Fab 4, à travailler une fois le comptage automatique.",
    },
    {
      v: "tc",
      l: "Vrai compte",
      d: "Diviser par les paquets restants",
      texte: "Convertir le compte courant en vrai compte, avec l'estimation des paquets restants. L'étape que les débutants ratent en conditions réelles.",
    },
  ];
  const actif = modes.find((m) => m.v === mode);
  const [confirmation, setConfirmation] = useState(false);
  const [ouvertHistorique, setOuvertHistorique] = useState(false);
  const [filtreExo, setFiltreExo] = useState("tous");
  const [redemarrage, setRedemarrage] = useState(0);
  const [confirmeBilans, setConfirmeBilans] = useState(false);
  const bilans = [...(entr?.bilans ?? [])].reverse();
  /* Le filtre porte sur l'affichage seul : les compteurs et la réinitialisation
     continuent de valoir pour toutes les séries. */
  const bilansFiltres = filtreExo === "tous" ? bilans : bilans.filter((b) => b.type === filtreExo);
  const gardees = bilans.filter((b) => b.garde).length;
  const [aSupprimer, setASupprimer] = useState(null);
  const [enCours, setEnCours] = useState(null);
  const [details, setDetails] = useState(false);
  const sons = reglages?.sons !== false;
  const jeuSons = reglages?.jeuSons ?? "marque";
  const serie = calculerSerie(entr?.jours ?? []);
  const criteres = evaluerPrets(entr ?? ENTRAINEMENT_VIDE);
  const pret = criteres.every((c) => c.atteint);
  const maitrisees = Object.values(entr?.strategie?.maitrise ?? {}).filter((m) => m.n >= 3 && m.bon === m.n).length;
  const vues = Object.keys(entr?.strategie?.maitrise ?? {}).length;

  if (!actif) {
    return (
      <div style={wrap}>
        <div style={{ padding: mobile ? "22px 0 18px" : "44px 0 20px" }}>
          <div style={S.eyebrow}>Exercices — {sys.nom}</div>
          <h1 style={{ fontSize: "clamp(26px,6.4vw,44px)", margin: "10px 0 12px", fontWeight: 700, maxWidth: 620 }}>
            Cinq exercices
          </h1>
          <p style={{ fontSize: mobile ? 15 : 16, lineHeight: 1.6, color: "var(--encre2)", maxWidth: 620, margin: 0 }}>
            Dans cet ordre. Passez au suivant quand le précédent est devenu ennuyeux — l'objectif est de ne plus avoir besoin de cet écran.
          </p>
        </div>

        <div
          style={{
            background: "var(--ecran)",
              border: "1px solid var(--ecran-bord)",
            color: "var(--ecran-texte)",
            borderRadius: 4,
            padding: mobile ? "16px 15px" : "20px 22px",
            marginBottom: 14,
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 14, flexWrap: "wrap" }}>
            <div>
              <div className="mono" style={{ ...S.eyebrow, fontSize: 10, color: "var(--ecran-sourd)" }}>
                PRÊT POUR LA TABLE
              </div>
              <div
                className="mono"
                style={{
                  /* Mêmes taille et graisse que le résultat net du journal :
                     c'est le chiffre que l'on vient chercher. */
                  fontSize: mobile ? 34 : 50,
                  fontWeight: 700,
                  letterSpacing: "-.008em",
                  lineHeight: 1.1,
                  color: pret ? "var(--ecran-ok)" : "var(--ecran-rouge)",
                }}
              >
                {pret ? "Oui" : "Pas encore"}
              </div>
            </div>
            <div style={{ textAlign: "right" }}>
              <div className="mono" style={{ ...S.eyebrow, fontSize: 10, color: "var(--ecran-sourd)" }}>
                SÉRIE
              </div>
              <div className="mono" style={{ fontSize: mobile ? 20 : 26, fontWeight: 700, letterSpacing: "-.008em", marginTop: 2 }}>
                {serie} jour{serie > 1 ? "s" : ""}
              </div>
            </div>
          </div>

          <div style={{ display: "grid", gap: 7, marginTop: 14 }}>
            {/* Une jauge par exigence : la barre montre l'avancement, le cran
                marque la cible. On voit d'où l'on part et ce qu'il reste. */}
            {criteres.map((c) => (
              <div key={c.cle} style={{ marginBottom: 4 }}>
                <div style={{ display: "flex", alignItems: "baseline", gap: 9 }}>
                  <Cartouche
                    mot={c.atteint ? "atteint" : "en cours"}
                    fond={c.atteint ? "#1B6E2C" : "#3A424A"}
                  />
                  <span style={{ flex: 1, fontSize: 13.5, minWidth: 0 }}>{c.titre}</span>
                  <span className="mono" style={{ fontSize: 12, flexShrink: 0 }}>{c.valeur}</span>
                </div>
                <div
                  style={{
                    position: "relative",
                    height: 7,
                    borderRadius: 999,
                    background: "var(--ecran-bord)",
                    overflow: "hidden",
                    margin: "6px 0 4px",
                  }}
                >
                  <div
                    style={{
                      position: "absolute",
                      inset: 0,
                      width: `${Math.round((c.part ?? 0) * 100)}%`,
                      background: c.atteint ? "var(--ecran-ok)" : "var(--ecran-texte)",
                      opacity: c.atteint ? 1 : 0.55,
                    }}
                  />
                  <div
                    style={{
                      position: "absolute",
                      top: 0,
                      bottom: 0,
                      right: 0,
                      width: 2,
                      background: "var(--ecran-texte)",
                    }}
                  />
                </div>
                <div style={{ fontSize: 11.5, color: "var(--ecran-sourd)", lineHeight: 1.4 }}>
                  cible {c.exigence}
                </div>
              </div>
            ))}
          </div>

          <p style={{ fontSize: 12.5, lineHeight: 1.55, color: "var(--ecran-sourd)", margin: "12px 0 0" }}>
            {pret
              ? "Les quatre conditions sont remplies. Cela ne garantit pas un gain : cela signifie que votre exécution ne sera pas la cause de vos pertes."
              : "Ces seuils ne sont pas décoratifs. En dessous, vos erreurs coûtent plus que ce que le comptage peut rapporter."}
            {" "}
            Les indices de déviation ne figurent pas ici : ils s'ajoutent une fois ces quatre points acquis, et le
            comptage rapporte déjà sans eux.
          </p>
        </div>

        {vues > 0 && (
          <div style={{ ...S.panneau, padding: mobile ? "14px 15px" : "16px 18px", marginBottom: 14 }}>
            <div style={{ ...S.eyebrow, marginBottom: 8 }}>Maîtrise des situations</div>
            <div style={{ display: "flex", alignItems: "baseline", gap: 10, flexWrap: "wrap" }}>
              <span className="mono" style={{ fontSize: 24, fontWeight: 700, color: "var(--ok)" }}>
                {maitrisees}
              </span>
              <span style={{ fontSize: 14, color: "var(--encre2)" }}>
                situation{maitrisees > 1 ? "s" : ""} maîtrisée{maitrisees > 1 ? "s" : ""} sur {vues} rencontrée
                {vues > 1 ? "s" : ""}
              </span>
            </div>
            <div style={{ height: 6, borderRadius: 999, background: "var(--regle)", marginTop: 9, overflow: "hidden" }}>
              <div style={{ height: "100%", width: `${(maitrisees / vues) * 100}%`, background: "var(--ok)" }} />
            </div>
            <p style={{ fontSize: 12.5, lineHeight: 1.5, color: "var(--encre2)", margin: "10px 0 12px" }}>
              Une situation est maîtrisée après trois rencontres sans erreur. Le tableau en compte 290 au total : ce
              compteur ne monte qu'au fil de ce que vous croisez réellement.
            </p>
          </div>
        )}

        <div style={{ display: "grid", gap: 10 }}>
          {modes.map((m, i) => (
            <button
              key={m.v}
              onClick={() => {
                /* Comme un changement de page : on remonte avant le rendu,
                   sinon l'exercice s'affiche à la hauteur du menu. */
                hauteurMenuExercices = window.scrollY || 0;
                window.scrollTo(0, 0);
                contexte();
                setMode(m.v);
              }}
              className="bjc-tap"
              style={{
                ...S.panneau,
                display: "flex",
                alignItems: "center",
                gap: 14,
                textAlign: "left",
                padding: mobile ? "16px 16px" : "20px 22px",
              }}
            >
              <span
                className="mono"
                style={{ fontSize: 15, fontWeight: 700, color: "var(--or)", flexShrink: 0 }}
              >
                {String(i + 1).padStart(2, "0")}
              </span>
              <span style={{ flex: 1 }}>
                <span
                  style={{
                    display: "block",
                    fontFamily: "'Public Sans', ui-sans-serif, sans-serif",
                    fontWeight: 700,
                    fontSize: mobile ? 18 : 21,
                    letterSpacing: "-.008em",
                  }}
                >
                  {m.l}
                </span>
                <span style={{ display: "block", fontSize: 13, color: "var(--or)", marginTop: 2 }}>{m.d}</span>
                <span
                  style={{ display: "block", fontSize: mobile ? 13.5 : 14.5, lineHeight: 1.5, color: "var(--encre2)", marginTop: 5 }}
                >
                  {m.texte}
                </span>
              </span>
              <span style={{ fontSize: 20, color: "var(--encre2)", flexShrink: 0 }}>→</span>
            </button>
          ))}
        </div>

        <div style={{ ...S.panneau, padding: mobile ? "14px 15px" : "16px 18px", marginTop: 20 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 10, flexWrap: "wrap" }}>
            <div style={S.eyebrow}>Votre progression</div>
            {bilans.length > 0 && (
              <button
                onClick={() => setOuvertHistorique((o) => !o)}
                style={{ fontSize: 12.5, fontWeight: 600, color: "var(--encre2)", textDecoration: "underline", textUnderlineOffset: 2 }}
              >
                {ouvertHistorique ? "Réduire" : `Voir les ${bilansFiltres.length}`}
              </button>
            )}
          </div>

          {bilans.length > 0 && (
            <select
              value={filtreExo}
              onChange={(e) => setFiltreExo(e.target.value)}
              aria-label="Filtrer par exercice"
              style={{ ...styleChamp, marginTop: 10, fontSize: 13 }}
            >
              <option value="tous">Tous les exercices ({bilans.length})</option>
              {modes.map((m) => {
                const n = bilans.filter((b) => b.type === m.v).length;
                return n > 0 ? (
                  <option key={m.v} value={m.v}>{m.l} ({n})</option>
                ) : null;
              })}
            </select>
          )}

          {bilans.length === 0 && (
            <p style={{ fontSize: 13, lineHeight: 1.55, color: "var(--encre2)", margin: "9px 0 0" }}>
              Rien pour l'instant. Terminez une série dans n'importe quel exercice — ou touchez « Terminer maintenant »
              en mode sans fin — et son bilan s'inscrira ici : date, exercice, taux de réussite, meilleure série.
            </p>
          )}

          {bilans.length > 0 && (
          <>

            <div style={{ display: "grid", gap: 3, marginTop: 10 }}>
              {(ouvertHistorique ? bilansFiltres : bilansFiltres.slice(0, 5)).map((b) => {
                const taux = b.total ? Math.round((b.bon / b.total) * 100) : 0;
                const d = new Date(b.date);
                return (
                  <div
                    key={b.id}
                    style={{
                      display: "flex",
                      alignItems: "baseline",
                      gap: 9,
                      padding: "7px 9px",
                      borderRadius: 2,
                      background: "var(--survol)",
                    }}
                  >
                    <span className="mono" style={{ fontSize: 11, color: "var(--encre2)", flexShrink: 0 }}>
                      {String(d.getDate()).padStart(2, "0")}/{String(d.getMonth() + 1).padStart(2, "0")}
                    </span>
                    <span style={{ flex: 1, fontSize: 13.5, minWidth: 0 }}>
                      {NOMS_EXERCICE[b.type] ?? b.type}
                      <span style={{ color: "var(--encre2)" }}>
                        {" "}· {b.total} réponses
                        {b.record ? ` · série de ${b.record}` : ""}
                        {b.temps ? ` · ${b.temps.toFixed(2).replace(".", ",")} s` : ""}
                      </span>
                    </span>
                    <span
                      className="mono"
                      style={{
                        fontSize: 14,
                        fontWeight: 700,
                        flexShrink: 0,
                        color: taux >= 95 ? "var(--ok)" : taux >= 80 ? "var(--or)" : "var(--rouge)",
                      }}
                    >
                      {taux} %
                    </span>
                    <button
                      onClick={() => basculerGarde && basculerGarde(b.id)}
                      aria-label={b.garde ? "Ne plus conserver cette série" : "Conserver cette série"}
                      title={b.garde ? "Conservée — ne sera pas effacée automatiquement" : "Conserver cette série"}
                      style={{
                        fontSize: 15,
                        lineHeight: 1,
                        padding: "0 2px",
                        flexShrink: 0,
                        color: b.garde ? "var(--or)" : "var(--regle)",
                      }}
                    >
                      {b.garde ? "★" : "☆"}
                    </button>
                    <button
                      onClick={() => {
                        if (aSupprimer === b.id) { supprimerBilan && supprimerBilan(b.id); setASupprimer(null); }
                        else setASupprimer(b.id);
                      }}
                      onBlur={() => setASupprimer((x) => (x === b.id ? null : x))}
                      aria-label={aSupprimer === b.id ? "Confirmer la suppression" : "Supprimer cette série"}
                      style={{
                        fontSize: aSupprimer === b.id ? 11.5 : 15,
                        fontWeight: aSupprimer === b.id ? 700 : 400,
                        lineHeight: 1,
                        padding: aSupprimer === b.id ? "4px 7px" : "0 2px",
                        borderRadius: 2,
                        flexShrink: 0,
                        color: aSupprimer === b.id ? "var(--panneau)" : "var(--encre2)",
                        background: aSupprimer === b.id ? "var(--rouge)" : "transparent",
                      }}
                    >
                      {aSupprimer === b.id ? "Confirmer" : "×"}
                    </button>
                  </div>
                );
              })}
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap", marginTop: 11 }}>
              <span style={{ fontSize: 12.5, lineHeight: 1.5, color: "var(--encre2)" }}>
                {MAX_BILANS} séries au maximum. Au-delà, les plus anciennes s'effacent — sauf celles marquées d'une
                étoile, qui restent tant que vous ne les libérez pas.
                {gardees > 0 && ` ${gardees} conservée${gardees > 1 ? "s" : ""} sur ${bilans.length}.`}
                {gardees >= MAX_BILANS - 5 && gardees < MAX_BILANS && " Vous approchez de la limite : libérez-en quelques-unes."}
              </span>
              {!confirmeBilans ? (
                <button
                  onClick={() => setConfirmeBilans(true)}
                  style={{ fontSize: 12.5, fontWeight: 600, color: "var(--encre2)", textDecoration: "underline", textUnderlineOffset: 2 }}
                >
                  Tout effacer
                </button>
              ) : (
                <span style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
                  <span style={{ fontSize: 12.5, color: "var(--rouge)" }}>
                    Effacer les {bilans.length} séries{gardees > 0 ? `, dont ${gardees} conservée${gardees > 1 ? "s" : ""}` : ""} ?
                  </span>
                  <button
                    onClick={() => { effacerBilans && effacerBilans(); setConfirmeBilans(false); }}
                    style={{ background: "var(--rouge)", color: "var(--panneau)", padding: "6px 12px", borderRadius: 3, fontSize: 12.5, fontWeight: 700 }}
                  >
                    Oui
                  </button>
                  <button
                    onClick={() => setConfirmeBilans(false)}
                    style={{ border: "1px solid var(--encre)", padding: "6px 12px", borderRadius: 3, fontSize: 12.5, fontWeight: 600 }}
                  >
                    Annuler
                  </button>
                </span>
              )}
            </div>
          </>
          )}

          {/* La remise à zéro vit avec les données qu'elle efface : séries,
              statistiques et maîtrise partent ensemble. */}
          <div style={{ borderTop: "1px solid var(--regle)", marginTop: 14, paddingTop: 12 }}>
          {!confirmation ? (
            <>
              <p style={{ fontSize: 13.5, lineHeight: 1.55, color: "var(--encre2)", margin: "0 0 11px" }}>
                Série, statistiques et maîtrise des situations sont conservées entre les séances. Les réinitialiser
                repart de zéro et ne touche ni vos réglages ni votre journal.
              </p>
              <button
                onClick={() => setConfirmation(true)}
                style={{
                  border: "1px solid var(--regle)",
                  padding: "10px 15px",
                  borderRadius: 3,
                  fontSize: 13.5,
                  fontWeight: 600,
                  color: "var(--encre2)",
                }}
              >
                Réinitialiser la progression
              </button>
            </>
          ) : (
            <>
              <p style={{ fontSize: 14, lineHeight: 1.55, margin: "0 0 11px" }}>
                <b>Confirmer ?</b> Vous perdrez {entr?.strategie?.total ?? 0} main
                {(entr?.strategie?.total ?? 0) > 1 ? "s" : ""} de stratégie, {entr?.valeur?.total ?? 0} carte
                {(entr?.valeur?.total ?? 0) > 1 ? "s" : ""}, {maitrisees} situation
                {maitrisees > 1 ? "s" : ""} maîtrisée{maitrisees > 1 ? "s" : ""} et une série de {serie} jour
                {serie > 1 ? "s" : ""}. C'est définitif.
              </p>
              <div style={{ display: "flex", gap: 9, flexWrap: "wrap" }}>
                <button
                  onClick={() => { reinitEntr && reinitEntr(); setConfirmation(false); }}
                  style={{
                    background: "var(--rouge)",
                    color: "var(--panneau)",
                    padding: "10px 16px",
                    borderRadius: 3,
                    fontSize: 13.5,
                    fontWeight: 700,
                  }}
                >
                  Oui, réinitialiser
                </button>
                <button
                  onClick={() => setConfirmation(false)}
                  style={{
                    border: "1px solid var(--encre)",
                    padding: "10px 16px",
                    borderRadius: 3,
                    fontSize: 13.5,
                    fontWeight: 600,
                  }}
                >
                  Annuler
                </button>
              </div>
            </>
          )}
          </div>
        </div>

      </div>
    );
  }

  return (
    <div style={wrap}>
      <div style={{ padding: mobile ? "18px 0 14px" : "34px 0 18px" }}>
        <button
          onClick={() => {
            /* On revient à la hauteur où l'on parcourait la liste. */
            setMode(null);
            requestAnimationFrame(() => window.scrollTo(0, hauteurMenuExercices));
          }}
          className="bjc-tap"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 7,
            border: "1px solid var(--regle)",
            background: "var(--panneau)",
            padding: "9px 14px",
            borderRadius: 3,
            fontSize: 13.5,
            fontWeight: 600,
            color: "var(--encre2)",
          }}
        >
          <span className="mono" aria-hidden="true">←</span> Tous les exercices
        </button>
        <div style={{ ...S.eyebrow, marginTop: 16 }}>
          {actif.d} — {sys.nom}
        </div>
        {/* Un cran sous les titres de page : on est dans un exercice, pas sur
            une page principale. */}
        <h1 style={{ fontSize: "clamp(21px,5vw,32px)", margin: "10px 0 12px", fontWeight: 700 }}>{actif.l}</h1>
      </div>

      {mode === "strategie" && <DrillStrategie key={redemarrage} mobile={mobile} reglages={reglages} majReglage={majReglage} noter={noter} noterBilan={noterBilan} allerStrategie={allerStrategie} />}
      {mode === "valeur" && <DrillValeur key={sys.id + "-" + redemarrage} sys={sys} mobile={mobile} noter={noter} noterBilan={noterBilan} sons={sons} jeuSons={jeuSons} allerTheorie={allerTheorie} />}
      {mode === "sabot" && <DrillSabot key={sys.id + "-" + redemarrage} sys={sys} mobile={mobile} noter={noter} noterBilan={noterBilan} sons={sons} jeuSons={jeuSons} tic={reglages?.tic !== false} allerTheorie={allerTheorie} />}
      {mode === "indices" && <DrillIndices key={sys.id + "-" + redemarrage} sys={sys} mobile={mobile} noter={noter} noterBilan={noterBilan} sons={sons} jeuSons={jeuSons} allerTheorie={allerTheorie} />}
      {mode === "tc" && <DrillVraiCompte key={sys.id + "-" + redemarrage} sys={sys} mobile={mobile} noter={noter} noterBilan={noterBilan} sons={sons} jeuSons={jeuSons} allerTheorie={allerTheorie} />}
    </div>
  );
}

/* ============================================================
   MOTEUR — espérances par main
   ============================================================ */

function Grille({ titre, lignes, mobile, onCellule, selection }) {
  const largeurLabel = mobile ? 46 : 76;
  return (
    <div style={{ marginTop: 26 }}>
      <div style={{ ...S.eyebrow, borderTop: "1px solid var(--encre)", paddingTop: 10, marginBottom: 10 }}>{titre}</div>

        {/* Même style d'en-tête que les autres tableaux de l'application. */}
      {/* Légende : elle ne montre que les décisions réellement présentes dans
          ce tableau. Les paires ont leur « séparer », les mains dures leur
          « abandonner » quand la table le propose. */}
      <div style={{ display: "flex", gap: 14, flexWrap: "wrap", marginBottom: 8 }}>
        {[["T", "Tirer"], ["D", "Doubler"], ["R", "Rester"], ["S", "Séparer"], ["A", "Abandonner"]]
          .filter(([c]) => lignes.some(([, codes]) => codes.some((k) => k === c || (c === "D" && k === "Dr"))))
          .map(([c, mot]) => (
          <span key={c} style={{ display: "flex", alignItems: "center", gap: 5 }}>
            <span
              style={{
                width: 8,
                height: 8,
                borderRadius: 2,
                flexShrink: 0,
                background:
                  c === "T" ? "var(--panneau)"
                  : c === "A" ? "var(--encre)"
                  : `color-mix(in srgb, ${ACTIONS[c].fond} 18%, var(--panneau))`,
                border: `1px solid ${
                  c === "T" ? "var(--regle)"
                  : c === "A" ? "var(--encre)"
                  : `color-mix(in srgb, ${ACTIONS[c].fond} 62%, transparent)`
                }`,
              }}
            />
            <span style={{ ...S.eyebrow, fontSize: 9.5, color: "var(--encre2)" }}>{mot}</span>
          </span>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: `${largeurLabel}px repeat(10,1fr)`, gap: 2 }}>
        <div style={{ ...S.eyebrow, fontSize: 10, alignSelf: "end", paddingBottom: 4 }}>
          {mobile ? "MAIN" : "VOTRE MAIN"}
        </div>
        {HAUTEURS.map((h) => (
          <div
            key={h}
            className="mono"
            style={{ textAlign: "center", fontSize: mobile ? 11.5 : 13, fontWeight: 700, paddingBottom: 4 }}
          >
            {h}
          </div>
        ))}

        {lignes.map(([label, codes]) => (
          <React.Fragment key={label}>
            <div
              className="mono"
              style={{
                fontSize: mobile ? 10 : 12,
                fontWeight: 700,
                display: "flex",
                alignItems: "center",
                justifyContent: "flex-end",
                paddingRight: 5,
              }}
            >
              {label}
            </div>
            {codes.map((code, i) => {
              const act = ACTIONS[code];
              const cible = `${label}|${HAUTEURS[i]}`;
              const actif = selection === cible;
              return (
                <button
                  key={i}
                  onClick={() => onCellule(actif ? null : cible, label, HAUTEURS[i], code)}
                  className="mono"
                  style={{
                    minHeight: mobile ? 27 : 33,
                    /* Lettre plus grande et plus grasse, teintes portées à 40 % :
                       la grille se lit d'un coup d'œil, à bout de bras. */
                    fontSize: mobile ? 13 : 15,
                    fontWeight: 700,
                    borderRadius: 2,
                    /* La lettre garde la couleur de son action ; c'est le fond
                       qui s'efface derrière elle. À 40 % les deux se
                       confondaient, à 18 % la lettre ressort nettement. */
                    color: code === "T" ? "var(--encre2)" : code === "A" ? "var(--panneau)" : act.teinte,
                    background: code === "T" ? "var(--panneau)" : code === "A" ? "var(--encre)" : `color-mix(in srgb, ${act.fond} 18%, var(--panneau))`,
                    border: actif ? "2px solid var(--or)" : `1px solid ${code === "T" ? "var(--regle)" : `color-mix(in srgb, ${act.fond} 62%, transparent)`}`,
                  }}
                >
                  {code}
                </button>
              );
            })}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
}

function VueStrategie({ mobile, wrap, hauteurEntete, hauteurSousNav, reglages, majReglage }) {
  const { h17, abandon, regle } = reglages;
  const das = reglages.das !== false;
  const setDas = (v) => majReglage("das", v);
  const paquets = reglages.nbPaquets >= 7 ? 8 : 6;
  const sansCarteCachee = regle === "enhc";
  const setH17 = (v) => majReglage("h17", v);
  const setAbandon = (v) => majReglage("abandon", v);
  const setRegle = (v) => majReglage("regle", v);
  const setPaquets = (v) => majReglage("nbPaquets", v);
  const [selection, setSelection] = useState(null);
  const [recherche, setRecherche] = useState("");
  const [erreurRecherche, setErreurRecherche] = useState(false);
  const [detail, setDetail] = useState(null);
  const [tableauVu, setTableauVu] = useState("dur");
  const [reglagesVus, setReglagesVus] = useState(false);
  const [infoVue, setInfoVue] = useState(false);

  const tables = useMemo(
    () => construireTables(h17, abandon, sansCarteCachee, paquets, das),
    [h17, abandon, sansCarteCachee, paquets, das]
  );

  /* Recherche rapide : « 16 10 », « A7 3 », « 88 as », « 16 contre 10 ».
     La main peut s'écrire par son total, par ses deux cartes ou par la paire. */
  const chercher = (texte) => {
    const t = texte.toLowerCase().replace(/contre|vs|\/|-/g, " ").replace(/[,;]/g, " ").trim();
    const mots = t.split(/\s+/).filter(Boolean);
    if (mots.length < 2) return null;
    const carte = (m) => {
      if (/^(a|as|1|ace)$/.test(m)) return "A";
      if (/^(10|d|v|r|j|q|k|t|dame|valet|roi|figure|buche|bûche)$/.test(m)) return "10";
      if (/^[2-9]$/.test(m)) return m;
      return null;
    };
    const hauteur = carte(mots[mots.length - 1]);
    if (!hauteur) return null;
    const g = mots.slice(0, -1).join("");

    // Paire : « 88 », « aa », « 10 10 »
    const paire = { aa: "A,A", "1010": "10,10", "22": "2,2", "33": "3,3", "44": "4,4", "55": "5,5", "66": "6,6", "77": "7,7", "88": "8,8", "99": "9,9" }[g];
    let main = paire;
    // Main souple : « a7 », « as7 »
    if (!main) {
      const m = g.match(/^(?:a|as)([2-9])$/);
      if (m) main = "A," + m[1];
    }
    // Total dur : les lignes du tableau regroupent les extrêmes
    if (!main) {
      const n = Number(g);
      if (n >= 4 && n <= 8) main = "5 à 8";
      else if (n >= 9 && n <= 17) main = String(n);
      else if (n >= 18 && n <= 21) main = "18 à 21";
    }
    if (!main) return null;

    const totalDemande = /^\d+$/.test(g) ? Number(g) : null;
    for (const groupe of ["dur", "mou", "paires"]) {
      const ligne = tables[groupe].find((l) => l[0] === main);
      if (ligne) {
        const i = { "2": 0, "3": 1, "4": 2, "5": 3, "6": 4, "7": 5, "8": 6, "9": 7, "10": 8, A: 9 }[hauteur];
        const groupee = main.includes(" à ");
        const cartes = groupee && totalDemande ? compositionDure(totalDemande) : null;
        return {
          cible: `${groupe}-${main}-${i}`,
          main,
          hauteur,
          code: ligne[1][i],
          titre: groupee && totalDemande ? String(totalDemande) : null,
          cartes,
        };
      }
    }
    return null;
  };

  const lancerRecherche = (texte) => {
    /* Champ vidé : on efface aussi le résultat, sinon le bandeau reste ouvert
       sur une main qu'on ne cherche plus. */
    if (!texte.trim()) { setErreurRecherche(false); choisir(null); return; }
    const r = chercher(texte);
    if (!r) { setErreurRecherche(texte.trim().length > 1); return; }
    setErreurRecherche(false);
    /* La main trouvée peut être dans un autre tableau que celui affiché. */
    setTableauVu(r.cible.split("-")[0]);
    choisir(r.cible, r.main, r.hauteur, r.code, r.cartes, r.titre);
  };

  const choisir = (cible, main, hauteur, code, cartesExactes, titre) => {
    setSelection(cible);
    if (!cible) { setDetail(null); return; }
    const cartes = cartesExactes ?? MAINS[main];
    const h = hauteur === "A" ? 1 : Number(hauteur);
    const stats = cartes ? analyserMain(cartes, h, h17, paquets, sansCarteCachee) : null;
    // Une ligne regroupée affiche sur quel total l'espérance a été calculée.
    const totalAffiche = cartes ? cartes[0] + cartes[1] : null;
    setDetail({
      main: titre ?? main,
      groupe: main.includes(" à ") ? main : null,
      hauteur,
      code,
      cartes,
      stats,
      totalAffiche,
    });
  };

  const options = detail?.stats
    ? [
        { c: "R", ev: detail.stats.ev.R },
        { c: "T", ev: detail.stats.ev.T },
        { c: "D", ev: detail.stats.ev.D },
        ...(detail.stats.ev.S !== null ? [{ c: "S", ev: detail.stats.ev.S }] : []),
        ...(abandon ? [{ c: "A", ev: -0.5 }] : []),
      ].sort((a, b) => b.ev - a.ev)
    : [];

  const codeChart = detail?.code === "Dr" ? "D" : detail?.code;
  const meilleur = options[0];
  const evChoisi = options.find((o) => o.c === codeChart);
  const divergence = meilleur && evChoisi && meilleur.c !== codeChart ? meilleur.ev - evChoisi.ev : 0;

  return (
    <div style={wrap}>
      <div style={{ padding: mobile ? "22px 0 18px" : "44px 0 20px", maxWidth: 640 }}>
        <div style={S.eyebrow}>Stratégie de base — {paquets} paquets</div>
        {/* Le texte d'introduction se lit une fois : il passe dans une fenêtre,
            et le tableau vient tout de suite. */}
        <div style={{ display: "flex", alignItems: "center", gap: 12, margin: "10px 0 0" }}>
          <h1 style={{ fontSize: "clamp(26px,6.4vw,44px)", lineHeight: 1.04, margin: 0, fontWeight: 700, flex: 1 }}>
            Tableau des mains
          </h1>
          <button
            onClick={() => setInfoVue(true)}
            aria-label="À quoi sert ce tableau"
            style={{
              width: 34,
              height: 34,
              borderRadius: "50%",
              flexShrink: 0,
              border: "1px solid var(--regle)",
              background: "transparent",
              color: "var(--encre2)",
              fontSize: 15,
              fontWeight: 700,
              fontStyle: "italic",
              lineHeight: 1,
            }}
          >
            i
          </button>
        </div>
      </div>

      {infoVue && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="À quoi sert ce tableau"
          onClick={() => setInfoVue(false)}
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 99,
            background: "rgba(0,0,0,.62)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 16,
          }}
        >
          <div
            className="bjc-flash"
            onClick={(e) => e.stopPropagation()}
            style={{ ...S.panneau, maxWidth: 380, padding: mobile ? "20px 18px" : "24px 22px", boxShadow: "var(--ombre-forte)" }}
          >
            <h2 style={{ fontSize: mobile ? 17 : 19, margin: "0 0 10px", fontWeight: 700, letterSpacing: "-.01em" }}>
              À quoi sert ce tableau
            </h2>
            <p style={{ fontSize: 14.5, lineHeight: 1.6, color: "var(--encre2)", margin: 0 }}>
              Il donne la meilleure décision sans aucune information sur le sabot. Il ramène l'avantage du casino autour
              de 0,5 %, et c'est le socle sur lequel le comptage ajoute son gain — compter sans le maîtriser vous fait
              perdre plus vite, pas moins.
            </p>
            <p style={{ fontSize: 14.5, lineHeight: 1.6, color: "var(--encre2)", margin: "10px 0 18px" }}>
              Touchez une case pour la décision en toutes lettres et l'espérance de chaque option.
            </p>
            <button
              onClick={() => setInfoVue(false)}
              className="bjc-tap"
              style={{
                width: "100%",
                background: "var(--encre)",
                color: "var(--panneau)",
                padding: "12px 18px",
                borderRadius: 3,
                fontWeight: 700,
                fontSize: 14,
                textTransform: "uppercase",
                letterSpacing: ".08em",
              }}
            >
              Fermer
            </button>
          </div>
        </div>
      )}

      {/* Les réglages sont repliés : on vient d'abord lire le tableau, on ne
          les ajuste qu'en changeant de table. Le résumé rappelle l'essentiel. */}
      <div style={{ ...S.panneau, padding: mobile ? "12px 14px" : "14px 16px", marginBottom: 12 }}>
        <button
          onClick={(e) => {
            /* Même geste que dans les paramètres : ce qui s'ouvre vient sous
               les yeux. */
            const o = !reglagesVus;
            setReglagesVus(o);
            if (o) amener(e.currentTarget.parentElement);
          }}
          aria-expanded={reglagesVus}
          style={{ width: "100%", display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 10, textAlign: "left" }}
        >
          <span style={{ fontSize: 12.5, fontWeight: 700, color: "var(--encre)" }}>
            Règles de la table
            <span className="mono" style={{ fontWeight: 400, color: "var(--encre2)", marginLeft: 8, fontSize: 11.5 }}>
              {paquets} paquets · {h17 ? "H17" : "S17"}
              {abandon ? " · abandon" : ""}
              {das ? "" : " · sans DAS"}
            </span>
          </span>
          <span className="mono" aria-hidden="true" style={{ fontSize: 15, color: "var(--encre2)", flexShrink: 0 }}>
            {reglagesVus ? "−" : "+"}
          </span>
        </button>

        {reglagesVus && (
          <div className="bjc-pop" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: mobile ? 10 : 14, alignItems: "start", marginTop: 13 }}>
            <div>
              <div style={S.titreChoix}>Paquets</div>
              <Segments plein options={[{ v: 6, l: "6" }, { v: 8, l: "8" }]} valeur={paquets} onChange={setPaquets} />
            </div>
            <div>
              <div style={S.titreChoix}>17 souple</div>
              <Segments plein options={[{ v: false, l: "Reste" }, { v: true, l: "Tire" }]} valeur={h17} onChange={setH17} />
            </div>
            <div>
              <div style={S.titreChoix}>Abandon tardif</div>
              <Segments plein options={[{ v: true, l: "Proposé" }, { v: false, l: "Non" }]} valeur={abandon} onChange={setAbandon} />
            </div>
            <div>
              <div style={S.titreChoix}>Doubler après séparation</div>
              <Segments plein options={[{ v: true, l: "Oui" }, { v: false, l: "Non" }]} valeur={das} onChange={setDas} />
            </div>
            <div style={{ gridColumn: "1 / -1" }}>
              <div style={S.titreChoix}>Blackjack du croupier</div>
              <Segments
                plein
                options={[
                  { v: "cachee", l: "Carte cachée" },
                  { v: "obo", l: "Mise rendue" },
                  { v: "enhc", l: "Tout perdu" },
                ]}
                valeur={regle}
                onChange={setRegle}
              />
              <div style={{ fontSize: 12.5, lineHeight: 1.55, color: "var(--encre2)", marginTop: 8 }}>
                {regle === "cachee" &&
                  "Le croupier vérifie son blackjack avant que vous jouiez. Règle de Las Vegas et des tables en direct."}
                {regle === "obo" &&
                  "Son blackjack ne vous prend que la mise initiale : le tableau reste celui de la carte cachée."}
                {regle === "enhc" &&
                  "Son blackjack emporte aussi vos doublements et séparations. Variantes « European Blackjack »."}
              </div>
            </div>
          </div>
        )}
      </div>

      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 8 }}>
        <input
          value={recherche}
          onChange={(e) => { setRecherche(e.target.value); lancerRecherche(e.target.value); }}
          /* Toucher le champ remonte en haut : le bandeau de réponse s'affiche
             sous l'en-tête, il doit être visible quand la main apparaît. */
          onFocus={() => window.scrollTo(0, 0)}
          placeholder="Votre main et la carte du croupier — 16 10"
          aria-label="Rechercher une décision"
          /* Clavier numérique : la saisie est faite de chiffres et d'espaces.
             L'as se pose avec le bouton dédié, puisque ce clavier n'a pas de
             lettres. */
          inputMode="numeric"
          enterKeyHint="search"
          style={{
            flex: "1 1 200px",
            width: "auto",
            padding: "11px 13px",
            border: "1px solid " + (erreurRecherche ? "var(--rouge)" : "var(--regle)"),
            borderRadius: 3,
            background: "var(--panneau)",
            color: "var(--encre)",
            fontSize: 15,
            fontFamily: "inherit",
          }}
        />
        <button
          onClick={() => {
            const v = recherche + (recherche && !recherche.endsWith(" ") ? "" : "") + "A";
            setRecherche(v);
            lancerRecherche(v);
          }}
          aria-label="Ajouter un as"
          style={{
            border: "1px solid var(--regle)",
            padding: "10px 15px",
            borderRadius: 3,
            fontSize: 16,
            fontWeight: 700,
            color: "var(--encre)",
            background: "var(--panneau)",
            flexShrink: 0,
          }}
        >
          A
        </button>
        {recherche && (
          <button
            onClick={() => { setRecherche(""); setErreurRecherche(false); choisir(null); }}
            style={{ border: "1px solid var(--regle)", padding: "10px 14px", borderRadius: 3, fontSize: 13.5, fontWeight: 600, color: "var(--encre2)" }}
          >
            Effacer
          </button>
        )}
      </div>

      {erreurRecherche && (
        <p style={{ fontSize: 12.5, lineHeight: 1.55, color: "var(--encre2)", margin: "0 0 8px" }}>
          Écrivez votre total puis la carte du croupier : <b>16 10</b>. Une main souple se note <b>A7 3</b>, une paire{" "}
          <b>88 as</b>.
        </p>
      )}

      {/* Bandeau de lecture : affiché seulement quand une case est choisie. En
          permanence, il masquait le haut du tableau sans rien apprendre. */}
      {detail && (
      <div
        data-colle="1"
        style={{
          position: "sticky",
          top: hauteurEntete + (hauteurSousNav ?? HAUTEUR_SOUSNAV),
          zIndex: 12,
          background: "var(--ecran)",
              border: "1px solid var(--ecran-bord)",
          color: "var(--ecran-texte)",
          borderRadius: 3,
          padding: mobile ? "12px 14px" : "14px 18px",
          marginTop: 12,
          minHeight: 62,
          display: "flex",
          alignItems: "center",
        }}
      >
        {detail ? (
          <div className="bjc-pop" style={{ width: "100%" }}>
            <div className="mono" style={{ fontSize: 10, letterSpacing: ".12em", color: "var(--ecran-sourd)" }}>
              {detail.main.toUpperCase()} CONTRE {detail.hauteur}
              {detail.cartes && ` · ${nomCarte(detail.cartes[0])} + ${nomCarte(detail.cartes[1])}`}
              {detail.groupe && detail.groupe !== detail.main && ` · ligne ${detail.groupe}`}
            </div>
            <div style={{ fontSize: mobile ? 15 : 17, fontWeight: 700, margin: "4px 0 8px", lineHeight: 1.3 }}>
              {ACTIONS[detail.code].phrase.charAt(0).toUpperCase() + ACTIONS[detail.code].phrase.slice(1)}.
            </div>

            {detail.stats && (
              <>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
                  {options.map((o, i) => {
                    const estChart = o.c === codeChart;
                    return (
                      <span
                        key={o.c}
                        className="mono"
                        style={{
                          fontSize: 11.5,
                          padding: "4px 8px",
                          borderRadius: 2,
                          whiteSpace: "nowrap",
                          background: estChart ? "var(--ecran-texte)" : "transparent",
                          color: estChart ? "var(--ecran)" : o.ev >= 0 ? "var(--ecran-ok)" : "var(--ecran-sourd)",
                          border: `1px solid ${estChart ? "var(--ecran-texte)" : "var(--ecran-regle)"}`,
                          fontWeight: estChart || i === 0 ? 700 : 400,
                        }}
                      >
                        {ACTIONS[o.c].nom.split(",")[0]} {pct(o.ev)}
                      </span>
                    );
                  })}
                </div>

                <div className="mono" style={{ fontSize: 10.5, color: "var(--ecran-sourd)", marginTop: 7, lineHeight: 1.5 }}>
                  {detail.groupe === detail.main && (
                    <span style={{ color: "var(--ecran-or)" }}>
                      Ligne regroupée : espérances calculées sur {detail.totalAffiche}. Cherchez un total précis pour
                      le sien.{" "}
                    </span>
                  )}
                  Le croupier crève {pct(detail.stats.creveCroupier, false)}
                  {detail.stats.total < 21 && ` · vous crevez ${pct(detail.stats.creveJoueur, false)} en tirant une carte`}
                  {divergence > 0.0005 && (
                    <span style={{ color: "var(--ecran-rouge)" }}>
                      {" "}· {ACTIONS[meilleur.c].nom.split(",")[0].toLowerCase()} rapporte {pct(divergence)} de plus sur
                      cette composition précise
                    </span>
                  )}
                </div>
              </>
            )}
          </div>
        ) : null}
      </div>
      )}

      {/* Un seul tableau à la fois : les trois empilés faisaient une page très
          longue, où l'on perdait la ligne d'en-tête en défilant. */}
      <div style={{ marginTop: 18 }}>
        <Segments
          plein
          options={[
            { v: "dur", l: "Dures" },
            { v: "mou", l: "Souples" },
            { v: "paires", l: "Paires" },
          ]}
          valeur={tableauVu}
          onChange={(v) => {
            /* On remonte AVANT le rendu, comme pour un changement d'onglet :
               centrer le nouveau tableau le faisait descendre puis remonter. */
            window.scrollTo(0, 0);
            setTableauVu(v);
          }}
        />
      </div>

      <div>
      {tableauVu === "dur" && (
        <Grille titre="Mains dures — sans As, ou As compté 1" lignes={tables.dur} mobile={mobile} onCellule={choisir} selection={selection} />
      )}
      {tableauVu === "mou" && (
        <Grille titre="Mains souples — un As compté 11, soit 13 à 20" lignes={tables.mou} mobile={mobile} onCellule={choisir} selection={selection} />
      )}
      {tableauVu === "paires" && (
        <Grille titre="Paires — séparer ou non" lignes={tables.paires} mobile={mobile} onCellule={choisir} selection={selection} />
      )}
      </div>

      {abandon && (
        <div
          style={{
            ...S.panneau,
            padding: mobile ? "16px 15px" : "20px 22px",
            marginTop: 24,
            borderLeft: "3px solid var(--encre)",
          }}
        >
          <div style={{ ...S.eyebrow, marginBottom: 10 }}>Quand abandonner — la liste complète</div>
          <div style={{ display: "grid", gap: 7 }}>
            {[
              ["16 contre 9, 10 ou As", "sauf 8,8 — une paire de 8 se sépare, elle ne s'abandonne pas"],
              ["15 contre 10", null],
              ...(h17
                ? [
                    ["15 contre As", "uniquement si le croupier tire sur 17 souple"],
                    ["17 contre As", "uniquement si le croupier tire sur 17 souple"],
                    ["8,8 contre As", "uniquement si le croupier tire sur 17 souple"],
                  ]
                : []),
            ].map(([cas, note], i) => (
              <div key={i} style={{ display: "flex", gap: 10, alignItems: "baseline" }}>
                <span
                  className="mono"
                  style={{
                    fontSize: 11,
                    fontWeight: 700,
                    color: "var(--panneau)",
                    background: "var(--encre)",
                    padding: "3px 6px",
                    borderRadius: 2,
                    flexShrink: 0,
                  }}
                >
                  A
                </span>
                <span style={{ fontSize: 14.5, lineHeight: 1.5 }}>
                  <b>{cas}</b>
                  {note && <span style={{ color: "var(--encre2)" }}> — {note}</span>}
                </span>
              </div>
            ))}
          </div>
          <p style={{ fontSize: 13.5, lineHeight: 1.6, color: "var(--encre2)", margin: "14px 0 0" }}>
            {h17 ? "Sept cases sur trois cents" : "Quatre cases sur trois cents"} : c'est normal. Abandonner ne se
            justifie que là où votre perte espérée dépasse la moitié de la mise, ce qui est rare. Beaucoup de tables ne
            proposent d'ailleurs pas l'abandon tardif — vérifiez avant de vous asseoir, le gain est faible mais réel
            (environ 0,07 %).
          </p>
        </div>
      )}

      <div style={{ ...S.panneau, padding: mobile ? "14px 14px" : "18px 20px", marginTop: 24 }}>
        <div style={{ ...S.eyebrow, marginBottom: 11 }}>Légende</div>
        <div style={{ display: "grid", gridTemplateColumns: mobile ? "1fr" : "1fr 1fr", gap: 8 }}>
          {Object.entries(ACTIONS).map(([code, act]) => (
            <div key={code} style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 14 }}>
              <span
                className="mono"
                style={{
                  width: 34,
                  textAlign: "center",
                  padding: "4px 0",
                  borderRadius: 2,
                  fontWeight: 700,
                  fontSize: 12.5,
                  flexShrink: 0,
                  color: code === "T" ? "var(--encre2)" : code === "A" ? "var(--panneau)" : act.teinte,
                  background: code === "T" ? "var(--panneau)" : code === "A" ? "var(--encre)" : `color-mix(in srgb, ${act.fond} 26%, var(--panneau))`,
                  border: `1px solid ${code === "T" ? "var(--regle)" : `color-mix(in srgb, ${act.fond} 45%, transparent)`}`,
                }}
              >
                {code}
              </span>
              {act.nom}
            </div>
          ))}
        </div>
      </div>

      <div style={{ marginTop: 22, fontSize: 14, lineHeight: 1.65, color: "var(--encre2)" }}>
        {!das && (
          <p style={{ margin: "0 0 10px" }}>
            Sans doublement après séparation, quatre lignes de paires changent : les 2,2 et 3,3 ne se séparent plus
            contre 2 et 3, le 4,4 ne se sépare plus du tout, et le 6,6 se tire contre 2. La règle coûte environ
            0,14 % — vérifiez-la à votre table, elle n'est presque jamais affichée.
          </p>
        )}
        {sansCarteCachee && (
          <p style={{ margin: "0 0 10px" }}>
            Quand le blackjack du croupier emporte aussi vos mises supplémentaires, quatre décisions se déplacent :
            le 11 contre 10 se tire au lieu de se doubler, et les paires d'As contre As, de 8 contre 10 et de 8 contre
            As se tirent au lieu de se séparer. Le reste du tableau est inchangé. La règle coûte environ 0,08 % sur le
            doublement et 0,03 % sur la séparation.
          </p>
        )}
        <p style={{ margin: "0 0 10px" }}>
          Les espérances sont calculées ici même, sur un sabot de {paquets} paquets dont vos deux cartes et la hauteur du
          croupier ont été retirées, avec jeu optimal après le tirage. Elles ont été confrontées à l'appendice 9 du
          Wizard of Odds : l'écart maximal relevé est de 0,14 point sur rester et tirer, 0,34 sur doubler. La
          séparation est estimée sans resplit, elle est donc légèrement pessimiste.
        </p>
        <p style={{ margin: "0 0 10px" }}>
          Elles sont exprimées en fraction de la mise de départ : −54 % signifie qu'une mise de 10 € en perd 5,40 € en
          moyenne sur cette situation.
        </p>
        <p style={{ margin: "0 0 10px" }}>
          Sur quelques cases très serrées, l'option la mieux payée diffère de celle du tableau : c'est signalé sous les
          chiffres. Le tableau suit la convention par total, alors que le calcul tient compte de la composition exacte
          — un 16 fait de 10 + 6 ne se joue pas tout à fait comme un 16 fait de trois cartes. L'écart se compte en
          fractions de pourcent et ne vaut pas la peine d'être mémorisé.
        </p>
        <p style={{ margin: "0 0 10px" }}>
          Ce tableau suppose le doublement autorisé sur deux cartes quelconques et le doublement après séparation.
          Entre 6 et 8 paquets, une seule case change : le A,2 contre 5 se double en 6 paquets et se tire en 8, quand
          le croupier reste sur 17 souple — la différence est de 0,09 point. Ce tableau vaut pour 4 à 8 paquets, les seules
          tailles proposées : le simple et le double paquet ont disparu d'Europe et du jeu en ligne.
        </p>
        <p style={{ margin: 0 }}>
          Ce tableau ne dépend d'aucun système de comptage : il vaut pour tout le monde, compteur ou non. Le comptage
          vient par-dessus, sous deux formes — la variation de mise, et les indices de déviation qui indiquent quand
          s'écarter d'une case selon le vrai compte. L'assurance, notamment, n'est jamais prise en stratégie de base :
          seul un compte favorable peut la justifier.
        </p>
      </div>
    </div>
  );
}


/* ============================================================
   VUE — STRATÉGIES DE MISE
   ============================================================ */

/* Modèle d'une main en stratégie de base : résultat net en unités.
   Masse calibrée sur une espérance de −0,6 % et un écart-type de 1,16. */
function Calculateur({ mobile, reglages }) {
  // Les mises de votre table servent de point de départ ; tout reste modifiable ici.
  const miseTable = Math.max(1, reglages?.miseMin ?? 5);
  const plafondTable = Math.max(miseTable, reglages?.miseMax ?? 500);
  const [unite, setUnite] = useState(miseTable);
  const capitalTable = Math.max(1, reglages?.capital ?? miseTable * 50);
  const [bankroll, setBankroll] = useState(capitalTable);
  const [mains, setMains] = useState(100);
  const [plafond, setPlafond] = useState(plafondTable);
  const [modifie, setModifie] = useState(false);

  // Un changement de réglage remet les valeurs de la table, sauf si vous les avez ajustées.
  useEffect(() => {
    if (modifie) return;
    setUnite(miseTable);
    setBankroll(capitalTable);
    setPlafond(plafondTable);
  }, [miseTable, plafondTable, capitalTable, modifie]);
  const [cle, setCle] = useState("douce");

  const unites = Math.max(1, Math.floor(bankroll / Math.max(unite, 1)));
  const plafondU = Math.max(1, Math.floor(plafond / Math.max(unite, 1)));
  const r = useMemo(
    () => simulerSeances(cle, unites, Math.max(1, mains), plafondU),
    [cle, unites, mains, plafondU]
  );
  const reco = useMemo(() => unitesRequises(cle, Math.max(1, mains), plafondU), [cle, mains, plafondU]);
  const comparaison = useMemo(
    () =>
      Object.keys(MISEURS)
        .map((k) => ({
          cle: k,
          ruine: simulerSeances(k, unites, Math.max(1, mains), plafondU, 1200).ruine,
          mains: mainsTenables(k, unites, plafondU),
        }))
        .sort((a, b) => a.ruine - b.ruine),
    [unites, mains, plafondU]
  );

  const champ = (label, valeur, set, suffixe) => (
    <label style={{ display: "block" }}>
      <div style={S.titreChoix}>{label}</div>
      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
        <ChampNombre
          valeur={valeur}
          min={1}
          onChange={(v) => { setModifie(true); set(v); }}
          style={{
            width: "100%",
            padding: "10px 11px",
            fontSize: 15,
            fontFamily: "inherit",
            color: "var(--encre)",
            background: "var(--panneau)",
            border: "1px solid var(--regle)",
            borderRadius: 3,
          }}
        />
        <span className="mono" style={{ fontSize: 13, color: "var(--encre2)" }}>{suffixe}</span>
      </div>
    </label>
  );

  const alerte = r.ruine >= 25 ? "var(--ecran-rouge)" : r.ruine >= 8 ? "var(--ecran-or)" : "var(--ecran-ok)";

  return (
    <div style={{ ...S.panneau, padding: mobile ? "16px 15px" : "22px", borderLeft: "3px solid var(--or)" }}>
      <div style={{ fontWeight: 700, fontSize: mobile ? 17 : 19 }}>
        Calculer votre risque
      </div>
      <p style={{ fontSize: 14.5, lineHeight: 1.6, margin: "6px 0 16px", color: "var(--encre2)" }}>
        Ce qui décide de votre risque n'est pas la somme que vous emportez, mais le nombre d'unités qu'elle représente.
        Chaque calcul simule 8 000 sessions.
      </p>

      <div style={{ display: "grid", gridTemplateColumns: mobile ? "1fr 1fr" : "repeat(4,1fr)", gap: 10 }}>
        {champ("Unité de mise", unite, setUnite, "€")}
        {champ("Capital de jeu", bankroll, setBankroll, "€")}
        {champ("Mains dans la session", mains, setMains, "")}
        {champ("Mise maximale de la table", plafond, setPlafond, "€")}
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap", marginTop: 9 }}>
        <span style={{ fontSize: 12.5, lineHeight: 1.5, color: "var(--encre2)" }}>
          {modifie
            ? `Valeurs ajustées ici. Votre table est relevée à ${miseTable} € minimum et ${plafondTable} € maximum.`
            : `Reprend vos réglages : ${miseTable} € de mise, ${capitalTable} € de capital, ${plafondTable} € de plafond.`}
        </span>
        {modifie && (
          <button
            onClick={() => { setModifie(false); setUnite(miseTable); setBankroll(capitalTable); setPlafond(plafondTable); }}
            style={{ fontSize: 12.5, fontWeight: 600, color: "var(--encre2)", textDecoration: "underline", textUnderlineOffset: 2 }}
          >
            Revenir à ma table
          </button>
        )}
      </div>

      <div style={{ marginTop: 14 }}>
        <div style={S.titreChoix}>Façon de miser</div>
        <select
          value={cle}
          onChange={(e) => setCle(e.target.value)}
          style={{
            width: "100%",
            padding: "10px 11px",
            fontSize: 15,
            fontFamily: "inherit",
            color: "var(--encre)",
            background: "var(--panneau)",
            border: "1px solid var(--regle)",
            borderRadius: 3,
          }}
        >
          {Object.entries(MISEURS).map(([k, v]) => (
            <option key={k} value={k}>{v.nom} — {v.sens.toLowerCase()}</option>
          ))}
        </select>
      </div>

      <div
        style={{
          marginTop: 16,
          background: "var(--ecran)",
              border: "1px solid var(--ecran-bord)",
          color: "var(--ecran-texte)",
          borderRadius: 3,
          padding: mobile ? "14px 15px" : "18px 20px",
        }}
      >
        <div className="mono" style={{ fontSize: 10, letterSpacing: ".12em", color: "var(--ecran-sourd)" }}>
          CAPITAL PERDU AVANT LA FIN DE LA SESSION
        </div>
        <div className="mono" style={{ fontSize: mobile ? 40 : 52, fontWeight: 700, lineHeight: 1.1, color: alerte }}>
          {r.ruine.toFixed(1).replace(".", ",")} %
        </div>
        <div style={{ display: "flex", gap: mobile ? 16 : 28, flexWrap: "wrap", marginTop: 12 }}>
          {[
            ["CAPITAL", `${unites} unités`],
            ["SESSIONS GAGNANTES", `${r.gagnantes.toFixed(1).replace(".", ",")} %`],
            ["RÉSULTAT MOYEN", `${(r.moyen * unite).toFixed(2).replace(".", ",")} €`],
            ["PIRE 5 %", `${(r.pire * unite).toFixed(0)} €`],
            ["PLUS GROSSE MISE", `${(r.maxMise * unite).toFixed(0)} €`],
          ].map(([k, v]) => (
            <div key={k}>
              <div style={{ ...S.eyebrow, fontSize: 10, color: "var(--ecran-sourd)" }}>{k}</div>
              <div className="mono" style={{ fontSize: 16, fontWeight: 700, marginTop: 2 }}>{v}</div>
            </div>
          ))}
        </div>
      </div>

      <div
        style={{
          marginTop: 14,
          padding: mobile ? "14px 15px" : "16px 18px",
          borderRadius: 3,
          border: "1px solid var(--regle)",
          background: "color-mix(in srgb, var(--bleu) 7%, transparent)",
        }}
      >
        <div style={{ ...S.eyebrow, marginBottom: 9 }}>Le bon rapport pour cette façon de miser</div>
        {reco.confort === null ? (
          <p style={{ fontSize: 14.5, lineHeight: 1.6, margin: 0 }}>
            Aucun capital raisonnable ne ramène la ruine sous 5 % avec cette progression sur {mains} mains. C'est le
            propre des systèmes qui montent après une perte : le risque ne se règle pas, il se subit.
          </p>
        ) : (
          <div style={{ display: "grid", gap: 9, fontSize: 14.5, lineHeight: 1.55 }}>
            <div>
              <b>{reco.confort} unités</b> de capital suffisent à tenir la ruine sous 5 %
              {reco.sur !== null && <> — il en faut <b>{reco.sur}</b> pour descendre sous 1 %</>}.
            </div>
            <div style={{ color: "var(--encre2)" }}>
              Avec vos {bankroll} €, cela donne une unité d'environ{" "}
              <b style={{ color: "var(--encre)" }}>{arrondirUnite(bankroll / reco.confort)} €</b>.
              {bankroll / reco.confort < unite && (
                <> Votre unité actuelle de {unite} € est trop élevée pour ce capital.</>
              )}
            </div>
            <div style={{ color: "var(--encre2)" }}>
              À l'inverse, pour jouer à {unite} € l'unité, il vous faudrait environ{" "}
              <b style={{ color: "var(--encre)" }}>{Math.round((reco.confort * unite) / 5) * 5} €</b> de capital.
            </div>
          </div>
        )}
      </div>

      <div
        style={{
          marginTop: 14,
          padding: mobile ? "14px 15px" : "16px 18px",
          borderRadius: 3,
          border: "1px solid var(--regle)",
          background: "color-mix(in srgb, var(--ok) 7%, transparent)",
        }}
      >
        <div style={{ ...S.eyebrow, marginBottom: 4 }}>Ce qui convient à vos {unites} unités</div>
        <p style={{ fontSize: 13, lineHeight: 1.5, color: "var(--encre2)", margin: "0 0 11px" }}>
          Chaque façon de miser recalculée avec votre unité, votre capital et votre plafond de table.
        </p>

        <div style={{ display: "grid", gap: 3 }}>
          {comparaison.map((c, i) => {
            const actuelle = c.cle === cle;
            return (
              <div
                key={c.cle}
                style={{
                  display: "flex",
                  alignItems: "baseline",
                  gap: 8,
                  padding: "7px 9px",
                  borderRadius: 2,
                  background: actuelle ? "var(--survol)" : "transparent",
                  border: `1px solid ${actuelle ? "var(--encre)" : "transparent"}`,
                }}
              >
                <span className="mono" style={{ fontSize: 11, color: "var(--encre2)", width: 16, flexShrink: 0 }}>
                  {i + 1}
                </span>
                <span style={{ flex: 1, fontSize: 13.5, fontWeight: actuelle ? 700 : 400, minWidth: 0 }}>
                  {MISEURS[c.cle].nom}
                </span>
                <span
                  className="mono"
                  style={{
                    fontSize: 13,
                    fontWeight: 700,
                    flexShrink: 0,
                    color: c.ruine >= 25 ? "var(--rouge)" : c.ruine >= 8 ? "var(--or)" : "var(--ok)",
                  }}
                >
                  {c.ruine.toFixed(1).replace(".", ",")} %
                </span>
                <span className="mono" style={{ fontSize: 12, color: "var(--encre2)", flexShrink: 0, width: 64, textAlign: "right" }}>
                  {c.mains ? `${c.mains} mains` : "—"}
                </span>
              </div>
            );
          })}
        </div>

        <p style={{ fontSize: 12.5, lineHeight: 1.5, color: "var(--encre2)", margin: "9px 0 0" }}>
          Colonne de gauche : part des sessions où le capital est perdu. Colonne de droite : la plus longue session qui
          garde ce risque sous 5 %, parmi 100, 200, 400 et 800 mains. Un tiret signifie qu'aucune n'y parvient.
        </p>

        <p style={{ fontSize: 13.5, lineHeight: 1.6, margin: "11px 0 0" }}>
          <b>Pour votre capital :</b>{" "}
          {comparaison[0].mains >= 400
            ? `${MISEURS[comparaison[0].cle].nom.toLowerCase()}, sur des sessions d'au plus ${comparaison[0].mains} mains.`
            : `aucune façon de miser ne tient une session ordinaire avec ${unites} unités. Baissez l'unité à environ ${arrondirUnite(bankroll / 40)} € ou montez le capital.`}
          {" "}L'espérance ne change pas d'une ligne à l'autre : seul le risque bouge.
        </p>
      </div>

      <p style={{ fontSize: 14, lineHeight: 1.6, margin: "12px 0 0", color: "var(--encre2)" }}>
        {unites < 20
          ? `Avec ${unites} unités de capital, la variance seule suffit à vous éliminer avant la fin de la session, quelle que soit votre façon de jouer. Il faut au moins une quarantaine d'unités pour que le risque de tout perdre devienne marginal — soit en abaissant l'unité, soit en augmentant le capital.`
          : unites < 40
          ? `${unites} unités de capital, c'est encore mince. Le résultat moyen ne bouge pas, mais le risque de terminer à zéro reste sensible sur une série défavorable.`
          : `${unites} unités de capital tiennent la variance d'une session ordinaire. Le résultat moyen reste négatif : l'espérance ne s'améliore pas, c'est seulement le risque de ruine qui devient négligeable.`}
      </p>
    </div>
  );
}

const PROGRESSIONS = [
  {
    nom: "Mise plate",
    sens: "Ne varie pas",
    principe: "Miser la même somme à chaque main, quoi qu'il arrive.",
    rendement: "−0,61 %",
    risque: 1,
    ruine: "0,3 %",
    gagnantes: "46,5 %",
    pire: "−280 €",
    maxMise: "10 €",
    verdict:
      "Référence de comparaison. Aucune progression ne rapporte davantage, et toutes exposent bien plus de capital. Si vous ne comptez pas, c'est la façon la moins destructrice de jouer.",
  },
  {
    nom: "Paroli (1-3-2-6)",
    sens: "Monte après un gain",
    principe: "Monter après un gain plutôt qu'après une perte, puis repartir de l'unité.",
    rendement: "−0,60 %",
    risque: 2,
    ruine: "7,1 %",
    gagnantes: "43,7 %",
    pire: "−495 €",
    maxMise: "60 €",
    verdict:
      "Progression positive : elle engage l'argent déjà gagné plutôt que le capital, ce qui la rend nettement moins destructrice que les autres. Elle ne rapporte rien de plus pour autant.",
  },
  {
    nom: "Progression douce (1 – 2 – 2,5)",
    sens: "Monte après un gain",
    principe: "Monter à 2 unités après un gain, puis à 2,5, et revenir à l'unité dès une perte.",
    rendement: "−0,61 %",
    risque: 2,
    ruine: "6,7 %",
    gagnantes: "46,0 %",
    pire: "−495 €",
    maxMise: "25 €",
    verdict:
      "Progression positive de la même famille que le Paroli, avec des paliers plus resserrés. C'est la variante la plus raisonnable de cette page : elle ne met en jeu que les gains, plafonne à 2,5 unités et conserve le meilleur taux de sessions gagnantes après la mise plate. Elle ne change toujours rien à l'espérance. Encaisser après le troisième gain plutôt que rester au palier ramène la ruine de 6,7 % à 5,3 %.",
  },
  {
    nom: "Fibonacci",
    sens: "Monte après une perte",
    principe: "Suivre la suite 1, 1, 2, 3, 5, 8… en avançant d'un cran après chaque perte.",
    rendement: "−0,68 %",
    risque: 4,
    ruine: "34,4 %",
    gagnantes: "53,4 %",
    pire: "−500 €",
    maxMise: "500 €",
    verdict:
      "La plus trompeuse du lot : elle affiche le meilleur taux de sessions gagnantes de tous les systèmes testés, mise plate comprise. C'est exactement ce qui la rend dangereuse — elle échange des gains fréquents contre des pertes rares et totales.",
  },
  {
    nom: "d'Alembert",
    sens: "Monte après une perte",
    principe: "Ajouter une unité après une perte, en retirer une après un gain.",
    rendement: "−0,56 %",
    risque: 5,
    ruine: "50,8 %",
    gagnantes: "45,5 %",
    pire: "−500 €",
    maxMise: "180 €",
    verdict:
      "Présentée comme la version prudente de la Martingale. Une session sur deux se termine pourtant capital perdu, parce qu'elle monte la mise précisément quand les pertes s'accumulent.",
  },
  {
    nom: "Martingale",
    sens: "Monte après une perte",
    principe: "Doubler la mise après chaque perte, revenir à l'unité après un gain.",
    rendement: "−0,61 %",
    risque: 5,
    ruine: "53,3 %",
    gagnantes: "43,3 %",
    pire: "−500 €",
    maxMise: "500 €",
    verdict:
      "La plus connue et la plus destructrice. Elle produit une longue série de petits gains, puis une séquence perdante qui emporte tout. Le plafond de table, que tout casino impose, garantit qu'une série assez longue ne pourra pas être rattrapée.",
  },
  {
    nom: "Mise au hasard",
    sens: "Sans règle",
    principe: "Miser entre 1 et 10 unités au hasard, sans aucune règle.",
    rendement: "−0,62 %",
    risque: 5,
    ruine: "63,2 %",
    gagnantes: "32,4 %",
    pire: "−500 €",
    maxMise: "100 €",
    verdict:
      "Incluse comme témoin. Elle obtient le même rendement que les systèmes élaborés, ce qui résume la démonstration : la règle de mise n'entre pas dans le calcul de l'espérance. Elle n'affecte que le risque — et ici, elle l'aggrave.",
  },
];

function VueMises({ mobile, wrap, reglages }) {
  const [ouvertes, setOuvertes] = useState([]);
  const basculer = (c) => setOuvertes((o) => (o.includes(c) ? o.filter((x) => x !== c) : [...o, c]));
  return (
    <div style={wrap}>
      <div style={{ padding: mobile ? "22px 0 18px" : "40px 0 22px", maxWidth: 660 }}>
        <div style={S.eyebrow}>Stratégies de mise</div>
        <h1 style={{ fontSize: "clamp(26px,6.4vw,44px)", lineHeight: 1.04, margin: "10px 0 12px", fontWeight: 700 }}>
          Les façons de miser
        </h1>
        <p style={{ fontSize: mobile ? 15 : 16, lineHeight: 1.62, color: "var(--encre2)", margin: 0 }}>
          Il existe deux familles de stratégies de mise. Celle qui repose sur l'information, et celle qui repose sur
          l'historique des coups précédents. La première marche. La seconde ne peut pas marcher, et ce n'est pas une
          question de réglage.
        </p>
      </div>

      <SectionReglages
        mobile={mobile}
        titre="Miser selon l'avantage"
        resume="La seule façon de miser qui déplace l'espérance"
        ouvert={ouvertes.includes("principe")}
        basculer={() => basculer("principe")}
      >

      <div style={{ ...S.panneau, padding: mobile ? "16px 15px" : "20px 22px", borderLeft: "3px solid var(--bleu)" }}>
        <div style={{ fontWeight: 700, fontSize: mobile ? 17 : 19 }}>
          Miser selon l'avantage
        </div>
        <p style={{ fontSize: 15, lineHeight: 1.62, margin: "10px 0 12px" }}>
          Vous augmentez la mise quand vous savez que le sabot vous est favorable, et vous la réduisez sinon. C'est le
          seul principe qui déplace réellement l'espérance, parce qu'il exploite une information sur les cartes à venir
          plutôt que sur les cartes passées. C'est aussi tout l'objet du comptage : le compte ne sert pas à mieux
          jouer, il sert à savoir quand miser gros.
        </p>
        <p style={{ fontSize: 14.5, lineHeight: 1.62, margin: "10px 0 0", color: "var(--encre2)" }}>
          La théorie de Kelly précise combien miser : une fraction de votre capital proportionnelle à votre avantage.
          Mais elle suppose que cet avantage existe. Appliquée à un jeu perdant, elle indique de ne rien miser du tout —
          ce qui est la bonne réponse.
        </p>
      </div>

      </SectionReglages>

      <SectionReglages
        mobile={mobile}
        titre="Votre risque de ruine"
        resume="Simulation sur votre capital, votre unité et votre table"
        ouvert={ouvertes.includes("risque")}
        basculer={() => basculer("risque")}
      >
      <Calculateur mobile={mobile} reglages={reglages} />

      </SectionReglages>

      <SectionReglages
        mobile={mobile}
        titre="Les progressions"
        resume="Martingale, Paroli, Fibonacci — pourquoi aucune ne fonctionne"
        ouvert={ouvertes.includes("progressions")}
        basculer={() => basculer("progressions")}
      >

      <div
        style={{
          ...S.panneau,
          padding: mobile ? "15px 15px" : "18px 20px",
          marginBottom: 16,
          borderLeft: "3px solid var(--rouge)",
        }}
      >
        <div style={{ ...S.eyebrow, marginBottom: 8 }}>Le seul critère qui distingue vraiment ces systèmes</div>
        <p style={{ fontSize: 14.5, lineHeight: 1.65, margin: 0 }}>
          Une progression <b>négative</b> monte la mise après une perte : elle cherche à récupérer, et engage donc votre
          capital au pire moment. Une progression <b>positive</b> monte après un gain : elle n'engage que l'argent
          déjà remporté, et vous ramène à l'unité dès que la série s'interrompt.
        </p>
        <p style={{ fontSize: 14.5, lineHeight: 1.65, margin: "10px 0 0", color: "var(--encre2)" }}>
          Le rendement est le même dans les deux cas. Le risque, non : dans la liste ci-dessous, toutes les
          progressions qui montent après une perte perdent le capital dans plus d'un tiers des sessions, alors que
          celles qui montent après un gain restent sous 8 %. C'est le seul enseignement pratique de cette page.
        </p>
      </div>

      <p style={{ fontSize: 15, lineHeight: 1.62, color: "var(--encre2)", margin: "0 0 14px" }}>
        Toutes les progressions ci-dessous choisissent la mise d'après les résultats précédents. Le rendement vient
        d'une simulation sur des dizaines de millions de mains ; les chiffres de risque viennent de 500 000 sessions de
        200 mains, avec une unité de 10 €, un capital de 500 € et un plafond de table à 500 €. Le jeu de départ perd
        0,6 %. Ces chiffres sont donnés à titre indicatif : ils dépendent du capital, de la longueur de session et du
        plafond de table retenus. Les écarts de rendement entre systèmes ne sont que du bruit de simulation — aucun ne
        s'écarte réellement du taux du jeu lui-même.
      </p>

      <div style={{ display: "grid", gap: 10 }}>
        {PROGRESSIONS.map((p) => (
          <div key={p.nom} style={{ ...S.panneau, padding: mobile ? "15px 15px" : "18px 20px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 12 }}>
              <span style={{ display: "flex", flexWrap: "wrap", alignItems: "baseline", gap: "3px 9px" }}>
                <span
                  style={{
                    fontFamily: "'Public Sans', ui-sans-serif, sans-serif",
                    fontWeight: 700,
                    fontSize: mobile ? 16.5 : 18,
                  }}
                >
                  {p.nom}
                </span>
                <span
                  style={{
                    fontSize: 11,
                    fontWeight: 700,
                    letterSpacing: ".04em",
                    textTransform: "uppercase",
                    padding: "3px 8px",
                    borderRadius: 999,
                    whiteSpace: "nowrap",
                    color: p.sens.includes("perte") ? "var(--rouge)" : "var(--encre2)",
                    border: `1px solid ${p.sens.includes("perte") ? "var(--rouge)" : "var(--regle)"}`,
                  }}
                >
                  {p.sens}
                </span>
              </span>
              <span className="mono" style={{ fontSize: 15, fontWeight: 700, color: "var(--rouge)", flexShrink: 0 }}>
                {p.rendement}
              </span>
            </div>
            <p style={{ fontSize: 14.5, lineHeight: 1.5, margin: "5px 0 0", fontWeight: 600 }}>{p.principe}</p>

            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                flexWrap: "wrap",
                margin: "11px 0 0",
                padding: "9px 11px",
                borderRadius: 3,
                background: `color-mix(in srgb, var(--rouge) ${p.risque * 4}%, transparent)`,
                border: "1px solid var(--regle)",
              }}
            >
              <span style={{ display: "flex", alignItems: "center", gap: 7, fontSize: 12.5 }}>
                <span style={{ ...S.eyebrow, fontSize: 10 }}>Risque</span>
                <Pips n={p.risque} couleur="var(--rouge)" />
              </span>
              <span className="mono" style={{ fontSize: 12.5, color: "var(--encre2)" }}>
                capital perdu <b style={{ color: "var(--rouge)" }}>{p.ruine}</b> des sessions · sessions gagnantes{" "}
                <b>{p.gagnantes}</b> · pire 5 % <b>{p.pire}</b> · plus grosse mise <b>{p.maxMise}</b>
              </span>
            </div>

            <p style={{ fontSize: 14.5, lineHeight: 1.62, margin: "10px 0 0", color: "var(--encre2)" }}>{p.verdict}</p>
          </div>
        ))}
      </div>

      <div
        style={{
          ...S.panneau,
          padding: mobile ? "16px 15px" : "20px 22px",
          marginTop: 20,
          borderLeft: "3px solid var(--encre)",
        }}
      >
        <div style={{ ...S.eyebrow, marginBottom: 9 }}>Pourquoi c'est impossible, et pas seulement difficile</div>
        <p style={{ fontSize: 14.5, lineHeight: 1.65, margin: 0 }}>
          Chaque main a la même espérance quelle que soit la mise engagée, et la mise est choisie avant que la main ne
          soit distribuée. Le résultat total est donc la somme de chaque mise multipliée par ce même pourcentage. Une
          règle de mise change les montants, jamais le pourcentage. C'est pourquoi une mise choisie au hasard obtient
          exactement le même rendement qu'un système travaillé.
        </p>
        <p style={{ fontSize: 14.5, lineHeight: 1.65, margin: "10px 0 0", color: "var(--encre2)" }}>
          Un détail de la simulation mérite d'être mentionné. Sans plafond de table, la Martingale a d'abord affiché un
          rendement <i>positif</i> sur 40 millions de mains — non pas parce qu'elle gagne, mais parce qu'une poignée de
          mises gigantesques dominaient l'échantillon. Il a fallu plafonner les mises, comme le fait toute vraie table,
          pour que le chiffre converge vers −0,6 %. C'est exactement l'illusion que produit cette progression sur
          quelques soirées.
        </p>
      </div>
      </SectionReglages>
    </div>
  );
}
/* ============================================================
   VUE — PARAMÈTRES ET SOURCES
   ============================================================ */

const ENSEIGNES_LOGO = [
  { v: "pique", glyphe: "♠", nom: "Pique", rouge: false },
  { v: "coeur", glyphe: "♥", nom: "Cœur", rouge: true },
  { v: "carreau", glyphe: "♦", nom: "Carreau", rouge: true },
  { v: "trefle", glyphe: "♣", nom: "Trèfle", rouge: false },
];

/* Jeton du logo : huit créneaux, anneau intérieur, enseigne évidée au centre.
   La couleur découle de l'enseigne, comme sur une carte — rouge pour cœur et
   carreau, encre pour pique et trèfle. */
const TRACES_ENSEIGNE = {
  pique: "M32 20c0 0-9 7.4-9 12.7a4.9 4.9 0 0 0 8.2 3.6c-.3 2.5-1.3 4.6-2.5 5.8h6.6c-1.2-1.2-2.2-3.3-2.5-5.8a4.9 4.9 0 0 0 8.2-3.6C41 27.4 32 20 32 20z",
  trefle:
    "M32 18.5a5.4 5.4 0 0 1 4.4 8.5a5.4 5.4 0 1 1 3.3 9.7a5.2 5.2 0 0 1-4.8-3.3c.2 3.3 1.3 5.7 2.4 7h-10.6c1.1-1.3 2.2-3.7 2.4-7a5.2 5.2 0 0 1-4.8 3.3a5.4 5.4 0 1 1 3.3-9.7A5.4 5.4 0 0 1 32 18.5z",
  coeur: "M32 43.5c-1-1.5-9.8-8.2-9.8-13.9a5.7 5.7 0 0 1 9.8-3.9a5.7 5.7 0 0 1 9.8 3.9c0 5.7-8.8 12.4-9.8 13.9z",
  carreau: "M32 18l10.2 14L32 46 21.8 32z",
};

function JetonLogo({ enseigne = "pique", taille = 30, sombre = false }) {
  const e = ENSEIGNES_LOGO.find((x) => x.v === enseigne) ?? ENSEIGNES_LOGO[0];
  /* Deux couleurs, dont les rôles s'échangent selon le thème. En clair, le
     disque porte la couleur et les creux sont blancs ; en sombre, le disque
     devient blanc et les creux prennent la couleur. Le rouge garde la même
     intensité partout — le blanc du jeton lui suffit à ressortir. */
  const couleur = e.rouge ? "#A32D2D" : "#14171A";
  const blanc = "#F2F2EE";
  const disque = sombre ? blanc : couleur;
  const creux = sombre ? couleur : blanc;
  return (
    <svg width={taille} height={taille} viewBox="0 0 64 64" aria-hidden="true" style={{ display: "block", flexShrink: 0 }}>
      <circle cx="32" cy="32" r="29" fill={disque} />
      <circle cx="32" cy="32" r="25" fill="none" stroke={creux} strokeWidth="8.5" strokeDasharray="9.8 9.8" />
      <circle cx="32" cy="32" r="18.5" fill={disque} />
      <circle cx="32" cy="32" r="18.5" fill="none" stroke={creux} strokeWidth="2" />
      <circle cx="32" cy="32" r="30" fill="none" stroke={disque} strokeWidth="1.5" />
      <path d={TRACES_ENSEIGNE[e.v] ?? TRACES_ENSEIGNE.pique} fill={creux} />
    </svg>
  );
}

/* Fenêtre de confirmation, sur le modèle de celle du journal : fond assombri,
   encart centré, action destructrice en rouge et sortie sûre à côté. */
function Confirmation({ ouvert, titre, texte, actionLabel, onAction, onAnnuler, mobile }) {
  if (!ouvert) return null;
  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={titre}
      onClick={onAnnuler}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 99,
        background: "rgba(0,0,0,.62)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 16,
      }}
    >
      <div
        className="bjc-flash"
        onClick={(e) => e.stopPropagation()}
        style={{ ...S.panneau, maxWidth: 340, padding: mobile ? "20px 18px" : "24px 22px", boxShadow: "var(--ombre-forte)" }}
      >
        <h2 style={{ fontSize: mobile ? 17 : 19, margin: "0 0 8px", fontWeight: 700, letterSpacing: "-.01em" }}>{titre}</h2>
        <p style={{ fontSize: 14, lineHeight: 1.55, color: "var(--encre2)", margin: "0 0 18px" }}>{texte}</p>
        <div style={{ display: "grid", gap: 8 }}>
          <button
            onClick={onAction}
            className="bjc-tap"
            style={{ background: "var(--rouge)", color: "var(--panneau)", padding: "12px 16px", borderRadius: 3, fontSize: 14, fontWeight: 700 }}
          >
            {actionLabel}
          </button>
          <button
            onClick={onAnnuler}
            className="bjc-tap"
            style={{ border: "1px solid var(--encre)", padding: "12px 16px", borderRadius: 3, fontSize: 14, fontWeight: 600 }}
          >
            Annuler
          </button>
        </div>
      </div>
    </div>
  );
}

const PROFILS = [
  {
    id: "evolution",
    nom: "Casino en ligne",
    resume: "8 paquets, coupe à 50 %, S17, carte cachée, abandon proposé",
    valeurs: { nbPaquets: 8, coupe: 4, h17: false, abandon: true, regle: "cachee", paiement: "3:2", melangeur: "coupe" },
  },
  {
    id: "physique6",
    nom: "Casino physique (6 paquets)",
    resume: "6 paquets, coupe à relever, S17, carte cachée, pas d'abandon",
    valeurs: { nbPaquets: 6, coupe: null, h17: false, abandon: false, regle: "cachee", paiement: "3:2", melangeur: "coupe" },
  },
  {
    id: "physique8",
    nom: "Casino physique (8 paquets)",
    resume: "8 paquets, coupe à relever, S17, carte cachée, pas d'abandon",
    valeurs: { nbPaquets: 8, coupe: null, h17: false, abandon: false, regle: "cachee", paiement: "3:2", melangeur: "coupe" },
  },
  {
    id: "europe6",
    nom: "Europe sans carte cachée (6 paquets)",
    resume: "6 paquets, coupe à relever, seconde carte après les joueurs, mises supplémentaires perdues",
    valeurs: { nbPaquets: 6, coupe: null, h17: false, abandon: false, regle: "enhc", paiement: "3:2", melangeur: "coupe" },
  },
  {
    id: "europe8",
    nom: "Europe sans carte cachée (8 paquets)",
    resume: "8 paquets, coupe à relever, seconde carte après les joueurs, mises supplémentaires perdues",
    valeurs: { nbPaquets: 8, coupe: null, h17: false, abandon: false, regle: "enhc", paiement: "3:2", melangeur: "coupe" },
  },
  {
    id: "vegas",
    nom: "Vegas — 17 souple tiré, abandon",
    resume: "6 paquets, coupe à 75 %, H17, carte cachée, abandon tardif proposé",
    valeurs: { nbPaquets: 6, coupe: 1.5, h17: true, abandon: true, regle: "cachee", paiement: "3:2", melangeur: "coupe" },
  },
];

const memesReglages = (a, b) =>
  ["nbPaquets", "coupe", "h17", "abandon", "regle", "paiement", "melangeur"].every((k) => a[k] === b[k]);

const PROVENANCE = [
  {
    categorie: "Calculé par l'application",
    teinte: "var(--ok)",
    lignes: [
      "Espérance de chaque décision et probabilités de crève du croupier",
      "Rendement et risque des stratégies de mise, calculateur de risque",
      "Effet de la pénétration, exceptions du jeu sans carte cachée",
    ],
    note: "Moteur confronté à l'appendice 9 du Wizard of Odds : écart maximal de 0,14 point.",
  },
  {
    categorie: "Repris de sources publiées",
    teinte: "var(--bleu)",
    lignes: [
      "Valeurs de cartes et corrélations des neuf systèmes — Encyclopedia of Blackjack de Michael Dalton, comparatif d'Arnold Snyder",
      "Illustrious 18 et Fab 4 — Don Schlesinger, Blackjack Attack",
      "Espérances de référence et effet de la carte de coupe — Wizard of Odds",
      "Règles sans carte cachée et conditions des tables en ligne — sources spécialisées",
    ],
    note: "Les liens figurent dans la section Lectures.",
  },
  {
    categorie: "Non vérifié",
    teinte: "var(--rouge)",
    lignes: [
      "Mélangeurs continus et règles des casinos belges — une liste de forum ancienne et invérifiable",
      "Conseils d'apprentissage et appréciations sur les systèmes — des jugements, pas des mesures",
    ],
    note: "À vérifier sur place avant de vous y fier.",
  },
];

/* Défini hors du composant : une définition interne recrée le sous-arbre
   à chaque rendu et fait remonter la page en haut. */
const A_RELEVER = [
  ["Paiement du blackjack", "Écrit sur le tapis. 3:2 se lit « Blackjack pays 3 to 2 ». Une table 6:5 coûte 1,4 % : ne vous y asseyez pas."],
  ["Mélange des cartes", "Le croupier remet-il les cartes jouées dans une machine après chaque main ? C'est un mélangeur continu, et le comptage n'y sert à rien."],
  ["Carte de coupe", "Repérez la carte colorée dans le sabot et estimez les paquets restants derrière elle. C'est le point le plus important pour un compteur."],
  ["Nombre de paquets", "Se demande au croupier, ou s'estime à l'épaisseur du sabot."],
  ["Croupier sur 17 souple", "Attendez qu'il obtienne un As avec un 6. S'il tire, c'est H17."],
  ["Abandon tardif", "Un bouton d'abandon, ou une option que le croupier annonce. Rare en Europe."],
  ["Doubler après séparation", "Séparez une paire et regardez si le doublement reste proposé sur les mains obtenues."],
  ["Mises minimale et maximale", "Sur le panneau de la table. Leur rapport limite votre écart de mise."],
];

function AideReleve({ mobile, ouvert, basculer }) {
  return (
    <div style={{ ...S.panneau, overflow: "hidden", marginBottom: 8 }}>
      <button
        onClick={basculer}
        aria-expanded={ouvert}
        style={{
          width: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 12,
          textAlign: "left",
          padding: mobile ? "12px 14px" : "13px 18px",
        }}
      >
        <span style={S.eyebrow}>Que relever à la table</span>
        <span className="mono" aria-hidden="true" style={{ fontSize: 15, color: "var(--encre2)" }}>
          {ouvert ? "−" : "+"}
        </span>
      </button>
      {ouvert && (
        <div className="bjc-pop" style={{ padding: mobile ? "0 14px 14px" : "0 18px 16px", display: "grid", gap: 9 }}>
          {A_RELEVER.map(([titre, comment], i) => (
            <div key={titre} style={{ display: "flex", gap: 10 }}>
              <span className="mono" style={{ fontSize: 11, color: "var(--or)", flexShrink: 0, paddingTop: 2 }}>
                {String(i + 1).padStart(2, "0")}
              </span>
              <span style={{ fontSize: 13.5, lineHeight: 1.5 }}>
                <b>{titre}</b>
                <span style={{ color: "var(--encre2)" }}> — {comment}</span>
              </span>
            </div>
          ))}
          <p style={{ fontSize: 12.5, lineHeight: 1.5, color: "var(--encre2)", margin: "2px 0 0" }}>
            Les trois premiers décident à eux seuls si la table vaut d'être jouée. Les autres affinent le tableau de
            stratégie.
          </p>
        </div>
      )}
    </div>
  );
}

/* Titre d'un cadre non repliable : même poids que les sections, en capitales.
   Évite que « Sauvegarde » ou « Code de protection » se lisent comme de
   simples étiquettes perdues dans la page. */
function TitreCadre({ mobile, children }) {
  return (
    <div
      style={{
        /* Pas de filet : le cadre en a déjà un. La distinction avec les
           sections se fait sur le fond, plus sombre pour ce qui s'ouvre. */
        fontFamily: "'Public Sans', ui-sans-serif, sans-serif",
        fontWeight: 700,
        fontSize: mobile ? 12 : 13,
        letterSpacing: ".1em",
        textTransform: "uppercase",
        color: "var(--encre2)",
        marginBottom: 9,
      }}
    >
      {children}
    </div>
  );
}

function SectionReglages({ mobile, titre, resume, ouvert, basculer, children }) {
  const cadre = useRef(null);
  return (
    <div ref={cadre} data-section="1" style={{ marginBottom: ouvert ? 18 : 8 }}>
      <button
        onClick={() => {
          /* Comme dans le journal : une section qui s'ouvre vient sous les yeux. */
          const ouvrait = !ouvert;
          basculer();
          if (ouvrait) amener(cadre.current);
        }}
        aria-expanded={ouvert}
        style={{
          width: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 12,
          textAlign: "left",
          padding: mobile ? "13px 14px" : "15px 18px",
          /* Fond légèrement creusé, sans aller jusqu'au cadre qui est bien
             plus sombre : la section doit se distinguer, pas s'imposer. */
          background: ouvert ? "var(--survol)" : "var(--panneau)",
          color: "var(--encre)",
          border: "1px solid " + (ouvert ? "var(--encre)" : "var(--encre2)"),
          borderLeft: "1px solid " + (ouvert ? "var(--encre)" : "var(--encre2)"),
          borderBottom: ouvert ? "none" : "1px solid var(--regle)",
          borderRadius: ouvert ? "3px 3px 0 0" : 3,
        }}
      >
        <span style={{ flex: 1, minWidth: 0 }}>
          <span
            style={{
              display: "block",
              fontFamily: "'Public Sans', ui-sans-serif, sans-serif",
              fontWeight: 700,
              fontSize: mobile ? 15.5 : 17,
              letterSpacing: "-.01em",
            }}
          >
            {titre}
          </span>
          {resume && (
            <span
              style={{
                display: "block",
                fontSize: 12.5,
                marginTop: 2,
                color: "var(--encre2)",
              }}
            >
              {resume}
            </span>
          )}
        </span>
        <span
          className="mono"
          aria-hidden="true"
          style={{ fontSize: 16, flexShrink: 0, color: "var(--encre2)" }}
        >
          {ouvert ? "−" : "+"}
        </span>
      </button>
      {ouvert && (
        <div
          className="bjc-pop"
          style={{
            display: "grid",
            gap: 8,
            marginTop: 0,
            padding: mobile ? "10px 10px 12px" : "12px 14px 14px",
            borderLeft: "1px solid var(--encre)",
            borderRight: "1px solid var(--encre)",
            borderBottom: "1px solid var(--encre)",
            borderRadius: "0 0 3px 3px",
            background: "var(--cadre)",
          }}
        >
          {children}
        </div>
      )}
    </div>
  );
}

/* Champ numérique qui accepte d'être vide le temps de la saisie. La valeur
   n'est ramenée dans les bornes qu'à la sortie du champ. */
function ChampNombre({ valeur, onChange, min = 0, style }) {
  const [texte, setTexte] = useState(String(valeur));
  const [saisie, setSaisie] = useState(false);
  useEffect(() => { if (!saisie) setTexte(String(valeur)); }, [valeur, saisie]);
  return (
    <input
      type="number"
      inputMode="numeric"
      min={min}
      value={texte}
      onFocus={() => setSaisie(true)}
      onChange={(e) => {
        setTexte(e.target.value);
        const n = Number(e.target.value);
        if (e.target.value !== "" && isFinite(n) && n >= min) onChange(n);
      }}
      onBlur={() => {
        setSaisie(false);
        const n = Number(texte);
        const v = texte === "" || !isFinite(n) || n < min ? min : n;
        setTexte(String(v));
        onChange(v);
      }}
      style={style}
    />
  );
}

function LigneReglage({ mobile, titre, aide, children }) {
  return (
    <div style={{ ...S.panneau, padding: mobile ? "14px 15px" : "16px 18px" }}>
      <div style={{ ...S.eyebrow, marginBottom: aide ? 4 : 9 }}>{titre}</div>
      {aide && <div style={{ fontSize: 13, lineHeight: 1.5, color: "var(--encre2)", marginBottom: 9 }}>{aide}</div>}
      {children}
    </div>
  );
}

/* Éditeur des règles d'une table. Il ne connaît que des valeurs et une
   fonction de modification : la section des paramètres lui passe les réglages
   courants, la fenêtre d'ajout lui passe un brouillon. */
/* Description lisible d'un jeu de règles, pour la fenêtre de détails. */
function detailsRegles(v) {
  return [
    ["Paquets", `${v.nbPaquets} paquets`],
    [
      "Mélange",
      v.melangeur === "continu" ? "Mélangeur continu — comptage impossible" : v.melangeur === "?" ? "Inconnu — à relever sur place" : "Sabot classique",
    ],
    ...(v.melangeur === "continu"
      ? []
      : [
          [
            "Carte de coupe",
            v.coupe == null
              ? "À relever sur place"
              : `${v.coupe.toFixed(1).replace(".", ",")} paquets — ${Math.round(((v.nbPaquets - v.coupe) / v.nbPaquets) * 100)} % de pénétration`,
          ],
        ]),
    ["Croupier sur 17 souple", v.h17 ? "Tire (H17)" : "Reste (S17)"],
    ["Abandon", v.abandon ? "Proposé" : "Non proposé"],
    ["Carte cachée", v.regle === "enhc" ? "Non — seconde carte après les joueurs" : "Oui"],
    ["Blackjack payé", v.paiement === "6:5" ? "6:5 — table à fuir" : "3:2"],
  ];
}

function EditeurRegles({ mobile, reglages, majReglage, styleSelect, aideSection, setAideSection }) {
  return (
    <>
      <AideReleve mobile={mobile} ouvert={aideSection} basculer={() => setAideSection((o) => !o)} />
      <LigneReglage mobile={mobile} titre="Paquets à votre table">
        <select
          value={reglages.nbPaquets}
          onChange={(e) => majReglage("nbPaquets", Number(e.target.value))}
          style={styleSelect}
        >
          {[4, 6, 8].map((d) => (
            <option key={d} value={d}>{d} paquet{d > 1 ? "s" : ""}</option>
          ))}
        </select>
      </LigneReglage>
      <LigneReglage mobile={mobile} titre="Croupier sur 17 souple">
        <Segments
          plein
          options={[{ v: false, l: "Reste (S17)" }, { v: true, l: "Tire (H17)" }]}
          valeur={reglages.h17}
          onChange={(v) => majReglage("h17", v)}
        />
      </LigneReglage>
      <LigneReglage mobile={mobile} titre="Abandon tardif">
        <Segments
          plein
          options={[{ v: true, l: "Proposé" }, { v: false, l: "Non proposé" }]}
          valeur={reglages.abandon}
          onChange={(v) => majReglage("abandon", v)}
        />
      </LigneReglage>
      <LigneReglage mobile={mobile} titre="Blackjack du croupier" aide="Ce qu'il advient de vos mises de doublement et de séparation.">
        <select value={reglages.regle} onChange={(e) => majReglage("regle", e.target.value)} style={styleSelect}>
          <option value="cachee">Carte cachée, vérifiée avant votre tour</option>
          <option value="obo">Sans carte cachée, mises supplémentaires rendues</option>
          <option value="enhc">Sans carte cachée, tout est perdu</option>
        </select>
      </LigneReglage>
      <LigneReglage mobile={mobile} titre="Paiement du blackjack" aide="Le point le plus important : le 6:5 coûte environ 1,4 % à lui seul.">
        <select value={reglages.paiement ?? "?"} onChange={(e) => majReglage("paiement", e.target.value)} style={styleSelect}>
          <option value="3:2">3:2 — un blackjack paie 15 € pour 10 misés</option>
          <option value="6:5">6:5 — un blackjack paie 12 € pour 10 misés</option>
          <option value="?">À relever</option>
        </select>
        {reglages.paiement === "6:5" && (
          <p style={{ fontSize: 13, lineHeight: 1.55, color: "var(--rouge)", margin: "9px 0 0" }}>
            Table 6:5 : injouable. Cette règle coûte plus qu'un comptage parfait ne rapporte.
          </p>
        )}
      </LigneReglage>
      <LigneReglage mobile={mobile} titre="Mélange des cartes" aide="Un mélangeur continu réinjecte les cartes à chaque main : le sabot ne s'épuise jamais, il n'y a rien à compter.">
        <select value={reglages.melangeur ?? "?"} onChange={(e) => majReglage("melangeur", e.target.value)} style={styleSelect}>
          <option value="coupe">Sabot classique — comptage possible</option>
          <option value="continu">Mélangeur continu — comptage impossible</option>
          <option value="?">Inconnu — à relever sur place</option>
        </select>
        {reglages.melangeur === "continu" && (
          <p style={{ fontSize: 13, lineHeight: 1.55, color: "var(--rouge)", margin: "9px 0 0" }}>
            Sabot jamais épuisé : rien à compter. Seule la stratégie de base sert.
          </p>
        )}
      </LigneReglage>
      {/* La carte de coupe n'existe que sur un sabot classique : elle marque
          l'endroit où le croupier arrête de distribuer. Sur mélangeur continu,
          la question n'a pas de sens. */}
      {reglages.melangeur !== "continu" && (
      <LigneReglage
        mobile={mobile}
        titre="Carte de coupe"
        aide="Paquets restant dans le sabot au moment du mélange. Plus la valeur est basse, meilleure est la pénétration."
      >
        <select
          value={reglages.coupe == null ? "" : Math.min(reglages.coupe, reglages.nbPaquets - 0.5)}
          onChange={(e) => majReglage("coupe", e.target.value === "" ? null : Number(e.target.value))}
          style={styleSelect}
        >
          <option value="">Inconnue — à relever sur place</option>
          {Array.from({ length: reglages.nbPaquets * 2 }, (_, i) => (i + 1) / 2)
            .filter((v) => v < reglages.nbPaquets)
            .map((v) => (
              <option key={v} value={v}>
                {v.toFixed(1).replace(".", ",")} paquet{v > 1 ? "s" : ""} —{" "}
                {Math.round(((reglages.nbPaquets - v) / reglages.nbPaquets) * 100)} % de pénétration
              </option>
            ))}
        </select>
      </LigneReglage>
      )}
    </>
  );
}

function VueParametres({ mobile, wrap, theme, setTheme, systemeId, setSysteme, defauts, majDefaut, appliquerProfil, mesTables, enregistrerBrouillon, supprimerTable, stockageActif, reinitialiser, toutesLesDonnees, appliquerSauvegarde, effacerToutTotal, nbSessions, codeDefini, definirCode, retirerCode }) {
  const reglages = defauts;
  const majReglage = majDefaut;
  const [aideSection, setAideSection] = useState(false);
  const tableActive = [...(mesTables ?? []), ...PROFILS].find((t) => memesReglages(t.valeurs, defauts));
  const [msgSauvegarde, setMsgSauvegarde] = useState("");
  const [instantane, setInstantane] = useState(() => lireInstantane());
  const [confirmeTable, setConfirmeTable] = useState(false);
  const [gestionTables, setGestionTables] = useState(false);
  const [tableASupprimer, setTableASupprimer] = useState(null);
  const [detailsTable, setDetailsTable] = useState(null);

  /* Brouillon de la fenêtre d'ajout ou de modification : indépendant des
     réglages courants, qui ne bougent qu'une fois la table enregistrée et
     choisie. { id, nom, valeurs } — id vaut null pour une création. */
  const [brouillon, setBrouillon] = useState(null);
  /* Sans nom saisi : le numéro suit le plus grand déjà attribué, sans combler
     les trous. Renommer « Table 3 » libère donc son numéro pour la suite. */
  const nomLibre = () => {
    const numeros = (mesTables ?? [])
      .map((t) => /^Table (\d+)$/.exec(t.nom))
      .filter(Boolean)
      .map((m) => Number(m[1]));
    return `Table ${numeros.length ? Math.max(...numeros) + 1 : 1}`;
  };
  const majBrouillon = (cle, valeur) =>
    setBrouillon((b) => (b ? { ...b, valeurs: { ...b.valeurs, [cle]: valeur } } : b));
  const fichierSauvegarde = useRef(null);

  const restaurerTout = (evt) => {
    const f = evt.target.files && evt.target.files[0];
    if (!f) return;
    const lecteur = new FileReader();
    lecteur.onload = () => {
      const r = analyserSauvegarde(String(lecteur.result));
      if (r.erreur) { setMsgSauvegarde("erreur:" + r.erreur); return; }
      appliquerSauvegarde(r.donnees);
      setMsgSauvegarde(`Sauvegarde restaurée (version ${r.version}) : ${r.resume}.`);
    };
    lecteur.readAsText(f, "utf-8");
    evt.target.value = "";
  };

  const [sectionsOuvertes, setSectionsOuvertes] = useState([]);
  /* Une seule section ouverte à la fois, comme les panneaux du journal. */
  const basculerSection = (c) => {
    setGestionTables(false);
    setSectionsOuvertes((o) => (o.includes(c) ? [] : [c]));
  };

  /* Sections et gestion se referment dès qu'on agit ailleurs. Une fenêtre
     ouverte suspend la règle : elle se superpose, et son fond assombri sert
     déjà de sortie. Placé ici, après sectionsOuvertes : un effet qui lit un
     état déclaré plus bas planterait au montage. */
  useEffect(() => {
    if (!gestionTables && sectionsOuvertes.length === 0) return;
    const dehors = (e) => {
      if (e.target.closest?.("[role='dialog'], [data-superpose]")) return;
      if (e.target.closest?.("[data-section]")) return;
      if (e.target.closest?.("[data-gestion]")) return;
      if (!e.target.closest?.("button, a, input, select, textarea, label")) return;
      replierSansSaut(() => {
        setGestionTables(false);
        setSectionsOuvertes([]);
      });
    };
    document.addEventListener("click", dehors, true);
    return () => document.removeEventListener("click", dehors, true);
  }, [gestionTables, sectionsOuvertes]);

  const nomEnseigne = (ENSEIGNES_LOGO.find((e) => e.v === (reglages.enseigne ?? "pique")) ?? ENSEIGNES_LOGO[0]).nom;
  const resumeTable = `${reglages.nbPaquets} paquets · ${reglages.coupe == null ? "coupe à relever" : Math.round(((reglages.nbPaquets - reglages.coupe) / reglages.nbPaquets) * 100) + " % de pénétration"} · ${reglages.h17 ? "H17" : "S17"} · blackjack ${reglages.paiement === "?" ? "à relever" : reglages.paiement}`;
  const resumeCompteur = `${SYSTEMS[systemeId].nom} · cartes neutres ${reglages.neutres ? "affichées" : "masquées"}`;
  const resumeApparence = `${{ null: "thème du système", clair: "thème clair", sombre: "thème sombre", tapis: "tapis vert", velours: "velours rouge" }[theme] ?? "thème du système"} · ${nomEnseigne.toLowerCase()} · sons ${reglages.sons === false ? "coupés" : "activés"}`;
  const resumeJeu = `${reglages.capital ?? 250} € de capital · ${reglages.plafondPerte ? `plafond de ${reglages.plafondPerte} € par ${reglages.periodePlafond ?? "semaine"}` : "aucun plafond de perte"}`;

  const [ouverts, setOuverts] = useState([]);
  const basculer = (c) => setOuverts((o) => (o.includes(c) ? o.filter((x) => x !== c) : [...o, c]));

  const styleSelect = {
    width: "100%",
    padding: "10px 11px",
    fontSize: 15,
    fontFamily: "inherit",
    color: "var(--encre)",
    background: "var(--panneau)",
    border: "1px solid var(--regle)",
    borderRadius: 3,
  };

  return (
    <div style={wrap}>
      <div style={{ padding: mobile ? "22px 0 18px" : "40px 0 22px", maxWidth: 640 }}>
        <div style={S.eyebrow}>Paramètres</div>
        <h1 style={{ fontSize: "clamp(26px,6.4vw,44px)", lineHeight: 1.04, margin: "10px 0 12px", fontWeight: 700 }}>
          Vos réglages
        </h1>
        <p style={{ fontSize: mobile ? 15 : 16, lineHeight: 1.62, color: "var(--encre2)", margin: 0 }}>
          Choisissez la table où vous jouez : ses règles s'appliquent partout.
        </p>
      </div>

      <div style={{ ...S.panneau, padding: mobile ? "14px 15px" : "16px 18px", marginBottom: 12 }}>
        {/* « Détails » vit avec le choix de la table : il montre ce que la
            table sélectionnée contient, avant même d'ouvrir la gestion. */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 10, marginBottom: 9 }}>
          {/* Même poids que les titres de section, en capitales : le cadre du
              choix n'est pas repliable, mais il pèse autant dans la page. */}
          <TitreCadre mobile={mobile}>Choix de la table</TitreCadre>
          <button
            onClick={() => setDetailsTable(tableActive ?? { nom: "Vos réglages", valeurs: reglages })}
            style={{
              fontSize: 12.5,
              fontWeight: 600,
              color: "var(--encre2)",
              textDecoration: "underline",
              textUnderlineOffset: 2,
              flexShrink: 0,
            }}
          >
            Détails
          </button>
        </div>
        <select
          value={tableActive?.id ?? ""}
          onChange={(e) => {
            const t = [...(mesTables ?? []), ...PROFILS].find((x) => x.id === e.target.value);
            if (t) appliquerProfil(t);
          }}
          style={styleSelect}
        >
          {!tableActive && <option value="">Réglages personnalisés</option>}
          <optgroup label="Tables préenregistrées">
            {PROFILS.map((prof) => (
              <option key={prof.id} value={prof.id}>{prof.nom}</option>
            ))}
          </optgroup>
          {mesTables && mesTables.length > 0 && (
            <optgroup label="Mes tables personnalisées">
              {mesTables.map((t) => (
                <option key={t.id} value={t.id}>{t.nom}</option>
              ))}
            </optgroup>
          )}
        </select>

        <p style={{ fontSize: 13, lineHeight: 1.5, color: "var(--encre2)", margin: "9px 0 0" }}>
          {tableActive?.resume ??
            (tableActive
              ? `${tableActive.valeurs.nbPaquets} paquets · ${tableActive.valeurs.coupe == null ? "coupe à relever" : Math.round(((tableActive.valeurs.nbPaquets - tableActive.valeurs.coupe) / tableActive.valeurs.nbPaquets) * 100) + " % de pénétration"} · ${tableActive.valeurs.h17 ? "H17" : "S17"}`
              : "Vos réglages ne correspondent à aucune table enregistrée.")}
        </p>


            {/* Même allure que « Régler les lieux » dans le journal : un lien
                souligné, discret, plutôt qu'un cadre supplémentaire. */}
            <div data-gestion="1">
            <button
              onClick={(e) => {
                const o = !gestionTables;
                /* Ouvrir la gestion referme la section en cours : un seul
                   panneau déplié à la fois dans toute la page. */
                if (o) setSectionsOuvertes([]);
                setGestionTables(o);
                if (o) amener(e.currentTarget.parentElement);
              }}
              aria-expanded={gestionTables}
              style={{
                fontSize: 12.5,
                fontWeight: 600,
                color: "var(--encre2)",
                textDecoration: "underline",
                textUnderlineOffset: 2,
              }}
            >
              {gestionTables ? "Masquer la gestion" : "Gérer mes tables"}
            </button>

            {gestionTables && (
              <div className="bjc-pop" style={{ display: "grid", gap: 8, marginTop: 12 }}>
                {/* Une ligne par table, sur le modèle des sessions du journal :
                    rien n'est modifiable au contact, tout passe par un bouton. */}
                {mesTables.map((t) => (
                  <div
                    key={t.id}
                    style={{ display: "flex", alignItems: "center", gap: 8, padding: "9px 10px", borderRadius: 2, background: "var(--survol)" }}
                  >
                    <button
                      onClick={() => setDetailsTable(t)}
                      aria-label={`Détails de ${t.nom}`}
                      style={{ flex: 1, minWidth: 0, textAlign: "left" }}
                    >
                      <div style={{ fontSize: 14, fontWeight: 700, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {t.nom}
                      </div>
                      <div className="mono" style={{ fontSize: 11.5, lineHeight: 1.45, color: "var(--encre2)" }}>
                        {t.valeurs.nbPaquets} paquets ·{" "}
                        {t.valeurs.coupe == null ? "coupe à relever" : Math.round(100 - t.valeurs.coupe * 12.5) + " %"} ·{" "}
                        {t.valeurs.h17 ? "H17" : "S17"}
                        {t.valeurs.abandon ? " · abandon" : ""}
                      </div>
                    </button>
                    <button
                      onClick={() => setBrouillon({ id: t.id, nom: t.nom, valeurs: { ...t.valeurs } })}
                      aria-label={`Modifier ${t.nom}`}
                      style={{ fontSize: 14, color: "var(--encre2)", padding: "0 4px", flexShrink: 0 }}
                    >
                      ✎
                    </button>
                    <button
                      onClick={() => setTableASupprimer(t)}
                      aria-label={`Supprimer ${t.nom}`}
                      style={{ fontSize: 15, color: "var(--encre2)", padding: "0 4px", flexShrink: 0 }}
                    >
                      ×
                    </button>
                  </div>
                ))}
                <button
                  onClick={() => setBrouillon({ id: null, nom: "", valeurs: { ...PROFILS[0].valeurs } })}
                  style={{
                    border: "1px solid var(--encre)",
                    padding: "9px 14px",
                    borderRadius: 3,
                    fontSize: 13,
                    fontWeight: 700,
                    justifySelf: "start",
                    marginTop: 4,
                  }}
                >
                  Créer une table
                </button>
              </div>
            )}

            {/* Fenêtre d'ajout ou de modification : elle travaille sur un
                brouillon, donc rien ne change derrière tant qu'on n'a pas
                enregistré. Les profils fournis, eux, restent intouchables. */}
            {brouillon && (
              <div
                role="dialog"
                aria-modal="true"
                aria-label={brouillon.id ? "Modifier la table" : "Nouvelle table"}
                onClick={() => setBrouillon(null)}
                style={{
                  position: "fixed",
                  inset: 0,
                  zIndex: 99,
                  background: "rgba(0,0,0,.62)",
                  display: "flex",
                  alignItems: "flex-start",
                  justifyContent: "center",
                  padding: 16,
                  overflowY: "auto",
                }}
              >
                <div
                  className="bjc-flash"
                  onClick={(e) => e.stopPropagation()}
                  style={{
                    ...S.panneau,
                    width: "100%",
                    maxWidth: 460,
                    margin: "auto",
                    padding: mobile ? "18px 16px" : "22px 20px",
                    boxShadow: "var(--ombre-forte)",
                  }}
                >
                  <h2 style={{ fontSize: mobile ? 17 : 19, margin: "0 0 14px", fontWeight: 700, letterSpacing: "-.01em" }}>
                    {brouillon.id ? "Modifier la table" : "Nouvelle table"}
                  </h2>

                  {/* Partir d'une table préenregistrée évite de tout régler à
                      la main. Seule une création en propose : modifier une
                      table existante n'a pas à l'écraser d'un coup. */}
                  {!brouillon.id && (
                    <label style={{ display: "block", marginBottom: 14 }}>
                      <div style={{ fontSize: 11.5, fontWeight: 600, color: "var(--encre2)", marginBottom: 5 }}>
                        Partir d'un modèle
                      </div>
                      <select
                        value=""
                        onChange={(e) => {
                          const m = PROFILS.find((x) => x.id === e.target.value);
                          if (m) setBrouillon((b) => ({ ...b, valeurs: { ...m.valeurs } }));
                        }}
                        style={styleSelect}
                      >
                        <option value="">Choisir une table préenregistrée…</option>
                        {PROFILS.map((m) => (
                          <option key={m.id} value={m.id}>{m.nom}</option>
                        ))}
                      </select>
                    </label>
                  )}

                  <label style={{ display: "block", marginBottom: 14 }}>
                    <div style={{ fontSize: 11.5, fontWeight: 600, color: "var(--encre2)", marginBottom: 5 }}>Nom</div>
                    <input
                      value={brouillon.nom}
                      onChange={(e) => setBrouillon((b) => ({ ...b, nom: e.target.value }))}
                      placeholder={brouillon.id ? "Le casino, la salle…" : nomLibre()}
                      style={{
                        width: "100%",
                        padding: "10px 11px",
                        fontSize: 15,
                        fontFamily: "inherit",
                        color: "var(--encre)",
                        background: "var(--panneau)",
                        border: "1px solid var(--regle)",
                        borderRadius: 3,
                      }}
                    />
                  </label>

                  <EditeurRegles
                    mobile={mobile}
                    reglages={brouillon.valeurs}
                    majReglage={majBrouillon}
                    styleSelect={styleSelect}
                    aideSection={aideSection}
                    setAideSection={setAideSection}
                  />

                  <div style={{ display: "grid", gap: 8, marginTop: 18 }}>
                    <button
                      onClick={() => {
                        const nom = brouillon.nom.trim() || nomLibre();
                        enregistrerBrouillon({ ...brouillon, nom });
                        setBrouillon(null);
                      }}
                      className="bjc-tap"
                      style={{
                        background: "var(--encre)",
                        color: "var(--panneau)",
                        padding: "12px 16px",
                        borderRadius: 3,
                        fontSize: 14,
                        fontWeight: 700,
                      }}
                    >
                      {brouillon.id ? "Mettre à jour" : "Créer la table"}
                    </button>
                    <button
                      onClick={() => setBrouillon(null)}
                      className="bjc-tap"
                      style={{ border: "1px solid var(--encre)", padding: "12px 16px", borderRadius: 3, fontSize: 14, fontWeight: 600 }}
                    >
                      Annuler
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Détails d'une table, en lecture seule : on vient voir ce que
                sont les règles, pas les changer. La modification passe par le
                crayon, et les tables préenregistrées n'en ont pas. */}
            {detailsTable && (
              <div
                role="dialog"
                aria-modal="true"
                aria-label={`Règles de ${detailsTable.nom}`}
                onClick={() => setDetailsTable(null)}
                style={{
                  position: "fixed",
                  inset: 0,
                  zIndex: 99,
                  background: "rgba(0,0,0,.62)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  padding: 16,
                }}
              >
                <div
                  className="bjc-flash"
                  onClick={(e) => e.stopPropagation()}
                  style={{ ...S.panneau, width: "100%", maxWidth: 400, padding: mobile ? "18px 16px" : "22px 20px", boxShadow: "var(--ombre-forte)" }}
                >
                  <h2 style={{ fontSize: mobile ? 17 : 19, margin: "0 0 4px", fontWeight: 700, letterSpacing: "-.01em" }}>
                    {detailsTable.nom}
                  </h2>
                  <p style={{ fontSize: 12, color: "var(--encre2)", margin: "0 0 14px" }}>
                    {detailsTable.id && !String(detailsTable.id).startsWith("perso-")
                      ? "Table préenregistrée"
                      : detailsTable.id
                      ? "Votre table"
                      : "Réglages courants"}
                  </p>
                  <dl style={{ display: "grid", gap: 9, margin: 0 }}>
                    {detailsRegles(detailsTable.valeurs).map(([cle, valeur]) => (
                      <div key={cle} style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "baseline" }}>
                        <dt style={{ fontSize: 12.5, color: "var(--encre2)", flexShrink: 0 }}>{cle}</dt>
                        <dd className="mono" style={{ fontSize: 12.5, fontWeight: 700, margin: 0, textAlign: "right" }}>
                          {valeur}
                        </dd>
                      </div>
                    ))}
                  </dl>
                  <button
                    onClick={() => setDetailsTable(null)}
                    className="bjc-tap"
                    style={{ width: "100%", border: "1px solid var(--encre)", padding: "11px 16px", borderRadius: 3, fontSize: 14, fontWeight: 600, marginTop: 18 }}
                  >
                    Fermer
                  </button>
                </div>
              </div>
            )}

            </div>

            <Confirmation
              ouvert={tableASupprimer !== null}
              mobile={mobile}
              titre={`Supprimer « ${tableASupprimer?.nom ?? ""} » ?`}
              texte="Le raccourci disparaît. Si vous jouiez dessus, vous revenez sur la première table préenregistrée."
              actionLabel="Supprimer cette table"
              onAction={() => {
                /* Supprimer la table sur laquelle on joue laisserait des réglages
                   sans nom : on revient alors à la première table préenregistrée.
                   La comparaison porte sur les valeurs, car tableActive se
                   recalcule et la table aura déjà disparu. */
                const active = memesReglages(tableASupprimer.valeurs, defauts);
                supprimerTable && supprimerTable(tableASupprimer.id);
                if (active) appliquerProfil(PROFILS[0]);
                setTableASupprimer(null);
              }}
              onAnnuler={() => setTableASupprimer(null)}
            />

      </div>




      <SectionReglages
        mobile={mobile}
        titre="Comptage"
        resume={resumeCompteur}
        ouvert={sectionsOuvertes.includes("compteur")}
        basculer={() => basculerSection("compteur")}
      >
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: mobile ? 10 : 14, alignItems: "start" }}>
        <LigneReglage mobile={mobile} titre="Système de comptage" aide="Utilisé par le compteur, les exercices et la fiche.">
          <select value={systemeId} onChange={(e) => setSysteme(e.target.value)} style={styleSelect}>
            {ORDRE.map((id) => (
              <option key={id} value={id}>{SYSTEMS[id].nom}</option>
            ))}
          </select>
        </LigneReglage>
        <LigneReglage mobile={mobile} titre="Cartes neutres au compteur" aide="Les cartes de valeur nulle ne changent pas le compte.">
          <Segments
            plein
            options={[{ v: false, l: "Masquées" }, { v: true, l: "Affichées" }]}
            valeur={reglages.neutres}
            onChange={(v) => majReglage("neutres", v)}
          />
        </LigneReglage>
        </div>
      </SectionReglages>


      <SectionReglages
        mobile={mobile}
        titre="Limites de jeu"
        resume={resumeJeu}
        ouvert={sectionsOuvertes.includes("jeu")}
        basculer={() => basculerSection("jeu")}
      >
        <LigneReglage
          mobile={mobile}
          titre="Capital de jeu"
          aide="La somme que vous acceptez d'exposer."
        >
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <ChampNombre valeur={reglages.capital ?? 250} min={1} onChange={(v) => majReglage("capital", v)} style={styleSelect} />
            <span className="mono" style={{ fontSize: 13, color: "var(--encre2)" }}>€</span>
          </div>
          <p style={{ fontSize: 13, lineHeight: 1.55, color: "var(--encre2)", margin: "9px 0 0" }}>
            {Math.floor((reglages.capital ?? 250) / Math.max(reglages.miseMin ?? 5, 1))} unités de mise.
            {Math.floor((reglages.capital ?? 250) / Math.max(reglages.miseMin ?? 5, 1)) < 20 &&
              " Sous vingt, la variance seule peut vous éliminer."}
          </p>
        </LigneReglage>
        <LigneReglage mobile={mobile} titre="Vos mises" aide="Les vôtres, pas celles du tapis.">
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            <label>
              <div style={{ ...S.eyebrow, marginBottom: 5 }}>Minimum</div>
              <ChampNombre valeur={reglages.miseMin ?? 5} min={1} onChange={(v) => majReglage("miseMin", v)} style={styleSelect} />
            </label>
            <label>
              <div style={{ ...S.eyebrow, marginBottom: 5 }}>Maximum</div>
              <ChampNombre valeur={reglages.miseMax ?? 500} min={1} onChange={(v) => majReglage("miseMax", v)} style={styleSelect} />
            </label>
          </div>
          <p style={{ fontSize: 13, lineHeight: 1.55, color: "var(--encre2)", margin: "9px 0 0" }}>
            Écart de 1 à {Math.floor((reglages.miseMax ?? 500) / Math.max(reglages.miseMin ?? 5, 1))}.
            {Math.floor((reglages.miseMax ?? 500) / Math.max(reglages.miseMin ?? 5, 1)) < 8 &&
              " Trop étroit pour qu'un comptage rapporte."}
          </p>
        </LigneReglage>

        <LigneReglage
          mobile={mobile}
          titre="Plafond de perte"
          aide="Montant au-delà duquel le journal vous alerte."
        >
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            <label>
              <div style={{ ...S.eyebrow, marginBottom: 5 }}>Montant (0 = aucun)</div>
              <ChampNombre valeur={reglages.plafondPerte ?? 0} min={0} onChange={(v) => majReglage("plafondPerte", v)} style={styleSelect} />
            </label>
            <label>
              <div style={{ ...S.eyebrow, marginBottom: 5 }}>Par</div>
              <select
                value={reglages.periodePlafond ?? "semaine"}
                onChange={(e) => majReglage("periodePlafond", e.target.value)}
                style={styleSelect}
              >
                <option value="semaine">semaine</option>
                <option value="mois">mois</option>
              </select>
            </label>
          </div>
        </LigneReglage>
      </SectionReglages>

      <SectionReglages
        mobile={mobile}
        titre="Thème et sons"
        resume={resumeApparence}
        ouvert={sectionsOuvertes.includes("apparence")}
        basculer={() => basculerSection("apparence")}
      >
        {/* Deux menus courts tiennent sur une ligne : la section passe de cinq
            blocs pleine largeur à trois. */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: mobile ? 10 : 14, alignItems: "start" }}>
          <LigneReglage mobile={mobile} titre="Thème">
            <select
              value={theme ?? "auto"}
              onChange={(e) => setTheme(e.target.value === "auto" ? null : e.target.value)}
              style={styleSelect}
            >
              <option value="auto">Système</option>
              <option value="clair">Clair</option>
              <option value="sombre">Sombre</option>
              <option value="tapis">Tapis vert</option>
              <option value="velours">Velours rouge</option>
            </select>
          </LigneReglage>
          <LigneReglage mobile={mobile} titre="Enseigne du logo">
            <select
              value={reglages.enseigne ?? "pique"}
              onChange={(e) => majReglage("enseigne", e.target.value)}
              style={styleSelect}
            >
              {ENSEIGNES_LOGO.map((e) => (
                <option key={e.v} value={e.v}>{e.glyphe}  {e.nom}</option>
              ))}
            </select>
          </LigneReglage>
        </div>

        <LigneReglage mobile={mobile} titre="Sons des exercices" aide="Un signal court à chaque réponse, pour garder les yeux sur les cartes plutôt que sur le texte. Aucun son ailleurs dans l'application.">
          <Segments
            plein
            options={[{ v: true, l: "Activés" }, { v: false, l: "Coupés" }]}
            valeur={reglages.sons !== false}
            onChange={(v) => majReglage("sons", v)}
          />
        </LigneReglage>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: mobile ? 10 : 14, alignItems: "start" }}>
            <LigneReglage mobile={mobile} titre="Jeu de sons" aide={
                (reglages.jeuSons ?? "marque") === "marque"
                  ? "Se distingue mieux quand les réponses s'enchaînent vite."
                  : "Se fait plus discret sur une longue série."
              }>
              <Segments
                plein
                options={[{ v: "sobre", l: "Sobre" }, { v: "marque", l: "Marqué" }]}
                valeur={reglages.jeuSons ?? "marque"}
                onChange={(v) => {
                  majReglage("jeuSons", v);
                  jouerSon("juste", reglages.sons !== false, v);
                }}
              />
            </LigneReglage>
            <LigneReglage mobile={mobile} titre="Tic du défilé" aide="Un clic sec à chaque carte du défilé, pour tenir la cadence.">
              <Segments
                plein
                options={[{ v: true, l: "Activé" }, { v: false, l: "Coupé" }]}
                valeur={reglages.tic !== false}
                onChange={(v) => majReglage("tic", v)}
              />
            </LigneReglage>
        </div>
      </SectionReglages>

      <div style={{ ...S.panneau, padding: mobile ? "14px 15px" : "16px 18px", marginTop: 10 }}>
        <TitreCadre mobile={mobile}>Sauvegarde</TitreCadre>
        <p style={{ fontSize: 13.5, lineHeight: 1.55, color: "var(--encre2)", margin: "0 0 11px" }}>
          {stockageActif
            ? "Tout est conservé sur cet appareil. Rien n'est envoyé ailleurs."
            : "Le stockage local est indisponible sur cet appareil : vos réglages seront perdus à la fermeture."}
        </p>
        <p style={{ fontSize: 13, lineHeight: 1.55, color: "var(--encre2)", margin: "0 0 12px" }}>
          Vos réglages, votre journal et votre entraînement sont enregistrés en continu et survivent aux mises à jour.
          Une sauvegarde vous protège de ce qui échappe à cet enregistrement : une réinitialisation, un changement
          d'adresse, un changement de téléphone.
        </p>

        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 10 }}>
          <button
            onClick={() => {
              const interne = ecrireInstantane(toutesLesDonnees());
              const fichier = exporterTout(toutesLesDonnees());
              if (interne) setInstantane(lireInstantane());
              setMsgSauvegarde(
                interne && fichier
                  ? "Sauvegardée dans l'application et téléchargée. Conservez le fichier hors du téléphone."
                  : interne
                  ? "Sauvegardée dans l'application. Le téléchargement du fichier a échoué."
                  : "erreur:Sauvegarde impossible."
              );
            }}
            className="bjc-tap"
            style={{
              background: "var(--encre)",
              color: "var(--panneau)",
              padding: "11px 18px",
              borderRadius: 3,
              fontSize: 14,
              fontWeight: 700,
            }}
          >
            Sauvegarder
          </button>
          <button
            onClick={() => {
              const i = lireInstantane();
              if (!i) { setMsgSauvegarde("erreur:Aucune sauvegarde dans l'application."); return; }
              appliquerSauvegarde(i.donnees);
              setMsgSauvegarde(`Sauvegarde du ${dateLisible(i.date)} restaurée.`);
            }}
            disabled={!instantane}
            style={{
              border: "1px solid var(--encre)",
              padding: "11px 18px",
              borderRadius: 3,
              fontSize: 14,
              fontWeight: 600,
              opacity: instantane ? 1 : 0.45,
            }}
          >
            Restaurer
          </button>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap", marginBottom: 12 }}>
          <span
            style={{
              fontSize: 12.5,
              lineHeight: 1.5,
              fontWeight: sauvegardeAgee() ? 700 : 400,
              color: sauvegardeAgee() ? "var(--or)" : "var(--encre2)",
            }}
          >
            {!instantane
              ? "Aucune sauvegarde pour l'instant."
              : `Dernière sauvegarde : ${dateLisible(instantane.date)}` +
                (ageSauvegarde() >= 1 ? `, il y a ${ageSauvegarde()} jour${ageSauvegarde() > 1 ? "s" : ""}.` : ".")}
          </span>
          <button
            onClick={() => fichierSauvegarde.current && fichierSauvegarde.current.click()}
            style={{ fontSize: 12.5, fontWeight: 600, color: "var(--encre2)", textDecoration: "underline", textUnderlineOffset: 2 }}
          >
            Restaurer depuis un fichier
          </button>
        </div>

        <input
          ref={fichierSauvegarde}
          type="file"
          accept=".json,application/json"
          onChange={restaurerTout}
          style={{ display: "none" }}
        />

        {msgSauvegarde && (
          <p
            style={{
              fontSize: 13,
              lineHeight: 1.55,
              margin: "0 0 12px",
              color: msgSauvegarde.startsWith("erreur") ? "var(--rouge)" : "var(--encre2)",
            }}
          >
            {msgSauvegarde.startsWith("erreur") ? msgSauvegarde.slice(7) : msgSauvegarde}
          </p>
        )}

        <button
          onClick={reinitialiser}
          style={{
            border: "1px solid var(--regle)",
            padding: "10px 15px",
            borderRadius: 3,
            fontSize: 13.5,
            fontWeight: 600,
            color: "var(--encre2)",
          }}
        >
          Réinitialiser les réglages
        </button>
        <p style={{ fontSize: 12.5, lineHeight: 1.5, color: "var(--encre2)", margin: "9px 0 14px" }}>
          Sans effet sur le journal ni l'entraînement.
        </p>

        <div style={{ borderTop: "1px solid var(--regle)", paddingTop: 14, marginBottom: 14 }}>
          <TitreCadre mobile={mobile}>Code de protection</TitreCadre>
          <p style={{ fontSize: 13, lineHeight: 1.55, color: "var(--encre2)", margin: "0 0 11px" }}>
            {codeDefini ? "Demandé avant toute suppression." : "Aucun code. Les suppressions demandent seulement une confirmation."}
          </p>
          {codeDefini && (
            <p style={{ fontSize: 12.5, lineHeight: 1.55, color: "var(--encre2)", margin: "-6px 0 11px" }}>
              Code oublié : saisissez la clé de secours à sa place, elle retire la protection. Elle est inscrite dans
              le fichier de l'application, à la ligne <span className="mono">CLE_SECOURS</span>.
            </p>
          )}
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <button
              onClick={definirCode}
              style={{ border: "1px solid var(--encre)", padding: "9px 15px", borderRadius: 3, fontSize: 13.5, fontWeight: 600 }}
            >
              {codeDefini ? "Changer le code" : "Définir un code"}
            </button>
            {codeDefini && (
              <button
                onClick={retirerCode}
                style={{ border: "1px solid var(--regle)", padding: "9px 15px", borderRadius: 3, fontSize: 13.5, fontWeight: 600, color: "var(--encre2)" }}
              >
                Retirer le code
              </button>
            )}
          </div>
        </div>

        <div style={{ borderTop: "1px solid var(--regle)", paddingTop: 14 }}>
          <p style={{ fontSize: 13.5, lineHeight: 1.55, color: "var(--encre2)", margin: "0 0 11px" }}>
            Tout, sauvegarde interne et code de protection compris. L'application revient à l'état exact
            d'une première installation.
          </p>
          <button
            onClick={() => setConfirmeTable(true)}
            style={{
              border: "1px solid var(--rouge)",
              padding: "10px 15px",
              borderRadius: 3,
              fontSize: 13.5,
              fontWeight: 600,
              color: "var(--rouge)",
            }}
          >
            Réinitialiser l'application
          </button>
          <Confirmation
            ouvert={confirmeTable}
            mobile={mobile}
            titre="Réinitialiser l'application ?"
            texte="Retour à l'état d'origine, sauvegarde interne et code compris. Seul un fichier exporté vous permettrait encore de revenir en arrière."
            actionLabel="Oui, tout remettre à zéro"
            onAction={() => {
              effacerToutTotal && effacerToutTotal();
              setConfirmeTable(false);
              setInstantane(null);
              setMsgSauvegarde("Application remise à son état d'origine.");
            }}
            onAnnuler={() => setConfirmeTable(false)}
          />
        </div>
        <p
          className="mono"
          style={{ fontSize: 12, lineHeight: 1.5, color: "var(--encre2)", margin: "11px 0 0", paddingTop: 9, borderTop: "1px solid var(--regle)" }}
        >
          Version {VERSION} — {DATE_VERSION}
        </p>

      </div>

      <div style={{ ...S.eyebrow, borderTop: "1px solid var(--encre)", paddingTop: 12, marginTop: 30, marginBottom: 10 }}>
        Sources — d'où vient chaque chiffre
      </div>

      <div style={{ display: "grid", gap: 6 }}>
        {PROVENANCE.map((bloc) => {
          const ouvert = ouverts.includes(bloc.categorie);
          return (
            <div key={bloc.categorie} style={{ ...S.panneau, borderLeft: `3px solid ${bloc.teinte}`, overflow: "hidden" }}>
              <button
                onClick={() => basculer(bloc.categorie)}
                aria-expanded={ouvert}
                style={{
                  width: "100%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: 12,
                  textAlign: "left",
                  padding: mobile ? "13px 14px" : "14px 18px",
                }}
              >
                <span style={{ ...S.eyebrow, color: bloc.teinte }}>{bloc.categorie}</span>
                <span className="mono" aria-hidden="true" style={{ fontSize: 15, color: bloc.teinte, flexShrink: 0, lineHeight: 1 }}>
                  {ouvert ? "−" : "+"}
                </span>
              </button>
              {ouvert && (
                <div className="bjc-pop" style={{ padding: mobile ? "0 14px 14px" : "0 18px 16px" }}>
                  <ul style={{ margin: 0, padding: 0, listStyle: "none", display: "grid", gap: 6 }}>
                    {bloc.lignes.map((l) => (
                      <li key={l} style={{ display: "flex", gap: 9, fontSize: 14.5, lineHeight: 1.5 }}>
                        <span style={{ color: bloc.teinte, flexShrink: 0 }}>·</span>
                        <span>{l}</span>
                      </li>
                    ))}
                  </ul>
                  <p style={{ fontSize: 13, lineHeight: 1.5, color: "var(--encre2)", margin: "10px 0 0" }}>{bloc.note}</p>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div style={{ display: "grid", gap: 6, marginTop: 6 }}>
        {[
          [
            "Limites connues",
            "Le moteur suppose une probabilité fixe pendant le tirage et estime les séparations sans resplit, ce qui les rend légèrement pessimistes. Les indices de déviation valent pour le Hi-Lo en six paquets et se décalent selon les règles.",
          ],
          [
            "Erreurs corrigées",
            "Des versions antérieures contenaient un bug sur les mains à deux As et deux valeurs fausses pour l'Ace-Five, détectés en confrontant les calculs aux tables publiées.",
          ],
          [
            "En cas de désaccord",
            "Si un chiffre de cette application contredit un ouvrage de référence, c'est l'ouvrage qui a raison — sauf pour les espérances, que vous pouvez recalculer.",
          ],
        ].map((paire) => {
          const [titre, texte] = paire;
          const ouvert = ouverts.includes(titre);
          return (
            <div key={titre} style={{ ...S.panneau, overflow: "hidden" }}>
              <button
                onClick={() => basculer(titre)}
                aria-expanded={ouvert}
                style={{
                  width: "100%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: 12,
                  textAlign: "left",
                  padding: mobile ? "13px 14px" : "14px 18px",
                }}
              >
                <span style={S.eyebrow}>{titre}</span>
                <span className="mono" aria-hidden="true" style={{ fontSize: 15, color: "var(--encre2)", lineHeight: 1 }}>
                  {ouvert ? "−" : "+"}
                </span>
              </button>
              {ouvert && (
                <p
                  className="bjc-pop"
                  style={{
                    fontSize: 14.5,
                    lineHeight: 1.6,
                    color: "var(--encre2)",
                    margin: 0,
                    padding: mobile ? "0 14px 14px" : "0 18px 16px",
                  }}
                >
                  {texte}
                </p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ============================================================
   VUE — LEXIQUE
   ============================================================ */

function VueLexique({ mobile, wrap }) {
  const [filtre, setFiltre] = useState("");
  const [ouverts, setOuverts] = useState([]);
  const q = filtre.trim().toLowerCase();

  /* Un seul terme déplié à la fois, comme les sections des paramètres et les
     panneaux du journal. */
  const basculer = (terme) => setOuverts((o) => (o.includes(terme) ? [] : [terme]));

  /* Toute autre interaction referme la définition — sauf les paramètres, qui
     sont une page posée par-dessus. */
  useEffect(() => {
    if (!ouverts.length) return;
    const dehors = (ev) => {
      if (ev.target.closest?.("[data-terme]")) return;
      if (ev.target.closest?.("[data-superpose], [role='dialog']")) return;
      if (!ev.target.closest?.("button, a, input, select, textarea, label")) return;
      setOuverts([]);
    };
    document.addEventListener("click", dehors, true);
    return () => document.removeEventListener("click", dehors, true);
  }, [ouverts]);

  const groupes = LEXIQUE.map((g) => ({
    ...g,
    entrees: g.entrees.filter(
      (e) =>
        !q ||
        e.terme.toLowerCase().includes(q) ||
        e.alias.includes(q) ||
        (e.anglais ?? "").toLowerCase().includes(q) ||
        e.court.toLowerCase().includes(q) ||
        e.long.toLowerCase().includes(q)
    ),
  })).filter((g) => g.entrees.length);

  return (
    <div style={wrap}>
      <div style={{ padding: mobile ? "22px 0 18px" : "44px 0 20px", maxWidth: 640 }}>
        <div style={S.eyebrow}>Lexique</div>
        <h1 style={{ fontSize: "clamp(26px,6.4vw,44px)", lineHeight: 1.04, margin: "10px 0 12px", fontWeight: 700 }}>
          Le vocabulaire
        </h1>
        <p style={{ fontSize: mobile ? 15 : 16, lineHeight: 1.62, color: "var(--encre2)", margin: 0 }}>
          Chaque notion employée ailleurs dans l'application. Touchez un terme pour l'ouvrir. La recherche fouille aussi
          les définitions et accepte les sigles anglais.
        </p>
      </div>

      <input
        value={filtre}
        onChange={(e) => setFiltre(e.target.value)}
        placeholder="Chercher un terme…"
        aria-label="Chercher un terme"
        style={{
          width: "100%",
          maxWidth: 380,
          padding: "11px 13px",
          fontSize: 15,
          fontFamily: "inherit",
          color: "var(--encre)",
          background: "var(--panneau)",
          border: "1px solid var(--regle)",
          borderRadius: 3,
        }}
      />

      {groupes.length === 0 && (
        <p style={{ fontSize: 15, color: "var(--encre2)", marginTop: 22 }}>
          Aucun terme ne correspond. Essayez un mot plus court, ou le sigle anglais.
        </p>
      )}

      {groupes.map((g) => (
        <div key={g.groupe} style={{ marginTop: 26 }}>
          <div style={{ ...S.eyebrow, borderTop: "1px solid var(--encre)", paddingTop: 10, marginBottom: 10 }}>
            {g.groupe}
          </div>
          <div style={{ display: "grid", gap: 6 }}>
            {g.entrees.map((e) => {
              const ouvert = ouverts.includes(e.terme) || !!q;
              return (
                <div
                  key={e.terme}
                  data-terme="1"
                  style={{
                    ...S.panneau,
                    borderLeft: `3px solid ${ouvert ? "var(--bleu)" : "var(--regle)"}`,
                    overflow: "hidden",
                  }}
                >
                  <button
                    onClick={(ev) => {
                      const ouvrait = !ouverts.includes(e.terme);
                      basculer(e.terme);
                      if (ouvrait) amener(ev.currentTarget.parentElement);
                    }}
                    aria-expanded={ouvert}
                    style={{
                      width: "100%",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      gap: 12,
                      textAlign: "left",
                      padding: mobile ? "13px 14px" : "14px 18px",
                    }}
                  >
                    <span
                      style={{
                        fontFamily: "'Public Sans', ui-sans-serif, sans-serif",
                        fontWeight: 700,
                        fontSize: mobile ? 15.5 : 17,
                        letterSpacing: "-.01em",
                      }}
                    >
                      {e.terme}
                      {e.anglais && (
                        /* Le mot que le croupier emploie à la table : utile pour
                           suivre une annonce en anglais. */
                        <span
                          style={{
                            display: "block",
                            fontStyle: "italic",
                            fontWeight: 400,
                            fontSize: 12.5,
                            color: "var(--encre2)",
                            marginTop: 1,
                          }}
                        >
                          {e.anglais}
                        </span>
                      )}
                    </span>
                    <span
                      className="mono"
                      aria-hidden="true"
                      style={{ fontSize: 15, color: ouvert ? "var(--bleu)" : "var(--encre2)", flexShrink: 0, lineHeight: 1 }}
                    >
                      {ouvert ? "−" : "+"}
                    </span>
                  </button>

                  {ouvert && (
                    <div className="bjc-pop" style={{ padding: mobile ? "0 14px 14px" : "0 18px 16px" }}>
                      <p style={{ fontSize: 15, lineHeight: 1.5, margin: 0, fontWeight: 600 }}>{e.court}</p>
                      <p style={{ fontSize: 14.5, lineHeight: 1.62, margin: "10px 0 12px", color: "var(--encre2)" }}>
                        {e.long}
                      </p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}

/* ============================================================
   VUE — LECTURES
   ============================================================ */

function VueLectures({ mobile, wrap }) {
  return (
    <div style={wrap}>
      <div style={{ padding: mobile ? "22px 0 18px" : "44px 0 20px", maxWidth: 640 }}>
        <div style={S.eyebrow}>Lectures</div>
        <h1 style={{ fontSize: "clamp(26px,6.4vw,44px)", lineHeight: 1.04, margin: "10px 0 12px", fontWeight: 700 }}>
          Livres et sources
        </h1>
        <p style={{ fontSize: mobile ? 15 : 16, lineHeight: 1.62, color: "var(--encre2)", margin: 0 }}>
          Un compteur et des exercices vous font acquérir un geste. Ils ne vous apprennent ni à dimensionner une
          bankroll, ni à évaluer une table, ni à savoir quand ne pas jouer — et c'est là que se joue l'essentiel.
        </p>
      </div>

      {LECTURES.map((g) => (
        <div key={g.groupe} style={{ marginTop: 26 }}>
          <div style={{ ...S.eyebrow, borderTop: "1px solid var(--encre)", paddingTop: 10, marginBottom: 12 }}>
            {g.groupe}
          </div>
          <div style={{ display: "grid", gap: 10 }}>
            {g.livres.map((l) => (
              <div key={l.titre} style={{ ...S.panneau, padding: mobile ? "15px 15px" : "18px 20px" }}>
                <div style={{ display: "flex", flexWrap: "wrap", alignItems: "baseline", gap: "2px 10px" }}>
                  <span
                    style={{
                      fontFamily: "'Public Sans', ui-sans-serif, sans-serif",
                      fontWeight: 700,
                      fontSize: mobile ? 16.5 : 18,
                      letterSpacing: "-.01em",
                    }}
                  >
                    {l.titre}
                  </span>
                  <span style={{ fontSize: 14, color: "var(--encre2)" }}>{l.auteur}</span>
                  <span className="mono" style={{ fontSize: 11.5, color: "var(--or)" }}>{l.annee}</span>
                </div>
                <p style={{ fontSize: 14.5, lineHeight: 1.6, margin: "10px 0 12px", color: "var(--encre2)" }}>{l.texte}</p>
              </div>
            ))}
          </div>
        </div>
      ))}

      <div style={{ marginTop: 26 }}>
        <div style={{ ...S.eyebrow, borderTop: "1px solid var(--encre)", paddingTop: 10, marginBottom: 12 }}>
          En ligne — les sources de cette application
        </div>
        <div style={{ display: "grid", gap: 10 }}>
          {SITES.map((s) => (
            <a
              key={s.nom}
              href={s.url}
              target="_blank"
              rel="noreferrer"
              style={{ ...S.panneau, padding: mobile ? "14px 15px" : "16px 20px", display: "block", textDecoration: "none", color: "inherit" }}
            >
              <div style={{ fontWeight: 700, fontSize: 15 }}>
                {s.nom} <span style={{ color: "var(--or)" }}>↗</span>
              </div>
              <p style={{ fontSize: 14, lineHeight: 1.55, margin: "5px 0 0", color: "var(--encre2)" }}>{s.texte}</p>
            </a>
          ))}
        </div>
      </div>

      <p style={{ fontSize: 13.5, lineHeight: 1.65, color: "var(--encre2)", marginTop: 26, maxWidth: 660 }}>
        Un mot sur les récits : <i>Bringing Down the House</i> de Ben Mezrich, sur l'équipe du MIT, se lit bien mais
        romance largement les faits, et le film qui en est tiré davantage encore. Divertissant, pas documentaire.
        <br />
        <br />
        Sur l'ancienneté de ces ouvrages : les mathématiques du blackjack n'ont pas bougé depuis Griffin, et les
        systèmes de comptage non plus. Ce qui a vieilli, ce sont les conditions de jeu décrites — pénétration,
        paiements, mélangeurs. Lisez la théorie dans ces livres, et vérifiez les conditions par vous-même à la table.
      </p>
    </div>
  );
}


/* ============================================================
   VUE — JOURNAL DES SESSIONS
   ============================================================ */

/* Séparateur de milliers en espace fine insécable : en chasse fixe, une espace
   ordinaire casse le nombre en deux à la lecture. */
const milliers = (t) => t.replace(/\B(?=(\d{3})+(?!\d))/g, "\u202F");
const eur = (v) => {
  const [ent, dec] = Math.abs(v).toFixed(2).split(".");
  return (v > 0 ? "+" : v < 0 ? "−" : "") + milliers(ent) + "," + dec + " €";
};

const cleJour = (d) => jourCourt(d);
const cleSemaine = (d) => {
  const t = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  const jour = t.getUTCDay() || 7;
  t.setUTCDate(t.getUTCDate() + 4 - jour);
  const debut = new Date(Date.UTC(t.getUTCFullYear(), 0, 1));
  const n = Math.ceil(((t - debut) / 86400000 + 1) / 7);
  return `${t.getUTCFullYear()}-S${String(n).padStart(2, "0")}`;
};
/* Périodes de 28 jours — quatre semaines pleines — plutôt que des mois
   calendaires de longueur inégale. Elles sont calées sur les lundis, à partir
   d'un lundi de référence, pour que chaque bloc contienne le même nombre de
   fins de semaine. */
/* Les périodes se comptent à rebours depuis aujourd'hui : la dernière se
   termine ce soir, la précédente s'arrête la veille de son début. Un bloc de
   28 jours contient de toute façon quatre samedis, quel que soit son point de
   départ — l'égalité des périodes est donc préservée. */
const minuitAujourdhui = () => {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
};
const blocDe = (d, jours) => {
  const q = new Date(d);
  q.setHours(0, 0, 0, 0);
  const ecart = Math.round((minuitAujourdhui() - q) / 86400000);
  return Math.floor(ecart / jours); // 0 = période en cours
};
/** Premier jour du bloc de rang n, 0 étant la période en cours. */
const debutBloc = (n, jours) => {
  const d = minuitAujourdhui();
  d.setDate(d.getDate() - (n * jours + jours - 1));
  return d;
};
/* Toutes les périodes longues sont des multiples de 28 jours, pour que
   chacune contienne le même nombre de fins de semaine. */
const JOURS_BLOC = { mois: 28 };
const cleBloc = (jours) => (d) => String(999999 - blocDe(d, jours)).padStart(6, "0");

const MOIS = ["janv.", "févr.", "mars", "avril", "mai", "juin", "juil.", "août", "sept.", "oct.", "nov.", "déc."];

/** Étiquette courte d'un bloc : la date de son premier jour. */
function etiquetteBloc(d, jours) {
  const a = debutBloc(blocDe(d, jours), jours);
  return `${a.getDate()}/${String(a.getMonth() + 1).padStart(2, "0")}`;
}

/** Étiquette développée : les deux bornes du bloc. */
function bornesBloc(d, jours, nom) {
  const a = debutBloc(blocDe(d, jours), jours);
  const b = new Date(a);
  b.setDate(b.getDate() + jours - 1);
  return `${nom}, du ${a.getDate()} ${MOIS[a.getMonth()]} au ${b.getDate()} ${MOIS[b.getMonth()]}`;
}

function regrouper(sessions, granularite) {
  const cles = {
    jour: cleJour,
    semaine: cleSemaine,
    ...Object.fromEntries(Object.entries(JOURS_BLOC).map(([k, j]) => [k, cleBloc(j)])),
  };
  const etiquettes = {
    jour: (d) => `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}`,
    semaine: (d) => "s" + cleSemaine(d).split("-S")[1],
    ...Object.fromEntries(Object.entries(JOURS_BLOC).map(([k, j]) => [k, (d) => etiquetteBloc(d, j)])),
  };
  const carte = new Map();
  for (const s of sessions) {
    const d = new Date(s.date);
    const c = cles[granularite](d);
    if (!carte.has(c))
      carte.set(c, {
        cle: c,
        etiquette: etiquettes[granularite](d),
        // Version développée, pour la lecture sous le graphique
        etiquetteLongue: {
          jour: `${d.getDate()} ${MOIS[d.getMonth()]}`,
          semaine: `semaine ${cleSemaine(d).split("-S")[1]}`,
          mois: bornesBloc(d, 28, "1 mois"),
        }[granularite],
        annee: d.getFullYear(),
        net: 0,
        n: 0,
      });
    const g = carte.get(c);
    g.net += s.retrait - s.depot;
    g.n += 1;
  }
  return [...carte.values()].sort((a, b) => a.cle.localeCompare(b.cle));
}

/** « 17/08 au 30/08 », ou avec l'année quand les deux extrémités n'y sont pas. */
function bornesVisibles(groupes) {
  const vus = groupes.slice(-14);
  const a = vus[0];
  const b = groupes[groupes.length - 1];
  const an = (g) => (a.annee === b.annee ? g.etiquette : `${g.etiquette}/${String(g.annee).slice(2)}`);
  return `${an(a)} au ${an(b)}`;
}

function Histogramme({ groupes, mobile, choisi, onChoisir }) {
  if (!groupes.length) return null;
  const max = Math.max(...groupes.map((g) => Math.abs(g.net)), 1);
  const derniers = groupes.slice(-14);
  const h = mobile ? 120 : 150;
  return (
    <>
    <div style={{ display: "flex", alignItems: "stretch", gap: 3, height: h, marginTop: 4 }}>
      {derniers.map((g) => {
        const part = Math.abs(g.net) / max;
        const positif = g.net >= 0;
        return (
          <button
            key={g.cle}
            onClick={() => onChoisir && onChoisir(choisi === g.cle ? null : g.cle)}
            style={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              minWidth: 0,
              padding: 0,
              background: choisi === g.cle ? "var(--survol)" : "transparent",
              borderRadius: 2,
            }}
          >
            <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "flex-end" }}>
              {positif && (
                <>
                  <div className="mono" style={{ fontSize: 8.5, color: "var(--ok)", textAlign: "center", marginBottom: 1, whiteSpace: "nowrap" }}>
                    {Math.round(g.net)}
                  </div>
                  <div
                    title={`${g.etiquette} : ${eur(g.net)}`}
                    style={{ width: "100%", height: `${part * 100}%`, background: "var(--ok)", borderRadius: "2px 2px 0 0" }}
                  />
                </>
              )}
            </div>
            <div style={{ height: 1, background: "var(--regle)" }} />
            <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "flex-start" }}>
              {!positif && (
                <>
                  <div
                    title={`${g.etiquette} : ${eur(g.net)}`}
                    style={{ width: "100%", height: `${part * 100}%`, background: "var(--rouge)", borderRadius: "0 0 2px 2px" }}
                  />
                  <div className="mono" style={{ fontSize: 8.5, color: "var(--rouge)", textAlign: "center", marginTop: 1, whiteSpace: "nowrap" }}>
                    {Math.round(g.net)}
                  </div>
                </>
              )}
            </div>
            <div
              className="mono"
              style={{ fontSize: 9, color: "var(--encre2)", textAlign: "center", marginTop: 4, overflow: "hidden" }}
            >
              {g.etiquette}
            </div>
          </button>
        );
      })}
    </div>

    </>
  );
}

/** Exporte les sessions en CSV lisible par un tableur français. */
function exporterCSV(sessions) {
  const lignes = [["Date", "Heure", "Lieu", "Déposé", "Retiré", "Résultat", "Mains", "Mise moyenne"]];
  for (const s of [...sessions].sort((a, b) => new Date(a.date) - new Date(b.date))) {
    const d = new Date(s.date);
    lignes.push([
      `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}/${d.getFullYear()}`,
      `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`,
      (s.lieu || "").replace(/[;\n]/g, " "),
      s.depot.toFixed(2).replace(".", ","),
      s.retrait.toFixed(2).replace(".", ","),
      (s.retrait - s.depot).toFixed(2).replace(".", ","),
      s.mains ? String(s.mains) : "",
      s.mise ? s.mise.toFixed(2).replace(".", ",") : "",
    ]);
  }
  const texte = "\uFEFF" + lignes.map((l) => l.join(";")).join("\r\n");
  return telecharger(texte, "text/csv;charset=utf-8", `big-jack-theory-${jourCourt(new Date())}.csv`);
}

/** Relit un CSV produit par l'export. Tolérant au séparateur et aux colonnes absentes. */
/* Une sauvegarde restaurée ou un stockage abîmé peut contenir n'importe quoi.
   On écarte ce qui n'est pas exploitable plutôt que d'afficher « NaN » ou de
   laisser une exception vider tout le journal. */
function assainir(liste) {
  if (!Array.isArray(liste)) return [];
  const n = (v) => {
    const x = typeof v === "number" ? v : parseFloat(String(v ?? "").replace(",", "."));
    return Number.isFinite(x) ? x : null;
  };
  return liste
    .filter((s) => s && typeof s === "object")
    .map((s) => {
      const d = new Date(s.date);
      const depot = n(s.depot);
      const retrait = n(s.retrait);
      if (isNaN(d.getTime()) || depot === null || retrait === null) return null;
      return {
        ...s,
        id: s.id ?? Date.now() + Math.random(),
        date: d.toISOString(),
        depot,
        retrait,
        mains: n(s.mains) ?? undefined,
        mise: n(s.mise) ?? undefined,
        lieu: typeof s.lieu === "string" ? s.lieu : "",
      };
    })
    .filter(Boolean);
}

function analyserCSV(texte) {
  const brut = texte.replace(/^\uFEFF/, "").split(/\r?\n/).filter((l) => l.trim());
  if (!brut.length) return { sessions: [], erreur: "Fichier vide." };
  const sep = (brut[0].match(/;/g) || []).length >= (brut[0].match(/,/g) || []).length ? ";" : ",";
  const entete = brut[0].split(sep).map((c) => c.trim().toLowerCase());
  const col = (...noms) => entete.findIndex((c) => noms.some((n) => c.includes(n)));
  const iDate = col("date"), iHeure = col("heure"), iLieu = col("lieu");
  const iDepot = col("dépos", "depos"), iRetrait = col("retir");
  const iMains = col("main"), iMise = col("mise");
  if (iDate < 0 || iDepot < 0 || iRetrait < 0)
    return { sessions: [], erreur: "Colonnes Date, Déposé et Retiré introuvables." };

  const nombre = (v) => parseFloat(String(v || "").replace(/\s/g, "").replace(",", "."));
  const sessions = [];
  let ignorees = 0;
  for (const ligne of brut.slice(1)) {
    const c = ligne.split(sep);
    const [j, m, a] = String(c[iDate] || "").trim().split(/[/.-]/);
    const [hh, mm] = String(iHeure >= 0 ? c[iHeure] : "").trim().split(/[h:]/);
    const d = new Date(Number(a), Number(m) - 1, Number(j), Number(hh) || 0, Number(mm) || 0);
    const depot = nombre(c[iDepot]), retrait = nombre(c[iRetrait]);
    if (isNaN(d.getTime()) || !isFinite(depot) || !isFinite(retrait) || depot < 0 || retrait < 0) {
      ignorees++;
      continue;
    }
    const nbMains = iMains >= 0 ? parseInt(String(c[iMains] || "").replace(/\D/g, ""), 10) : NaN;
    const miseMoy = iMise >= 0 ? nombre(c[iMise]) : NaN;
    sessions.push({
      id: d.getTime() + Math.floor(Math.random() * 1000),
      date: d.toISOString(),
      depot,
      retrait,
      lieu: iLieu >= 0 ? String(c[iLieu] || "").trim() : "",
      ...(isFinite(nbMains) && nbMains > 0 ? { mains: nbMains } : {}),
      ...(isFinite(miseMoy) && miseMoy > 0 ? { mise: miseMoy } : {}),
    });
  }
  return { sessions, ignorees };
}

function CourbeCumul({ sessions, mobile }) {
  const pts = [...sessions].sort((a, b) => new Date(a.date) - new Date(b.date));
  if (pts.length < 2) return null;
  let cumul = 0;
  const valeurs = pts.map((s) => (cumul += s.retrait - s.depot));
  const min = Math.min(0, ...valeurs), max = Math.max(0, ...valeurs);
  const etendue = max - min || 1;
  const l = 100, h = mobile ? 90 : 110;
  const x = (i) => (i / (valeurs.length - 1)) * l;
  const y = (v) => h - ((v - min) / etendue) * h;
  const trace = valeurs.map((v, i) => `${i ? "L" : "M"}${x(i).toFixed(2)},${y(v).toFixed(2)}`).join(" ");
  const zero = y(0);
  const fin = valeurs[valeurs.length - 1];
  const jour = (d) => {
    const q = new Date(d);
    return `${String(q.getDate()).padStart(2, "0")}/${String(q.getMonth() + 1).padStart(2, "0")}`;
  };
  const premiereDate = jour(pts[0].date);
  const derniereDate = jour(pts[pts.length - 1].date);
  /* Les montants sont posés en HTML par-dessus le tracé : le SVG est étiré en
     largeur, un texte placé dedans serait déformé. Au-delà de dix sessions on
     n'annote que le sommet, le creux et le point final, sinon c'est illisible. */
  const iMax = valeurs.indexOf(Math.max(...valeurs));
  const iMin = valeurs.indexOf(Math.min(...valeurs));
  const annotes =
    valeurs.length <= 10
      ? valeurs.map((_, i) => i)
      : [...new Set([iMax, iMin, valeurs.length - 1])].sort((a, b) => a - b);

  return (
    <div style={{ marginTop: 4 }}>
      <div style={{ position: "relative" }}>
        <svg viewBox={`0 0 ${l} ${h}`} preserveAspectRatio="none" style={{ width: "100%", height: h, display: "block" }}>
          {/* Aire sous le tracé : elle donne du corps à la courbe et distingue
              d'un coup d'œil ce qui est au-dessus de zéro de ce qui est en
              dessous. Le dégradé s'éteint vers la ligne de zéro. */}
          <defs>
            <linearGradient id="bjc-aire" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={teinte(fin)} stopOpacity="0.26" />
              <stop offset="100%" stopColor={teinte(fin)} stopOpacity="0.02" />
            </linearGradient>
          </defs>
          <path d={`${trace} L${l},${zero.toFixed(2)} L0,${zero.toFixed(2)} Z`} fill="url(#bjc-aire)" stroke="none" />
          {/* La ligne de zéro est le repère du lecteur : elle mérite d'être vue. */}
          <line x1="0" y1={zero} x2={l} y2={zero} stroke="var(--encre2)" strokeWidth="1"
                strokeDasharray="3 3" vectorEffect="non-scaling-stroke" opacity="0.55" />
          <path d={trace} fill="none" stroke={teinte(fin)} strokeWidth="1.6"
                vectorEffect="non-scaling-stroke" strokeLinejoin="round" strokeLinecap="round" />
          {/* Le plus bas est marqué : c'est le creux qu'il faut avoir tenu. */}
          <circle cx={x(iMin)} cy={y(valeurs[iMin])} r="2.4" fill="var(--rouge)"
                  vectorEffect="non-scaling-stroke" />
          <circle cx={x(valeurs.length - 1)} cy={y(fin)} r="2.6" fill={teinte(fin)}
                  stroke="var(--panneau)" strokeWidth="1.4" vectorEffect="non-scaling-stroke" />
        </svg>
        {annotes.map((i) => {
          const v = valeurs[i];
          const gauche = (x(i) / l) * 100;
          // Près du haut du cadre, l'étiquette passe sous le point pour ne pas
          // déborder sur ce qui précède le graphique.
          const haut = (y(v) / h) * 100 < 16;
          return (
            <span
              key={i}
              className="mono"
              style={{
                position: "absolute",
                left: `${gauche}%`,
                top: `${(y(v) / h) * 100}%`,
                transform: `translate(${gauche < 12 ? "0" : gauche > 88 ? "-100%" : "-50%"}, ${haut ? "55%" : "-145%"})`,
                fontSize: 9.5,
                whiteSpace: "nowrap",
                color: "var(--encre2)",
                pointerEvents: "none",
              }}
            >
              {Math.round(v)}
            </span>
          );
        })}
      </div>
      <div className="mono" style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "var(--encre2)", marginTop: 4 }}>
        <span>{premiereDate}</span>
        <span style={{ color: "var(--rouge)" }}>plus bas {Math.round(valeurs[iMin])} €</span>
        <span>{derniereDate}</span>
      </div>
    </div>
  );
}

/* Une phrase par jour, la même toute la journée : elle change à minuit.
   L'indice vient du quantième, donc pas de tirage qui se répète. */
const PHRASES_JOURNAL = [
  "La mémoire retient les bonnes soirées et efface les autres. Un relevé, non.",
  "La partie est gagnée ou perdue avant la première carte.",
  "Le joueur habile ne cherche pas la chance. Il attend qu'elle devienne probable.",
  "Savoir ne pas jouer est aussi une façon de jouer.",
  "Celui qui mise toujours pareil ne perd jamais gros, et ne gagne jamais rien.",
  "Une soirée ne prouve rien. Cent soirées ne mentent pas.",
  "Le hasard est bruyant sur le moment, silencieux sur la durée.",
];
/* L'ordre est retiré au sort à chaque cycle, à partir de son numéro : la
   semaine ne se répète donc pas à l'identique, et l'on voit quand même les
   sept phrases avant d'en revoir une. */
const PHRASE_DU_JOUR = () => {
  const n = PHRASES_JOURNAL.length;
  const jours = Math.floor(minuitAujourdhui().getTime() / 86400000);
  const cycle = Math.floor(jours / n);
  const rang = ((jours % n) + n) % n;

  let graine = (cycle * 2654435761) >>> 0;
  const suivant = () => {
    graine = (graine * 1664525 + 1013904223) >>> 0;
    return graine / 4294967296;
  };
  const ordre = PHRASES_JOURNAL.map((_, i) => i);
  for (let i = n - 1; i > 0; i--) {
    const j = Math.floor(suivant() * (i + 1));
    [ordre[i], ordre[j]] = [ordre[j], ordre[i]];
  }
  return PHRASES_JOURNAL[ordre[rang]];
};

/** Adresse d'un lieu, ouverte dans un nouvel onglet. */
function LienLieu({ url, nom }) {
  const complet = /^https?:\/\//i.test(url) ? url : "https://" + url;
  return (
    <a
      href={complet}
      target="_blank"
      rel="noopener noreferrer"
      style={{ color: "var(--encre)", textDecoration: "underline", textUnderlineOffset: 3, textDecorationColor: "var(--or)" }}
    >
      Ouvrir ↗
    </a>
  );
}

function VueJournal({ mobile, wrap, sessions, setSessions, reglages, proteger, codeDefini, lieuxInfos, setLieuxInfos, hauteurEntete, vue, setVue }) {
  /* Rendement d'un résultat net, rapporté aux sommes engagées. */
  const pourcent = (net, depot) =>
    depot > 0
      ? `${net > 0 ? "+" : net < 0 ? "−" : ""}${Math.abs((net / depot) * 100).toFixed(1).replace(".", ",")} %`
      : null;
  const maintenant = () => {
    const d = new Date();
    d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
    const iso = d.toISOString();
    return { date: iso.slice(0, 10), heure: iso.slice(11, 16) };
  };
  const [date, setDate] = useState(() => maintenant().date);
  const [heure, setHeure] = useState(() => maintenant().heure);
  const [depot, setDepot] = useState("");
  const [retrait, setRetrait] = useState("");
  const [mains, setMains] = useState("");
  const [mise, setMise] = useState("");
  const [lieu, setLieu] = useState("");
  const [granularite, setGranularite] = useState("jour");
  const [alerte, setAlerte] = useState("");
  const [messageExport, setExport] = useState("");
  const [aSupprimer, setASupprimer] = useState(null);
  const [enCours, setEnCours] = useState(null);
  const [details, setDetails] = useState(false);

  const [vueGraphique, setVueGraphique] = useState("barres");
  const [filtrePeriode, setFiltrePeriode] = useState("tout");
  const [filtreLieu, setFiltreLieu] = useState("tous");
  const [debut, setDebut] = useState("");
  const [fin, setFin] = useState("");

  const lieux = useMemo(
    () => [...new Set(sessions.map((s) => (s.lieu || "").trim()).filter(Boolean))].sort(),
    [sessions]
  );

  const [gererLieux, setGererLieux] = useState(false);

  /* Plafond de dépôt hebdomadaire des sites de jeu belges : 200 € par site,
     sur une fenêtre glissante. Chaque dépôt se libère exactement sept jours
     après avoir été fait. */
  const PLAFOND_SITE = 200;
  /* Un dépôt sort de la fenêtre exactement sept jours après avoir été fait :
     le calcul doit donc suivre l'horloge, pas seulement les données. */
  const [minute, setMinute] = useState(() => Date.now());
  useEffect(() => {
    const t = setInterval(() => setMinute(Date.now()), 60000);
    return () => clearInterval(t);
  }, []);

  const suiviLieux = useMemo(() => {
    const maintenant = minute;
    const semaine = 7 * 24 * 3600 * 1000;
    return lieux.map((nom) => {
      const fiche = lieuxInfos?.[nom] ?? {};
      const plafond = fiche.plafond ?? PLAFOND_SITE;
      const recents = sessions
        .filter((x) => (x.lieu || "").trim() === nom && maintenant - new Date(x.date).getTime() < semaine)
        .sort((a, b) => new Date(a.date) - new Date(b.date));
      const engage = recents.reduce((a, x) => a + x.depot, 0);
      /* Chaque dépôt libère sa propre place, sept jours après. Plusieurs
         peuvent tomber le même jour : on les regroupe par date. */
      const parEcheance = new Map();
      for (const x of recents) {
        if (!x.depot) continue;
        const quand = new Date(new Date(x.date).getTime() + semaine);
        const cle = jourCourt(quand);
        if (!parEcheance.has(cle)) parEcheance.set(cle, { date: quand, montant: 0 });
        parEcheance.get(cle).montant += x.depot;
      }
      const liberations = [...parEcheance.values()].sort((a, b) => a.date - b.date);
      const prochaine = liberations[0] ?? null;
      return {
        nom,
        type: fiche.type ?? "physique",
        plafond,
        // « circus.be » saisi sans protocole ne serait pas un lien valide.
        lien: fiche.lien ? (/^https?:\/\//i.test(fiche.lien) ? fiche.lien : "https://" + fiche.lien) : "",
        engage,
        restant: Math.max(0, plafond - engage),
        prochaine,
        liberations,
      };
    });
  }, [lieux, sessions, lieuxInfos, minute]);

  /* Triés par marge décroissante : en tête, les sites où l'on peut encore
     déposer. À marge égale — notamment quand tout est épuisé — c'est la
     libération la plus proche qui passe devant, puisqu'elle dit où rejouer
     en premier. */
  const sites = suiviLieux
    .filter((l) => l.type === "site")
    .sort(
      (a, b) =>
        b.restant - a.restant ||
        (a.prochaine?.date.getTime() ?? Infinity) - (b.prochaine?.date.getTime() ?? Infinity) ||
        a.nom.localeCompare(b.nom)
    );
  const totalDisponible = Math.round(sites.reduce((a, l) => a + l.restant, 0));


  const majLieu = (nom, cle, valeur) =>
    setLieuxInfos((o) => ({ ...o, [nom]: { ...(o?.[nom] ?? {}), [cle]: valeur } }));

  // Filtre par période, appliqué avant le filtre par lieu
  const parPeriode = useMemo(() => {
    if (filtrePeriode === "tout") return sessions;
    if (filtrePeriode === "perso") {
      const d = debut ? new Date(debut + "T00:00") : null;
      const f = fin ? new Date(fin + "T23:59") : null;
      return sessions.filter((s) => {
        const q = new Date(s.date);
        return (!d || q >= d) && (!f || q <= f);
      });
    }
    /* Bornes en jours pleins, comme les blocs du graphique : une session ne
       doit pas entrer ou sortir du filtre selon l'heure de consultation. */
    const jours = Number(filtrePeriode);
    const seuil = minuitAujourdhui();
    seuil.setDate(seuil.getDate() - (jours - 1));
    return sessions.filter((s) => new Date(s.date) >= seuil);
  }, [sessions, filtrePeriode, debut, fin]);

  const visibles = useMemo(
    () => {
      if (filtreLieu === "tous") return parPeriode;
      /* « type:site » retient tous les lieux de ce type ; sinon c'est un nom. */
      if (filtreLieu.startsWith("type:")) {
        const voulu = filtreLieu.slice(5);
        return parPeriode.filter(
          (s) => (lieuxInfos?.[(s.lieu || "").trim()]?.type ?? "physique") === voulu
        );
      }
      return parPeriode.filter((s) => (s.lieu || "").trim() === filtreLieu);
    },
    [parPeriode, filtreLieu, lieuxInfos]
  );

  /* La liste s'ouvre sur les trois derniers jours ayant une séance, puis se
     déplie. Les en-têtes de semaine et de jour rendent une longue liste
     lisible. */
  const [toutAfficher, setToutAfficher] = useState(false);
  const [barreChoisie, setBarreChoisie] = useState(null);

  /* Sous-onglets : le filtre reste unique et commun aux trois.
     Analyse et Sessions sont des vues à part entière, comme les sous-onglets
     des autres pages — c'est la barre de navigation commune qui les porte, et
     le chemin de retour les traite comme tout le reste. */
  const onglet = vue === "journal_sessions" ? "sessions" : "analyse";
  const setOnglet = (v) => setVue(v === "sessions" ? "journal_sessions" : "journal");
  const barreOnglets = useRef(null);
  const zoneFiltres = useRef(null);
  const zoneRappel = useRef(null);
  const contenuRappel = useRef(null);
  const rangeeOnglets = useRef(null);

  /* Balayage horizontal pour passer d'un onglet à l'autre. On ne réagit qu'aux
     gestes nettement horizontaux, sinon un défilement vertical un peu oblique
     changerait d'onglet sous les doigts. */
  const ONGLETS = ["analyse", "sessions"];
  /* Bouton et balayage passent par ici : sans quoi l'un remonterait en haut et
     l'autre non. */
  /* Aucun registre de retour ici : le chemin commun s'en charge, comme pour
     les sous-onglets de « À la table » et de « Comprendre ». */

  const allerOnglet = (v) => {
    /* Saut direct, sans animation : le contenu change entièrement, glisser le
       long d'une page qu'on quitte n'a rien à montrer. Les panneaux ouverts se
       referment — on ne revient pas sur un onglet à moitié déplié. */
    /* On remonte AVANT de changer d'onglet. Sinon le navigateur peint une
       image du nouveau contenu à l'ancienne position, et cette image se voit
       comme une remontée. */
    window.scrollTo(0, 0);
    setOnglet(v);
    setLieuOuvert(null);
    setSiteOuvert(null);
    setGererLieux(false);
    setDetails(false);
  };
  const geste = useRef(null);
  const debutGeste = (e) => {
    const t = e.touches?.[0];
    geste.current = t ? { x: t.clientX, y: t.clientY } : null;
  };
  const finGeste = (e) => {
    const d = geste.current;
    const t = e.changedTouches?.[0];
    geste.current = null;
    if (!d || !t) return;
    const dx = t.clientX - d.x;
    const dy = t.clientY - d.y;
    if (Math.abs(dx) < 60 || Math.abs(dx) < Math.abs(dy) * 1.8) return;
    const i = ONGLETS.indexOf(onglet) + (dx < 0 ? 1 : -1);
    if (i >= 0 && i < ONGLETS.length) allerOnglet(ONGLETS[i]);
  };

  /* Le rappel se déplie progressivement, à mesure que le panneau de filtres
     quitte l'écran : 0 tant qu'il est entier, 1 quand il est sorti. Le filtre
     étant commun aux trois onglets, la règle vaut partout. Les styles sont
     écrits directement, sans repasser par React — sinon le journal se
     redessinerait à chaque image. */
  useEffect(() => {
    const r = zoneRappel.current;
    if (!r) return;
    const doux = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    /* Une seule progression pour les deux : les onglets se compriment pendant
       que le rappel s'ouvre, si bien que la barre garde à peu près sa hauteur.
       Le texte du rappel n'apparaît qu'une fois la place suffisante, sinon on
       le verrait tranché en deux. */
    const peindre = (a) => {
      /* Le rappel prend de la largeur entre les deux onglets ; la hauteur de la
         barre ne bouge pas. Le texte n'apparaît qu'une fois la place suffisante. */
      r.style.flexBasis = (56 * a).toFixed(1) + "%";
      const c = contenuRappel.current;
      if (c) c.style.opacity = Math.max(0, (a - 0.5) / 0.5).toFixed(2);
    };
    const suivre = () => {
      const z = zoneFiltres.current;
      if (!z) return;
      const { bottom, height } = z.getBoundingClientRect();
      const parcouru = Math.min(Math.max((height + 56 - bottom) / Math.max(height, 1), 0), 1);
      peindre(doux ? (parcouru > 0.5 ? 1 : 0) : parcouru);
    };
    suivre();
    window.addEventListener("scroll", suivre, { passive: true });
    window.addEventListener("resize", suivre);
    return () => {
      window.removeEventListener("scroll", suivre);
      window.removeEventListener("resize", suivre);
    };
  }, [onglet]);

  /* Les clés de bloc se répètent d'une granularité à l'autre : sans remise à
     zéro, le premier appui après un changement désélectionnerait. */
  useEffect(() => setBarreChoisie(null), [granularite, vueGraphique]);
  const [siteOuvert, setSiteOuvert] = useState(null);
  const [saisieOuverte, setSaisieOuverte] = useState(false);
  const panneauSaisie = useRef(null);
  const empreinte = useRef(null);
  const [abandonDemande, setAbandonDemande] = useState(null);
  /* Champ actif avant l'ouverture de la fenêtre : on y revient sans laisser le
     navigateur faire défiler la page pour l'amener à l'écran. */
  const focusAvant = useRef(null);
  const champsActuels = () => JSON.stringify([date, heure, depot, retrait, mains, mise, lieu]);

  /* Fermer une correction : direct si rien n'a bougé, sinon un appui de plus.
     Le crayon et le bouton Annuler passent tous deux par ici. */
  const fermerCorrection = (id) => {
    const cle = id ?? "saisie";
    if (empreinte.current && champsActuels() !== empreinte.current && abandonDemande !== cle) {
      focusAvant.current = document.activeElement;
      setAbandonDemande(cle);
      return;
    }
    /* On reste où l'on est : abandonner n'est pas une raison de se déplacer. */
    annulerModification();
    setSaisieOuverte(false);
  };

  /* À l'ouverture, le formulaire se centre à l'écran ; à la fermeture, on
     remonte en haut du journal plutôt que de rester devant un panneau replié. */
  const basculerSaisie = () => {
    const ouvrir = !saisieOuverte;
    if (!ouvrir) return fermerCorrection(null); // même garde qu'une correction
    /* Les champs sont remis à l'instant présent ET l'empreinte prise sur ces
       mêmes valeurs : sans cela, une minute écoulée depuis l'ouverture de
       l'application suffisait à faire croire à une saisie en cours. */
    const m = maintenant();
    setDate(m.date);
    setHeure(m.heure);
    setDepot("");
    setRetrait("");
    setMains("");
    setMise("");
    setLieu("");
    empreinte.current = JSON.stringify([m.date, m.heure, "", "", "", "", ""]);
    setSaisieOuverte(true);
    amener(panneauSaisie.current);
  };

  /* Un appui ailleurs alors qu'un formulaire est ouvert et modifié : on
     demande confirmation plutôt que de laisser la saisie disparaître. */
  const zoneFormulaire = useRef(null);
  useEffect(() => {
    if (!saisieOuverte && enCours === null) return;
    const dehors = (e) => {
      if (zoneFormulaire.current?.contains(e.target)) return;
      if (e.target.closest?.("[role='dialog']")) return; // la fenêtre elle-même
      /* Les paramètres se superposent : ils ne referment pas le formulaire. */
      if (e.target.closest?.("[data-superpose]")) return;
      /* La croix du formulaire ouvert est son bouton de fermeture, pas une
         action ailleurs : la laisser passer, sinon le garde referme et le
         bouton rouvre dans la foulée. */
      if (e.target.closest?.("[data-ferme-correction]")) return;
      if (!e.target.closest?.("button, a, input, select, textarea, label, [role='button']")) return;
      /* Rien de saisi : on referme sans rien demander, l'appui suit son cours. */
      if (!empreinte.current || champsActuels() === empreinte.current) {
        annulerModification();
        setSaisieOuverte(false);
        return;
      }
      focusAvant.current = document.activeElement;
      /* En phase de capture : on arrête l'appui avant qu'il n'agisse, sinon la
         saisie aurait déjà disparu quand la fenêtre s'ouvre. */
      e.preventDefault();
      e.stopPropagation();
      setAbandonDemande(enCours ?? "saisie");
    };
    /* Les menus déroulants et les sélecteurs de date s'ouvrent dès le contact,
       avant le clic : leur fenêtre native se poserait au-dessus de la nôtre.
       On les arrête donc plus tôt, eux seuls. */
    const auContact = (e) => {
      if (!e.target.closest?.("select, input[type='date'], input[type='time']")) return;
      dehors(e);
    };
    document.addEventListener("pointerdown", auContact, true);
    document.addEventListener("click", dehors, true);
    return () => {
      document.removeEventListener("pointerdown", auContact, true);
      document.removeEventListener("click", dehors, true);
    };
  }, [saisieOuverte, enCours, date, heure, depot, retrait, mains, mise, lieu]);
  const { aAfficher, coupures, restants: sessionsMasquees } = useMemo(() => {
    const jour = (d) => jourCourt(new Date(d));
    const jours = [...new Set(visibles.map((x) => jour(x.date)))];
    const gardes = toutAfficher ? jours : jours.slice(0, 3);
    const liste = visibles.filter((x) => gardes.includes(jour(x.date)));

    const nomsJours = ["dimanche", "lundi", "mardi", "mercredi", "jeudi", "vendredi", "samedi"];
    const mois = ["janvier", "février", "mars", "avril", "mai", "juin", "juillet", "août", "septembre", "octobre", "novembre", "décembre"];
    // Lundi de la semaine contenant cette date
    const lundi = (d) => {
      const q = new Date(d);
      q.setHours(0, 0, 0, 0);
      q.setDate(q.getDate() - ((q.getDay() + 6) % 7));
      return q;
    };
    const libelleSemaine = (d) => {
      const a = lundi(d);
      const b = new Date(a);
      b.setDate(b.getDate() + 6);
      const auj = lundi(new Date());
      if (a.getTime() === auj.getTime()) return "Cette semaine";
      if (a.getTime() === auj.getTime() - 7 * 24 * 3600 * 1000) return "Semaine dernière";
      return `Semaine du ${a.getDate()} ${mois[a.getMonth()]}${a.getMonth() !== b.getMonth() ? "" : ""} au ${b.getDate()} ${mois[b.getMonth()]}`;
    };
    const libelleJour = (d) => {
      const q = new Date(d);
      const h = new Date(); h.setHours(0, 0, 0, 0);
      const j = new Date(q); j.setHours(0, 0, 0, 0);
      const ecart = Math.round((h - j) / (24 * 3600 * 1000));
      if (ecart === 0) return "Aujourd'hui";
      if (ecart === 1) return "Hier";
      return `${nomsJours[q.getDay()]} ${q.getDate()} ${mois[q.getMonth()]}`;
    };

    const marques = new Map();
    let semaineCourante = null, jourCourant = null;
    for (const x of liste) {
      const sem = lundi(x.date).getTime();
      const j = jour(x.date);
      const e = {};
      if (sem !== semaineCourante) { e.semaine = libelleSemaine(x.date); semaineCourante = sem; }
      if (j !== jourCourant) { e.jour = libelleJour(x.date); jourCourant = j; }
      if (e.semaine || e.jour) marques.set(x.id, e);
    }
    return { aAfficher: liste, coupures: marques, restants: visibles.length - liste.length };
  }, [visibles, toutAfficher]);
  const filtreActif = filtrePeriode !== "tout" || filtreLieu !== "tous";
  /* Abrégé : le rappel n'a que la moitié de la barre, entre les deux onglets. */
  const rappelFiltre = useMemo(() => {
    const p = { tout: "Tout", perso: "Dates", 7: "7 j", 28: "1 mois", 84: "3 mois", 168: "6 mois", 336: "1 an" }[filtrePeriode] ?? filtrePeriode;
    const l =
      filtreLieu === "tous"
        ? "tous lieux"
        : filtreLieu === "type:site"
        ? "sites"
        : filtreLieu === "type:physique"
        ? "casinos"
        : filtreLieu.length > 10
        ? filtreLieu.slice(0, 9) + "…"
        : filtreLieu;
    return `${p} · ${l}`;
  }, [filtrePeriode, filtreLieu]);
  const fichier = useRef(null);

  const importer = (evt) => {
    const f = evt.target.files && evt.target.files[0];
    if (!f) return;
    const lecteur = new FileReader();
    lecteur.onload = () => {
      const { sessions: lues, erreur, ignorees } = analyserCSV(String(lecteur.result));
      if (erreur) { setExport("erreur:" + erreur); return; }
      const cle = (s) => `${s.date}|${s.depot}|${s.retrait}`;
      const connues = new Set(sessions.map(cle));
      const nouvelles = lues.filter((s) => !connues.has(cle(s)));
      if (nouvelles.length) {
        setSessions((liste) => [...liste, ...nouvelles].sort((a, b) => new Date(b.date) - new Date(a.date)));
      }
      const doublons = lues.length - nouvelles.length;
      setExport(
        "import:" +
          `${nouvelles.length} session${nouvelles.length > 1 ? "s" : ""} importée${nouvelles.length > 1 ? "s" : ""}` +
          (doublons ? `, ${doublons} déjà présente${doublons > 1 ? "s" : ""}` : "") +
          (ignorees ? `, ${ignorees} ligne${ignorees > 1 ? "s" : ""} illisible${ignorees > 1 ? "s" : ""}` : "") +
          "."
      );
    };
    lecteur.readAsText(f, "utf-8");
    evt.target.value = "";
  };

  const ajouter = () => {
    const d = parseFloat(String(depot).replace(",", "."));
    const r = parseFloat(String(retrait).replace(",", "."));
    if (!isFinite(d) || !isFinite(r) || d < 0 || r < 0) {
      setAlerte("Indiquez deux montants positifs, en euros.");
      return;
    }
    setAlerte("");
    const nbMains = parseInt(String(mains).replace(/\D/g, ""), 10);
    const miseMoy = parseFloat(String(mise).replace(",", "."));
    const fiche = {
      id: enCours ?? Date.now(),
      date: new Date(`${date}T${heure || "00:00"}`).toISOString(),
      depot: d,
      retrait: r,
      lieu: lieu.trim(),
      ...(isFinite(nbMains) && nbMains > 0 ? { mains: nbMains } : {}),
      ...(isFinite(miseMoy) && miseMoy > 0 ? { mise: miseMoy } : {}),
    };
    setSessions((liste) =>
      (enCours ? liste.map((x) => (x.id === enCours ? fiche : x)) : [...liste, fiche]).sort(
        (a, b) => new Date(b.date) - new Date(a.date)
      )
    );
    /* Après une correction, on revient sur la ligne modifiée ; après un ajout,
       en haut du journal, où le résultat net vient de changer. */
    const corrige = enCours;
    setEnCours(null);
    setSaisieOuverte(false);
    requestAnimationFrame(() => {
      const ligne = corrige && document.getElementById(`bjt-session-${corrige}`);
      if (ligne) amener(ligne);
      else glisserVers(0);
    });
    setDepot("");
    setRetrait("");
    setMains("");
    setMise("");
    setLieu("");
  };

  /** Recharge une session dans le formulaire pour la corriger. */
  const modifier = (s) => {
    const d = new Date(s.date);
    d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
    const iso = d.toISOString();
    setEnCours(s.id);
    setDate(iso.slice(0, 10));
    setHeure(iso.slice(11, 16));
    setDepot(String(s.depot));
    setRetrait(String(s.retrait));
    setMains(s.mains ? String(s.mains) : "");
    setMise(s.mise ? String(s.mise) : "");
    setLieu(s.lieu || "");
    setAlerte("");
    setAbandonDemande(null);
    empreinte.current = JSON.stringify([
      iso.slice(0, 10),
      iso.slice(11, 16),
      String(s.depot),
      String(s.retrait),
      s.mains ? String(s.mains) : "",
      s.mise ? String(s.mise) : "",
      s.lieu || "",
    ]);
    /* Le panneau de correction s'ouvre sous la ligne : on le centre pour
       éviter qu'il ne s'ouvre hors de l'écran. */
    requestAnimationFrame(() => amener(document.getElementById(`bjt-session-${s.id}`)));
  };

  const annulerModification = () => {
    setAbandonDemande(null);
    empreinte.current = null;
    setEnCours(null);
    setDepot(""); setRetrait(""); setMains(""); setMise(""); setLieu("");
    const m = maintenant();
    setDate(m.date); setHeure(m.heure);
  };

  const supprimer = (id) => setSessions((liste) => liste.filter((s) => s.id !== id));

  /* Avec un code, il remplace la confirmation en deux temps ; sans code, la
     confirmation reste, pour qu'un doigt mal placé ne suffise jamais. */
  const demanderSuppression = (id) => {
    if (codeDefini) { proteger(() => supprimer(id)); return; }
    if (aSupprimer === id) { supprimer(id); setASupprimer(null); }
    else setASupprimer(id);
  };

  const totalDepot = visibles.reduce((a, s) => a + s.depot, 0);
  const totalRetrait = visibles.reduce((a, s) => a + s.retrait, 0);
  const net = totalRetrait - totalDepot;

  /* Statistiques fines, calculées sur les sessions visibles après filtrage. */
  const stats = useMemo(() => {
    const soldes = visibles.map((s) => s.retrait - s.depot);
    if (!soldes.length) {
      return { gagnantes: 0, perdantes: 0, nulles: 0, meilleure: 0, pireSession: 0, ecartType: 0, miseMoyenne: null, mainsTotales: 0 };
    }
    const moyenne = soldes.reduce((a, b) => a + b, 0) / soldes.length;
    const variance = soldes.reduce((a, b) => a + (b - moyenne) ** 2, 0) / soldes.length;
    const avecMise = visibles.filter((s) => s.mise > 0 && s.mains > 0);
    const mains = avecMise.reduce((a, s) => a + s.mains, 0);
    return {
      gagnantes: soldes.filter((v) => v > 0).length,
      perdantes: soldes.filter((v) => v < 0).length,
      nulles: soldes.filter((v) => v === 0).length,
      meilleure: Math.max(...soldes),
      pireSession: Math.min(...soldes),
      ecartType: Math.sqrt(variance),
      miseMoyenne: mains ? avecMise.reduce((a, s) => a + s.mise * s.mains, 0) / mains : null,
      mainsTotales: mains,
    };
  }, [visibles]);
  const { gagnantes, perdantes, nulles, meilleure, pireSession, ecartType, miseMoyenne, mainsTotales } = stats;
  const groupes = useMemo(() => regrouper(visibles, granularite), [visibles, granularite]);
  // Plafond de perte sur la période en cours
  const plafond = reglages?.plafondPerte ?? 0;
  const periode = reglages?.periodePlafond ?? "semaine";
  const alertePlafond = (() => {
    if (!plafond) return null;
    const maintenant = new Date();
    const cle = periode === "mois" ? cleMois : cleSemaine;
    const courante = cle(maintenant);
    const net = sessions
      .filter((s) => cle(new Date(s.date)) === courante)
      .reduce((a, s) => a + (s.retrait - s.depot), 0);
    if (net >= 0) return null;
    return { perte: -net, part: (-net / plafond) * 100 };
  })();

  // Résultats par lieu
  const parLieu = (() => {
    const m = new Map();
    for (const s of parPeriode) {
      const l = (s.lieu || "Sans lieu").trim() || "Sans lieu";
      if (!m.has(l)) m.set(l, { lieu: l, n: 0, net: 0, engage: 0, retire: 0, soldes: [], mains: 0, miseTotale: 0, premiere: null, derniere: null });
      const g = m.get(l);
      const solde = s.retrait - s.depot;
      g.n += 1;
      g.net += solde;
      g.engage += s.depot;
      g.retire += s.retrait;
      g.soldes.push(solde);
      if (s.mains > 0 && s.mise > 0) {
        g.mains += s.mains;
        g.miseTotale += s.mise * s.mains;
      }
      const t = new Date(s.date).getTime();
      if (!g.premiere || t < g.premiere) g.premiere = t;
      if (!g.derniere || t > g.derniere) g.derniere = t;
    }
    return [...m.values()]
      .map((g) => ({
        ...g,
        gagnantes: g.soldes.filter((v) => v > 0).length,
        perdantes: g.soldes.filter((v) => v < 0).length,
        nulles: g.soldes.filter((v) => v === 0).length,
        meilleure: Math.max(...g.soldes),
        pire: Math.min(...g.soldes),
        miseMoyenne: g.mains ? g.miseTotale / g.mains : null,
      }))
      .sort((a, b) => b.n - a.n);
  })();

  /* Le tableau par lieu se limite au type demandé. Un lieu sans réglage est
     considéré comme un casino, valeur par défaut. */
  const [filtreType, setFiltreType] = useState("tous");
  const [lieuOuvert, setLieuOuvert] = useState(null);

  /* Ce que le bouton retour referme, dans cet ordre : la fenêtre, le
     formulaire, puis le dernier panneau déplié. */
  useEffect(() => {
    poserRetour("panneau-details", details, () => setDetails(false));
  }, [details]);
  useEffect(() => {
    poserRetour("panneau-lieu", lieuOuvert !== null, () => setLieuOuvert(null));
  }, [lieuOuvert]);
  useEffect(() => {
    poserRetour("panneau-site", siteOuvert !== null, () => setSiteOuvert(null));
  }, [siteOuvert]);
  useEffect(() => {
    poserRetour("panneau-reglages", gererLieux, () => setGererLieux(false));
  }, [gererLieux]);
  useEffect(() => {
    /* Vide, le formulaire se referme au retour. Modifié, le retour ouvre la
       confirmation : il faut alors trancher, car quitter la page détruirait la
       saisie. Le retour ne peut pas franchir ce point tout seul — c'est
       voulu. */
    poserRetour("formulaire", saisieOuverte || enCours !== null, () => fermerCorrection(enCours));
  }, [saisieOuverte, enCours, date, heure, depot, retrait, mains, mise, lieu]);
  useEffect(() => {
    /* La fenêtre passe en dernier : c'est elle qu'on referme en premier. */
    poserRetour("fenetre", abandonDemande !== null, () => {
      setAbandonDemande(null);
      const el = focusAvant.current;
      focusAvant.current = null;
      requestAnimationFrame(() => {
        amener(zoneFormulaire.current);
        if (el && el.isConnected) el.focus({ preventScroll: true });
      });
    });
  }, [abandonDemande]);

  /* Les réglages se referment quand on agit ailleurs — sur un bouton, un champ
     ou un lien. Un appui dans le vide ne les ferme pas : ce n'est pas une
     action, et fermer là serait déroutant. */
  const zoneReglages = useRef(null);
  /* Vrai le temps d'un geste qui referme un panneau : le contenu au-dessus
     disparaît alors, et tout défilement calculé avant ce repli viserait à
     côté. Les panneaux ouverts dans le même geste s'abstiennent donc. */
  const replieEnCours = useRef(false);

  /* Un seul panneau de détail ouvert à la fois, et il se referme dès qu'on
     agit ailleurs — y compris dans un autre cadre. */
  useEffect(() => {
    if (lieuOuvert === null && siteOuvert === null) return;
    const dehors = (e) => {
      /* Les paramètres se superposent au journal : ils ne le referment pas. */
      if (e.target.closest?.("[data-superpose]")) return;
      const dans = e.target.closest?.("[data-panneau]");
      if (dans && dans.dataset.panneau === (lieuOuvert !== null ? "lieu" : "site")) return;
      if (!e.target.closest?.("button, a, input, select, textarea, label, [role='button']")) return;
      replieEnCours.current = true;
      replierSansSaut(() => {
        setLieuOuvert(null);
        setSiteOuvert(null);
      });
      setTimeout(() => {
        replieEnCours.current = false;
      }, 400);
    };
    document.addEventListener("click", dehors, true);
    return () => document.removeEventListener("click", dehors, true);
  }, [lieuOuvert, siteOuvert]);

  useEffect(() => {
    if (!gererLieux) return;
    const dehors = (e) => {
      if (zoneReglages.current?.contains(e.target)) return;
      if (e.target.closest?.("[data-superpose]")) return;
      const agissant = e.target.closest?.("button, a, input, select, textarea, label, [role='button']");
      if (agissant) {
        replieEnCours.current = true;
        replierSansSaut(() => setGererLieux(false));
        setTimeout(() => {
          replieEnCours.current = false;
        }, 400);
      }
    };
    /* Sur « click » et non « pointerdown » : fermer dès le contact déplaçait la
       page sous le doigt et l'appui se perdait. En phase de capture, pour que
       le drapeau soit posé avant que le bouton visé ne réagisse — sinon il
       défilerait vers une position que le repli est en train de périmer. */
    document.addEventListener("click", dehors, true);
    return () => document.removeEventListener("click", dehors, true);
  }, [gererLieux]);
  const parLieuFiltre =
    filtreType === "tous"
      ? parLieu
      : parLieu.filter((l) => (lieuxInfos?.[l.lieu]?.type ?? "physique") === filtreType);

  const mesurables = visibles.filter((s) => s.mains > 0 && s.mise > 0);
  const mesure = mesurables.length
    ? (() => {
        const engage = mesurables.reduce((a, s) => a + s.mains * s.mise, 0);
        const net = mesurables.reduce((a, s) => a + (s.retrait - s.depot), 0);
        return { sessions: mesurables.length, mains: mesurables.reduce((a, s) => a + s.mains, 0), engage, net, taux: (net / engage) * 100 };
      })()
    : null;

  const styleChamp = {
    width: "100%",
    padding: "10px 11px",
    fontSize: 15,
    fontFamily: "inherit",
    color: "var(--encre)",
    background: "var(--panneau)",
    border: "1px solid var(--regle)",
    borderRadius: 3,
  };

  /* Seuls chiffres et un séparateur décimal passent ; le reste est écarté à la
     frappe. La virgule est conservée telle qu'elle est tapée — l'enregistrement
     la convertit — pour ne pas transformer « 12,50 » en « 12.50 » sous les
     doigts. */
  const filtrerNombre = (v, entier) => {
    const t = v.replace(/[^\d.,]/g, "");
    if (entier) return t.replace(/[.,]/g, "");
    const i = t.search(/[.,]/);
    return i === -1 ? t : t.slice(0, i + 1) + t.slice(i + 1).replace(/[.,]/g, "");
  };

  const champ = (etiquette, valeur, set, suffixe, facultatif, entier) => (
    <label style={{ display: "block" }}>
      <div style={{ ...S.eyebrow, marginBottom: 5 }}>
        {etiquette}
        {facultatif && (
          <span style={{ textTransform: "none", letterSpacing: 0, fontWeight: 400 }}> (facultatif)</span>
        )}
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
        <input
          inputMode={entier ? "numeric" : "decimal"}
          autoComplete="off"
          value={valeur}
          onChange={(e) => set(filtrerNombre(e.target.value, entier))}
          style={styleChamp}
        />
        {suffixe && <span className="mono" style={{ fontSize: 13, color: "var(--encre2)" }}>{suffixe}</span>}
      </div>
    </label>
  );

  return (
    <div style={wrap}>
      <div style={{ padding: mobile ? "22px 0 18px" : "40px 0 22px", maxWidth: 640 }}>
        <div style={S.eyebrow}>Journal</div>
        <h1 style={{ fontSize: "clamp(26px,6.4vw,44px)", lineHeight: 1.04, margin: "10px 0 12px", fontWeight: 700 }}>
          Vos sessions
        </h1>
        <p style={{ fontSize: mobile ? 15 : 16, lineHeight: 1.62, color: "var(--encre2)", margin: 0 }}>
          {PHRASE_DU_JOUR()}
        </p>
      </div>

      <div ref={zoneFiltres} style={{ ...S.panneau, padding: mobile ? "13px 14px" : "15px 18px", marginBottom: 12 }}>
        {/* Les deux menus tiennent sur une ligne, même sur téléphone : le
            panneau reste bas, donc le rappel se déplie moins souvent. */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: mobile ? 8 : 10 }}>
          <label>
            <div style={{ fontSize: 11.5, fontWeight: 600, color: "var(--encre2)", marginBottom: 5 }}>Période</div>
            <select
              value={filtrePeriode}
              onChange={(e) => setFiltrePeriode(e.target.value)}
              style={{
                width: "100%",
                padding: mobile ? "10px 8px" : "10px 11px",
                fontSize: mobile ? 13.5 : 15,
                fontFamily: "inherit",
                color: "var(--encre)",
                background: "var(--panneau)",
                border: "1px solid var(--regle)",
                borderRadius: 3,
              }}
            >
              {/* Mêmes durées que les périodes du graphique : des
                  multiples de 28 jours, pour que filtre et blocs
                  s'accordent. */}
              <option value="tout">Depuis le début</option>
              <option value="7">7 derniers jours</option>
              <option value="28">1 mois (28 j)</option>
              <option value="84">3 mois (84 j)</option>
              <option value="168">6 mois (168 j)</option>
              <option value="336">1 an (336 j)</option>
              <option value="perso">Dates précises…</option>
            </select>
          </label>
            {filtrePeriode === "perso" && (
              /* Sous le menu qui les fait apparaître, pas sous « Lieu ». */
              <div className="bjc-pop" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginTop: 8 }}>
                <label>
                  <div style={{ ...S.eyebrow, marginBottom: 4 }}>Du</div>
                  <input type="date" value={debut} onChange={(e) => setDebut(e.target.value)} style={{ ...styleChamp, padding: "8px 9px", fontSize: 13.5 }} />
                </label>
                <label>
                  <div style={{ ...S.eyebrow, marginBottom: 4 }}>Au</div>
                  <input type="date" value={fin} onChange={(e) => setFin(e.target.value)} style={{ ...styleChamp, padding: "8px 9px", fontSize: 13.5 }} />
                </label>
              </div>
            )}

          <label>
            <div style={{ fontSize: 11.5, fontWeight: 600, color: "var(--encre2)", marginBottom: 5 }}>Lieu</div>
            <select
              value={filtreLieu}
              onChange={(e) => setFiltreLieu(e.target.value)}
              disabled={!lieux.length}
              style={{
                width: "100%",
                padding: mobile ? "10px 8px" : "10px 11px",
                fontSize: mobile ? 13.5 : 15,
                fontFamily: "inherit",
                color: "var(--encre)",
                background: "var(--panneau)",
                border: "1px solid var(--regle)",
                borderRadius: 3,
              }}
            >
              <option value="tous">Tous les lieux</option>
              <option value="type:physique">Casinos seulement</option>
              <option value="type:site">Sites seulement</option>
              {lieux.map((l) => (
                <option key={l} value={l}>{l}</option>
              ))}
            </select>
          </label>
        </div>

        {filtreActif && (
          <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap", marginTop: 10 }}>
            <span style={{ fontSize: 13, color: "var(--encre2)" }}>
              {visibles.length === 0
                ? "Aucune session ne correspond."
                : `${visibles.length} session${visibles.length > 1 ? "s" : ""} retenue${visibles.length > 1 ? "s" : ""} sur ${sessions.length}.`}
            </span>
            <button
              onClick={() => { setFiltrePeriode("tout"); setFiltreLieu("tous"); setDebut(""); setFin(""); }}
              style={{ fontSize: 13, fontWeight: 600, color: "var(--encre2)", textDecoration: "underline", textUnderlineOffset: 2 }}
            >
              Tout afficher
            </button>
          </div>
        )}
      </div>


      {sessions.length > 0 && (
        <div onTouchStart={debutGeste} onTouchEnd={finGeste} style={{ touchAction: "pan-y" }}>
          {/* Sous-onglets du journal. Le filtre est commun aux trois : il vit
              dans « Général » et se rappelle dans la barre collée ci-dessous.
              Le balayage latéral fait passer d'un onglet au suivant. */}
          <div
            ref={barreOnglets}
            data-colle="1"
            style={{
              position: "sticky",
              /* Sous l'en-tête seul : le journal n'a pas de sous-navigation,
                 contrairement à Stratégie et Théorie. */
              top: hauteurEntete,
              zIndex: 12,
              background: "var(--papier)",
              borderBottom: "1px solid var(--regle)",
              marginBottom: 12,
            }}
          >
            {/* Le rappel se glisse entre les deux onglets : la barre garde sa
                hauteur, seule la largeur se redistribue au fil du défilement. */}
            <div ref={rangeeOnglets} style={{ display: "flex", alignItems: "stretch", paddingTop: 6 }}>
              {[["analyse", "Analyse"], ["sessions", "Sessions"]].map(([v, l], i) => (
                <React.Fragment key={v}>
                  {i === 1 && (
                    <button
                      ref={zoneRappel}
                      onClick={() => requestAnimationFrame(() => glisserVers(0))}
                      style={{
                        flex: "0 0 0%",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        overflow: "hidden",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {/* Deux lignes serrées, tenant dans la hauteur d'un onglet :
                          l'état du filtre, puis le résultat net qu'il produit. */}
                      <span
                        ref={contenuRappel}
                        style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 1, opacity: 0 }}
                      >
                        <span
                          className="mono"
                          style={{ fontSize: 10, lineHeight: 1.2, color: filtreActif ? "var(--or)" : "var(--encre2)" }}
                        >
                          {rappelFiltre} ↑
                        </span>
                        <span
                          className="mono"
                          style={{ fontSize: 11.5, fontWeight: 700, lineHeight: 1.2, color: teinte(net) }}
                        >
                          {eur(net)}
                          {totalDepot > 0 && (
                            <span style={{ fontWeight: 400, color: "var(--encre2)" }}> {pourcent(net, totalDepot)}</span>
                          )}
                          {filtreActif && (
                            <span style={{ fontWeight: 400, color: "var(--or)" }}>
                              {" "}· {visibles.length}/{sessions.length}
                            </span>
                          )}
                        </span>
                      </span>
                    </button>
                  )}
                  <button
                    onClick={() => allerOnglet(v)}
                    aria-current={onglet === v}
                    style={{
                      position: "relative",
                      flex: "1 1 0",
                      minWidth: 0,
                      padding: "11px 4px 10px",
                      fontSize: 12,
                      fontWeight: 700,
                      letterSpacing: ".09em",
                      textTransform: "uppercase",
                      color: onglet === v ? "var(--encre)" : "var(--encre2)",
                    }}
                  >
                    {l}
                    {onglet === v && (
                      <span
                        aria-hidden="true"
                        style={{ position: "absolute", left: 6, right: 6, bottom: -1, height: 2, background: "var(--encre)" }}
                      />
                    )}
                  </button>
                </React.Fragment>
              ))}
            </div>
          </div>

          {onglet === "analyse" && (
          <>
          <input
            ref={fichier}
            type="file"
            accept=".csv,text/csv"
            onChange={importer}
            style={{ display: "none" }}
          />

          {alertePlafond && (
            <div
              style={{
                ...S.panneau,
                borderLeft: `3px solid ${alertePlafond.part >= 100 ? "var(--rouge)" : "var(--or)"}`,
                background: alertePlafond.part >= 100 ? "var(--err-fond)" : "var(--panneau)",
                padding: mobile ? "13px 14px" : "15px 18px",
                marginBottom: 12,
                fontSize: 14.5,
                lineHeight: 1.55,
              }}
            >
              <b>
                {alertePlafond.part >= 100
                  ? "Plafond de perte dépassé."
                  : alertePlafond.part >= 70
                  ? "Plafond de perte bientôt atteint."
                  : "Perte en cours sur la période."}
              </b>{" "}
              {alertePlafond.perte.toFixed(0)} € perdus cette {periode === "mois" ? "mois-ci" : "semaine"}, sur un
              plafond de {plafond} € — soit {alertePlafond.part.toFixed(0)} %.
              {alertePlafond.part >= 100 && " Ce plafond est une limite que vous vous êtes fixée, pas un seuil à partir duquel la chance tournerait."}
            </div>
          )}

          <div
            style={{
              background: "var(--ecran)",
              border: "1px solid var(--ecran-bord)",
              color: "var(--ecran-texte)",
              borderRadius: 4,
              padding: mobile ? "16px 15px" : "20px 22px",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 7, flexWrap: "wrap" }}>
              <span style={{ ...S.eyebrow, fontSize: 10, color: "var(--ecran-sourd)" }}>RÉSULTAT NET</span>
              <Cartouche
                mot={net > 0 ? "gain" : net < 0 ? "perte" : null}
                fond={net > 0 ? "#1B6E2C" : "#8E1220"}
              />
            </div>
            <div
              className="mono"
              style={{
                fontSize: mobile ? 34 : 50,
                fontWeight: 700,
                lineHeight: 1.1,
                /* Montant et pourcentage tiennent sur une seule ligne, même
                   avec une somme à cinq chiffres. */
                whiteSpace: "nowrap",
                letterSpacing: "-.04em",
                /* Le montant reprend sa couleur : sur le fond d'instrument, le
                   vert et le rouge sont ceux du thème « écran », calibrés pour
                   ce fond — la lecture reste franche. Le cartouche double
                   l'information pour qui ne distingue pas les teintes. */
                color: teinte(net, "ecran-"),
              }}
            >
              {eur(net)}
              {totalDepot > 0 && (
                <span style={{ fontSize: mobile ? 15 : 21, color: "var(--ecran-sourd)", fontWeight: 700, letterSpacing: 0 }}>
                  {" "}
                  ({pourcent(net, totalDepot)})
                </span>
              )}
            </div>
            {/* Barre déposé / retiré : la proportion se lit plus vite que deux
                montants. Les quatre indicateurs sont résumés en dessous. */}
            <div style={{ marginTop: 14 }}>
              <div style={{ display: "flex", height: 7, borderRadius: 2, overflow: "hidden", background: "var(--ecran-neutre)" }}>
                {/* Gain : le dépôt, puis le surplus en vert. Perte : ce qui a été
                    récupéré, puis la part manquante en rouge. */}
                <div style={{ flex: Math.max(net >= 0 ? totalDepot : totalRetrait, 0.001), background: "var(--ecran-sourd)" }} />
                {net > 0 && <div style={{ flex: net, background: "var(--ecran-ok)" }} />}
                {net < 0 && <div style={{ flex: -net, background: "var(--ecran-rouge)" }} />}
              </div>
              <div
                className="mono"
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  gap: 12,
                  fontSize: 11.5,
                  fontWeight: 700,
                  color: "var(--ecran-sourd)",
                  marginTop: 6,
                }}
              >
                <span>déposé {eur(totalDepot).replace("+", "")}</span>
                <span>retiré {eur(totalRetrait).replace("+", "")}</span>
              </div>
              <div
                className="mono"
                style={{ fontSize: 11.5, fontWeight: 700, color: "var(--ecran-sourd)", marginTop: 8 }}
              >
                {visibles.length} session{visibles.length > 1 ? "s" : ""}
                {visibles.length > 0 && ` · ${eur(net / visibles.length)} en moyenne`}
              </div>
            </div>
          </div>

          <div style={{ ...S.panneau, padding: mobile ? "14px 15px" : "16px 18px", marginTop: 12 }}>
            <button
              onClick={(e) => { const o = !details; setDetails(o); if (o) amener(e.currentTarget.parentElement); }}
              aria-expanded={details}
              style={{ width: "100%", display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10, textAlign: "left" }}
            >
              <span style={S.eyebrow}>Plus de détails</span>
              <span className="mono" aria-hidden="true" style={{ fontSize: 15, color: "var(--encre2)" }}>
                {details ? "−" : "+"}
              </span>
            </button>

            {details && (
              <div className="bjc-pop" style={{ marginTop: 12 }}>
            {mesure && (
              <div style={{ borderLeft: "3px solid var(--or)", paddingLeft: 12, marginBottom: 14 }}>
              <div style={{ ...S.eyebrow, marginBottom: 9 }}>Rendement mesuré</div>
              <div style={{ display: "flex", alignItems: "baseline", gap: 12, flexWrap: "wrap" }}>
                <span
                  className="mono"
                  style={{ fontSize: mobile ? 30 : 36, fontWeight: 700, color: mesure.taux >= 0 ? "var(--ok)" : "var(--rouge)" }}
                >
                  {(mesure.taux >= 0 ? "+" : "−") + Math.abs(mesure.taux).toFixed(2).replace(".", ",")} %
                </span>
                <span className="mono" style={{ fontSize: 13, color: "var(--encre2)" }}>
                  sur {mesure.engage.toFixed(0)} € engagés · {mesure.mains} mains · {mesure.sessions} session
                  {mesure.sessions > 1 ? "s" : ""}
                </span>
              </div>
              <p style={{ fontSize: 13.5, lineHeight: 1.6, color: "var(--encre2)", margin: "10px 0 0" }}>
                {(() => {
                  const marge = (1.15 / Math.sqrt(mesure.mains)) * 100;
                  return mesure.mains < 20000
                    ? `Ce chiffre est encore dominé par le hasard : sur ${mesure.mains} mains, l'incertitude est de ±${marge.toFixed(1).replace(".", ",")} %, pour une espérance qui se joue autour de 0,5 %. Il faut plusieurs dizaines de milliers de mains pour qu'il devienne lisible.`
                    : `Avec ${mesure.mains} mains, l'incertitude tombe à ±${marge.toFixed(1).replace(".", ",")} %. En stratégie de base, une table courante coûte entre 0,4 et 0,6 % des sommes engagées ; un écart nettement plus défavorable suggère des erreurs de jeu ou des règles moins bonnes que prévu.`;
                })()}
              </p>
              </div>
            )}

                <div style={{ display: "grid", gap: 3 }}>
                  {[
                    ["Sessions gagnantes", repartition(gagnantes, visibles.length)],
                    ["Sessions perdantes", repartition(perdantes, visibles.length)],
                    ...(nulles ? [["Sessions nulles", repartition(nulles, visibles.length)]] : []),
                    ["Meilleure session", eur(meilleure)],
                    ["Pire session", eur(pireSession)],
                    ["Écart type par session", eur(ecartType)],
                    ["Mise moyenne relevée", miseMoyenne ? `${miseMoyenne.toFixed(2).replace(".", ",")} €` : "non renseignée"],
                    ["Mains totales relevées", mainsTotales ? String(mainsTotales) : "non renseignées"],
                  ].map(([k, v]) => (
                    <div
                      key={k}
                      style={{ display: "flex", alignItems: "baseline", gap: 10, padding: "7px 9px", borderRadius: 2, background: "var(--survol)" }}
                    >
                      <span style={{ flex: 1, fontSize: 13.5, minWidth: 0 }}>{k}</span>
                      <span className="mono" style={{ fontSize: 13.5, fontWeight: 700, flexShrink: 0 }}>{v}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div style={{ ...S.panneau, padding: mobile ? "15px 15px" : "18px 20px", marginTop: 12 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
              <div style={S.eyebrow}>Évolution</div>
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                <Segments
                  options={[{ v: "barres", l: "Par période" }, { v: "cumul", l: "Cumulé" }]}
                  valeur={vueGraphique}
                  onChange={setVueGraphique}
                />
                {vueGraphique === "barres" && (
                  <select
                    value={granularite}
                    onChange={(e) => setGranularite(e.target.value)}
                    aria-label="Découpage du graphique"
                    style={{ ...styleChamp, width: "auto", padding: "7px 9px", fontSize: 13 }}
                  >
                    <option value="jour">Par jour</option>
                    <option value="semaine">Par semaine</option>
                    <option value="mois">Par mois — 28 jours</option>
                  </select>
                )}
              </div>
            </div>
            {vueGraphique === "barres" && (
              <div
                className="mono"
                style={{ fontSize: 12.5, color: "var(--encre2)", minHeight: 20, marginTop: 4 }}
              >
                {(() => {
                  const g = groupes.find((x) => x.cle === barreChoisie);
                  if (!g) return "Touchez une barre pour lire sa valeur.";
                  return (
                    <>
                      {g.etiquetteLongue ?? g.etiquette} ·{" "}
                      <b style={{ color: teinte(g.net) }}>{eur(g.net)}</b>
                      {g.n ? ` · ${g.n} session${g.n > 1 ? "s" : ""}` : ""}
                    </>
                  );
                })()}
              </div>
            )}

            {vueGraphique === "barres" ? (
              <Histogramme groupes={groupes} mobile={mobile} choisi={barreChoisie} onChoisir={setBarreChoisie} />
            ) : (
              <CourbeCumul sessions={visibles} mobile={mobile} />
            )}
            {/* En barres, les montants et le menu disent déjà tout : on ne
                précise que l'étendue réellement affichée. */}
            {vueGraphique === "barres" ? (
              groupes.length > 1 && (
                <p style={{ fontSize: 12.5, lineHeight: 1.5, color: "var(--encre2)", margin: "10px 0 0" }}>
                  {groupes.length > 14 ? "Les 14 dernières périodes, du " : "Du "}
                  {bornesVisibles(groupes)}.
                </p>
              )
            ) : (
              <p style={{ fontSize: 12.5, lineHeight: 1.5, color: "var(--encre2)", margin: "10px 0 0" }}>
                Solde cumulé, session après session.
              </p>
            )}
          </div>

          {parLieu.length > 0 && (
            <div style={{ ...S.panneau, padding: mobile ? "15px 15px" : "18px 20px", marginTop: 12 }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, flexWrap: "wrap", marginBottom: 9 }}>
                <span style={S.eyebrow}>Par lieu</span>
                <Segments
                  options={[
                    { v: "tous", l: "Tous" },
                    { v: "physique", l: "Casinos" },
                    { v: "site", l: "Sites" },
                  ]}
                  valeur={filtreType}
                  onChange={setFiltreType}
                />
              </div>
              <div style={{ display: "grid", gap: 3 }}>
                {parLieuFiltre.length === 0 && (
                  <p style={{ fontSize: 13, color: "var(--encre2)", margin: "2px 0" }}>
                    Aucun lieu de ce type. Réglez-le ci-dessous.
                  </p>
                )}
                {parLieuFiltre.map((l) => (
                  <div key={l.lieu}>
                  <button
                    data-panneau="lieu"
                    onClick={(e) => { const o = lieuOuvert === l.lieu ? null : l.lieu; const cible = e.currentTarget.parentElement; setLieuOuvert(o); if (o && !replieEnCours.current) amener(cible); }}
                    aria-expanded={lieuOuvert === l.lieu}
                    style={{ width: "100%", display: "flex", alignItems: "baseline", gap: 10, padding: "7px 9px", borderRadius: 2, background: "var(--survol)", textAlign: "left" }}
                  >
                    <span style={{ flex: 1, fontSize: 14, minWidth: 0 }}>
                      {l.lieu}
                      {lieuxInfos?.[l.lieu]?.lien && (
                        <span aria-hidden="true" style={{ color: "var(--or)", fontSize: 11 }}> ↗</span>
                      )}
                    </span>
                    <span className="mono" style={{ fontSize: 12, color: "var(--encre2)", flexShrink: 0 }}>
                      {l.n} session{l.n > 1 ? "s" : ""}
                    </span>
                    <span
                      className="mono"
                      style={{ fontSize: 14, fontWeight: 700, flexShrink: 0, width: 82, textAlign: "right", color: teinte(l.net) }}
                    >
                      {eur(l.net)}
                      {l.engage > 0 && (
                        <span style={{ fontWeight: 400, fontSize: 11, color: "var(--encre2)" }}>
                          {" "}
                          ({pourcent(l.net, l.engage)})
                        </span>
                      )}
                    </span>
                  </button>

                  {lieuOuvert === l.lieu && (
                    <div
                      className="bjc-pop"
                      style={{ display: "grid", gap: 2, padding: "8px 9px 10px", borderLeft: "3px solid var(--or)", marginTop: 2, marginBottom: 4 }}
                    >
                      {[
                        ["Déposé", l.engage.toFixed(2).replace(".", ",") + " €"],
                        ["Retiré", l.retire.toFixed(2).replace(".", ",") + " €"],
                        ["Sessions gagnantes", repartition(l.gagnantes, l.n)],
                        ["Sessions perdantes", repartition(l.perdantes, l.n)],
                        ...(l.nulles ? [["Sessions nulles", repartition(l.nulles, l.n)]] : []),
                        ["Meilleure session", eur(l.meilleure)],
                        ["Pire session", eur(l.pire)],
                        ["Moyenne par session", eur(l.net / l.n)],
                        ["Mise moyenne", l.miseMoyenne ? l.miseMoyenne.toFixed(2).replace(".", ",") + " €" : "non renseignée"],
                        ["Mains relevées", l.mains ? String(l.mains) : "non renseignées"],
                        ...(lieuxInfos?.[l.lieu]?.lien
                          ? [["Site", <LienLieu key="lien" url={lieuxInfos[l.lieu].lien} nom={l.lieu} />]]
                          : []),
                        [
                          "Période",
                          l.premiere === l.derniere
                            ? dateCourte(new Date(l.premiere))
                            : `${dateCourte(new Date(l.premiere))} → ${dateCourte(new Date(l.derniere))}`,
                        ],
                      ].map(([k, v]) => (
                        <div key={k} style={{ display: "flex", alignItems: "baseline", gap: 10 }}>
                          <span style={{ flex: 1, fontSize: 12.5, color: "var(--encre2)", minWidth: 0 }}>{k}</span>
                          <span className="mono" style={{ fontSize: 12.5, fontWeight: 700, flexShrink: 0 }}>{v}</span>
                        </div>
                      ))}
                    </div>
                  )}
                  </div>
                ))}
              </div>
              <div ref={zoneReglages}>
              <button
                onClick={(e) => {
                  const o = !gererLieux;
                  setGererLieux(o);
                  if (o) amener(e.currentTarget.parentElement);
                }}
                style={{
                  fontSize: 12.5,
                  fontWeight: 600,
                  color: "var(--encre2)",
                  textDecoration: "underline",
                  textUnderlineOffset: 2,
                  marginTop: 13,
                }}
              >
                {gererLieux ? "Masquer les réglages" : "Régler les lieux"}
              </button>

              {gererLieux && (
                <div className="bjc-pop" style={{ display: "grid", gap: 4, marginTop: 10 }}>
                  {suiviLieux.map((l) => (
                    <div
                      key={l.nom}
                      style={{ display: "flex", alignItems: "center", gap: 9, flexWrap: "wrap", padding: "8px 9px", borderRadius: 2, background: "var(--survol)" }}
                    >
                      <span style={{ flex: "1 1 90px", fontSize: 13.5, minWidth: 0 }}>{l.nom}</span>
                      <Segments
                        options={[{ v: "physique", l: "Casino" }, { v: "site", l: "Site" }]}
                        valeur={l.type}
                        onChange={(v) => majLieu(l.nom, "type", v)}
                      />
                      {l.type === "site" && (
                        <span style={{ display: "flex", alignItems: "center", gap: 5 }}>
                            <ChampNombre
                              valeur={l.plafond}
                              min={1}
                              onChange={(v) => majLieu(l.nom, "plafond", v)}
                              style={{ width: 74, padding: "7px 8px", fontSize: 13.5, fontFamily: "inherit", color: "var(--encre)", background: "var(--panneau)", border: "1px solid var(--regle)", borderRadius: 3 }}
                            />
                          <span className="mono" style={{ fontSize: 12, color: "var(--encre2)" }}>€/sem.</span>
                        </span>
                      )}
                      <input
                        value={(lieuxInfos?.[l.nom]?.lien) ?? ""}
                        onChange={(e) => majLieu(l.nom, "lien", e.target.value.trim())}
                        placeholder="Lien"
                        inputMode="url"
                        aria-label={`Lien vers ${l.nom}`}
                        style={{
                          flex: "1 1 160px",
                          minWidth: 0,
                          padding: "7px 9px",
                          fontSize: 13,
                          fontFamily: "inherit",
                          color: "var(--encre)",
                          background: "var(--panneau)",
                          border: "1px solid var(--regle)",
                          borderRadius: 3,
                        }}
                      />
                    </div>
                  ))}
                </div>
              )}
              </div>
            </div>
          )}

          {lieux.length > 0 && (
            <div style={{ ...S.panneau, padding: mobile ? "15px 15px" : "18px 20px", marginTop: 12 }}>
              {/* Toujours déplié : l'information est courte et toujours utile. */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 10 }}>
                <span style={S.eyebrow}>Limites de dépôt</span>
                {sites.length > 0 && (
                  <span className="mono" style={{ fontSize: 12.5, color: "var(--encre2)" }}>
                    {totalDisponible} € disponibles
                  </span>
                )}
              </div>


              <div className="bjc-pop" style={{ marginTop: 12 }}>
              {sites.length === 0 ? (
                <p style={{ fontSize: 13, lineHeight: 1.5, color: "var(--encre2)", margin: 0 }}>
                  Aucun lieu marqué comme site. Indiquez-le ci-dessous.
                </p>
              ) : (
                <div style={{ display: "grid", gap: 12 }}>
                  {sites.map((l) => (
                    <div key={l.nom}>
                      {/* Toute la ligne ouvre le détail, comme dans « Par lieu ».
                          Seul le lien vers le site fait exception. */}
                      <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
                        <button
                          onClick={(e) => {
                            const o = siteOuvert === l.nom ? null : l.nom;
                            const cible = e.currentTarget.parentElement.parentElement;
                            setSiteOuvert(o);
                            if (o && !replieEnCours.current) amener(cible);
                          }}
                          data-panneau="site"
                          aria-expanded={siteOuvert === l.nom}
                          aria-label={`Détail de ${l.nom}`}
                          style={{ flex: 1, display: "flex", alignItems: "baseline", gap: 8, minWidth: 0, textAlign: "left" }}
                        >
                          <span style={{ flex: 1, fontSize: 14, fontWeight: 700, minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                            {l.nom}
                          </span>
                          {/* Même couleur que la barre : vert, doré au-delà de
                              trois quarts, rouge une fois le plafond atteint. */}
                          <span
                            className="mono"
                            style={{
                              fontSize: 15,
                              fontWeight: 700,
                              color:
                                l.engage >= l.plafond
                                  ? "var(--rouge)"
                                  : l.engage > l.plafond * 0.75
                                  ? "var(--or)"
                                  : "var(--ok)",
                            }}
                          >
                            {l.restant > 0 ? `${l.restant.toFixed(0)} €` : "épuisé"}
                          </span>
                          <span className="mono" style={{ fontSize: 11.5, color: "var(--encre2)" }}>
                            / {l.plafond}
                          </span>
                        </button>
                      </div>

                      {l.prochaine && l.restant < l.plafond && (
                        <div className="mono" style={{ fontSize: 10.5, color: "var(--encre2)", marginTop: 2 }}>
                          +{l.prochaine.montant.toFixed(0)} € {quandTexte(l.prochaine.date, minute)}
                        </div>
                      )}

                      <div style={{ height: 5, background: "var(--survol)", borderRadius: 999, marginTop: 5, overflow: "hidden" }}>
                        <div
                          style={{
                            width: `${Math.min(100, (l.engage / l.plafond) * 100)}%`,
                            height: "100%",
                            background: l.engage >= l.plafond ? "var(--rouge)" : l.engage > l.plafond * 0.75 ? "var(--or)" : "var(--ok)",
                          }}
                        />
                      </div>

                      {siteOuvert === l.nom && (
                        <div
                          className="bjc-pop mono"
                          style={{ fontSize: 11.5, lineHeight: 1.6, color: "var(--encre2)", marginTop: 6, overflowWrap: "anywhere" }}
                        >
                          {/* Lignes courtes : sur un écran étroit, une phrase
                              longue se coupait entre le nombre et son unité. */}
                          <div>
                            {`${l.engage.toFixed(0)} / ${l.plafond} € déposés · ${Math.round((l.engage / l.plafond) * 100)} %`}
                          </div>
                          {l.lien && (
                            <a
                              href={/^https?:\/\//i.test(l.lien) ? l.lien : "https://" + l.lien}
                              target="_blank"
                              rel="noopener noreferrer"
                              style={{
                                display: "inline-flex",
                                alignItems: "center",
                                gap: 5,
                                marginTop: 7,
                                padding: "6px 11px",
                                borderRadius: 3,
                                border: "1px solid var(--or)",
                                fontSize: 12,
                                fontWeight: 700,
                                color: "var(--or)",
                              }}
                            >
                              Ouvrir {l.nom} ↗
                            </a>
                          )}
                          {l.liberations.length === 0 ? (
                            <div>Aucun dépôt depuis 7 jours.</div>
                          ) : (
                            /* La première est déjà annoncée sur la ligne du
                               site : ici, les suivantes. */
                            l.liberations.slice(1).map((x) => (
                              <div key={x.date.getTime()}>
                                {`puis +${x.montant.toFixed(0)} € le ${String(x.date.getDate()).padStart(2, "0")}/${String(x.date.getMonth() + 1).padStart(2, "0")} à ${String(x.date.getHours()).padStart(2, "0")}:${String(x.date.getMinutes()).padStart(2, "0")}`}
                              </div>
                            ))
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}

              </div>

            </div>
          )}


          </>
          )}

          {onglet === "sessions" && (
          <>
          {!enCours && (
            <div ref={(el) => { panneauSaisie.current = el; zoneFormulaire.current = el; }} style={{ ...S.panneau, padding: mobile ? "15px 15px" : "18px 20px" }}>
              <button
                onClick={() => basculerSaisie()}
                aria-expanded={saisieOuverte}
                className="bjc-tap"
                style={{
                  width: "100%",
                  padding: "13px 18px",
                  borderRadius: 3,
                  background: saisieOuverte ? "var(--survol)" : "var(--encre)",
                  color: saisieOuverte ? "var(--encre)" : "var(--panneau)",
                  border: saisieOuverte ? "1px solid var(--regle)" : "none",
                  fontWeight: 700,
                  fontSize: 13,
                  letterSpacing: ".1em",
                  textTransform: "uppercase",
                  textAlign: "center",
                }}
              >
                {saisieOuverte ? "Fermer" : "Encoder une session"}
              </button>
              {saisieOuverte && (
              <div className="bjc-pop" style={{ marginTop: 12 }}>
            {/* ATTENTION — ce formulaire existe en DEUX exemplaires : ici et dans
                l'autre vue (saisie / correction). Ils sont identiques au caractère
                près. Toute retouche doit être reportée sur les deux, sinon elle ne
                s'appliquera qu'à moitié — c'est ce qui était arrivé au bouton
                Annuler en 1.35.9. Vérifier avec :
                  grep -c 'S.eyebrow, marginBottom: 5 }}>\n *{etiquette}' */}
            <div style={{ display: "grid", gap: 10 }}>
              <div style={{ display: "grid", gridTemplateColumns: "1.35fr 1fr", gap: 10 }}>
                <label style={{ display: "block" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 8, marginBottom: 5 }}>
                    <span style={S.eyebrow}>Date</span>
                    <button
                      onClick={() => { const m = maintenant(); setDate(m.date); setHeure(m.heure); }}
                      style={{ fontSize: 12, fontWeight: 600, color: "var(--encre2)", textDecoration: "underline", textUnderlineOffset: 2 }}
                    >
                      Maintenant
                    </button>
                  </div>
                  <input type="date" value={date} onChange={(e) => setDate(e.target.value)} style={styleChamp} />
                </label>
                <label style={{ display: "block" }}>
                  <div style={{ ...S.eyebrow, marginBottom: 5 }}>Heure</div>
                  <input type="time" value={heure} onChange={(e) => setHeure(e.target.value)} style={styleChamp} />
                </label>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                {champ("Déposé", depot, setDepot, "€")}
                {champ("Retiré", retrait, setRetrait, "€")}
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                {champ("Mains jouées", mains, setMains, "", true, true)}
                {champ("Mise moyenne", mise, setMise, "€", true)}
              </div>

              <label style={{ display: "block" }}>
                <div style={S.titreChoix}>Lieu <span style={{ fontWeight: 400, textTransform: "none", letterSpacing: 0, color: "var(--encre2)" }}>(facultatif)</span></div>
                <input
                  value={lieu}
                  onChange={(e) => setLieu(e.target.value)}
                  list="bjt-lieux"
                  placeholder={lieux.length ? lieux[0] : "Le casino, la salle, le site"}
                  style={styleChamp}
                />
                <datalist id="bjt-lieux">
                  {lieux.map((l) => (
                    <option key={l} value={l} />
                  ))}
                </datalist>
              </label>

              {lieux.length > 0 && (
                <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginTop: -4 }}>
                  {lieux.slice(0, 6).map((l) => (
                    <button
                      key={l}
                      onClick={() => setLieu(l)}
                      style={{
                        border: "1px solid " + (lieu === l ? "var(--encre)" : "var(--regle)"),
                        background: lieu === l ? "var(--survol)" : "var(--panneau)",
                        padding: "6px 11px",
                        borderRadius: 999,
                        fontSize: 12.5,
                        fontWeight: lieu === l ? 700 : 500,
                      }}
                    >
                      {l}
                    </button>
                  ))}
                </div>
              )}

            </div>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 12 }}>
            {enCours && (
              <button
                onClick={() => fermerCorrection(enCours)}
                style={{
                  border: "1px solid color-mix(in srgb, var(--rouge) 45%, transparent)",
                  padding: "12px 18px",
                  borderRadius: 3,
                  fontWeight: 600,
                  fontSize: 13,
                  color: "var(--rouge)",
                  textTransform: "uppercase",
                  letterSpacing: ".08em",
                }}
              >
                Annuler
              </button>
            )}
            <button
              onClick={ajouter}
              className="bjc-tap"
              style={{
                flex: mobile ? "1 1 auto" : "0 0 auto",
                background: "var(--encre)",
                color: "var(--panneau)",
                padding: "12px 22px",
                borderRadius: 3,
                fontWeight: 700,
                fontSize: 13.5,
                textTransform: "uppercase",
                letterSpacing: ".08em",
              }}
            >
              {enCours ? "Mettre à jour" : "Enregistrer la session"}
            </button>
            </div>
            {alerte && <div style={{ fontSize: 13.5, color: "var(--rouge)", marginTop: 9 }}>{alerte}</div>}
              </div>
              )}
            </div>
          )}

          <div style={{ display: "grid", gap: 6 }}>
            {aAfficher.map((s, i) => {
              const enTetes = coupures.get(s.id);
              const r = s.retrait - s.depot;
              const d = new Date(s.date);
              return (
                <div key={s.id} id={`bjt-session-${s.id}`}>
                {enTetes?.semaine && (
                  <div
                    style={{
                      ...S.eyebrow,
                      color: "var(--or)",
                      borderTop: "1px solid var(--regle)",
                      paddingTop: 10,
                      marginTop: i ? 12 : 0,
                      marginBottom: 6,
                    }}
                  >
                    {enTetes.semaine}
                  </div>
                )}
                {enTetes?.jour && (
                  <div className="mono" style={{ fontSize: 11.5, color: "var(--encre2)", margin: "6px 0 4px" }}>
                    {enTetes.jour}
                  </div>
                )}
                <div
                  style={{
                    ...S.panneau,
                    padding: mobile ? "12px 13px" : "13px 16px",
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                    borderLeft: `3px solid ${teinte(r)}`,
                  }}
                >
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div className="mono" style={{ fontSize: 13 }}>
                      {String(d.getDate()).padStart(2, "0")}/{String(d.getMonth() + 1).padStart(2, "0")}/{d.getFullYear()}
                      {"  "}
                      {String(d.getHours()).padStart(2, "0")}h{String(d.getMinutes()).padStart(2, "0")}
                    </div>
                    <div style={{ fontSize: 12.5, color: "var(--encre2)", marginTop: 2 }}>
                      {s.lieu ? s.lieu + " · " : ""}
                      {s.depot.toFixed(2).replace(".", ",")} € engagés, {s.retrait.toFixed(2).replace(".", ",")} € retirés
                      {/* La mise ne se rattache au nombre de mains que si
                          celui-ci est renseigné ; seule, elle est nommée. */}
                      {s.mains && s.mise
                        ? ` · ${s.mains} mains à ${s.mise.toFixed(2).replace(".", ",")} €`
                        : s.mains
                        ? ` · ${s.mains} mains`
                        : s.mise
                        ? ` · mise ${s.mise.toFixed(2).replace(".", ",")} €`
                        : ""}
                    </div>
                  </div>
                  <div
                    className="mono"
                    style={{ fontSize: 16, fontWeight: 700, color: teinte(r), flexShrink: 0 }}
                  >
                    {eur(r)}
                    {s.depot > 0 && (
                      <div style={{ fontSize: 10.5, fontWeight: 400, color: "var(--encre2)", marginTop: 1, textAlign: "right" }}>
                        ({pourcent(r, s.depot)})
                      </div>
                    )}
                  </div>
                  <button
                    onClick={() => {
                      if (enCours !== s.id) return modifier(s);
                      fermerCorrection(s.id);
                    }}
                    data-ferme-correction={enCours === s.id ? "1" : undefined}
                    aria-label={enCours === s.id ? "Fermer la correction" : "Modifier cette session"}
                    style={{ fontSize: 14, color: "var(--encre2)", padding: "0 3px", flexShrink: 0 }}
                  >
                    {enCours === s.id ? "×" : "✎"}
                  </button>
                  <button
                    onClick={() => demanderSuppression(s.id)}
                    onBlur={() => setASupprimer((x) => (x === s.id ? null : x))}
                    aria-label={aSupprimer === s.id ? "Confirmer la suppression" : "Supprimer cette session"}
                    style={{
                      fontSize: aSupprimer === s.id ? 11.5 : 16,
                      fontWeight: aSupprimer === s.id ? 700 : 400,
                      lineHeight: 1,
                      padding: aSupprimer === s.id ? "4px 7px" : "0 2px",
                      borderRadius: 2,
                      flexShrink: 0,
                      color: aSupprimer === s.id ? "var(--panneau)" : "var(--encre2)",
                      background: aSupprimer === s.id ? "var(--rouge)" : "transparent",
                    }}
                  >
                    {aSupprimer === s.id ? "Confirmer" : "×"}
                  </button>
                </div>

                {enCours === s.id && (
                  <div
                    className="bjc-pop"
                    style={{
                      borderLeft: "3px solid var(--or)",
                      background: "var(--cadre)",
                      padding: mobile ? "13px 13px" : "15px 17px",
                      marginTop: 2,
                      marginBottom: 4,
                      borderRadius: "0 0 3px 3px",
                    }}
                    ref={(el) => { if (el) zoneFormulaire.current = el; }}
                  >
                    <div style={{ ...S.eyebrow, marginBottom: 9, color: "var(--or)" }}>Corriger cette session</div>
              {/* ATTENTION — ce formulaire existe en DEUX exemplaires : ici et dans
                  l'autre vue (saisie / correction). Ils sont identiques au caractère
                  près. Toute retouche doit être reportée sur les deux, sinon elle ne
                  s'appliquera qu'à moitié — c'est ce qui était arrivé au bouton
                  Annuler en 1.35.9. Vérifier avec :
                    grep -c 'S.eyebrow, marginBottom: 5 }}>\n *{etiquette}' */}
              <div style={{ display: "grid", gap: 10 }}>
                <div style={{ display: "grid", gridTemplateColumns: "1.35fr 1fr", gap: 10 }}>
                  <label style={{ display: "block" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 8, marginBottom: 5 }}>
                      <span style={S.eyebrow}>Date</span>
                      <button
                        onClick={() => { const m = maintenant(); setDate(m.date); setHeure(m.heure); }}
                        style={{ fontSize: 12, fontWeight: 600, color: "var(--encre2)", textDecoration: "underline", textUnderlineOffset: 2 }}
                      >
                        Maintenant
                      </button>
                    </div>
                    <input type="date" value={date} onChange={(e) => setDate(e.target.value)} style={styleChamp} />
                  </label>
                  <label style={{ display: "block" }}>
                    <div style={{ ...S.eyebrow, marginBottom: 5 }}>Heure</div>
                    <input type="time" value={heure} onChange={(e) => setHeure(e.target.value)} style={styleChamp} />
                  </label>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                  {champ("Déposé", depot, setDepot, "€")}
                  {champ("Retiré", retrait, setRetrait, "€")}
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                  {champ("Mains jouées", mains, setMains, "", true, true)}
                  {champ("Mise moyenne", mise, setMise, "€", true)}
                </div>

                <label style={{ display: "block" }}>
            <div style={S.titreChoix}>Lieu <span style={{ fontWeight: 400, textTransform: "none", letterSpacing: 0, color: "var(--encre2)" }}>(facultatif)</span></div>
            <input
              value={lieu}
              onChange={(e) => setLieu(e.target.value)}
              list="bjt-lieux"
              placeholder={lieux.length ? lieux[0] : "Le casino, la salle, le site"}
              style={styleChamp}
            />
            <datalist id="bjt-lieux">
              {lieux.map((l) => (
                <option key={l} value={l} />
              ))}
            </datalist>
          </label>

          {lieux.length > 0 && (
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginTop: -4 }}>
              {lieux.slice(0, 6).map((l) => (
                <button
                  key={l}
                  onClick={() => setLieu(l)}
                  style={{
                    border: "1px solid " + (lieu === l ? "var(--encre)" : "var(--regle)"),
                    background: lieu === l ? "var(--survol)" : "var(--panneau)",
                    padding: "6px 11px",
                    borderRadius: 999,
                    fontSize: 12.5,
                    fontWeight: lieu === l ? 700 : 500,
                  }}
                >
                  {l}
                </button>
              ))}
            </div>
          )}
              </div>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 12 }}>
              {enCours && (
                <button
                  onClick={() => fermerCorrection(enCours)}
                  style={{
                    border: "1px solid color-mix(in srgb, var(--rouge) 45%, transparent)",
                    padding: "12px 18px",
                    borderRadius: 3,
                    fontWeight: 600,
                    fontSize: 13,
                    color: "var(--rouge)",
                    textTransform: "uppercase",
                    letterSpacing: ".08em",
                  }}
                >
                  Annuler
                </button>
              )}
              <button
                onClick={ajouter}
                className="bjc-tap"
                style={{
                  flex: mobile ? "1 1 auto" : "0 0 auto",
                  background: "var(--encre)",
                  color: "var(--panneau)",
                  padding: "12px 22px",
                  borderRadius: 3,
                  fontWeight: 700,
                  fontSize: 13.5,
                  textTransform: "uppercase",
                  letterSpacing: ".08em",
                }}
              >
                {enCours ? "Mettre à jour" : "Enregistrer la session"}
              </button>
              </div>
              {alerte && <div style={{ fontSize: 13.5, color: "var(--rouge)", marginTop: 9 }}>{alerte}</div>}
                  </div>
                )}
                </div>
              );
            })}
          </div>

          {sessionsMasquees > 0 && (
            <button
              onClick={() => setToutAfficher(true)}
              style={{
                width: "100%",
                marginTop: 10,
                border: "1px solid var(--regle)",
                background: "var(--panneau)",
                padding: "11px 16px",
                borderRadius: 3,
                fontSize: 13.5,
                fontWeight: 600,
                color: "var(--encre2)",
              }}
            >
              Afficher les {sessionsMasquees} session{sessionsMasquees > 1 ? "s" : ""} plus anciennes
            </button>
          )}
          {toutAfficher && visibles.length > aAfficher.length - 1 && sessionsMasquees === 0 && (
            <button
              onClick={() => setToutAfficher(false)}
              style={{
                width: "100%",
                marginTop: 10,
                padding: "9px 16px",
                fontSize: 12.5,
                fontWeight: 600,
                color: "var(--encre2)",
                textDecoration: "underline",
                textUnderlineOffset: 2,
              }}
            >
              Réduire
            </button>
          )}

          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 14 }}>
            <button
              onClick={() => setExport(exporterCSV(visibles) ? "ok" : "erreur")}
              style={{
                /* Outils secondaires : fond de cadre, nettement plus creusé que
                   le panneau, pour se distinguer des actions du journal. */
                border: "none",
                background: "var(--cadre)",
                padding: "8px 14px",
                borderRadius: 3,
                fontSize: 11.5,
                fontWeight: 700,
                /* Encre adoucie par le fond : lisible en clair sans éblouir sur
                   les thèmes foncés, où le contraste montait à 18. */
                color: "color-mix(in srgb, var(--encre) 78%, var(--cadre))",
                textTransform: "uppercase",
                letterSpacing: ".08em",
              }}
            >
              Exporter en CSV
            </button>
            <button
              onClick={() => fichier.current && fichier.current.click()}
              style={{
                /* Outils secondaires : fond de cadre, nettement plus creusé que
                   le panneau, pour se distinguer des actions du journal. */
                border: "none",
                background: "var(--cadre)",
                padding: "8px 14px",
                borderRadius: 3,
                fontSize: 11.5,
                fontWeight: 700,
                /* Encre adoucie par le fond : lisible en clair sans éblouir sur
                   les thèmes foncés, où le contraste montait à 18. */
                color: "color-mix(in srgb, var(--encre) 78%, var(--cadre))",
                textTransform: "uppercase",
                letterSpacing: ".08em",
              }}
            >
              Importer
            </button>
          </div>
          {messageExport && (
            <p
              style={{
                fontSize: 13,
                lineHeight: 1.5,
                color: messageExport.startsWith("erreur") ? "var(--rouge)" : "var(--encre2)",
                margin: "-6px 0 12px",
              }}
            >
              {messageExport === "ok"
                ? `Fichier téléchargé — ${visibles.length} session${visibles.length > 1 ? "s" : ""}${filtreActif ? " (filtre appliqué)" : ""}. Conservez-le ailleurs que sur ce téléphone.`
                : messageExport === "erreur"
                ? "Le téléchargement est bloqué dans cet environnement. Il fonctionne dans l'application installée."
                : messageExport.startsWith("import:")
                ? messageExport.slice(7) + " Les sessions déjà connues ne sont jamais dupliquées."
                : messageExport.slice(7)}
            </p>
          )}
          </>
          )}
        </div>
      )}

      {abandonDemande !== null && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={abandonDemande === "saisie" ? "Abandonner cette saisie" : "Abandonner les modifications"}
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 99,
            background: "rgba(0,0,0,.62)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 16,
          }}
          onClick={() => {
            setAbandonDemande(null);
            const el = focusAvant.current;
            focusAvant.current = null;
            requestAnimationFrame(() => {
              amener(zoneFormulaire.current);
              if (el && el.isConnected) el.focus({ preventScroll: true });
            });
          }}
        >
          <div
            className="bjc-flash"
            onClick={(e) => e.stopPropagation()}
            style={{ ...S.panneau, maxWidth: 340, padding: mobile ? "20px 18px" : "24px 22px", boxShadow: "var(--ombre-forte)" }}
          >
            <h2 style={{ fontSize: mobile ? 17 : 19, margin: "0 0 8px", fontWeight: 700, letterSpacing: "-.01em" }}>
              {abandonDemande === "saisie" ? "Abandonner cette session ?" : "Abandonner les modifications ?"}
            </h2>
            <p style={{ fontSize: 14, lineHeight: 1.55, color: "var(--encre2)", margin: "0 0 18px" }}>
              {abandonDemande === "saisie"
                ? "Elle n'est pas encore enregistrée : ce que vous venez de saisir sera perdu."
                : "Ce que vous venez de saisir sera perdu. La session reprendra ses valeurs enregistrées."}
            </p>
            <div style={{ display: "flex", gap: 9, flexWrap: "wrap" }}>
              <button
                onClick={() => {
                  setAbandonDemande(null);
                  /* On revient au formulaire qu'on reprend, et le champ qu'on
                     éditait retrouve le focus. */
                  const el = focusAvant.current;
                  focusAvant.current = null;
                  requestAnimationFrame(() => {
                    amener(zoneFormulaire.current);
                    if (el && el.isConnected) el.focus({ preventScroll: true });
                  });
                }}
                className="bjc-tap"
                style={{
                  flex: "1 1 auto",
                  border: "1px solid var(--regle)",
                  padding: "12px 18px",
                  borderRadius: 3,
                  fontWeight: 600,
                  fontSize: 14.5,
                  color: "var(--encre2)",
                }}
              >
                {abandonDemande === "saisie" ? "Continuer la saisie" : "Continuer la correction"}
              </button>
              <button
                onClick={() => {
                  annulerModification();
                  setSaisieOuverte(false);
                }}
                className="bjc-tap"
                style={{
                  flex: "1 1 auto",
                  background: "var(--rouge)",
                  color: "var(--panneau)",
                  padding: "12px 18px",
                  borderRadius: 3,
                  fontWeight: 700,
                  fontSize: 14.5,
                }}
              >
                Abandonner
              </button>
            </div>
          </div>
        </div>
      )}

      {sessions.length === 0 && (
        <p style={{ fontSize: 14.5, lineHeight: 1.6, color: "var(--encre2)", marginTop: 20 }}>
          Aucune session enregistrée. Le récapitulatif et le graphique apparaîtront dès la première.
        </p>
      )}
    </div>
  );
}

/* ============================================================
   VUE 0 — ACCUEIL
   ============================================================ */

function VueAccueil({ sys, allerA, mobile, wrap, enseigne }) {
  /* Les quatre pages, dans l'ordre de la barre : ce qu'on ouvre à la table, ce
     qu'on travaille chez soi, ce qu'on lit à froid, ce qu'on consigne après. */
  const entrees = [
    ["strategie", "À la table", "Le tableau des mains et le compteur, à ouvrir en jouant.", `${sys.nom} · 3 tableaux`],
    ["entrainement", "S'entraîner", "Cinq exercices pour compter de tête et décider sans hésiter.", "5 exercices"],
    ["recap", "Comprendre", "Les neuf systèmes, les façons de miser, le lexique et les lectures.", "9 systèmes · 33 termes"],
    ["journal", "Journal", "Vos sessions, ce que vous engagez et ce que vous retirez réellement.", "sessions · analyse"],
  ];

  return (
    <div style={wrap}>
      {/* Logo en ligne : le jeton centré sur la séparation des deux mots, qui
          sont forcés à la même largeur. Les valeurs viennent d'une mesure au
          pixel, pas d'une estimation. */}
      <div style={{ display: "flex", justifyContent: "center", padding: mobile ? "26px 0 30px" : "44px 0 44px" }}>
        <svg
          viewBox="0 0 440 170"
          aria-label="Big Jack Theory"
          style={{ width: mobile ? 268 : 330, height: "auto", display: "block" }}
        >
          <g transform="translate(84 85) scale(1.875) translate(-32 -32)">
            <circle cx="32" cy="32" r="29" fill="var(--encre)" />
            <circle cx="32" cy="32" r="25" fill="none" stroke="var(--papier)" strokeWidth="8.5" strokeDasharray="9.8 9.8" />
            <circle cx="32" cy="32" r="18.5" fill="var(--encre)" />
            <circle cx="32" cy="32" r="18.5" fill="none" stroke="var(--papier)" strokeWidth="2" />
            <circle cx="32" cy="32" r="30" fill="none" stroke="var(--encre)" strokeWidth="1.5" />
            <path d={TRACES_ENSEIGNE[enseigne ?? "pique"]} fill="var(--papier)" />
          </g>
          <text
            x="172"
            y="79.8"
            fill="var(--encre)"
            style={{ fontFamily: "'Source Serif 4', Georgia, serif", fontWeight: 700, fontSize: 36, letterSpacing: "-.01em" }}
          >
            BIG JACK
          </text>
          <text
            x="175.5"
            y="119.8"
            fill="var(--encre)"
            style={{ fontFamily: "'Source Serif 4', Georgia, serif", fontWeight: 700, fontSize: 36, letterSpacing: ".0562em" }}
          >
            THEORY
          </text>
        </svg>
      </div>

      {/* Sous-titre : ce que fait l'application, dit une fois. */}
      <p
        style={{
          textAlign: "center",
          fontStyle: "italic",
          fontSize: mobile ? 13.5 : 15,
          lineHeight: 1.5,
          color: "var(--encre2)",
          margin: mobile ? "-14px 0 22px" : "-22px 0 30px",
        }}
      >
        Application d'apprentissage du blackjack. Tout fonctionne hors ligne.
      </p>

      <div style={{ display: "grid", gap: mobile ? 8 : 9 }}>
        {entrees.map(([v, titre, texte, meta]) => (
          <button
            key={v}
            onClick={() => {
              window.scrollTo(0, 0);
              allerA(v);
            }}
            className="bjc-tap"
            style={{
              ...S.panneau,
              display: "flex",
              alignItems: "center",
              gap: 16,
              textAlign: "left",
              padding: mobile ? "16px 16px" : "20px 22px",
            }}
          >
            <div style={{ flex: 1 }}>
              <div
                style={{
                  fontFamily: "'Source Serif 4', Georgia, serif",
                  fontWeight: 700,
                  fontSize: mobile ? 19 : 22,
                  letterSpacing: "-.008em",
                }}
              >
                {titre}
              </div>
              <div style={{ fontSize: mobile ? 13.5 : 14.5, lineHeight: 1.5, color: "var(--encre2)", marginTop: 3 }}>
                {texte}
              </div>
              {meta && (
                <div style={{ ...S.eyebrow, fontSize: 10, color: "var(--encre2)", marginTop: 7 }}>{meta}</div>
              )}
            </div>
            <div style={{ fontSize: 20, color: "var(--encre2)", flexShrink: 0 }}>→</div>
          </button>
        ))}
      </div>
    </div>
  );
}

/* ============================================================
   SOUS-NAVIGATION — section Théorie
   ============================================================ */

/* Les pages suivent le moment d'usage : ce qu'on ouvre à la table, ce qu'on lit
   à froid avant de jouer, ce qu'on travaille chez soi, ce qu'on consigne après.
   Le tableau des mains vient en tête : c'est ce qu'on ouvre en urgence. */
function SousNav({ onglets, vue, setVue, mobile, wrap, hauteurEntete, cadre }) {
  /* Changer d'onglet ramène en haut, au bouton comme au balayage. */
  const aller = (v) => {
    window.scrollTo(0, 0);
    setVue(v);
  };


  return (
    <div
      ref={cadre}
      data-colle="1"
      style={{
        position: "sticky",
        top: hauteurEntete,
        zIndex: 18,
        background: "var(--papier)",
        borderBottom: "1px solid var(--regle)",
      }}
    >
      {/* Le gabarit général ajoute une marge basse de 24 px, prévue pour le
          bas de page : elle épaississait la bande. Seules les marges latérales
          sont reprises. */}
      <div style={{ ...wrap, paddingBottom: 0, paddingTop: 0 }}>
        <div style={{ display: "grid", gridTemplateColumns: `repeat(${onglets.length},1fr)` }}>
          {onglets.map((o) => {
            const actif = vue === o.v;
            return (
              <button
                key={o.v}
                onClick={() => aller(o.v)}
                aria-current={actif}
                style={{
                  position: "relative",
                  /* Bande fine, mêmes réglages typographiques que le journal :
                     12 px et .09em partout, pour que les trois pages se
                     ressemblent. */
                  padding: "7px 2px 6px",
                  fontSize: 12,
                  fontWeight: 700,
                  letterSpacing: ".09em",
                  textTransform: "uppercase",
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  color: actif ? "var(--encre)" : "var(--encre2)",
                }}
              >
                {o.court ?? o.l}
                {actif && (
                  <span
                    aria-hidden="true"
                    style={{ position: "absolute", left: 6, right: 6, bottom: -1, height: 2, background: "var(--encre)" }}
                  />
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

/** Balayage latéral entre les onglets d'un groupe. */
function useBalayage(onglets, vue, setVue) {
  /* Même chemin que les boutons de la barre : un seul saut, pas deux. */
  const geste = useRef(null);
  return {
    onTouchStart: (e) => {
      const t = e.touches?.[0];
      geste.current = t ? { x: t.clientX, y: t.clientY } : null;
    },
    onTouchEnd: (e) => {
      const dep = geste.current;
      const t = e.changedTouches?.[0];
      geste.current = null;
      if (!dep || !t) return;
      const dx = t.clientX - dep.x;
      const dy = t.clientY - dep.y;
      if (Math.abs(dx) < 60 || Math.abs(dx) < Math.abs(dy) * 1.8) return;
      const i = onglets.findIndex((o) => o.v === vue) + (dx < 0 ? 1 : -1);
      if (i >= 0 && i < onglets.length) {
        window.scrollTo(0, 0);
        setVue(onglets[i].v);
      }
    },
  };
}

/* ============================================================
   APP
   ============================================================ */

export default function App() {
  const sauvegarde = useMemo(() => lireStockage(), []);
  const mobile = useMediaQuery("(max-width: 719px)");
  const prefereSombre = useMediaQuery("(prefers-color-scheme: dark)");
  const [theme, setTheme] = useState(sauvegarde?.theme ?? null);
  const themeActif = theme ?? (prefereSombre ? "sombre" : "clair");
  // Trois thèmes sur quatre sont sombres : l'icône et la bascule s'y accordent.
  const fondSombre = themeActif !== "clair";

  /* Écran courant conservé le temps d'une session seulement : un rafraîchissement
     ou un passage en arrière-plan le retrouvent, une fermeture complète repart
     de l'accueil. Le compteur est exclu au-delà de dix minutes — un sabot laissé
     plus longtemps n'a plus de sens. */
  const [vue, setVue] = useState(() => {
    let v = null;
    try {
      v = sessionStorage.getItem("big-jack-theory-vue");
    } catch {
      /* stockage indisponible */
    }
    if (!v || v === "parametres") return "accueil";
    if (v === "compteur") {
      const age = Date.now() - (sauvegarde?.vueDate ?? 0);
      if (age > 10 * 60 * 1000) return "accueil";
    }
    return v;
  });

  useEffect(() => {
    try {
      sessionStorage.setItem("big-jack-theory-vue", vue);
    } catch {
      /* sans conséquence */
    }
  }, [vue]);

  /* Bouton retour d'Android. On empile une entrée d'historique, et chaque
     retour consomme d'abord un panneau ouvert, puis la page, puis quitte —
     après confirmation. */
  /* Changer de sous-onglet ramène en haut — bouton comme balayage, un seul
     saut puisque les deux passent par setVue. */
  const groupeCourant = EST_STRATEGIE(vue) ? GROUPE_STRATEGIE : EST_THEORIE(vue) ? GROUPE_THEORIE : null;
  const balayageGroupe = useBalayage(groupeCourant ?? [], vue, setVue);
  const balayagePage = groupeCourant ? balayageGroupe : {};

  useEffect(() => {
    const avant = vuePrecedente.current;
    vuePrecedente.current = vue;
    /* L'accueil est la racine : y passer, de quelque façon que ce soit, efface
       le chemin parcouru. Une fermeture complète le vide aussi, la session ne
       lui survivant pas. */
    if (vue === "accueil") {
      histoire.current = { onglet: null, page: null };
      enregistrerChemin(histoire.current);
      return;
    }
    if (avant === null || avant === vue) return;
    if (enRetour.current) {
      enRetour.current = false;
      return;
    }
    /* Les paramètres sont une page posée par-dessus, pas une étape du parcours :
       ils n'entrent ni dans l'historique ni dans les jalons. Leur fermeture est
       prise en charge par le registre des retours. */
    if (vue === "parametres" || avant === "parametres") return;
    if (groupeDe(avant) === groupeDe(vue)) {
      /* Changement d'onglet : seul le précédent est retenu. */
      histoire.current = { ...histoire.current, onglet: avant };
    } else {
      /* Changement de page : on retient la page quittée et l'on oublie ses
         onglets, qui ne concernent plus le niveau où l'on se trouve. */
      histoire.current = { onglet: null, page: avant };
    }
    enregistrerChemin(histoire.current);
    poserEtape();
  }, [vue]);

  const quitterArme = useRef(0);
  const [quitterMessage, setQuitterMessage] = useState(false);
  /* La vue courante est lue par une référence : l'abonnement au retour est posé
     une seule fois, sinon les jalons d'historique se réempilaient à chaque
     changement de page et la profondeur devenait imprévisible. */
  const vueCourante = useRef(vue);
  useEffect(() => {
    vueCourante.current = vue;
  }, [vue]);


  useEffect(() => {
    /* Deux jalons d'avance plutôt qu'un : sur Android, reposer un jalon pendant
       le traitement du retour n'est pas toujours pris en compte, et l'unique
       jalon consommé faisait sortir de l'application sans avertissement. */
    try {
      history.replaceState({ bjt: 0 }, "");
      history.pushState({ bjt: 1 }, "");
      history.pushState({ bjt: 2 }, "");
      /* Les deux jalons de départ comptent aussi dans la réserve. */
      JALONS.restants = 2;
      /* Après un rafraîchissement, le chemin est retrouvé : il lui faut autant
         de jalons qu'il compte de pas, sinon le retour sort trop tôt. */
      if (histoire.current.onglet) poserEtape();
      if (histoire.current.page) poserEtape();
    } catch {
      /* sans conséquence */
    }
    const enArriere = () => {
      if (JALONS.restants > 0) JALONS.restants -= 1;
      const v = vueCourante.current;
      /* Le jalon n'est reposé que si l'on reste : pour quitter, on laisse le
         navigateur consommer l'entrée, ce qui ferme l'application. */

      /* Une série engagée passe avant tout : on demande confirmation, et l'on
         revient aux consignes plutôt qu'au menu. */
      if (v === "entrainement" && gardeExercice.engage && gardeExercice.engage()) {
        setQuitterVers("__consignes");
        return;
      }
      if (consommerRetour()) {
        return;
      }
      /* La fiche n'a plus de retour figé : le chemin sait d'où l'on vient —
         de la liste des systèmes, ou du renvoi d'un exercice. */
      /* L'accueil est la racine : on n'en remonte pas, le retour y amorce la
         sortie. Ailleurs, on suit le chemin parcouru. */
      if (v !== "accueil") {
        const c = histoire.current;
        const cible = c.onglet ?? c.page ?? null;
        if (cible) {
          histoire.current = c.onglet ? { ...c, onglet: null } : { onglet: null, page: null };
          /* On atterrit sur une vue secondaire : le pas suivant est sa mère. */
          if (PAGE_MERE[cible]) histoire.current = { ...histoire.current, onglet: PAGE_MERE[cible] };
          enregistrerChemin(histoire.current);
          enRetour.current = true;
          window.scrollTo(0, 0);
          setVue(cible);
          return;
        }
        window.scrollTo(0, 0);
        setVue("accueil");
        return;
      }
      const t = Date.now();
      if (t - quitterArme.current < 2000) {
        /* Deuxième appui : on ne repose rien et l'on remonte au-delà du jalon,
           ce qui sort de l'application. */
        quitterArme.current = 0;
        /* Deuxième appui : on remonte d'un cran de plus que le jalon déjà
           consommé, ce qui sort de l'application. */
        try {
          /* Les jalons encore en réserve — ceux d'un chemin effacé en passant
             par l'accueil — sont franchis d'un coup, sinon il faudrait autant
             d'appuis qu'il en reste. */
          history.go(-(JALONS.restants + 1));
        } catch {
          /* sans conséquence */
        }
        return;
      }
      /* Premier appui : on reconstitue la réserve au tour suivant, pour que le
         second appui trouve encore un jalon à consommer. */
      quitterArme.current = t;
      setQuitterMessage(true);
      setTimeout(poserEtape, 0);
      setTimeout(() => setQuitterMessage(false), 2000);
    };
    window.addEventListener("popstate", enArriere);
    return () => window.removeEventListener("popstate", enArriere);
  }, []);
  const [systemeId, setSystemeId] = useState(sauvegarde?.systemeId ?? "hilo");
  const [sessions, setSessions] = useState(() => assainir(sauvegarde?.sessions));
  const [mesTables, setMesTables] = useState(sauvegarde?.mesTables ?? []);
  const [lieuxInfos, setLieuxInfos] = useState(sauvegarde?.lieuxInfos ?? {});

  /* La pastille de l'engrenage : recalculée quand on navigue ou qu'on
     enregistre, ce qui suffit — la date ne bouge pas toute seule. */
  const [rappelSauvegarde, setRappelSauvegarde] = useState(() => sauvegardeAgee());
  useEffect(() => setRappelSauvegarde(sauvegardeAgee()), [vue, sessions]);
  const sabotRepris = useMemo(() => {
    const h = sauvegarde?.sabot;
    return !!(h && Array.isArray(h.cartes) && h.cartes.length && h.systeme === (sauvegarde?.systemeId ?? "hilo") && Date.now() - (h.date ?? 0) <= 10 * 60 * 1000);
  }, [sauvegarde]);
  /* Le sabot en cours survit à une interruption courte — basculer vers une autre
     application, verrouiller l'écran. Au-delà de dix minutes, il repart à
     zéro : un compte plus ancien ne correspond plus à la table. */
  const [historique, setHistorique] = useState(() => {
    const h = sauvegarde?.sabot;
    if (!h || !Array.isArray(h.cartes) || !h.cartes.length) return [];
    if (h.systeme !== (sauvegarde?.systemeId ?? "hilo")) return [];
    if (Date.now() - (h.date ?? 0) > 10 * 60 * 1000) return [];
    return h.cartes;
  });

  const [codeHash, setCodeHash] = useState(sauvegarde?.codeHash ?? null);
  const [codeVu, setCodeVu] = useState(sauvegarde?.codeVu ?? false);
  const [dialogue, setDialogue] = useState(null); // { mode, action }
  const [erreurCode, setErreurCode] = useState("");

  /** Exécute une action destructrice, après vérification du code s'il existe. */
  const proteger = useCallback(
    (action) => {
      if (!codeHash) { action(); return; }
      setErreurCode("");
      setDialogue({ mode: "verifier", action });
    },
    [codeHash]
  );

  const [entr, setEntr] = useState(() => {
    const sv = sauvegarde?.entrainement ?? {};
    const fusion = { ...ENTRAINEMENT_VIDE, ...sv };
    // Une sauvegarde antérieure n'a pas les listes « recents » : on les crée vides.
    for (const c of ["strategie", "valeur", "sabot", "tc", "indices"]) {
      fusion[c] = { ...ENTRAINEMENT_VIDE[c], ...(sv[c] ?? {}) };
    }
    return fusion;
  });

  /** Enregistre le résultat d'une question dans le profil d'entraînement. */
  const noter = useCallback((type, info) => {
    setEntr((e) => {
      const n = { ...e, jours: e.jours.includes(jourCourt(new Date())) ? e.jours : [...e.jours, jourCourt(new Date())] };
      if (type === "strategie") {
        const m = { ...e.strategie.maitrise };
        const c = m[info.cle] ?? { n: 0, bon: 0 };
        m[info.cle] = { n: c.n + 1, bon: c.bon + (info.ok ? 1 : 0) };
        n.strategie = {
          total: e.strategie.total + 1,
          bon: e.strategie.bon + (info.ok ? 1 : 0),
          maitrise: m,
          recents: [...(e.strategie.recents ?? []), info.ok ? 1 : 0].slice(-FENETRES.strategie),
        };
      } else if (type === "valeur") {
        n.valeur = {
          total: e.valeur.total + 1,
          bon: e.valeur.bon + (info.ok ? 1 : 0),
          tempsTotal: e.valeur.tempsTotal + (info.temps || 0),
          recents: [...(e.valeur.recents ?? []), info.ok ? 1 : 0].slice(-FENETRES.valeur),
          tempsRecents: [...(e.valeur.tempsRecents ?? []), info.temps || 0].slice(-FENETRES.valeur),
        };
      } else if (type === "sabot") {
        n.sabot = {
          essais: e.sabot.essais + 1,
          reussis: e.sabot.reussis + (info.ok ? 1 : 0),
          meilleureVitesse: info.ok
            ? Math.min(e.sabot.meilleureVitesse ?? Infinity, info.vitesse)
            : e.sabot.meilleureVitesse,
          recents: [...(e.sabot.recents ?? []), info.ok ? 1 : 0].slice(-FENETRES.sabot),
        };
      } else if (type === "tc" || type === "indices") {
        n[type] = {
          total: e[type].total + 1,
          bon: e[type].bon + (info.ok ? 1 : 0),
          recents: [...(e[type].recents ?? []), info.ok ? 1 : 0].slice(-FENETRES[type]),
        };
      }
      return n;
    });
  }, []);
  const normaliser = (r, cle) => {
    const suivant = { ...r };
    if (suivant.nbPaquets < 4) suivant.nbPaquets = 6;
    if (cle === "nbPaquets" && r.coupe != null) suivant.coupe = Math.min(r.coupe, r.nbPaquets - 0.5) || 0.5;
    return suivant;
  };
  let etatInitial = {
    ...PROFILS[0].valeurs,
    neutres: false,
    enseigne: "pique",
    das: true,
    sons: true,
    jeuSons: "marque",
    tic: true,
    miseMin: 5,
    miseMax: 500,
    plafondPerte: 0,
    periodePlafond: "semaine",
    ...(sauvegarde?.defauts ?? {}),
  };
  // Une sauvegarde antérieure peut contenir 1 ou 2 paquets, valeurs retirées.
  if (!etatInitial.nbPaquets || etatInitial.nbPaquets < 4) etatInitial.nbPaquets = 6;
  const [defauts, setDefauts] = useState(etatInitial);

  const toutesLesDonnees = useCallback(
    () => ({ defauts, theme, systemeId, sessions, entrainement: entr, mesTables, lieuxInfos }),
    [defauts, theme, systemeId, sessions, entr, mesTables, lieuxInfos]
  );

  /* Sauvegarde depuis l'en-tête : même action que dans les paramètres, avec un
     bref message en retour. */
  const [flashSauvegarde, setFlashSauvegarde] = useState("");
  const sauvegarderVite = () => {
    const tout = toutesLesDonnees();
    const interne = ecrireInstantane(tout);
    const fichier = exporterTout(tout);
    setRappelSauvegarde(sauvegardeAgee());
    setFlashSauvegarde(
      interne && fichier ? "Sauvegardé et téléchargé" : interne ? "Sauvegardé, téléchargement échoué" : "Sauvegarde impossible"
    );
    setTimeout(() => setFlashSauvegarde(""), 2600);
  };
  const [reglages, setReglages] = useState(etatInitial);
  // Ajustement de passage : ne touche pas aux valeurs enregistrées.
  const majReglage = (cle, valeur) => setReglages((r) => normaliser({ ...r, [cle]: valeur }, cle));
  // Modification dans les paramètres : change le défaut et l'applique.
  const majDefaut = (cle, valeur) => {
    const v = normaliser({ ...defauts, [cle]: valeur }, cle);
    setDefauts(v);
    setReglages(v);
  };
  const appliquerProfil = (prof) => {
    // Les profils décrivent la table, pas les préférences d'affichage.
    const v = {
      ...prof.valeurs,
      neutres: defauts.neutres,
      enseigne: defauts.enseigne,
      das: defauts.das,
      sons: defauts.sons,
      jeuSons: defauts.jeuSons,
      tic: defauts.tic,
      capital: defauts.capital,
      miseMin: defauts.miseMin,
      miseMax: defauts.miseMax,
      plafondPerte: defauts.plafondPerte,
      periodePlafond: defauts.periodePlafond,
    };
    setDefauts(v);
    setReglages(v);
  };
  /** Enregistre le bilan d'une série terminée. */
  const noterBilan = useCallback((b) => {
    setEntr((e) => ({
      ...e,
      bilans: rognerBilans([...(e.bilans ?? []), { ...b, id: Date.now(), date: new Date().toISOString(), garde: false }]),
    }));
  }, []);

  const [stockageActif, setStockageActif] = useState(true);
  useEffect(() => {
    setStockageActif(
      ecrireStockage({ defauts, theme, systemeId, sessions, mesTables, lieuxInfos, entrainement: entr, codeHash, codeVu, vue, vueDate: Date.now(), sabot: { cartes: historique, systeme: systemeId, date: Date.now() } })
    );
  }, [defauts, theme, systemeId, sessions, mesTables, lieuxInfos, entr, codeHash, codeVu, vue, historique]);

  const modifie = !memesReglages(reglages, defauts);
  const enseigneLogo =
    ENSEIGNES_LOGO.find((e) => e.v === defauts.enseigne) ?? ENSEIGNES_LOGO[0];

  // L'icône de l'onglet suit l'enseigne choisie et le thème actif.
  useEffect(() => {
    try {
      /* Le même jeton que dans l'en-tête, dessiné pour l'onglet du navigateur. */
      const sombre = fondSombre;
      const creux = sombre ? "#191C21" : "#F2F2EE";
      const fond = enseigneLogo.rouge ? (sombre ? "#C4444B" : "#A32D2D") : sombre ? "#E9E9E4" : "#14171A";
      const creneaux =
        `<rect x="27" y="0" width="10" height="11"/><rect x="27" y="53" width="10" height="11"/>` +
        `<rect x="0" y="27" width="11" height="10"/><rect x="53" y="27" width="11" height="10"/>` +
        `<rect x="8" y="8" width="10" height="11" transform="rotate(-45 13 13.5)"/>` +
        `<rect x="46" y="8" width="10" height="11" transform="rotate(45 51 13.5)"/>` +
        `<rect x="8" y="45" width="10" height="11" transform="rotate(45 13 50.5)"/>` +
        `<rect x="46" y="45" width="10" height="11" transform="rotate(-45 51 50.5)"/>`;
      const svg =
        `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">` +
        `<circle cx="32" cy="32" r="30" fill="${fond}"/>` +
        `<g fill="${creux}">${creneaux}</g>` +
        `<circle cx="32" cy="32" r="21" fill="none" stroke="${creux}" stroke-width="2.5"/>` +
        `<path d="${TRACES_ENSEIGNE[enseigneLogo.v] ?? TRACES_ENSEIGNE.pique}" fill="${creux}"/>` +
        `</svg>`;
      const href = "data:image/svg+xml," + encodeURIComponent(svg);
      for (const rel of ["icon", "apple-touch-icon"]) {
        let lien = document.querySelector(`link[rel="${rel}"]`);
        if (!lien) {
          lien = document.createElement("link");
          lien.rel = rel;
          document.head.appendChild(lien);
        }
        lien.href = href;
      }
    } catch {
      /* icône inchangée : sans conséquence */
    }
  }, [enseigneLogo, themeActif, fondSombre]);
  const nbPaquets = reglages.nbPaquets;
  const setNbPaquets = (v) => majReglage("nbPaquets", v);
  const sys = SYSTEMS[systemeId];
  const [avantParametres, setAvantParametres] = useState("accueil");
  const positionQuittee = useRef(0);
  const positionARestaurer = useRef(null);
  /* L'exercice en cours signale ici qu'une série est engagée. Quitter la page
     l'interrompt, donc on demande confirmation avant. */
  const gardeExercice = useRef(false);
  /* Historique des vues visitées : le retour y puise au lieu de sauter à
     l'accueil. Le drapeau évite qu'un retour ne s'inscrive lui-même. */
  /* Deux repères seulement : l'onglet précédent de la page courante, et la page
     précédente. Le retour les emprunte dans cet ordre, puis l'accueil — on ne
     rembobine pas tout le parcours. */
  const histoire = useRef(
    (() => {
      try {
        const v = JSON.parse(sessionStorage.getItem("big-jack-theory-chemin") || "null");
        if (v && typeof v === "object" && !Array.isArray(v)) return v;
      } catch {
        /* stockage indisponible */
      }
      return { onglet: null, page: null };
    })()
  );
  const vuePrecedente = useRef(null);
  const enRetour = useRef(false);
  const [quitterVers, setQuitterVers] = useState(null);
  const [sortieParam, setSortieParam] = useState(false);

  const basculerParametres = () => {
    if (vue === "parametres") {
      /* On laisse le panneau remonter avant de le retirer : sans ce délai, il
         disparaîtrait d'un coup et l'ouverture seule serait animée. */
      if (sortieParam) return;
      setSortieParam(true);
      setTimeout(() => {
        positionARestaurer.current = positionQuittee.current;
        setVue(avantParametres);
        setSortieParam(false);
      }, 90);
    } else {
      /* On mémorise la position pour y revenir, puis on remonte : les
         paramètres s'ouvrent en haut, pas à la hauteur où l'on lisait. */
      positionQuittee.current = window.scrollY || 0;
      window.scrollTo(0, 0);
      setAvantParametres(vue);
      setVue("parametres");
      /* Un jalon leur est propre : le retour les referme et rend la main à la
         page d'où l'on vient, sans toucher au parcours. */
      poserEtape();
    }
  };

  /* Les paramètres se referment au retour, comme un panneau : ils sont posés
     par-dessus le parcours, ils n'en font pas partie. */
  useEffect(() => {
    poserRetour("parametres", vue === "parametres", () => basculerParametres());
    return () => poserRetour("parametres", false, () => {});
  }, [vue, avantParametres]);

  // Le navigateur restaure sa position de défilement au rechargement, ce qui
  // renvoyait en bas de l'accueil quand on venait d'une page longue.
  useEffect(() => {
    try {
      if ("scrollRestoration" in window.history) window.history.scrollRestoration = "manual";
      window.scrollTo(0, 0);
    } catch {
      /* sans conséquence */
    }
  }, []);

  // Changer d'écran ramène en haut, sauf en refermant les paramètres.
  useEffect(() => {
    /* Uniquement au retour des paramètres, où une position a été mise de côté.
       Les autres changements de vue remontent déjà eux-mêmes, avant le rendu :
       défiler ici en plus produisait une seconde remontée visible. */
    const y = positionARestaurer.current;
    if (y === null) return;
    positionARestaurer.current = null;
    try {
      window.scrollTo(0, y);
    } catch {
      /* défilement indisponible */
    }
  }, [vue]);
  const [dernierTheorie, setDernierTheorie] = useState(GROUPE_THEORIE[0].v);
  const [derniereStrategie, setDerniereStrategie] = useState("strategie");
  useEffect(() => {
    if (EST_THEORIE(vue)) setDernierTheorie(vue);
    if (EST_STRATEGIE(vue)) setDerniereStrategie(vue);
  }, [vue]);
  const changerVue = (v) => {
    /* Changer de page ramène en haut, avant le rendu comme ailleurs. */
    window.scrollTo(0, 0);
    setVue(v === "theorie" ? dernierTheorie : v === "strategie" ? derniereStrategie : v);
  };
  const allerOnglet = (v) => {
    /* Une série engagée serait perdue : on demande avant de quitter. */
    if (gardeExercice.engage && gardeExercice.engage() && v !== "entrainement") {
      setQuitterVers(v);
      return;
    }
    changerVue(v);
  };

  const changerSysteme = (id) => {
    setSystemeId(id);
    setHistorique([]);
    /* Le contenu change entièrement — valeurs, seuils, fiche : on repart du
       haut. Sauf dans la liste des systèmes, où l'on compare : y remonter
       ferait perdre la ligne qu'on était en train de lire.
       La remontée est répétée : sur mobile, la fermeture du menu déroulant
       natif restitue parfois la position d'avant. */
    if (vue === "recap") return;
    window.scrollTo(0, 0);
    requestAnimationFrame(() => window.scrollTo(0, 0));
    setTimeout(() => window.scrollTo(0, 0), 60);
  };

  /* Sous les paramètres, la page de fond reste celle que l'on consultait. */
  const vueFond = vue === "parametres" ? avantParametres : vue;

  const onglets = [
    { v: "accueil", l: "Accueil", court: "Accueil", barre: false },
    { v: "strategie", l: "À la table", court: "À la table", barre: true },
    { v: "entrainement", l: "S'entraîner", court: "S'entraîner", barre: true },
    { v: "theorie", l: "Comprendre", court: "Comprendre", barre: true },
    { v: "journal", l: "Journal", court: "Journal", barre: true },
  ];

  /* Hauteur réelle de l'en-tête, mesurée après rendu : la valeur écrite en dur
     laissait un décalage sous les bandes collées. */
  const entete = useRef(null);
  const [hauteurEntete, setHauteurEntete] = useState(mobile ? 53 : 49);
  useEffect(() => {
    const mesurer = () => {
      const h = entete.current?.getBoundingClientRect().height;
      if (h && Math.abs(h - hauteurEntete) > 0.5) setHauteurEntete(h);
    };
    mesurer();
    window.addEventListener("resize", mesurer);
    return () => window.removeEventListener("resize", mesurer);
  }, [mobile, hauteurEntete]);
  /* La barre des sous-onglets est mesurée elle aussi : la constante écrite en
     dur laissait le cadre du compteur trop bas. */
  const sousNav = useRef(null);
  const [hauteurSousNav, setHauteurSousNav] = useState(HAUTEUR_SOUSNAV);
  useEffect(() => {
    const mesurer = () => {
      const h = sousNav.current?.getBoundingClientRect().height;
      if (h && Math.abs(h - hauteurSousNav) > 0.5) setHauteurSousNav(h);
    };
    mesurer();
    window.addEventListener("resize", mesurer);
    return () => window.removeEventListener("resize", mesurer);
  }, [mobile, hauteurSousNav, vue]);

  const wrap = {
    maxWidth: 1080,
    margin: "0 auto",
    padding: mobile ? "0 14px 24px" : "0 20px 72px",
  };

  return (
    <div className="bjc" style={{ ...THEMES[themeActif], paddingBottom: mobile ? 74 : 0 }}>
      <style>{CSS}</style>

      <header
        ref={entete}
        data-colle="1"
        style={{
          borderBottom: "1px solid var(--regle)",
          background: "var(--papier)",
          position: "sticky",
          top: 0,
          zIndex: 25,
        }}
      >
        <div
          style={{
            maxWidth: 1080,
            margin: "0 auto",
            padding: mobile ? "0 14px" : "0 20px",
            display: "flex",
            alignItems: "center",
            gap: mobile ? 10 : 26,
          }}
        >
          <button
            onClick={() => {
              /* Comme tout changement de page : on arrive en haut. */
              window.scrollTo(0, 0);
              setVue("accueil");
            }}
            aria-label="Retour à l'accueil"
            style={{
              display: "flex",
              alignItems: "center",
              gap: 9,
              padding: "8px 0",
              flexShrink: 0,
              opacity: vue === "accueil" ? 1 : 0.92,
            }}
          >
            {vue !== "accueil" && (
              <span className="mono" aria-hidden="true" style={{ fontSize: 14, color: "var(--encre2)" }}>
                ←
              </span>
            )}
            <JetonLogo enseigne={defauts.enseigne ?? "pique"} taille={mobile ? 30 : 34} sombre={fondSombre} />
            {mobile ? (
              /* Les deux lignes sont forcées à la même largeur : textLength
                 étire l'espacement, « Theory » s'aligne donc sur « Big Jack ». */
              /* Les deux lignes sont forcées à la même largeur : textLength
                 étire l'espacement, « Theory » s'aligne donc sur « Big Jack ». */
              <svg width="52" height="25" viewBox="0 0 100 48" aria-hidden="true" style={{ display: "block", flexShrink: 0 }}>
                {[
                  ["Big Jack", 20],
                  ["Theory", 44],
                ].map(([mot, y]) => (
                  <text
                    key={mot}
                    x="0"
                    y={y}
                    textLength="100"
                    lengthAdjust="spacingAndGlyphs"
                    fill="var(--encre)"
                    style={{ fontFamily: "'Source Serif 4', Georgia, serif", fontWeight: 700, fontSize: 22 }}
                  >
                    {mot}
                  </text>
                ))}
              </svg>
            ) : (
              <span
                style={{
                  fontFamily: "'Public Sans', ui-sans-serif, sans-serif",
                  fontWeight: 700,
                  letterSpacing: "-.008em",
                  lineHeight: 1,
                  fontSize: 17,
                  textAlign: "left",
                  whiteSpace: "nowrap",
                }}
              >
                Big Jack Theory
              </span>
            )}
          </button>

          {!mobile && (
            <nav className="bjc-nav" style={{ display: "flex", gap: 22, marginLeft: "auto" }}>
              {onglets.map((o) => (
                <button
                  key={o.v}
                  data-actif={(o.v === "theorie" ? EST_THEORIE(vue) : o.v === "strategie" ? EST_STRATEGIE(vue) : vue === o.v) ? "1" : "0"}
                  onClick={() => allerOnglet(o.v)}
                >
                  {o.l}
                </button>
              ))}
            </nav>
          )}

          <div style={{ display: "flex", alignItems: "center", gap: mobile ? 6 : 8, marginLeft: "auto", flexShrink: 0 }}>
            {/* Le système actif se change aussi depuis la liste : elle le met
                en avant, autant pouvoir en changer sans ouvrir une fiche. */}
            {["compteur", "entrainement", "fiche", "recap"].includes(vue) && (
              <select
                value={systemeId}
                onChange={(e) => changerSysteme(e.target.value)}
                aria-label="Système de comptage"
                style={{
                  border: "1px solid var(--regle)",
                  background: "var(--panneau)",
                  padding: "8px 8px",
                  borderRadius: 3,
                  fontSize: 13,
                  maxWidth: mobile ? 96 : "none",
                }}
              >
                {ORDRE.map((id) => (
                  <option key={id} value={id}>{SYSTEMS[id].nom}</option>
                ))}
              </select>
            )}
            <button
              onClick={() => setTheme(fondSombre ? "clair" : "sombre")}
              aria-label={fondSombre ? "Passer en thème clair" : "Passer en thème sombre"}
              style={{
                width: mobile ? 32 : 36,
                height: mobile ? 32 : 36,
                borderRadius: 3,
                border: "1px solid var(--regle)",
                background: "var(--panneau)",
                fontSize: 15,
                lineHeight: 1,
                flexShrink: 0,
              }}
            >
              {fondSombre ? "☀" : "☾"}
            </button>
            <button
              onClick={sauvegarderVite}
              aria-label="Sauvegarder maintenant"
              title="Sauvegarder maintenant"
              className="bjc-tap"
              style={{
                position: "relative",
                width: mobile ? 32 : 36,
                height: mobile ? 32 : 36,
                borderRadius: 3,
                border: `1px solid ${rappelSauvegarde ? "var(--or)" : "var(--regle)"}`,
                background: "var(--panneau)",
                color: rappelSauvegarde ? "var(--or)" : "var(--encre)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                lineHeight: 1,
                flexShrink: 0,
              }}
            >
              {/* Disquette : le symbole que tout le monde reconnaît. */}
              <svg width="15" height="15" viewBox="0 0 16 16" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.4">
                <path d="M2.5 1.8h8.6l2.9 2.9v9.3H2.5z" strokeLinejoin="round" />
                <path d="M5.2 1.8h5.4v3.6H5.2z" strokeLinejoin="round" />
                <path d="M4.4 9.4h7.2v4.6H4.4z" strokeLinejoin="round" />
              </svg>
            </button>
            <button
              onClick={basculerParametres}
              data-superpose="1"
              aria-label={
                vue === "parametres"
                  ? "Fermer les paramètres"
                  : rappelSauvegarde
                  ? "Paramètres — sauvegarde à faire"
                  : "Paramètres"
              }
              title={vue === "parametres" ? "Fermer les paramètres" : "Paramètres"}
              style={{
                position: "relative",
                width: mobile ? 32 : 36,
                height: mobile ? 32 : 36,
                borderRadius: 3,
                border: `1px solid ${vue === "parametres" ? "var(--encre)" : "var(--regle)"}`,
                background: vue === "parametres" ? "var(--encre)" : "var(--panneau)",
                color: vue === "parametres" ? "var(--panneau)" : "var(--encre)",
                fontSize: 16,
                lineHeight: 1,
                flexShrink: 0,
              }}
            >
              ⚙
              {rappelSauvegarde && (
                <span
                  aria-hidden="true"
                  style={{
                    position: "absolute",
                    top: -3,
                    right: -3,
                    width: 9,
                    height: 9,
                    borderRadius: "50%",
                    background: "var(--or)",
                    border: "2px solid var(--papier)",
                  }}
                />
              )}
            </button>
          </div>
        </div>
      </header>

      {EST_STRATEGIE(vue) && (
        <SousNav cadre={sousNav} onglets={GROUPE_STRATEGIE} vue={vue} setVue={setVue} mobile={mobile} wrap={wrap} hauteurEntete={hauteurEntete} />
      )}
      {EST_THEORIE(vue) && (
        <SousNav cadre={sousNav} onglets={GROUPE_THEORIE} vue={vue} setVue={setVue} mobile={mobile} wrap={wrap} hauteurEntete={hauteurEntete} />
      )}
      {/* La zone de contenu reste montée sous les paramètres : elle est
          seulement masquée. Ouvrir les réglages ne doit rien perdre — ni la
          hauteur de lecture, ni un panneau déplié, ni un exercice en cours. */}
      <div
        {...balayagePage}
        style={{ touchAction: "pan-y", ...(vue === "parametres" ? { display: "none" } : null) }}
      >
      {vueFond === "accueil" && <VueAccueil sys={sys} enseigne={defauts.enseigne} allerA={setVue} mobile={mobile} wrap={wrap} />}
      {vueFond === "lexique" && <VueLexique mobile={mobile} wrap={wrap} />}
      {dialogue && (
        <EcranCode
          mode={dialogue.mode}
          mobile={mobile}
          erreur={erreurCode}
          onAnnuler={() => { setDialogue(null); setErreurCode(""); }}
          onValider={(v, err) => {
            if (err) { setErreurCode(err); return; }
            if (dialogue.mode === "definir") {
              if (v === CLE_SECOURS) { setErreurCode("Ce code est réservé au secours."); return; }
              setCodeHash(empreinte(v));
              setCodeVu(true);
              setDialogue(null);
              setErreurCode("");
              return;
            }
            if (v === CLE_SECOURS) {
              setCodeHash(null);
              setCodeVu(true);
              setDialogue(null);
              setErreurCode("");
              return;
            }
            if (empreinte(v) !== codeHash) { setErreurCode("Code incorrect."); return; }
            const a = dialogue.action;
            setDialogue(null);
            setErreurCode("");
            a && a();
          }}
        />
      )}

      {!codeVu && !codeHash && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 99,
            background: "rgba(0,0,0,.62)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 16,
          }}
        >
          <div style={{ ...S.panneau, maxWidth: 360, padding: mobile ? "22px 18px" : "28px 24px", boxShadow: "var(--ombre-forte)" }}>
            <h2 style={{ fontSize: mobile ? 18 : 20, margin: "0 0 8px", fontWeight: 700, letterSpacing: "-.01em" }}>
              Protéger vos données
            </h2>
            <p style={{ fontSize: 14, lineHeight: 1.55, color: "var(--encre2)", margin: "0 0 16px" }}>
              Un code à quatre chiffres, demandé avant toute suppression. Contre les fausses manœuvres, pas contre
              quelqu'un de déterminé.
            </p>
            <div style={{ display: "flex", gap: 9, flexWrap: "wrap" }}>
              <button
                onClick={() => { setDialogue({ mode: "definir" }); setErreurCode(""); }}
                className="bjc-tap"
                style={{ background: "var(--encre)", color: "var(--panneau)", padding: "12px 20px", borderRadius: 3, fontWeight: 700, fontSize: 14.5 }}
              >
                Définir un code
              </button>
              <button
                onClick={() => setCodeVu(true)}
                style={{ border: "1px solid var(--regle)", padding: "12px 20px", borderRadius: 3, fontWeight: 600, fontSize: 14.5, color: "var(--encre2)" }}
              >
                Plus tard
              </button>
            </div>
          </div>
        </div>
      )}

      {modifie && vue !== "parametres" && (
        <div style={{ ...wrap, paddingTop: mobile ? 12 : 20, paddingBottom: 0 }}>
          <div
            style={{
              ...S.panneau,
              borderLeft: "3px solid var(--or)",
              padding: mobile ? "11px 13px" : "13px 16px",
              display: "flex",
              flexWrap: "wrap",
              alignItems: "center",
              gap: 10,
            }}
          >
            <span style={{ fontSize: 13.5, lineHeight: 1.45, flex: "1 1 200px" }}>
              Réglages ajustés pour cette session. Vos paramètres enregistrés sont inchangés.
            </span>
            <button
              onClick={() => setReglages(defauts)}
              style={{
                border: "1px solid var(--regle)",
                padding: "8px 13px",
                borderRadius: 3,
                fontSize: 13,
                fontWeight: 600,
              }}
            >
              Rétablir
            </button>
            <button
              onClick={() => setDefauts(reglages)}
              style={{
                background: "var(--encre)",
                color: "var(--panneau)",
                padding: "8px 13px",
                borderRadius: 3,
                fontSize: 13,
                fontWeight: 600,
              }}
            >
              Enregistrer
            </button>
          </div>
        </div>
      )}

      {vueFond === "lectures" && <VueLectures mobile={mobile} wrap={wrap} />}
      {vueFond === "strategie" && (
        <VueStrategie mobile={mobile} wrap={wrap} hauteurEntete={hauteurEntete} hauteurSousNav={hauteurSousNav} reglages={reglages} majReglage={majReglage} />
      )}
      {vueFond === "mises" && <VueMises mobile={mobile} wrap={wrap} reglages={reglages} />}
      {vueFond === "recap" && (
        <VueMenu systemeId={systemeId} setSysteme={changerSysteme} allerA={setVue} mobile={mobile} wrap={wrap} />
      )}
      {vueFond === "fiche" && <VueFiche sys={sys} allerA={setVue} mobile={mobile} wrap={wrap} reglages={reglages} />}
      {vueFond === "compteur" && (
        <VueCompteur
          key={systemeId}
          sys={sys}
          nbPaquets={nbPaquets}
          setNbPaquets={setNbPaquets}
          historique={historique}
          setHistorique={setHistorique}
          mobile={mobile}
          wrap={wrap}
          hauteurEntete={hauteurEntete}
          hauteurSousNav={hauteurSousNav}
          reglages={reglages}
          majReglage={majReglage}
          sabotRepris={sabotRepris}
        />
      )}
      <Confirmation
        ouvert={quitterVers !== null}
        mobile={mobile}
        titre="Quitter l'exercice ?"
        texte="La série en cours sera interrompue. Les réponses déjà données restent comptées dans votre profil."
        actionLabel="Quitter l'exercice"
        onAction={() => {
          const v = quitterVers;
          setQuitterVers(null);
          /* Le retour matériel revient au menu des exercices ; la barre de
             navigation, elle, part vers la page demandée. */
          if (v === "__consignes") {
            gardeExercice.consignes && gardeExercice.consignes();
            return;
          }
          gardeExercice.current = false;
          changerVue(v);
        }}
        onAnnuler={() => setQuitterVers(null)}
      />
      {vueFond === "entrainement" && <VueEntrainement sys={sys} mobile={mobile} wrap={wrap} reglages={reglages} majReglage={majReglage} entr={entr} noter={noter} noterBilan={noterBilan} allerTheorie={() => { window.scrollTo(0, 0); setVue("fiche"); }} allerStrategie={() => { window.scrollTo(0, 0); setVue("strategie"); }}
          effacerBilans={() => setEntr((e) => ({ ...e, bilans: [] }))}
          supprimerBilan={(id) =>
            setEntr((e) => ({ ...e, bilans: (e.bilans ?? []).filter((b) => b.id !== id) }))
          }
          basculerGarde={(id) =>
            setEntr((e) => ({
              ...e,
              bilans: (e.bilans ?? []).map((b) => (b.id === id ? { ...b, garde: !b.garde } : b)),
            }))
          }
          reinitEntr={() => proteger(() => setEntr(ENTRAINEMENT_VIDE))} gardeExercice={gardeExercice} />}
      {/* Les paramètres se superposent au journal plutôt que de le remplacer :
          on le garde monté, simplement masqué, pour retrouver ses panneaux
          ouverts et sa position en revenant. */}
      {(EST_JOURNAL(vue) || (vue === "parametres" && EST_JOURNAL(avantParametres))) && (
        <div style={EST_JOURNAL(vue) ? undefined : { display: "none" }}>
          <VueJournal mobile={mobile} wrap={wrap} vue={vueFond} setVue={setVue} hauteurEntete={hauteurEntete} sessions={sessions} setSessions={setSessions} reglages={reglages} proteger={proteger} codeDefini={!!codeHash} lieuxInfos={lieuxInfos} setLieuxInfos={setLieuxInfos} />
        </div>
      )}

      </div>

      {/* Les paramètres descendent par-dessus la page au lieu de la remplacer :
          le mouvement dit que rien n'a été quitté. */}
      {vue === "parametres" && (
        <div className={sortieParam ? "bjc-remonte" : "bjc-descend"}>
        <VueParametres
          mobile={mobile}
          wrap={wrap}
          theme={theme}
          setTheme={setTheme}
          systemeId={systemeId}
          setSysteme={changerSysteme}
          defauts={defauts}
          majDefaut={majDefaut}
          appliquerProfil={appliquerProfil}
          mesTables={mesTables}
          supprimerTable={(id) => setMesTables((l) => l.filter((t) => t.id !== id))}
          enregistrerBrouillon={({ id, nom, valeurs }) => {
            const n = nom.trim();
            if (!n) return;
            setMesTables((l) =>
              id
                ? l.map((t) => (t.id === id ? { ...t, nom: n, valeurs } : t))
                : [...l.filter((t) => t.nom !== n), { id: "perso-" + Date.now(), nom: n, valeurs }]
            );
          }}
          stockageActif={stockageActif}
          toutesLesDonnees={toutesLesDonnees}
          nbSessions={sessions.length}
          effacerToutTotal={() => proteger(() => {
            effacerStockage();
            effacerInstantane();
            setDefauts(etatInitial);
            setReglages(etatInitial);
            setTheme(null);
            setSystemeId("hilo");
            setSessions([]);
            setMesTables([]);
            setLieuxInfos({});
            setEntr(ENTRAINEMENT_VIDE);
            setHistorique([]);
            setCodeHash(null);
            setCodeVu(false);
            setVue("accueil");
          })}
          codeDefini={!!codeHash}
          definirCode={() => { setErreurCode(""); setDialogue({ mode: "definir" }); }}
          retirerCode={() => proteger(() => { setCodeHash(null); setCodeVu(true); })}
          appliquerSauvegarde={(d) => proteger(() => {
            if (d.defauts) {
              const v = { ...etatInitial, ...d.defauts };
              setDefauts(v);
              setReglages(v);
            }
            if (d.theme !== undefined) setTheme(d.theme);
            if (d.systemeId) setSystemeId(d.systemeId);
            if (Array.isArray(d.sessions)) setSessions(d.sessions);
            if (Array.isArray(d.mesTables)) setMesTables(d.mesTables);
            if (d.lieuxInfos && typeof d.lieuxInfos === "object") setLieuxInfos(d.lieuxInfos);
            if (d.entrainement) {
              const e = { ...ENTRAINEMENT_VIDE, ...d.entrainement };
              for (const c of ["strategie", "valeur", "sabot", "tc", "indices"]) {
                e[c] = { ...ENTRAINEMENT_VIDE[c], ...(d.entrainement[c] ?? {}) };
              }
              setEntr(e);
            }
          })}
          reinitialiser={() => {
            effacerStockage();
            const v = { ...PROFILS[0].valeurs, neutres: false, enseigne: "pique" };
            setDefauts(v);
            setReglages(v);
            setTheme(null);
            setSystemeId("hilo");
            // Le journal n'est pas touché : ce bouton ne concerne que les réglages.
          }}
        />
        </div>
      )}

      <footer style={{ borderTop: "1px solid var(--regle)", marginTop: 32 }}>
        <div
          style={{
            maxWidth: 720,
            margin: "0 auto",
            padding: mobile ? "18px 14px 26px" : "22px 20px 34px",
            fontSize: 12.5,
            lineHeight: 1.65,
            color: "var(--encre2)",
          }}
        >
          <p style={{ margin: "0 0 12px" }}>
            Compter les cartes n'est pas illégal, mais un casino est un établissement privé : il peut limiter vos mises
            ou vous refuser l'accès. L'avantage théorique dépasse rarement 1 %, et il ne se matérialise qu'après des
            dizaines d'heures — la pénétration du sabot et une table qui paie le blackjack 3:2 comptent davantage que le
            choix du système.
          </p>
          <p style={{ margin: "0 0 12px" }}>
            Les calculs de cette application sont donnés à titre informatif et ne garantissent aucun résultat. Le
            blackjack reste un jeu d'argent : n'engagez que ce que vous pouvez perdre. Si le jeu cesse d'être un plaisir,
            le Joueurs Anonymes et les services d'aide aux joueurs de votre région existent pour ça.
          </p>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "baseline",
              gap: 12,
              flexWrap: "wrap",
              borderTop: "1px solid var(--regle)",
              paddingTop: 12,
              fontSize: 12,
            }}
          >
            <span>
              <b style={{ color: "var(--encre)" }}>Big Jack Theory</b>{" "}
              <span className="mono" style={{ color: "var(--or)" }}>v{VERSION}</span> — {DATE_VERSION}. © 2026, tous
              droits réservés.
            </span>
            <span>
              Redistribution et usage commercial interdits sans autorisation écrite.
            </span>
            {/* Mention d'usage : le lecteur doit pouvoir juger de la nature du
                travail, et vérifier ce qui compte auprès d'une source établie. */}
            <span style={{ flexBasis: "100%", color: "var(--encre2)" }}>
              Application conçue et développée avec l'aide d'une intelligence artificielle générative. Les tableaux et
              les chiffres proviennent de sources publiées, citées dans les lectures ; vérifiez-y ce qui vous engage.
            </span>
          </div>
        </div>
      </footer>

      {flashSauvegarde && (
        <div
          role="status"
          style={{
            position: "fixed",
            left: "50%",
            transform: "translateX(-50%)",
            bottom: mobile ? 88 : 32,
            zIndex: 98,
            background: "var(--encre)",
            color: "var(--panneau)",
            padding: "10px 18px",
            borderRadius: 3,
            fontSize: 13.5,
            fontWeight: 600,
            boxShadow: "var(--ombre-forte)",
            pointerEvents: "none",
          }}
        >
          {flashSauvegarde}
        </div>
      )}

      {quitterMessage && (
        <div
          role="status"
          style={{
            position: "fixed",
            left: "50%",
            transform: "translateX(-50%)",
            bottom: mobile ? 88 : 32,
            zIndex: 98,
            background: "var(--encre)",
            color: "var(--panneau)",
            padding: "10px 18px",
            borderRadius: 3,
            fontSize: 13.5,
            fontWeight: 600,
            boxShadow: "var(--ombre-forte)",
            pointerEvents: "none",
          }}
        >
          Appuyez à nouveau pour quitter
        </div>
      )}

      {/* Navigation basse — mobile uniquement */}
      {mobile && (
        <nav
          style={{
            position: "fixed",
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 30,
            display: "grid",
            /* Le nombre de colonnes suit la liste : figé à cinq, il laissait
               une colonne vide à droite depuis la réorganisation. */
            gridTemplateColumns: `repeat(${onglets.filter((o) => o.barre).length},1fr)`,
            background: "var(--panneau)",
            borderTop: "1px solid var(--regle)",
            paddingBottom: "env(safe-area-inset-bottom)",
          }}
        >
          {onglets.filter((o) => o.barre).map((o) => {
            const actif = o.v === "theorie" ? EST_THEORIE(vue) : o.v === "strategie" ? EST_STRATEGIE(vue) : vue === o.v;
            return (
              <button
                key={o.v}
                onClick={() => allerOnglet(o.v)}
                style={{
                  padding: "13px 4px 14px",
                  fontSize: 11.5,
                  fontWeight: 700,
                  letterSpacing: "0",
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  color: actif ? "var(--encre)" : "var(--encre2)",
                  borderTop: `2px solid ${actif ? "var(--rouge)" : "transparent"}`,
                  marginTop: -1,
                }}
              >
                {o.court}
              </button>
            );
          })}
        </nav>
      )}
    </div>
  );
}
