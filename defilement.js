/* Amener un élément sous les yeux, replier sans saut, teinter un montant. */

const teinte = (v, prefixe = "") =>
  v > 0 ? `var(--${prefixe}ok)` : v < 0 ? `var(--${prefixe}rouge)` : `var(--${prefixe}neutre)`;

/** Date au format 12/08/26, pour les récapitulatifs compacts. */
/* Amène un panneau qu'on vient de déplier dans le champ de vision : centré
   s'il tient à l'écran, sinon calé en haut pour qu'on en voie le début. */
function glisserVers(cible, duree = 260) {
  try {
    const depart = window.scrollY;
    const max = Math.max(0, document.documentElement.scrollHeight - window.innerHeight);
    const arrivee = Math.max(0, Math.min(max, cible));
    const ecart = arrivee - depart;
    if (Math.abs(ecart) < 2) return;
    const t0 = performance.now();
    const pas = (t) => {
      const a = Math.min(1, (t - t0) / duree);
      const doux = 1 - Math.pow(1 - a, 3);
      window.scrollTo(0, depart + ecart * doux);
      if (a < 1) requestAnimationFrame(pas);
    };
    requestAnimationFrame(pas);
  } catch {
    /* sans conséquence */
  }
}

/* Hauteur cumulée des bandes collées en haut. Mesurée à l'exécution : les
   valeurs écrites en dur se décalaient dès qu'une bande changeait de taille. */
function hautCollé() {
  try {
    let h = 0;
    for (const el of document.querySelectorAll("[data-colle]")) {
      const r = el.getBoundingClientRect();
      if (r.height > 0) h = Math.max(h, r.bottom);
    }
    return Math.max(0, h);
  } catch {
    return 0;
  }
}

/* Referme un panneau sans que la page saute : le contenu retiré au-dessus du
   regard décalerait tout vers le haut, on rend la hauteur perdue au
   défilement. */
function replierSansSaut(fermer) {
  const avant = document.documentElement.scrollHeight;
  const y = window.scrollY;
  fermer();
  requestAnimationFrame(() =>
    requestAnimationFrame(() => {
      try {
        const perdu = avant - document.documentElement.scrollHeight;
        if (perdu > 4 && y > 0) window.scrollTo(0, Math.max(0, y - perdu));
      } catch {
        /* sans conséquence */
      }
    })
  );
}

function amener(element) {
  if (!element) return;
  /* Deux images d'attente au lieu d'un délai fixe : le panneau vient d'être
     posé, on mesure dès qu'il est peint. */
  requestAnimationFrame(() =>
    requestAnimationFrame(() => {
      try {
        const r = element.getBoundingClientRect();
        const haut = window.scrollY + r.top;
        const colle = hautCollé();
        const libre = window.innerHeight - colle;
        const enHaut = r.height > libre * 0.8;
        glisserVers(enHaut ? haut - colle - 12 : haut - colle - (libre - r.height) / 2);
      } catch {
        /* sans conséquence */
      }
    })
  );
}

/** Date au format 12/08/26, pour les récapitulatifs compacts. */

export { amener, glisserVers, hautCollé, replierSansSaut, teinte };
