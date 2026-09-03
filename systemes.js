/* Les neuf systèmes de comptage : valeurs, indicateurs, seuils de déviation.
   Extrait du fichier principal : ce sont des données, elles ne
   dépendent de rien et personne n'a besoin de les lire pour
   comprendre le reste. */

const T = "T"; // 10, V, D, R

const SYSTEMS = {
  hilo: {
    id: "hilo",
    nom: "Hi-Lo",
    sous: "La référence universelle",
    niveau: 1,
    equilibre: true,
    tc: true,
    asSepare: false,
    couleurRequise: false,
    precision: 4,
    complexite: 2,
    bc: "0,97",
    pe: "0,51",
    ic: "0,76",
    valeurs: { A: -1, 2: 1, 3: 1, 4: 1, 5: 1, 6: 1, 7: 0, 8: 0, 9: 0, [T]: -1 },
    resume:
      "Trois valeurs seulement (+1 / 0 / −1), compte équilibré, vrai compte obligatoire. Le meilleur rapport entre effort et gain : c'est le système par défaut, celui de toute la littérature et de tous les tableaux d'indices.",
    fonctionnement:
      "Les petites cartes (2 à 6) valent +1, les neutres (7, 8, 9) valent 0, les hautes (10, figures, As) valent −1. On part de 0 au début du sabot et on additionne chaque carte vue, y compris celles des autres joueurs et du croupier. Comme le système est équilibré, le compte revient exactement à 0 quand toutes les cartes sont sorties : c'est votre autocontrôle. Le compte courant seul ne dit rien tant qu'il n'est pas ramené au nombre de paquets restants — on divise donc par les paquets restants pour obtenir le vrai compte, et c'est lui qui pilote la mise et les écarts de stratégie.",
    avantages: [
      "Un seul niveau de valeurs : la charge mentale reste faible même après plusieurs heures.",
      "Équilibré, donc le retour à zéro en fin de sabot vérifie votre comptage.",
      "Toute la documentation existante (Illustrious 18, tableaux d'indices, calculs de bankroll) est écrite pour lui.",
      "Corrélation de mise de 0,97 : on ne gagne presque rien à passer à un système plus lourd.",
    ],
    inconvenients: [
      "Le calcul du vrai compte à chaque main demande de l'entraînement, surtout l'estimation des paquets restants.",
      "L'As et le 10 partagent la même valeur, alors qu'ils n'ont pas le même rôle : l'As sert au blackjack, le 10 sert aux doublements.",
      "Efficacité de jeu moyenne (0,51) : sans les indices de déviation, une partie du gain est laissée sur la table.",
    ],
    pourQui:
      "Tout le monde, et en particulier si vous débutez. Il n'existe aucune raison sérieuse de commencer ailleurs.",
    conseils: [
      "Entraînez-vous par paires qui s'annulent : un 5 et un Roi vus ensemble font 0, inutile de compter deux fois.",
      "Estimez les paquets restants au tiers de paquet près en regardant la pile de cartes brûlées, pas les cartes du sabot.",
      "Les 18 indices ci-dessous apportent l'essentiel du gain de l'efficacité de jeu — l'assurance à elle seule en représente environ un tiers.",
    ],
    indices: [
      ["Assurance", "ne pas prendre", "prendre", "+3"],
      ["16 contre 10", "tirer", "rester", "0"],
      ["15 contre 10", "tirer", "rester", "+4"],
      ["10-10 contre 5", "rester", "séparer", "+5"],
      ["10-10 contre 6", "rester", "séparer", "+4"],
      ["10 contre 10", "tirer", "doubler", "+4"],
      ["12 contre 3", "tirer", "rester", "+2"],
      ["12 contre 2", "tirer", "rester", "+3"],
      ["11 contre As", "tirer", "doubler", "+1"],
      ["9 contre 2", "tirer", "doubler", "+1"],
      ["10 contre As", "tirer", "doubler", "+4"],
      ["9 contre 7", "tirer", "doubler", "+3"],
      ["16 contre 9", "tirer", "rester", "+5"],
      ["13 contre 2", "rester", "tirer", "−1"],
      ["12 contre 4", "rester", "tirer", "0"],
      ["12 contre 5", "rester", "tirer", "−2"],
      ["12 contre 6", "rester", "tirer", "−1"],
      ["13 contre 3", "rester", "tirer", "−2"],
    ],
    fab4: [
      ["14 contre 10", "+3"],
      ["15 contre 10", "0"],
      ["15 contre 9", "+2"],
      ["15 contre As", "+1"],
    ],
  },

  ko: {
    id: "ko",
    nom: "KO (Knock-Out)",
    sous: "Déséquilibré, compte courant seul",
    niveau: 1,
    equilibre: false,
    tc: false,
    asSepare: false,
    couleurRequise: false,
    precision: 4,
    complexite: 1,
    bc: "0,98",
    pe: "0,55",
    ic: "0,78",
    pivot: 4,
    irc: (d) => 4 - 4 * d,
    valeurs: { A: -1, 2: 1, 3: 1, 4: 1, 5: 1, 6: 1, 7: 1, 8: 0, 9: 0, [T]: -1 },
    resume:
      "Le Hi-Lo avec le 7 à +1. Ce déséquilibre volontaire supprime la division par les paquets restants : on mise directement sur le compte courant, avec un pivot fixe à +4.",
    fonctionnement:
      "Identique au Hi-Lo à une carte près : le 7 vaut +1 au lieu de 0. Le compte ne revient donc plus à zéro en fin de sabot, il dérive vers le haut. On compense en démarrant à un compte initial négatif qui dépend du nombre de paquets — pour six paquets, on part de −20. Le pivot, c'est-à-dire le point où votre espérance devient positive, tombe alors toujours sur +4, quel que soit le nombre de paquets. À partir de là, on monte la mise par paliers sur le compte courant, sans jamais diviser.",
    avantages: [
      "Aucune division en cours de partie : c'est l'obstacle numéro un du comptage qui disparaît.",
      "Charge mentale minimale, donc moins d'erreurs sur de longues sessions — et une erreur coûte plus cher qu'un système imprécis.",
      "Corrélation de mise quasiment identique au Hi-Lo.",
      "Le compte se lit tel quel, ce qui rend les décisions de mise très rapides.",
    ],
    inconvenients: [
      "Pas d'autocontrôle : le compte ne revient pas à zéro, une erreur passe inaperçue.",
      "Le compte initial change avec le nombre de paquets, il faut le recalculer à chaque changement de table.",
      "Les indices de déviation sont moins précis qu'avec un vrai compte, sauf près du pivot.",
      "Moins de documentation disponible que pour le Hi-Lo.",
    ],
    pourQui:
      "Ceux que le calcul du vrai compte bloque, et ceux qui jouent en conditions bruyantes ou sur de très longues sessions.",
    conseils: [
      "Retenez la formule du compte initial : 4 − 4 × (nombre de paquets).",
      "Le pivot à +4 est votre repère unique : en dessous, mise minimale ; au-dessus, vous montez.",
      "Prenez l'assurance dès que le compte courant atteint le pivot.",
    ],
  },

  red7: {
    id: "red7",
    nom: "Red 7",
    sous: "Déséquilibré, pivot à zéro",
    niveau: 1,
    equilibre: false,
    tc: false,
    asSepare: false,
    couleurRequise: true,
    precision: 4,
    complexite: 2,
    bc: "0,98",
    pe: "0,54",
    ic: "0,78",
    pivot: 0,
    irc: (d) => -2 * d,
    valeurs: { A: -1, 2: 1, 3: 1, 4: 1, 5: 1, 6: 1, 8: 0, 9: 0, [T]: -1 },
    valeurSpeciale: { rang: 7, rouge: 1, noir: 0 },
    resume:
      "Comme le Hi-Lo, mais seuls les 7 rouges valent +1 (les noirs valent 0). Système déséquilibré à pivot zéro : dès que le compte devient positif, vous avez l'avantage.",
    fonctionnement:
      "Petites cartes 2 à 6 à +1, hautes cartes à −1, 8 et 9 neutres, et le 7 dédoublé : rouge il vaut +1, noir il vaut 0. On démarre à −2 par paquet, ce qui place le pivot exactement sur zéro. La lecture devient donc binaire et immédiate : compte négatif, vous êtes en dessous de l'espérance ; compte positif, vous êtes au-dessus. Aucune division n'est nécessaire.",
    avantages: [
      "Pivot à zéro : le signe du compte suffit à savoir où vous en êtes, c'est la lecture la plus rapide qui existe.",
      "Pas de vrai compte à calculer.",
      "Précision comparable au Hi-Lo pour la mise.",
      "Le compte initial se retient facilement : −2 par paquet.",
    ],
    inconvenients: [
      "Il faut voir la couleur des 7, ce qui ajoute une donnée visuelle sur des cartes distribuées vite.",
      "Comme tout système déséquilibré, pas de retour à zéro pour vérifier son comptage.",
      "Le dédoublement du 7 est la source d'erreur la plus fréquente chez les débutants.",
    ],
    pourQui:
      "Une bonne alternative au KO si vous préférez un pivot à zéro. À éviter si les tables où vous jouez sont mal éclairées ou si le croupier ramasse vite.",
    conseils: [
      "Entraînez-vous d'abord sans les 7, puis réintroduisez-les une fois le reste automatique.",
      "Une variante existe où l'on compte tous les 7 à +½ : plus précise, mais elle réintroduit les fractions.",
    ],
  },

  hiopt1: {
    id: "hiopt1",
    nom: "Hi-Opt I",
    sous: "As neutralisé",
    niveau: 1,
    equilibre: true,
    tc: true,
    asSepare: true,
    couleurRequise: false,
    precision: 4,
    complexite: 3,
    bc: "0,88",
    pe: "0,61",
    ic: "0,85",
    valeurs: { A: 0, 2: 0, 3: 1, 4: 1, 5: 1, 6: 1, 7: 0, 8: 0, 9: 0, [T]: -1 },
    resume:
      "L'As sort du compte principal et se suit à part. Meilleure efficacité de jeu que le Hi-Lo, mais la mise devient mauvaise si vous négligez le comptage annexe des As.",
    fonctionnement:
      "Seuls les 3, 4, 5 et 6 comptent +1 ; seules les cartes valant 10 comptent −1. Le 2, le 7, le 8, le 9 et l'As sont neutres. En retirant l'As du compte, on obtient un indicateur bien plus fidèle de la richesse en cartes de valeur 10, ce qui améliore les décisions de jeu. En contrepartie, l'As est décisif pour les blackjacks, donc pour la mise : il faut le suivre sur un compteur séparé et corriger le vrai compte en fonction du surplus ou du déficit d'As restants.",
    avantages: [
      "Efficacité de jeu de 0,61, nettement supérieure au Hi-Lo.",
      "Corrélation d'assurance de 0,85 : la décision la plus rentable devient plus fiable.",
      "Système équilibré, donc vérifiable en fin de sabot.",
      "Les valeurs restent à un seul niveau.",
    ],
    inconvenients: [
      "Sans comptage annexe des As, la corrélation de mise chute à 0,88 : moins bon que le Hi-Lo.",
      "Tenir deux compteurs simultanément est une vraie difficulté, souvent sous-estimée.",
      "Le bénéfice net sur un jeu à plusieurs paquets est faible par rapport au Hi-Lo bien joué.",
    ],
    pourQui:
      "Joueurs déjà à l'aise avec le Hi-Lo qui jouent sur peu de paquets, là où l'efficacité de jeu pèse davantage.",
    conseils: [
      "Suivez les As avec les doigts sur les jetons plutôt qu'en mémoire, pour libérer votre attention.",
      "Correction usuelle : ajoutez au vrai compte le nombre d'As excédentaires par paquet restant.",
      "Ne passez à ce système que si votre Hi-Lo est parfaitement automatique.",
    ],
  },

  hiopt2: {
    id: "hiopt2",
    nom: "Hi-Opt II",
    sous: "Haute précision, As compté à part",
    niveau: 2,
    equilibre: true,
    tc: true,
    asSepare: true,
    couleurRequise: false,
    precision: 5,
    complexite: 4,
    bc: "0,91",
    pe: "0,67",
    ic: "0,91",
    valeurs: { A: 0, 2: 1, 3: 1, 4: 2, 5: 2, 6: 1, 7: 1, 8: 0, 9: 0, [T]: -2 },
    resume:
      "Valeurs sur deux niveaux et As compté à part. L'un des systèmes les plus précis en pratique, au prix d'une charge mentale importante.",
    fonctionnement:
      "Les 4 et 5, les cartes les plus favorables au joueur quand elles sont sorties, valent +2 ; les 2, 3, 6 et 7 valent +1 ; les 8 et 9 sont neutres ; toutes les cartes de valeur 10 valent −2 ; l'As est neutre et se suit séparément. La granularité supplémentaire rapproche le compte de la valeur réelle de chaque carte, d'où une efficacité de jeu et une corrélation d'assurance parmi les meilleures disponibles.",
    avantages: [
      "Efficacité de jeu de 0,67 : les écarts de stratégie deviennent réellement rentables.",
      "Corrélation d'assurance de 0,91, la meilleure de cette sélection.",
      "Équilibré, donc contrôlable en fin de sabot.",
    ],
    inconvenients: [
      "Deux niveaux de valeurs plus un comptage d'As : la fatigue arrive vite et les erreurs coûtent cher.",
      "Le gain réel sur un Hi-Lo bien exécuté est de l'ordre de quelques dixièmes de pourcent.",
      "Difficile à maintenir dans un environnement bruyant ou à table pleine.",
    ],
    pourQui:
      "Joueurs expérimentés jouant beaucoup d'heures, sur des conditions de jeu favorables qui justifient l'effort.",
    conseils: [
      "Ne l'abordez qu'après plusieurs centaines d'heures de Hi-Lo sans erreur.",
      "Chronométrez-vous sur un paquet complet : sous 25 secondes, vous êtes prêt pour la table.",
    ],
  },

  omega2: {
    id: "omega2",
    nom: "Omega II",
    sous: "Orienté jeu plutôt que mise",
    niveau: 2,
    equilibre: true,
    tc: true,
    asSepare: true,
    couleurRequise: false,
    precision: 5,
    complexite: 4,
    bc: "0,92",
    pe: "0,67",
    ic: "0,85",
    valeurs: { A: 0, 2: 1, 3: 1, 4: 2, 5: 2, 6: 2, 7: 1, 8: 0, 9: -1, [T]: -2 },
    resume:
      "Proche du Hi-Opt II, mais le 9 vaut −1 et le 6 vaut +2. Très bonne efficacité de jeu ; l'As doit être suivi séparément pour que la mise suive.",
    fonctionnement:
      "Les 4, 5 et 6 valent +2, les 2, 3 et 7 valent +1, le 8 est neutre, le 9 vaut −1, les cartes de valeur 10 valent −2 et l'As est neutre. En donnant une valeur au 9, le système reflète mieux l'effet réel de chaque retrait de carte sur l'espérance, ce qui améliore les décisions en cours de main.",
    avantages: [
      "Efficacité de jeu de 0,67, au niveau des meilleurs systèmes.",
      "Le 9 pris en compte affine les décisions sur les mains à 15 et 16.",
      "Équilibré, donc vérifiable.",
    ],
    inconvenients: [
      "Presque toutes les cartes ont une valeur non nulle : rien ne s'annule facilement, le rythme est plus lent.",
      "Comptage annexe des As indispensable pour une mise correcte.",
      "Bénéfice marginal réel face au Hi-Lo, pour un risque d'erreur bien plus élevé.",
    ],
    pourQui:
      "Joueurs très entraînés cherchant à maximiser l'efficacité de jeu sur des tables à une ou deux paquets.",
    conseils: [
      "La difficulté vient du 9 : entraînez-vous spécifiquement sur les mains contenant 8 et 9.",
      "Vérifiez votre compte sur un paquet complet, il doit revenir exactement à zéro.",
    ],
  },

  zen: {
    id: "zen",
    nom: "Zen Count",
    sous: "Le compromis équilibré",
    niveau: 2,
    equilibre: true,
    tc: true,
    asSepare: false,
    couleurRequise: false,
    precision: 5,
    complexite: 3,
    bc: "0,96",
    pe: "0,63",
    ic: "0,85",
    valeurs: { A: -1, 2: 1, 3: 1, 4: 2, 5: 2, 6: 2, 7: 1, 8: 0, 9: 0, [T]: -2 },
    resume:
      "Deux niveaux de valeurs, mais l'As reste dans le compte principal : pas de comptage annexe. Le meilleur équilibre parmi les systèmes de niveau 2.",
    fonctionnement:
      "Les 4, 5 et 6 valent +2, les 2, 3 et 7 valent +1, les 8 et 9 sont neutres, les cartes de valeur 10 valent −2 et l'As vaut −1. En attribuant à l'As une valeur intermédiaire, le système capte à la fois son rôle dans les blackjacks et sa neutralité relative pour les doublements, ce qui évite d'avoir à le suivre séparément.",
    avantages: [
      "Corrélation de mise 0,96 et efficacité de jeu 0,63 : les deux qualités à la fois.",
      "Aucun comptage annexe, contrairement aux autres systèmes de niveau 2.",
      "Équilibré et donc vérifiable en fin de sabot.",
    ],
    inconvenients: [
      "Deux niveaux à mémoriser, avec un temps d'adaptation notable après le Hi-Lo.",
      "Le vrai compte reste nécessaire.",
      "Moins de tableaux d'indices publiés que pour le Hi-Lo.",
    ],
    pourQui:
      "La progression naturelle après le Hi-Lo, pour qui veut gagner en précision sans gérer deux compteurs.",
    conseils: [
      "La transition demande une à deux semaines : ne jouez pas en argent réel pendant cette période.",
      "Les paires qui s'annulent restent utiles : un 4 et un Roi font 0.",
    ],
  },

  halves: {
    id: "halves",
    nom: "Wong Halves",
    sous: "Précision maximale, demi-points",
    niveau: 3,
    equilibre: true,
    tc: true,
    asSepare: false,
    couleurRequise: false,
    precision: 5,
    complexite: 5,
    bc: "0,99",
    pe: "0,57",
    ic: "0,72",
    valeurs: { A: -1, 2: 0.5, 3: 1, 4: 1, 5: 1.5, 6: 1, 7: 0.5, 8: 0, 9: -0.5, [T]: -1 },
    resume:
      "Valeurs par demis, corrélation de mise de 0,99 — la plus élevée qui existe. Un système de démonstration plus que d'usage courant : les fractions ruinent la vitesse.",
    fonctionnement:
      "Chaque carte reçoit une valeur proportionnelle à son influence réelle sur l'espérance : +0,5 pour le 2 et le 7, +1 pour le 3, 4 et 6, +1,5 pour le 5, 0 pour le 8, −0,5 pour le 9, −1 pour les cartes de valeur 10 et l'As. Beaucoup de joueurs doublent toutes les valeurs pour travailler en nombres entiers, puis divisent le vrai compte par deux à la fin.",
    avantages: [
      "Corrélation de mise de 0,99 : théoriquement le meilleur pour dimensionner les mises.",
      "Équilibré, donc contrôlable.",
      "Excellent exercice pour comprendre pourquoi chaque carte a le poids qu'elle a.",
    ],
    inconvenients: [
      "Les demis, ou le doublement de toutes les valeurs, coûtent une vitesse considérable.",
      "Le gain face au Hi-Lo est de l'ordre de 0,02 en corrélation : négligeable en pratique.",
      "Efficacité de jeu inférieure à celle du Zen ou du Hi-Opt II, malgré la complexité.",
      "Taux d'erreur élevé en conditions réelles, ce qui annule l'avantage théorique.",
    ],
    pourQui:
      "Curiosité théorique, ou joueurs de tête très rapides sur des conditions de pénétration exceptionnelles.",
    conseils: [
      "Travaillez en valeurs doublées, puis divisez le vrai compte par deux au moment de miser.",
      "Si vous hésitez plus d'une demi-seconde sur une carte, ce système vous coûte de l'argent.",
    ],
  },

  ace5: {
    id: "ace5",
    nom: "Ace-Five",
    sous: "Deux cartes, rien d'autre",
    niveau: 1,
    equilibre: true,
    tc: false,
    asSepare: false,
    couleurRequise: false,
    precision: 1,
    complexite: 1,
    bc: "0,54",
    pe: "0,05",
    ic: "0,00",
    valeurs: { A: -1, 2: 0, 3: 0, 4: 0, 5: 1, 6: 0, 7: 0, 8: 0, 9: 0, [T]: 0 },
    resume:
      "On ne suit que les 5 (+1) et les As (−1). Avantage très faible, mais quasiment impossible à rater et invisible pour la surveillance.",
    fonctionnement:
      "Toutes les cartes sont ignorées sauf deux : chaque 5 vu ajoute +1, chaque As vu retire 1. On part de 0. La mise double à chaque fois que le compte augmente au-dessus de +1, et retombe à la mise minimale dès que le compte redescend à +1 ou moins. Le 5 est la carte la plus favorable au joueur quand elle sort du sabot, l'As la plus défavorable : suivre uniquement ces deux extrêmes capte une petite partie de l'information, pour un effort presque nul.",
    avantages: [
      "Se retient en une minute et se tient en discutant, en buvant, en jouant en groupe.",
      "Taux d'erreur pratiquement nul, ce qui compte plus qu'on ne le croit.",
      "Bon point d'entrée pour se familiariser avec la variation de mise.",
    ],
    inconvenients: [
      "Avantage marginal : l'espérance gagnée est une fraction de celle du Hi-Lo.",
      "Aucun écart de stratégie possible, y compris l'assurance.",
      "La progression de mise est brutale et exige une bankroll solide pour absorber la variance.",
    ],
    pourQui:
      "Joueurs occasionnels, sorties entre amis, ou pour se faire la main sur la discipline de mise avant d'apprendre un vrai système.",
    conseils: [
      "Fixez une mise maximale avant de vous asseoir et tenez-vous-y : le doublement va vite.",
      "Considérez-le comme un exercice d'échauffement, pas comme une méthode de gain.",
    ],
  },
};

const ORDRE = ["hilo", "ko", "red7", "zen", "hiopt1", "hiopt2", "omega2", "halves", "ace5"];

/* ============================================================
   THÈMES
   ============================================================ */

export { T, SYSTEMS, ORDRE };
