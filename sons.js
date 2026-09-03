/* Le moteur audio : trois jeux de sons, et de quoi les jouer. */

let contexteAudio = null;
function contexte() {
  if (!contexteAudio) {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return null;
    contexteAudio = new AC();
  }
  if (contexteAudio.state === "suspended") contexteAudio.resume();
  return contexteAudio;
}

/* Deux jeux de sons. « sobre » reste discret, « marque » se lit à haute vitesse. */
const JEUX_SONS = {
  sobre: {
    nom: "Sobre — deux notes",
    juste: { notes: [[880, 0, 0.07], [1320, 0.07, 0.09]], forme: "sine", volume: 0.16 },
    faux: { notes: [[196, 0, 0.16]], forme: "sawtooth", volume: 0.16 },
  },
  marque: {
    nom: "Marqué — trois notes",
    juste: { notes: [[660, 0, 0.05], [990, 0.05, 0.05], [1320, 0.1, 0.08]], forme: "triangle", volume: 0.15 },
    faux: { notes: [[330, 0, 0.08], [220, 0.08, 0.14]], forme: "sawtooth", volume: 0.14 },
  },
};

/** type : "juste", "faux" ou "tic". jeu : clé de JEUX_SONS. */
function jouerSon(type, actif, jeu = "marque") {
  if (!actif) return;
  try {
    const c = contexte();
    if (!c) return;
    const set = JEUX_SONS[jeu] ?? JEUX_SONS.marque;
    const modele = type === "tic" ? { notes: [[1500, 0, 0.02]], forme: "sine", volume: 0.07 } : set[type];
    if (!modele) return;
    const { notes, forme, volume } = modele;
    const t = c.currentTime;
    for (const [freq, debut, duree] of notes) {
      const o = c.createOscillator();
      const g = c.createGain();
      o.type = forme;
      o.frequency.setValueAtTime(freq, t + debut);
      g.gain.setValueAtTime(0.0001, t + debut);
      g.gain.exponentialRampToValueAtTime(volume, t + debut + 0.008);
      g.gain.exponentialRampToValueAtTime(0.0001, t + debut + duree);
      o.connect(g).connect(c.destination);
      o.start(t + debut);
      o.stop(t + debut + duree + 0.02);
    }
  } catch {
    /* son indisponible : l'exercice fonctionne sans */
  }
}

/* Profil d'entraînement : progression conservée entre les séances. */

export { JEUX_SONS, contexte, contexteAudio, jouerSon };
