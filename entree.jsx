/* Point d'entrée de la compilation.
   Monte l'application dans le conteneur #racine de index.html.

   Reconstruit le 3 septembre 2026 : le fichier d'origine avait disparu.
   L'identifiant « racine » est celui qu'interroge la suite de tests. */

import { createRoot } from "react-dom/client";
import App from "./compteur-blackjack.jsx";

createRoot(document.getElementById("racine")).render(<App />);
