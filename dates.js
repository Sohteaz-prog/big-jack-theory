/* Formats de date courts, pour les listes et les récapitulatifs. */

const dateCourte = (d) =>
  `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}/${String(d.getFullYear()).slice(2)}`;

const jourCourt = (d) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

/** Nombre de jours consécutifs travaillés, en comptant aujourd'hui ou hier. */

export { dateCourte, jourCourt };
