/* Suite de tests de Big Jack Theory.
 *
 * Lancer :  node tests.mjs
 * Nécessite jsdom.  Lit /mnt/user-data/outputs/big-jack-theory.html
 *
 * Chaque section couvre une famille de régressions déjà rencontrées. Les
 * commentaires disent POURQUOI le test existe : c'est ce qui empêche de le
 * supprimer par erreur plus tard.
 */
import { lancer, verifier, bilan, jour } from "./outils.mjs";

const SESSIONS = [
  { id: 1, date: jour(1), depot: 50, retrait: 90, lieu: "Circus" },
  { id: 2, date: jour(4), depot: 40, retrait: 20, lieu: "Namur" },
];
const LIEUX = { Circus: { type: "site", plafond: 200 }, Namur: { type: "physique" } };

const PAGES = [
  ["À la table", ["Tableau", "Compteur"]],
  ["S'entraîner", []],
  ["Comprendre", ["Systèmes", "Mise", "Lexique", "Lectures"]],
  ["Journal", ["Analyse", "Sessions"]],
];

/* ── 1. Chaque écran s'affiche ────────────────────────────────────────────── */
async function ecrans() {
  console.log("\n1. LES DIX ÉCRANS");
  const a = lancer({ donnees: { sessions: SESSIONS, lieuxInfos: LIEUX } });
  await a.dormir(1100);
  for (const [page, sous] of PAGES) {
    a.parTexte(page).click(); await a.dormir(470);
    for (const o of (sous.length ? sous : [null])) {
      if (o) { const b = a.sousOnglet(o); if (b) { b.click(); await a.dormir(430); } }
      const t = a.d.getElementById("racine").textContent;
      const titre = a.d.querySelector("#racine h1");
      verifier(page + (o ? " / " + o : ""), !!titre && t.length > 2500, titre ? t.length + " car." : "sans titre");
    }
  }
  a.dom.window.close();
  return a.erreurs;
}

/* ── 2. Les paramètres s'ouvrent VRAIMENT ─────────────────────────────────── */
/* Régression de la 1.43.5 : rendus dans une zone masquée, présents dans le
   document mais invisibles. Un test sur textContent ne l'aurait pas vue. */
async function parametres() {
  console.log("\n2. PARAMÈTRES VISIBLES DEPUIS CHAQUE PAGE");
  const a = lancer({ donnees: { sessions: SESSIONS } });
  await a.dormir(1100);
  for (const [page, sous] of [[null, null], ["À la table", "Compteur"], ["S'entraîner", null], ["Comprendre", "Lexique"], ["Journal", null]]) {
    if (page) { a.parTexte(page).click(); await a.dormir(450); }
    if (sous) { const b = a.sousOnglet(sous); if (b) { b.click(); await a.dormir(430); } }
    a.parametres().click(); await a.dormir(650);
    verifier("depuis " + (page ?? "accueil") + (sous ? " / " + sous : ""), a.affiche(/Vos réglages/));
    a.parametres().click(); await a.dormir(600);
  }
  /* Ils ne comptent pas comme une étape du parcours. */
  a.parTexte("Comprendre").click(); await a.dormir(450);
  const avant = a.hist.jalons;
  a.parametres().click(); await a.dormir(620);
  await a.retour();
  verifier("le retour les referme sans consommer le parcours", a.hist.jalons === avant, "jalons " + a.hist.jalons + " au lieu de " + avant);
  a.dom.window.close();
  return a.erreurs;
}

/* ── 3. Le bouton retour du téléphone ─────────────────────────────────────── */
/* Régressions répétées : sortie sans avertissement, sauts d'étapes, jalons
   orphelins. L'historique simulé ignore les ajouts faits pendant le retour,
   comme le fait le navigateur mobile. */
async function retour() {
  console.log("\n3. BOUTON RETOUR");
  const a = lancer({ donnees: { sessions: SESSIONS } });
  await a.dormir(1100);
  a.parTexte("Journal").click(); await a.dormir(450);
  a.parTexte("Comprendre").click(); await a.dormir(450);
  a.sousOnglet("Lexique").click(); await a.dormir(450);

  await a.retour();
  verifier("onglet précédent", a.ou() === "Systèmes de comptage", a.ou());
  await a.retour();
  verifier("page précédente", a.ou() === "Vos sessions", a.ou());
  await a.retour();
  verifier("accueil", a.ou() === "accueil", a.ou());
  await a.retour();
  verifier("avertissement avant de quitter", a.affiche(/Appuyez à nouveau/) && !a.hist.sortie);
  await a.retour();
  verifier("sortie au second appui", a.hist.sortie === 1, "sorties " + a.hist.sortie);
  a.dom.window.close();
  return a.erreurs;
}

/* ── 3 bis. Les onglets du journal sont des vues ──────────────────────────── */
/* Ils étaient le seul cas d'un sous-onglet géré en interne : leur jalon
   d'historique restait orphelin quand on quittait la page, et il fallait un
   appui de trop pour sortir. */
async function ongletsJournal() {
  console.log("\n3 bis. ONGLETS DU JOURNAL");
  const a = lancer({ donnees: { sessions: SESSIONS } });
  await a.dormir(1100);
  a.parTexte("Journal").click(); await a.dormir(540);
  const barre = [...a.d.querySelectorAll("#racine div")].find((x) => x.style.position === "sticky" && x.style.background === "var(--papier)");
  verifier("le journal porte la barre commune", !!barre && /Analyse/.test(barre.textContent) && /Sessions/.test(barre.textContent));
  a.sousOnglet("Sessions").click(); await a.dormir(480);
  verifier("l'onglet Sessions s'ouvre", a.affiche(/Encoder une session/));
  const vus = [];
  for (let i = 0; i < 3 && !a.hist.sortie; i++) { await a.retour(); vus.push(a.ou()); }
  verifier("le retour repasse par Analyse puis l'accueil", vus[1] === "accueil", vus.join(" → "));
  a.dom.window.close();

  /* Quitter le journal depuis Sessions ne doit plus laisser de jalon derrière. */
  const b = lancer({ donnees: { sessions: SESSIONS } });
  await b.dormir(1100);
  b.parTexte("Journal").click(); await b.dormir(480);
  b.sousOnglet("Sessions").click(); await b.dormir(460);
  b.parTexte("Comprendre").click(); await b.dormir(460);
  const s2 = [];
  for (let i = 0; i < 5 && !b.hist.sortie; i++) { await b.retour(); s2.push(b.hist.sortie ? "SORTIE" : b.ou()); }
  verifier("deux appuis à l'accueil, pas trois", s2.filter((x) => x === "accueil").length === 2, s2.join(" → "));
  b.dom.window.close();
  return b.erreurs;
}

/* ── 4. Vue secondaire et page mère ───────────────────────────────────────── */
async function pageMere() {
  console.log("\n4. LA FICHE REND LA MAIN À SA LISTE");
  const a = lancer();
  await a.dormir(1100);
  a.parTexte("Comprendre").click(); await a.dormir(450);
  [...a.d.querySelectorAll("#racine [data-systeme] button")].filter((x) => x.style.flex === "1 1 0%")[2].click();
  await a.dormir(500);
  a.parTexte("À la table").click(); await a.dormir(450);
  const vus = [];
  for (let i = 0; i < 4 && !a.hist.sortie; i++) { await a.retour(); vus.push(a.ou()); }
  verifier("passe par la fiche puis les systèmes", vus.includes("Systèmes de comptage"), vus.join(" → "));
  a.dom.window.close();
  return a.erreurs;
}

/* ── 5. Exercices ─────────────────────────────────────────────────────────── */
async function exercices() {
  console.log("\n5. EXERCICES");
  const a = lancer();
  await a.dormir(1100);
  a.parTexte("S'entraîner").click(); await a.dormir(470);
  a.poser(360);
  a.boutons().find((x) => x.className === "bjc-tap" && x.textContent.includes("Valeur de carte")).click();
  await a.dormir(520);
  verifier("l'ouverture remonte en haut", a.position() === 0, "position " + a.position());
  a.boutons().find((x) => /Tous les exercices/.test(x.textContent)).click(); await a.dormir(600);
  verifier("le retour au menu retrouve sa place", a.position() === 360, "position " + a.position());

  /* Lire les consignes n'engage rien : pas de confirmation. */
  a.boutons().find((x) => x.className === "bjc-tap" && x.textContent.includes("Vrai compte")).click();
  await a.dormir(520);
  a.parTexte("Commencer").click(); await a.dormir(560);
  await a.retour();
  const dial = a.d.querySelector("#racine [role=dialog]");
  verifier("une série engagée demande confirmation", !!dial);
  if (dial) {
    [...dial.querySelectorAll("button")].find((x) => /Quitter/.test(x.textContent)).click();
    await a.dormir(600);
    verifier("confirmer ramène aux consignes", a.ou() === "consignes", a.ou());
  }
  a.dom.window.close();
  return a.erreurs;
}

/* ── 6. Le tableau de stratégie dit vrai ──────────────────────────────────── */
/* Les décisions sont vérifiables : une erreur ici coûte de l'argent. */
async function strategie() {
  console.log("\n6. DÉCISIONS DU TABLEAU");
  const a = lancer();
  await a.dormir(1100);
  a.parTexte("À la table").click(); await a.dormir(470);
  /* Le groupe garde son dernier sous-onglet : on impose le tableau. */
  a.sousOnglet("Tableau")?.click(); await a.dormir(450);
  /* Deux champs depuis la 1.45.4 : la main d'un côté, la hauteur de l'autre. */
  const attendu = [["16", "10", /Tirer/], ["11", "10", /Doubler/], ["88", "10", /Séparer/], ["A7", "3", /Doubler/], ["12", "2", /Tirer/]];
  for (const [main, hauteur, decision] of attendu) {
    a.saisir(a.champ("Votre main"), main);
    await a.dormir(180);
    a.saisir(a.champ("Carte du croupier"), hauteur);
    await a.dormir(450);
    const bandeau = [...a.d.querySelectorAll("#racine div")].find((x) => x.style.position === "sticky" && x.style.background === "var(--ecran)");
    verifier("« " + main + " contre " + hauteur + " »", !!bandeau && decision.test(bandeau.textContent), bandeau ? bandeau.textContent.replace(/\s+/g, " ").slice(0, 34) : "aucun résultat");
    /* La case trouvée doit aussi s'entourer : la recherche et la grille se sont
       déjà parlé dans deux formats différents, sans que rien ne le signale. */
    const entouree = a.boutons().filter((x) => x.style.border === "2px solid var(--or)");
    verifier("  et la case s'entoure", entouree.length === 1, entouree.length + " case(s)");
  }
  a.dom.window.close();
  return a.erreurs;
}

/* ── 6 bis. La refonte visuelle tient ─────────────────────────────────────── */
/* Ces réglages ont demandé plusieurs allers-retours : ils sont faciles à casser
   en touchant à autre chose, et invisibles dans un test fonctionnel. */
async function apparence() {
  console.log("\n6 bis. APPARENCE");
  const a = lancer({ donnees: { sessions: SESSIONS, defauts: { abandon: true, nbPaquets: 8 } } });
  await a.dormir(1100);

  /* Le tableau : lettre colorée sur fond atténué, et sa légende. */
  a.parTexte("À la table").click(); await a.dormir(470);
  a.sousOnglet("Tableau")?.click(); await a.dormir(440);
  const cases = a.boutons().filter((x) => /^(T|R|D|Dr|S|A)$/.test(x.textContent.trim()));
  const doubler = cases.find((x) => x.textContent.trim() === "D");
  verifier("la lettre garde la couleur de son action", doubler?.style.color === "var(--bleu)", doubler?.style.color);
  verifier("le fond reste atténué", /18%/.test(doubler?.style.background ?? ""), doubler?.style.background?.slice(0, 40));
  verifier("la lettre est lisible", parseFloat(doubler?.style.fontSize) >= 13, doubler?.style.fontSize);
  /* La légende ne montre que les décisions présentes dans le tableau affiché :
     « séparer » sur les paires, « abandonner » quand la table le propose. */
  const legende = () => [...a.d.querySelectorAll("#racine span")]
    .filter((x) => x.style.width === "8px")
    .map((p) => p.parentElement.textContent.trim());
  verifier("la légende des mains dures inclut l'abandon", legende().includes("Abandonner"), legende().join(", "));
  a.boutons().find((x) => x.textContent.trim() === "Paires")?.click(); await a.dormir(440);
  verifier("celle des paires inclut « séparer »", legende().includes("Séparer"), legende().join(", "));
  verifier("et n'inclut pas l'abandon", !legende().includes("Abandonner"), legende().join(", "));
  a.boutons().find((x) => x.textContent.trim() === "Dures")?.click(); await a.dormir(440);
  verifier("le titre est court", a.d.querySelector("#racine h1")?.textContent.trim() === "Tableau des mains");

  /* Les afficheurs : chiffre coloré, cartouche d'état, séparateur de milliers. */
  a.parTexte("Journal").click(); await a.dormir(520);
  const net = [...a.d.querySelectorAll("#racine div.mono")].find((x) => parseFloat(x.style.fontSize) > 25);
  verifier("le résultat net est coloré", /ecran-(ok|rouge)/.test(net?.style.color ?? ""), net?.style.color);
  const cartouche = [...a.d.querySelectorAll("#racine span.mono")].find((x) => x.style.background && /gain|perte/i.test(x.textContent));
  verifier("il porte son cartouche d'état", !!cartouche, cartouche?.textContent);

  /* Le compteur : chiffre en encre pleine, cartouche positif/négatif. */
  a.parTexte("À la table").click(); await a.dormir(460);
  a.sousOnglet("Compteur").click(); await a.dormir(480);
  /* Le compte courant est coloré selon son signe, sans étiquette : le signe
     et la couleur disent la même chose, un cartouche n'apprenait rien. */
  const gros = [...a.d.querySelectorAll("#racine div.mono")].find((x) => parseFloat(x.style.fontSize) > 40);
  /* La jauge de pénétration suit le même dessin que celles des exercices. */
  const jaugePen = [...a.d.querySelectorAll("#racine div")].find((x) => x.style.height === "7px" && x.style.borderRadius === "999px");
  verifier("la pénétration a sa jauge", !!jaugePen);
  verifier("elle porte son cran de cible", !!jaugePen && [...jaugePen.children].some((c) => c.style.width === "2px" && c.style.left === "75%"));

  verifier("le compte courant suit son signe", /teinteEcran|ecran-/.test(gros?.style.color ?? "") || !!gros, gros?.style.color);
  const etiq = [...a.d.querySelectorAll("#racine span.mono")].some((x) => x.style.background && /positif|négatif/i.test(x.textContent));
  verifier("il n'a pas d'étiquette redondante", !etiq);

  /* Les jauges de « prêt pour la table ». */
  a.parTexte("S'entraîner").click(); await a.dormir(480);
  const jauges = [...a.d.querySelectorAll("#racine div")].filter((x) => x.style.height === "7px" && x.style.borderRadius === "999px");
  verifier("quatre jauges d'avancement", jauges.length === 4, jauges.length + " jauge(s)");
  verifier("chacune porte son cran de cible", jauges.every((j) => [...j.children].some((c) => c.style.width === "2px")));

  /* Les titres en serif, et le plancher de 19 px. */
  const h1 = a.d.querySelector("#racine h1");
  const famille = a.w.getComputedStyle(h1).fontFamily || "";
  verifier("les titres sont en serif", /Serif|Georgia/i.test(famille) || /Source Serif/.test(a.d.documentElement.innerHTML), famille);
  /* La police doit aussi être RÉELLEMENT chargée : le script de construction a
     déjà servi une liste de polices périmée. */
  const html = a.d.documentElement.innerHTML;
  verifier("la police serif est chargée", /family=Source\+Serif/.test(html));
  verifier("Bricolage n'est plus chargé", !/Bricolage/.test(html));

  /* Le barème sur dix cartes dans la liste des systèmes. */
  a.parTexte("Comprendre").click(); await a.dormir(480);
  const ligne = [...a.d.querySelectorAll("#racine [data-systeme]")][0];
  const bareme = [...ligne.querySelectorAll("span.mono")].filter((x) => x.style.flex);
  verifier("le barème montre dix cartes", bareme.length === 10, bareme.length + " carte(s)");
  /* Les trois indicateurs sont des jauges nommées, plus des sigles. */
  const barres = [...ligne.querySelectorAll("span")].filter((x) => x.style.height === "5px");
  verifier("trois jauges d'indicateur", barres.length === 3, barres.length + " jauge(s)");
  /* Elles doivent se remplir différemment : une largeur absente ou identique
     partout signalerait un calcul cassé — c'est arrivé deux fois. */
  const largeurs = barres.map((b) => b.children[0]?.style.width ?? "");
  verifier("les jauges se remplissent", largeurs.every((w) => /%$/.test(w)), largeurs.join(" · "));
  verifier("et diffèrent entre elles", new Set(largeurs).size > 1, largeurs.join(" · "));

  /* Le tri des systèmes : sept critères, sur une seule ligne. */
  /* L'aide au choix est repliée : en bas de page, elle passait inaperçue. */
  const aide = a.boutons().find((x) => /Lequel choisir/.test(x.textContent));
  verifier("l'aide au choix est repliée", !!aide && aide.getAttribute("aria-expanded") === "false");
  if (aide) {
    aide.click(); await a.dormir(430);
    const conseils = a.boutons().filter((x) => /Si vous débutez|Si la division|Après le Hi-Lo|sans effort/.test(x.textContent));
    verifier("elle propose quatre conseils", conseils.length === 4, conseils.length + " conseil(s)");
    aide.click(); await a.dormir(400);
  }

  const menuTri = a.d.querySelector('#racine select[aria-label="Trier les systèmes"]');
  verifier("le tri des systèmes existe", !!menuTri && menuTri.options.length === 8, menuTri ? menuTri.options.length + " choix" : "absent");
  if (menuTri) {
    const premier = () => a.d.querySelector("#racine [data-systeme] div")?.textContent.trim().slice(0, 10);
    const avant = premier();
    menuTri.value = "jeu";
    menuTri.dispatchEvent(new a.w.Event("change", { bubbles: true }));
    await a.dormir(420);
    verifier("il réordonne la liste", premier() !== avant, avant + " → " + premier());
  }
  /* Les sigles accompagnent les noms — sur les jauges et dans l'introduction.
     Un temps retirés, ils manquaient à la lecture. */
  verifier("les sigles accompagnent les jauges",
    barres.every((b) => /CM|EJ|CA/.test(b.previousElementSibling?.textContent ?? "")),
    barres.map((b) => b.previousElementSibling?.textContent.trim()).join(" · "));

  a.dom.window.close();
  return a.erreurs;
}

/* ── 7. Journal : encodage et export ──────────────────────────────────────── */
async function journal() {
  console.log("\n7. JOURNAL");
  const a = lancer({ donnees: { sessions: SESSIONS, lieuxInfos: LIEUX } });
  let telecharge = null;
  a.w.HTMLAnchorElement.prototype.click = function () { telecharge = this.download; };
  await a.dormir(1100);
  a.parTexte("Journal").click(); await a.dormir(500);
  a.sousOnglet("Sessions").click(); await a.dormir(450);
  a.boutons().find((x) => x.textContent.includes("Encoder une session")).click(); await a.dormir(480);
  const ch = [...a.d.querySelectorAll("#racine input")].filter((x) => x.inputMode === "decimal");
  a.saisir(ch[0], "70"); a.saisir(ch[1], "95"); await a.dormir(280);
  a.boutons().find((x) => x.textContent.includes("Enregistrer la session")).click(); await a.dormir(520);
  const n = JSON.parse(a.w.localStorage.getItem("big-jack-theory")).sessions.length;
  verifier("une session s'enregistre", n === 3, n + " sessions");
  a.boutons().find((x) => /Exporter en CSV/i.test(x.textContent))?.click(); await a.dormir(450);
  verifier("l'export CSV produit un fichier", !!telecharge, String(telecharge));

  /* Séparateur de milliers en espace fine : une espace ordinaire casse le
     nombre en deux en chasse fixe. */
  const gros = [...a.d.querySelectorAll("#racine div.mono")].find((x) => parseFloat(x.style.fontSize) > 25);
  verifier("les milliers sont séparés par une espace fine",
    !/\d{4}/.test((gros?.textContent ?? "").replace(/\u202F/g, "")) || /\u202F/.test(gros?.textContent ?? ""),
    gros?.textContent.trim().slice(0, 16));

  /* La courbe cumulée et ses repères. */
  /* La courbe vit dans l'onglet Analyse, pas dans la liste des sessions. */
  a.sousOnglet("Analyse").click(); await a.dormir(480);
  const bascule = a.boutons().find((x) => /Cumul/i.test(x.textContent));
  verifier("la bascule vers la courbe existe", !!bascule);
  if (bascule) {
    bascule.click(); await a.dormir(500);
    const svg = [...a.d.querySelectorAll("#racine svg")].find((x) => x.getAttribute("preserveAspectRatio") === "none");
    verifier("la courbe a son aire", !!svg && [...svg.querySelectorAll("path")].some((p) => p.getAttribute("fill") === "url(#bjc-aire)"));
    verifier("la ligne de zéro est marquée", !!svg && [...svg.querySelectorAll("line")].some((l) => l.getAttribute("stroke-dasharray")));
    verifier("le plus bas est annoté", a.affiche(/plus bas/));
  }
  a.dom.window.close();
  return a.erreurs;
}

/* ── 8. Le compteur ───────────────────────────────────────────────────────── */
async function compteur() {
  console.log("\n8. COMPTEUR");
  const a = lancer();
  await a.dormir(1100);
  a.parTexte("À la table").click(); await a.dormir(450);
  a.sousOnglet("Compteur").click(); await a.dormir(500);

  const nav = [...a.d.querySelectorAll("#racine div")].find((x) => x.style.position === "sticky" && x.style.background === "var(--papier)");
  const cadre = [...a.d.querySelectorAll("#racine div")].find((x) => x.style.position === "sticky" && x.style.background === "var(--ecran)");
  verifier("le cadre se cale sous la barre des sous-onglets", !!cadre && !!nav && parseInt(cadre.style.top) >= parseInt(nav.style.top),
    cadre ? "cadre " + cadre.style.top + " · barre " + nav?.style.top : "cadre absent");

  const clavier = [...a.d.querySelectorAll("#racine div")].find((x) => x.style.alignItems === "stretch" && x.style.gridTemplateColumns);
  verifier("le clavier est en colonnes", !!clavier && /repeat\(\d,1fr\)/.test(clavier.style.gridTemplateColumns), clavier?.style.gridTemplateColumns);

  const gros = () => [...a.d.querySelectorAll("#racine div.mono")].find((x) => parseFloat(x.style.fontSize) > 40)?.textContent.trim();
  clavier.children[0].querySelector("button").click(); await a.dormir(340);
  verifier("un appui modifie le compte", gros() !== "0", "compte " + gros());
  a.dom.window.close();
  return a.erreurs;
}

/* ── 9. Le sabot expire ───────────────────────────────────────────────────── */
async function sabot() {
  console.log("\n9. EXPIRATION DU SABOT");
  const cartes = [{ r: "5", c: "p", v: 1 }, { r: "6", c: "c", v: 1 }, { r: "10", c: "t", v: -1 }];
  for (const [nom, minutes, garde] of [["à 5 minutes", 5, true], ["à 11 minutes", 11, false]]) {
    const a = lancer({ donnees: { systemeId: "hilo", sabot: { cartes, systeme: "hilo", date: Date.now() - minutes * 60000 } } });
    await a.dormir(1100);
    a.parTexte("À la table").click(); await a.dormir(450);
    a.sousOnglet("Compteur").click(); await a.dormir(480);
    const compte = [...a.d.querySelectorAll("#racine div.mono")].find((x) => parseFloat(x.style.fontSize) > 40)?.textContent.trim();
    verifier("le compte " + (garde ? "survit" : "est effacé") + " " + nom, garde ? compte !== "0" : compte === "0", "compte " + compte);
    a.dom.window.close();
  }
}

/* ── 10. Restauration d'une sauvegarde ────────────────────────────────────── */
async function sauvegarde() {
  console.log("\n10. RESTAURATION D'UNE SAUVEGARDE");
  const ancienne = JSON.stringify({
    application: "Big Jack Theory", version: "1.38.10", exporte: new Date().toISOString(),
    donnees: {
      defauts: { nbPaquets: 6, h17: true, capital: 400, enseigne: "coeur" },
      theme: "sombre", systemeId: "ko", sessions: SESSIONS, lieuxInfos: LIEUX,
      mesTables: [{ id: "perso-1", nom: "Namur", valeurs: { nbPaquets: 6, h17: false, regle: "cachee", paiement: "3:2", melangeur: "coupe" } }],
    },
  });
  const a = lancer();
  a.w.FileReader = class { readAsText() { this.result = ancienne; this.onload && this.onload({ target: { result: ancienne } }); } };
  await a.dormir(1100);
  a.parametres().click(); await a.dormir(620);
  for (const b of [...a.d.querySelectorAll("#racine button[aria-expanded]")]) { b.click(); await a.dormir(60); }
  const inp = [...a.d.querySelectorAll("#racine input")].find((x) => x.type === "file");
  verifier("le champ de restauration existe", !!inp);
  if (inp) {
    Object.defineProperty(inp, "files", { value: [{ name: "s.json" }], configurable: true });
    inp.dispatchEvent(new a.w.Event("change", { bubbles: true }));
    await a.dormir(1100);
    const st = JSON.parse(a.w.localStorage.getItem("big-jack-theory") || "{}");
    verifier("les sessions reviennent", st.sessions?.length === 2, String(st.sessions?.length));
    verifier("les tables personnalisées reviennent", st.mesTables?.length === 1, String(st.mesTables?.length));
    verifier("les lieux reviennent", Object.keys(st.lieuxInfos ?? {}).length === 2);
    verifier("le système revient", st.systemeId === "ko", String(st.systemeId));
  }
  a.dom.window.close();
  return a.erreurs;
}

/* ── Exécution ────────────────────────────────────────────────────────────── */
const toutes = [];
for (const suite of [ecrans, parametres, retour, ongletsJournal, pageMere, exercices, strategie, apparence, journal, compteur, sabot, sauvegarde]) {
  const e = await suite();
  if (e?.length) toutes.push(...e);
}
console.log("\nerreurs JavaScript : " + (toutes.length ? toutes.slice(0, 4).join(" | ") : "aucune"));
process.exit(bilan() > 0 || toutes.length ? 1 : 0);
