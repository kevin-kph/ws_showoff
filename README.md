# Mon Atelier

Un site statique (HTML, CSS, JavaScript) pour présenter des images et publier des articles. Aucune compilation, aucune dépendance : seules les polices viennent de Google Fonts.

## Structure

```
index.html          Squelette de la page
css/style.css       Styles (les couleurs et polices sont en haut du fichier)
js/app.js           Logique : pages, galerie, blog, visionneuse, effets
data/images.json    Liste des images de la galerie
data/posts.json     Liste des articles
images/             Vos images
posts/              Vos articles, en Markdown (.md)
.nojekyll           Dit à GitHub Pages de ne pas transformer le site
```

## Voir le site en local

Le site charge des fichiers JSON : il faut un petit serveur (un double-clic sur `index.html` ne suffit pas).

```
cd mon-site
python3 -m http.server
```

Ouvrez ensuite http://localhost:8000.

## Mettre le site en ligne avec GitHub Pages

1. Créez un dépôt sur GitHub (par exemple `mon-site`).
2. Envoyez-y le contenu de ce dossier :
   ```
   git init
   git add .
   git commit -m "Premier commit"
   git branch -M main
   git remote add origin https://github.com/VOTRE-NOM/mon-site.git
   git push -u origin main
   ```
3. Sur GitHub : **Settings**, puis **Pages**, puis « Deploy from a branch », branche `main`, dossier `/ (root)`.
4. Après une minute, le site est disponible sur `https://VOTRE-NOM.github.io/mon-site/`.

## Personnaliser

- **Nom et phrase d'accroche** : bloc `CONFIG` en haut de `js/app.js` (et la balise `<title>` de `index.html`).
- **Couleurs et polices** : variables `:root` en haut de `css/style.css`.
- **Effets** : dans `js/app.js`, les fonctions `bindTilt` (inclinaison des images) et `initHeroTitle` (titre qui réagit à la souris). Supprimez l'appel pour désactiver un effet.

## Ajouter une image

1. Copiez le fichier dans `images/`.
2. Ajoutez une entrée dans `data/images.json` :
   ```json
   {
     "src": "images/mon-image.png",
     "title": "Titre",
     "description": "Une phrase de description.",
     "date": "2026-10-01",
     "width": 1600,
     "height": 1000,
     "color": "#4A3CF7",
     "alt": "Description pour les lecteurs d'écran"
   }
   ```
   `width` et `height` évitent que la page saute pendant le chargement. `color` est la couleur affichée avant l'arrivée de l'image.

Conseil : exportez vos images en WebP ou JPEG, à 1600 px de large maximum, pour que la galerie reste rapide.

## Ajouter un article

1. Créez `posts/mon-article.md` (Markdown : titres, listes, citations, code, images).
2. Ajoutez une entrée dans `data/posts.json` avec le même `slug` que le nom du fichier.

## Pistes pour aller plus loin

- Filtres par tag dans la galerie.
- Flux RSS (à générer avec un petit script).
- Nom de domaine personnalisé (Settings, Pages, Custom domain).
- Remplacer le mini-parseur Markdown par la bibliothèque `marked`.
