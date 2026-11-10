# Portfolio — Crusis Darel Aholou

Page d'accueil professionnelle, en français : travaux, méthode, tarifs en francs CFA et contact.

**En ligne :** <https://darelaholou4-ux.github.io/>

## Ce qu'il y a dedans

| Fichier | Rôle |
| --- | --- |
| `index.html` | La page, en HTML sémantique |
| `style.css` | Mise en page, thème clair et sombre, styles d'impression |
| `assets/fonts/` | Inter et Instrument Serif, auto-hébergées (licence OFL) |
| `assets/apercu-formulaire.webp` | Capture du formulaire Darel Survey |
| `assets/apercu-lien.png` | Image d'aperçu pour les liens partagés (1200 × 630) |
| `favicon.svg` | Monogramme C-B |

## Choix techniques

- **Aucune dépendance** : ni bibliothèque, ni script. La page fonctionne sans JavaScript.
- **Deux polices**, auto-hébergées et préchargées. Pas d'appel à un service de polices.
- **Une colonne**, mesure de lecture de 42 rem, hauteur de ligne 1,65.
- **Thème sombre** automatique (`prefers-color-scheme`), sans bascule manuelle.
- **Tableau des tarifs** qui devient une liste sur téléphone, sans défilement horizontal.
- **Accessibilité** : lien d'évitement, contrastes vérifiés, `:focus-visible`, aucune violation axe-core sur quatre combinaisons (ordinateur/téléphone × clair/sombre).

## Modifier

Tout est en texte brut. Le contenu se change dans `index.html`, les couleurs dans les variables `:root` de `style.css`.

```bash
python3 -m http.server 8000   # puis http://localhost:8000
```

## Licence

Code sous licence MIT (voir `LICENSE`). Les polices gardent leur licence d'origine, détaillée dans `assets/fonts/LICENCES.txt`.
