# Darel-survey

Deux petites pages statiques (HTML/CSS/JS, zéro dépendance) :

| Page | Fichiers | Description |
| --- | --- | --- |
| Formulaire d'enquête | `index.html` · `survey.css` · `survey.js` | Questionnaire personnel, accessible et responsive, envoyé via Formspree. |
| Carte de visite numérique | `business-card.html` · `business-card.css` | Carte de contact avec liens e-mail, téléphone, portfolio et réseaux sociaux. |

## Lancer le projet

Aucune installation n'est nécessaire. Deux options :

```bash
# 1. Ouvrir directement les fichiers
open index.html            # macOS
xdg-open index.html        # Linux

# 2. Servir le dossier (recommandé)
python3 -m http.server 8000
# puis http://localhost:8000/index.html
```

## Ce qui a été amélioré

- **HTML sémantique** : `main`, `header`, `footer`,
  `fieldset`/`legend`, listes de contact, titres hiérarchisés.
- **Accessibilité** : tous les champs ont un `label` associé, groupes de
  radios/questions annoncés, lien d'évitement (« skip link »), focus visible,
  messages d'état en `aria-live`, lien `noopener noreferrer` pour les onglets
  externes, alternative textuelle de l'image.
- **Responsive** : largeurs fluides (`min()`, `clamp()`), grille adaptative,
  confortable de 320 px à grand écran.
- **Design** : palette chaleureuse avec variables CSS, mode sombre automatique
  (`prefers-color-scheme`), animations sobres désactivables
  (`prefers-reduced-motion`), styles d'impression pour la carte.
- **UX du formulaire** : validation native (email, âge 1–120, champs requis),
  erreurs affichées seulement après interaction, compteur de caractères,
  anti double-envoi et état « Sending… ».
- **Détails techniques** : `meta viewport`, favicon inline (aucune requête
  supplémentaire), dimensions d'image déclarées pour éviter les sauts de mise
  en page, `loading="lazy"`.

## Notes

- L'envoi du formulaire utilise l'endpoint Formspree déjà configuré
  (`https://formspree.io/f/xojnnrro`). Sans JavaScript, le formulaire continue
  de fonctionner normalement.
- Les identifiants attendus par les projets freeCodeCamp (`#title`,
  `#survey-form`, `#name`, `#email`, `#number`, `#dropdown`, `#submit`,
  `.business-card`, `.profile-image`, `.full-name`, `.social-media`, etc.) sont
  conservés.
