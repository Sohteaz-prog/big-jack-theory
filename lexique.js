/* Le vocabulaire du blackjack : trente-trois entrées, groupées par thème.
   Extrait du fichier principal : ce sont des données, elles ne
   dépendent de rien et personne n'a besoin de les lire pour
   comprendre le reste. */

const LEXIQUE = [
  {
    groupe: "Compter",
    entrees: [
      {
        terme: "Compte courant",
        anglais: "running count",
        alias: "running count rc",
        court: "La somme des valeurs de toutes les cartes vues depuis le début du sabot.",
        long: "C'est le compte que vous tenez de tête. Il monte quand des petites cartes sortent, descend quand des hautes sortent. Seul, il ne vous dit rien : +6 dans un sabot presque entier et +6 dans le dernier paquet sont deux situations sans rapport.",
      },
      {
        terme: "Vrai compte",
        anglais: "true count",
        alias: "true count tc conversion",
        court: "Le compte courant divisé par le nombre de paquets restants.",
        long: "C'est lui qui pilote tout : la mise et les déviations. La division ramène le compte à une densité, indépendante du moment du sabot. Estimer les paquets restants au demi-paquet près suffit ; visez la pile de cartes déjà jouées plutôt que le sabot, elle est plus facile à jauger. Point souvent mal compris : on divise par les paquets restants dans le sabot, cartes derrière la carte de coupe comprises. Sur huit paquets coupés à quatre, le diviseur descend jusqu'à quatre, jamais en dessous — ces cartes ne seront pas distribuées, mais elles restent inconnues, et elles peuvent contenir les 10 qui vous manquent.",
      },
      {
        terme: "Système équilibré",
        alias: "balanced déséquilibré unbalanced",
        court: "Un système dont le compte revient exactement à zéro quand tout le sabot est sorti.",
        long: "Cette propriété vous offre un autocontrôle gratuit : si vous ne finissez pas à zéro, vous avez fait une erreur. Elle impose en revanche la division par les paquets restants. Un système déséquilibré renonce à ce contrôle pour supprimer la division.",
      },
      {
        terme: "Compte initial et pivot",
        alias: "irc initial running count pivot déséquilibré",
        court: "Le point de départ et le seuil de bascule d'un système déséquilibré.",
        long: "Le compte initial compense volontairement le déséquilibre : −20 pour six paquets au KO, −2 par paquet au Red 7. Le pivot est le compte à partir duquel votre espérance devient positive : +4 au KO, 0 au Red 7. Comme ce pivot est fixe, il remplace le calcul du vrai compte.",
      },
      {
        terme: "Comptage annexe des As",
        anglais: "side count",
        alias: "side count ace as séparé",
        court: "Un second compteur, tenu en parallèle du premier, qui suit uniquement les As.",
        long: "Nécessaire aux systèmes qui neutralisent l'As, comme le Hi-Opt et l'Omega II. On compare les As vus à ceux attendus, et on corrige le vrai compte à la hausse si le sabot en est riche. Tenir deux compteurs simultanément est bien plus difficile qu'il n'y paraît — c'est la principale raison pour laquelle ces systèmes déçoivent en pratique.",
      },
      {
        terme: "Niveau d'un système",
        alias: "level multi-niveau tags valeurs",
        court: "La plus grande valeur absolue attribuée à une carte.",
        long: "Le Hi-Lo est de niveau 1 : uniquement +1, 0 et −1. Le Zen et l'Omega II sont de niveau 2, avec des ±2. Le Wong Halves est de niveau 3 par ses demis. Chaque niveau supplémentaire gagne un peu de précision et coûte beaucoup de vitesse.",
      },
    ],
  },
  {
    groupe: "Mesurer un système",
    entrees: [
      {
        terme: "Effet du retrait",
        alias: "eor effect of removal",
        court: "De combien votre espérance bouge quand une carte donnée quitte le sabot.",
        long: "C'est la grandeur fondamentale dont tout le reste découle. Retirer un 5 vous fait gagner nettement plus que retirer un 8. Les valeurs de cartes d'un système ne sont qu'une approximation grossière et mémorisable de ces effets réels, et les trois corrélations ci-dessous mesurent la qualité de cette approximation.",
      },
      {
        terme: "Corrélation de mise",
        alias: "bc betting correlation",
        court: "À quel point le compte prédit votre avantage réel, donc quand augmenter la mise.",
        long: "Une note entre 0 et 1. C'est l'indicateur le plus important sur un jeu à plusieurs paquets, parce que l'essentiel du gain d'un compteur vient de la variation de mise, pas des déviations. Le Hi-Lo est à 0,97 : les systèmes plus lourds ne peuvent presque rien gagner de plus.",
      },
      {
        terme: "Efficacité de jeu",
        alias: "pe playing efficiency",
        court: "À quel point le compte indique correctement comment jouer chaque main.",
        long: "Le Hi-Lo est à 0,51, le Hi-Opt II et l'Omega II à 0,67. Le plafond théorique d'un compte unique tourne autour de 0,70. L'efficacité de jeu compte surtout sur un ou deux paquets, où les décisions individuelles pèsent lourd ; en sabot de six ou huit, elle passe derrière la corrélation de mise.",
      },
      {
        terme: "Corrélation d'assurance",
        alias: "ic insurance correlation",
        court: "À quel point le compte estime la densité réelle de cartes valant 10.",
        long: "L'assurance est le pari le plus rentable ouvert à un compteur — Schlesinger l'estime à environ un tiers du gain total des déviations. Un système qui isole bien les 10, comme le Hi-Opt II à 0,91, y excelle. Le Wong Halves, qui mélange l'As aux 10, tombe à 0,72.",
      },
      {
        terme: "Pourquoi ces trois notes divergent",
        alias: "compromis arbitrage as ace",
        court: "Parce que l'As sert à miser mais presque pas à jouer.",
        long: "Un As restant dans le sabot augmente votre avantage : il fait les blackjacks, payés 3:2. Mais il ne change presque rien à la façon de jouer un 16 contre un 10. Un système qui compte l'As avec les 10 est donc excellent à la mise et médiocre au jeu ; un système qui le neutralise fait l'inverse. Aucun système ne maximise les trois notes à la fois, et c'est un fait mathématique, pas un défaut de conception.",
      },
    ],
  },
  {
    groupe: "Jouer et miser",
    entrees: [
      {
        terme: "Indice de déviation",
        anglais: "index play",
        alias: "index illustrious 18 écart déviation",
        court: "Le vrai compte à partir duquel une décision remplace celle de la stratégie de base.",
        long: "La stratégie de base suppose que vous ignorez tout du sabot. Le compte vous en apprend quelque chose, et certaines décisions basculent. L'indice est le seuil de bascule. Exemple : le 16 contre 10 se tire en stratégie de base et se garde dès que le vrai compte atteint 0. Les indices dépendent du système de comptage et des règles ; ceux du Hi-Lo ne se transposent pas au Zen.",
      },
      {
        terme: "Écart de mise",
        anglais: "bet spread",
        alias: "spread ramp variation",
        court: "Le rapport entre votre plus petite et votre plus grosse mise.",
        long: "Un écart de 1 à 8 signifie que vous misez huit unités au compte le plus favorable et une au plus défavorable. Sans écart suffisant, compter ne rapporte rien : c'est là que se fait l'argent. Mais un écart large attire l'œil, et c'est le principal signal que cherche la surveillance.",
      },
      {
        terme: "Unité et bankroll",
        anglais: "unit, bankroll",
        alias: "capital mise unitaire",
        court: "L'unité est votre mise de référence ; la bankroll, le capital total que vous acceptez d'exposer.",
        long: "Le rapport entre les deux détermine votre survie. Les ordres de grandeur usuels tournent autour de plusieurs centaines d'unités de bankroll pour un écart de mise ambitieux. Sous-capitaliser est la façon la plus commune de perdre en jouant pourtant correctement.",
      },
      {
        terme: "Plafond de perte",
        alias: "limite budget stop loss",
        court: "La somme que vous décidez de ne pas dépasser sur une période.",
        long: "C'est une limite que vous vous fixez, pas un seuil à partir duquel la chance tournerait. Le journal la surveille par semaine ou par mois et vous prévient à l'approche. Elle n'a d'effet que si vous la respectez.",
      },
      {
        terme: "Écart type",
        anglais: "standard deviation",
        alias: "ecart type sigma dispersion",
        court: "La mesure de l'amplitude des écarts autour du résultat attendu.",
        long: "Au blackjack, il vaut environ 1,15 fois la mise par main. Sur cent mains, l'écart type du résultat est donc d'environ onze mises — largement plus que l'espérance de gain, ce qui explique qu'une session gagnante ou perdante ne dise presque rien de votre niveau.",
      },
      {
        terme: "Espérance",
        anglais: "expected value, EV",
        alias: "ev expected value avantage",
        court: "Le gain ou la perte moyen par main, exprimé en fraction de la mise.",
        long: "Une espérance de −0,5 % signifie que vous perdez en moyenne 50 centimes par tranche de 100 € misée. Un compteur compétent vise entre +0,5 % et +1,5 %. C'est une moyenne de long terme : elle ne dit rien de votre soirée.",
      },
      {
        terme: "Variance",
        anglais: "variance",
        alias: "écart-type fluctuation risque de ruine",
        court: "L'ampleur des écarts autour de cette moyenne.",
        long: "Au blackjack elle est brutale. Un avantage de 1 % est noyé dans des fluctuations bien plus grandes, et il faut des centaines d'heures pour que l'espérance domine le bruit. Le risque de ruine est la probabilité de perdre toute votre bankroll avant que cela n'arrive.",
      },
      {
        terme: "Tirer, rester, doubler, séparer",
        anglais: "hit, stand, double, split",
        alias: "hit stand double split decisions actions",
        court: "Les quatre décisions de base, auxquelles s'ajoute l'abandon quand la table le propose.",
        long: "Tirer demande une carte de plus. Rester fige la main. Doubler mise à nouveau la même somme et n'accorde qu'une seule carte. Séparer transforme une paire en deux mains, chacune recevant une mise identique. Le tableau de stratégie donne la meilleure de ces décisions pour chaque situation.",
      },
      {
        terme: "Abandon",
        anglais: "late surrender",
        alias: "surrender abandon tardif late",
        court: "Rendre la main contre la moitié de la mise, avant de tirer.",
        long: "L'abandon tardif — le seul courant — n'est proposé qu'après que le croupier a vérifié son blackjack. Il ne concerne qu'une poignée de situations, surtout 16 contre 9, 10 ou As, mais il y économise plus que n'importe quelle autre décision. Toutes les tables ne le proposent pas.",
      },
      {
        terme: "Doubler après séparation",
        anglais: "double after split, DAS",
        alias: "das double after split",
        court: "L'autorisation de doubler sur une main issue d'une paire séparée.",
        long: "Souvent noté DAS. Quand elle est accordée, cette règle rend la séparation plus intéressante et modifie quelques cases du tableau — on sépare des paires qu'on garderait sinon. Son absence coûte environ 0,14 % au joueur.",
      },
      {
        terme: "17 souple du croupier",
        anglais: "soft 17, H17 / S17",
        alias: "h17 s17 soft 17 hauteur",
        court: "Le croupier tire ou reste sur un 17 contenant un As compté 11.",
        long: "Noté S17 quand il reste, H17 quand il tire. H17 coûte environ 0,22 % au joueur et déplace plusieurs décisions : on double 11 contre As, on abandonne 17 contre As. C'est la règle la plus souvent variable d'une table à l'autre.",
      },
      {
        terme: "Égalité",
        anglais: "push",
        alias: "push egalite tie mise rendue",
        court: "Joueur et croupier au même total : la mise est rendue, sans gain ni perte.",
        long: "Une égalité n'est ni une victoire ni une défaite. Elle compte dans le nombre de mains jouées mais laisse le solde inchangé, ce qui explique qu'un journal puisse afficher beaucoup de mains pour un résultat net proche de zéro.",
      },
      {
        terme: "Assurance",
        anglais: "insurance",
        alias: "insurance pari annexe",
        court: "Un pari annexe proposé quand le croupier montre un As, payé 2:1.",
        long: "Il gagne si la carte cachée vaut 10. Comme cela arrive un peu moins d'une fois sur trois alors que le pari en exige un tiers, il est perdant en stratégie de base — toujours, sans exception. Il devient rentable au seul moment où le sabot est réellement riche en 10, ce que seul un compte peut vous dire.",
      },
    ],
  },
  {
    groupe: "La table",
    entrees: [
      {
        terme: "Pénétration",
        anglais: "penetration",
        alias: "penetration carte de coupe",
        court: "La proportion du sabot effectivement distribuée avant le mélange.",
        long: "Le paramètre le plus important de tous, avant le choix du système. Elle se lit dans le bon sens : plus le pourcentage est élevé, mieux c'est pour vous. À 80 %, le croupier distribue huit dixièmes du sabot avant de mélanger ; à 50 %, il s'arrête à la moitié et les comptes très favorables n'ont pas le temps d'apparaître. En ordre de grandeur, sous 60 % le comptage ne rapporte pratiquement rien, autour de 70 % il devient exploitable, au-delà de 75 % il devient intéressant. Regardez où est placée la carte de coupe avant de vous asseoir.",
      },
      {
        terme: "Mélangeur continu",
        anglais: "continuous shuffler, CSM",
        alias: "csm shuffle master machine",
        court: "Une machine qui réinjecte les cartes jouées après chaque main.",
        long: "Le sabot ne s'épuise jamais, donc la composition ne dérive jamais, donc il n'y a rien à compter. Aucun système ne fonctionne contre un mélangeur continu. À ne pas confondre avec un mélangeur automatique classique, qui prépare le sabot suivant pendant que le premier se joue : celui-là laisse le comptage intact.",
      },
      {
        terme: "Main dure et main souple",
        anglais: "hard hand, soft hand",
        alias: "hard soft as 11",
        court: "Une main est souple si elle contient un As encore comptable pour 11.",
        long: "A+6 est un 17 souple : tirer ne peut pas vous faire crever, l'As redescendra à 1 si besoin. 10+7 est un 17 dur : tirer un 5 vous élimine. C'est pourquoi les deux tableaux de stratégie sont différents, et pourquoi on double des mains souples qu'on n'oserait pas doubler dures.",
      },
      {
        terme: "Hauteur du croupier",
        anglais: "dealer upcard",
        alias: "upcard carte visible",
        court: "La carte visible du croupier, celle sur laquelle repose toute votre décision.",
        long: "Les hauteurs 2 à 6 sont dites faibles : le croupier y crève entre 35 et 42 % du temps. De 7 à l'As, il est fort et vous devez souvent améliorer votre main même au risque de crever.",
      },
      {
        terme: "Carte cachée",
        anglais: "hole card",
        alias: "hole card enhc obo européen",
        court: "La seconde carte du croupier, servie face cachée et vérifiée avant que vous jouiez.",
        long: "Là où elle existe, un blackjack du croupier interrompt le coup avant que vous n'engagiez de mise supplémentaire. Sans elle, vos doublements et séparations sont exposés — sauf si la table vous les rend, une clause appelée « mises initiales seulement » qui restitue la stratégie américaine.",
      },
      {
        terme: "Blackjack payé 3:2 ou 6:5",
        anglais: "blackjack pays 3 to 2",
        alias: "paiement naturel",
        court: "Le rapport auquel votre blackjack est payé.",
        long: "À 3:2, un blackjack rapporte 15 € pour 10 misés ; à 6:5, seulement 12 €. Ce seul changement coûte environ 1,4 % d'espérance, soit davantage que tout ce qu'un comptage peut vous rapporter. Une table 6:5 est injouable, quel que soit votre niveau.",
      },
      {
        terme: "Effet de la carte de coupe",
        alias: "cut card effect",
        court: "Un biais minime qui pénalise le joueur dans les jeux distribués jusqu'à une carte de coupe.",
        long: "Quand un sabot est riche en petites cartes, les mains sont plus courtes et davantage de tours tiennent avant la coupe. Le joueur subit donc un peu plus souvent des sabots défavorables. L'effet se compte en centièmes de pourcent, et c'est pourquoi un mélangeur continu abaisse paradoxalement l'avantage de la maison. Attention à ne pas confondre : cet effet oppose carte de coupe et mélangeur, pas coupe profonde et coupe superficielle.",
      },
      {
        terme: "La pénétration ne change rien à la stratégie de base",
        alias: "profondeur coupe espérance non compteur",
        court: "Couper deux paquets sur six ne revient pas à jouer avec quatre paquets.",
        long: "Les cartes non distribuées sont mélangées au hasard parmi les autres : elles n'ont aucune raison d'être plus riches en 10 que celles que vous voyez, donc elles ne portent aucune information. Votre espérance en stratégie de base est identique à 50 % et à 75 % de pénétration, et le tableau ne bouge pas d'une case. La pénétration ne concerne que le comptage — mais elle le concerne plus que tout le reste.",
      },
      {
        terme: "Back-counting",
        anglais: "wonging",
        alias: "wonging observer entrer sortir",
        court: "Observer une table sans jouer et n'y entrer que sur compte favorable.",
        long: "Aussi appelé « wonging », d'après Stanford Wong. Cela supprime les mains jouées à désavantage et améliore nettement le rendement horaire. Mais entrer et sortir d'une table selon le compte est extrêmement visible, et beaucoup de casinos interdisent désormais d'entrer en cours de sabot.",
      },
    ],
  },
];

export { LEXIQUE };
