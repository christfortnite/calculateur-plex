# La Bonne Porte — calculateur de plex

Outil d'analyse de rentabilité d'un immeuble locatif au Québec : cashflow, couverture de la dette, taxe de bienvenue, prime SCHL, scénarios, amortissement, comparaison d'immeubles et rapport PDF.

Site statique, sans installation ni serveur : `index.html` (page d'accueil, avec `landing.js`), `calculateur.html` (l'outil, avec `app.js`) et `style.css` (partagé). La connexion et l'abonnement affichés sur l'accueil ne sont pas encore branchés. Les immeubles sont gardés dans le navigateur du visiteur.

## Mettre le site en ligne avec GitHub Pages

1. Sur github.com, crée un dépôt public nommé `calculateur-plex`.
2. Dans le dépôt, clique « Add file » puis « Upload files », glisse tout le contenu de ce dossier et clique « Commit changes ».
3. Va dans Settings, puis Pages. Sous « Branch », choisis `main` et le dossier `/ (root)`, puis Save.
4. Après une minute ou deux, le site est en ligne à `https://christfortnite.github.io/calculateur-plex/`.

Pour un nom de domaine à toi, achète-le chez un registraire et inscris-le dans Settings, Pages, « Custom domain ».

## Extension de navigateur

Le dossier `extension/` contient une extension Chrome. Sur une annonce Centris, un clic lit la fiche affichée et l'ouvre dans le calculateur, sans collage.

1. L'adresse du site est déjà inscrite dans `extension/background.js`.
2. Dans Chrome, ouvre `chrome://extensions`, active le mode développeur, clique « Charger l'extension non empaquetée » et choisis le dossier `extension`.

L'extension agit seulement quand on clique dessus, sur la page affichée. Elle ne parcourt pas Centris et n'envoie rien à un serveur.

## Données de référence à tenir à jour

Elles sont écrites dans `app.js` :

| Donnée | Où dans le code | Source | Fréquence |
|---|---|---|---|
| Taux hypothécaire de départ | `EX.taux` et l'indice sous le champ dans `index.html` | nesto.ca | Mensuelle |
| Seuils de la taxe de bienvenue | fonction `mutation` | Avis annuel du gouvernement du Québec | Chaque 1er janvier |
| Tranches de Québec et de Lévis | fonction `mutation` | Règlements municipaux | Annuelle |
| Loyers et inoccupation | objet `Z` | SCHL, enquête d'octobre | Annuelle, en décembre |
| Taux de taxation municipaux | objet `T` | Profil financier des municipalités, MAMH | Annuelle |
| Primes d'assurance prêt | fonction `schl` | SCHL | Lors des changements |

## Limites connues

- Données de marché pour Québec, Lévis, Lotbinière et la Beauce seulement.
- La TPS/TVQ sur un immeuble neuf n'est pas calculée.
- L'impôt est une estimation simple.
- Pas de comptes : rien n'est partagé entre les appareils.

Ce site n'est pas affilié à Centris, à la SCHL ni au gouvernement du Québec. Outil d'aide à la réflexion, pas un conseil financier.

## Pages légales, polices et bibliothèques

- `conditions.html`, `confidentialite.html` et `sources.html` : à faire réviser par un avocat avant de vendre un abonnement, et à compléter avec les coordonnées de l'exploitant.
- Polices servies par le site (dossier `fonts/`) : Newsreader et Hanken Grotesk, sous licence SIL Open Font License 1.1.
- `vendor/jspdf.umd.min.js` : jsPDF 2.5.1, licence MIT.
