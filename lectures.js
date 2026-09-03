/* Références bibliographiques et sites cités dans la partie Lectures.
   Extrait du fichier principal : ce sont des données, elles ne
   dépendent de rien et personne n'a besoin de les lire pour
   comprendre le reste. */

const LECTURES = [
  {
    groupe: "Par où commencer",
    livres: [
      {
        titre: "Beat the Dealer",
        auteur: "Edward O. Thorp",
        annee: "1962, révisé en 1966",
        texte:
          "Le livre fondateur. Thorp y démontre pour la première fois, calculs à l'appui, qu'un joueur informé peut renverser l'avantage du casino. Historiquement essentiel et toujours lisible, mais ses systèmes ont été dépassés depuis longtemps : lisez-le pour comprendre d'où vient tout le reste, pas pour y prendre une méthode.",
      },
      {
        titre: "Knock-Out Blackjack",
        auteur: "Olaf Vancura et Ken Fuchs",
        annee: "1998, 3ᵉ édition revue",
        texte:
          "Le livre qui introduit le système KO. Le plus accessible du lot : il vous amène à un avantage réel sans jamais vous demander de diviser. Si le vrai compte vous rebute, commencez ici plutôt que par le Hi-Lo. L'édition récente traite aussi du blackjack payé 6:5.",
      },
    ],
  },
  {
    groupe: "Pour aller au fond",
    livres: [
      {
        titre: "Blackjack Attack: Playing the Pros' Way",
        auteur: "Don Schlesinger",
        annee: "3ᵉ édition, 2005 — toujours l'édition courante",
        texte:
          "La référence moderne, et la source des Illustrious 18 et des Fab 4 reproduits dans la fiche Hi-Lo. Traite la gestion de bankroll, le risque de ruine et la comparaison des jeux avec une rigueur qu'aucun autre ouvrage n'atteint. Exigeant mathématiquement.",
      },
      {
        titre: "The Hi-Lo Card Counting System: A Complete Guide to Index Play",
        auteur: "Don Schlesinger et Dave Brolley",
        annee: "2023",
        texte:
          "Le plus récent de cette liste, et le complément direct des Illustrious 18 : plus de 300 tableaux d'indices classés par contribution au gain, pour presque toutes les combinaisons de règles. C'est l'ouvrage à prendre si vous voulez les indices exacts de votre table plutôt que la liste abrégée.",
      },
      {
        titre: "The Theory of Blackjack",
        auteur: "Peter Griffin",
        annee: "6ᵉ édition, 1999",
        texte:
          "Les fondations mathématiques : effet du retrait de chaque carte, corrélation de mise, efficacité de jeu. C'est de là que viennent les indicateurs affichés dans le récapitulatif. À lire pour comprendre pourquoi un système vaut ce qu'il vaut, plutôt que le croire sur parole. Réputé ardu, et il l'est.",
      },
      {
        titre: "Professional Blackjack",
        auteur: "Stanford Wong",
        annee: "1975, dernière édition 1994",
        texte:
          "Source du système Halves et du back-counting, cette pratique consistant à observer une table sans jouer et à n'entrer que sur compte favorable — qu'on appelle d'ailleurs « wonging ». Le fond théorique reste valable ; les conditions de jeu décrites datent.",
      },
      {
        titre: "Blackbelt in Blackjack",
        auteur: "Arnold Snyder",
        annee: "1983, édition révisée 2005",
        texte:
          "Source du Red 7 et du Zen Count. Snyder défend une approche pragmatique : un système simple joué sans faute bat un système savant joué approximativement. Son comparatif de cent systèmes est le document derrière les colonnes chiffrées de cette application.",
      },
    ],
  },
  {
    groupe: "Systèmes particuliers",
    livres: [
      {
        titre: "The World's Greatest Blackjack Book",
        auteur: "Lance Humble et Carl Cooper",
        annee: "1980",
        texte:
          "L'ouvrage de référence du Hi-Opt I, avec le traitement du comptage annexe des As. Le plus ancien de cette liste et celui qui a le plus vieilli sur les conditions de jeu : prenez-y le système, pas les conseils de table.",
      },
    ],
  },
];

const SITES = [
  {
    nom: "Wizard of Odds — appendices blackjack",
    url: "https://wizardofodds.com/games/blackjack/expected-values/",
    texte:
      "Espérances par composition pour 1 à 8 paquets, effet du retrait de carte, finesses de l'abandon. C'est la table contre laquelle le moteur de cette application a été validé.",
  },
  {
    nom: "Blackjack Review — encyclopédie",
    url: "https://www.blackjackreview.com/wp/encyclopedia/card-counting-system-comparisons/",
    texte:
      "Tableau comparatif de plusieurs dizaines de systèmes avec leurs valeurs de cartes et leurs trois indicateurs. Source des chiffres du récapitulatif.",
  },
  {
    nom: "Comparatif de cent systèmes — Arnold Snyder",
    url: "https://www.lasvegasadvisor.com/gambling-with-an-edge/whats-the-best-card-counting-system/",
    texte: "Corrélations de mise et efficacités de jeu de cent systèmes, générées par simulation.",
  },
];

export { LECTURES, SITES };
