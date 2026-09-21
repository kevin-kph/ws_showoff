Ce site n'a pas de back-office. Ajouter un article, c'est ajouter deux fichiers et envoyer le tout sur GitHub.

## Étape 1 : écrire le texte

Créez un fichier dans le dossier `posts/`, par exemple `posts/mon-nouvel-article.md`. Écrivez en Markdown : `##` pour un titre, `**gras**`, `*italique*`, des listes, des citations.

Pour insérer une image, utilisez un chemin depuis la racine du site :

```
![Légende de l'image](images/mon-image.png)
```

## Étape 2 : déclarer l'article

Ajoutez une entrée dans `data/posts.json` :

```
{
  "slug": "mon-nouvel-article",
  "title": "Le titre affiché",
  "date": "2026-10-01",
  "summary": "Une phrase qui donne envie de lire.",
  "cover": "images/mon-image.png"
}
```

Le `slug` doit être identique au nom du fichier `.md`, sans l'extension.

## Étape 3 : publier

```
git add .
git commit -m "Nouvel article"
git push
```

Au bout d'une minute environ, l'article apparaît en ligne, en tête de la liste.

![Cercles du soir](images/cercles-du-soir.svg)
