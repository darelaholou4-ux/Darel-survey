# Portfolio — AHOLOU Crusis Darel

Une seule page, en français : trois projets avec leur fenêtre d'aperçu, tarifs en francs CFA, engagements et contact.

**En ligne :** <https://darelaholou4-ux.github.io/Darel-survey/portfolio/>

## Ce qu'il y a dedans

| Fichier | Rôle |
| --- | --- |
| `index.html` | La page, en HTML sémantique |
| `style.css` | Mise en page, deux teintes douces, thème clair et sombre, styles d'impression |
| `assets/fonts/` | Inter et Instrument Serif, auto-hébergées (licence OFL) |
| `assets/apercu-lien.png` | Image d'aperçu pour les liens partagés (1200 × 630) |
| `favicon.svg` | Monogramme C-B |

## Choix techniques

- **Aucune dépendance** : ni bibliothèque, ni service externe. Un seul script en ligne, huit lignes, qui révèle les aperçus une fois les sites chargés ; sans lui, la page reste entière et lisible.
- **Deux polices**, auto-hébergées et préchargées. Pas d'appel à un service de polices.
- **Fenêtres d'aperçu** : trois mini-navigateurs. Le site s'affiche dedans s'il répond ; sinon la vignette colorée reste, pour éviter un cadre blanc.
- **Thème sombre** automatique (`prefers-color-scheme`), sans bascule manuelle.
- **Une colonne** de 46 rem, hauteur de ligne 1,65.
- **Tableau des tarifs** qui devient une liste sur téléphone, sans défilement horizontal.
- **Accessibilité** : lien d'évitement, contrastes vérifiés, `:focus-visible`, aucune violation axe-core sur quatre combinaisons (ordinateur/téléphone × clair/sombre).

## Modifier

Tout est en texte brut. Le contenu se change dans `index.html`, les couleurs dans les variables `:root` de `style.css`.

```bash
python3 -m http.server 8000   # puis http://localhost:8000
```

## Licence

Code sous licence MIT (voir `LICENSE`). Les polices gardent leur licence d'origine, détaillée dans `assets/fonts/LICENCES.txt`.
