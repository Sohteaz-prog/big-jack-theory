# Message à donner à Claude Design

*Copiez ce texte, joignez `systeme-visuel.md` et vos captures d'écran.*

---

J'ai développé une application web de blackjack qui fonctionne bien, mais dont
le design est resté très classique. Je cherche à lui donner un caractère, sans
casser ce qui marche.

**L'application.** Un compagnon de blackjack pour téléphone : tableau de
stratégie de base, compteur de cartes en direct, exercices d'entraînement,
journal de sessions, et une partie théorique sur les systèmes de comptage.
Quatre pages. Je joins le document qui décrit son système visuel actuel, et des
captures de ses écrans.

**Deux contextes d'usage très différents.** Certains écrans se consultent
debout, à une table de casino, en quelques secondes et parfois discrètement.
D'autres se lisent à froid, assis, pour apprendre.

**Ce que je veux que vous laissiez tranquille.** Le tableau des mains et le
compteur. Ce sont les écrans de la première catégorie. Ils sont dépouillés à
dessein : tout ce qui les habille ralentit leur lecture. Vous pouvez proposer
des ajustements de lisibilité, mais pas de matière ni d'ornement.

**Ce sur quoi je veux des propositions.** Les écrans qu'on consulte à froid :
la page d'accueil, les cartes des cinq exercices, la liste des neuf systèmes de
comptage, et la page des façons de miser. Ce sont eux qui manquent
d'identité aujourd'hui.

**Ce que j'attends.** Deux ou trois directions distinctes, pas une seule
version aboutie. Par direction j'entends un parti pris — une atmosphère, une
manière de traiter la matière et la typographie — pas seulement une palette
différente. Montrez chaque direction sur deux écrans au moins, pour que je
puisse juger de sa tenue.

**Contraintes techniques.** L'application est en React, thème clair et sombre,
et utilise trois polices avec des rôles stricts : Bricolage Grotesque pour ce
qui nomme, Public Sans pour ce qui se lit, JetBrains Mono pour ce qui se
chiffre. Si une direction demande d'autres polices, dites-le explicitement,
c'est un choix que je veux pouvoir peser.

**Un élément existant à conserver.** Un jeton de casino dessiné en SVG,
décliné selon l'enseigne choisie par l'utilisateur. Il sert d'icône, d'écran de
lancement et de logo. Vous pouvez le retravailler, mais il reste le signe
distinctif de l'application.
