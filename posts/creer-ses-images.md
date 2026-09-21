Toutes les images de la galerie partent du même point : une palette de cinq couleurs. Une couleur très sombre pour le fond, trois couleurs intermédiaires, une couleur claire pour la lumière.

## Trois familles de formes

J'alterne entre trois compositions :

1. **Les nappes** : de grandes ellipses floutées qui se recouvrent.
2. **Les ondes** : des cercles concentriques, épais ou fins.
3. **Les vagues** : des couches superposées, du fond vers l'avant.

![Marée haute](images/maree-haute.svg)

## Le grain, pour finir

Sans grain, un dégradé numérique paraît lisse et froid. Un bruit très léger, à 14 % d'opacité, suffit à lui donner de la matière.

Voici l'idée en une ligne de SVG :

```
<feTurbulence type="fractalNoise" baseFrequency=".85" numOctaves="2"/>
```

Ce qui compte, c'est de **changer une seule chose à la fois** : la palette, ou la forme, ou le grain. Sinon, impossible de savoir ce qui a marché.
