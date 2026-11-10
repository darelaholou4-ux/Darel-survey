# Mettre le compte GitHub au niveau

Tout ce qui suit se fait dans le navigateur, en une demi-heure. Les textes sont prêts à coller.

## 1. Le profil (Settings → Public profile)

| Champ | Valeur |
| --- | --- |
| Name | `AHOLOU Crusis Darel` |
| Bio | `Sites web pour les commerces au Bénin. Pages rapides, commande par WhatsApp.` |
| URL | `https://darelaholou4-ux.github.io/Darel-survey/portfolio/` |
| Company | `à mon compte` |
| Location | `Abomey-Calavi, Bénin` |
| Photo | `assets/profil.jpg` (elle est déjà dans le dépôt Darel-survey) |
| Liens sociaux | LinkedIn `darel-aholou-0228253b3`, X `DAholou76424` |

## 2. Les deux dépôts qui manquent

| Dépôt | À quoi il sert | Comment |
| --- | --- | --- |
| `darelaholou4-ux` | README de profil, affiché en haut de ta page | voir `docs/profil-github.md` |
| `darelaholou4-ux.github.io` | Le portfolio à l'adresse courte | voir plus bas |

### Le dépôt `darelaholou4-ux.github.io`

1. <https://github.com/new> → nom : `darelaholou4-ux.github.io` → **Public** → **Create repository**.
2. Dans le dépôt vide : **Add file → Upload files**, puis glisser **le contenu** du dossier `portfolio/` de ce dépôt (index.html, style.css, favicon.svg, le dossier assets, robots.txt, sitemap.xml, LICENSE, `.nojekyll`).
3. **Settings → Pages** → Source : **Deploy from a branch** → Branche : `main` → Dossier : `/ (root)` → **Save**.
4. Une minute plus tard : <https://darelaholou4-ux.github.io/>.

Ensuite, deux lignes à changer pour que tout pointe vers l'adresse courte — dis-le moi et je m'en occupe :

- `business-card.html`, lien du portfolio ;
- `assets/crusis-darel-aholou.vcf`, champ `URL:`.

## 3. Descriptions et sujets des dépôts

À coller dans **Settings** de chaque dépôt, champ *Description*, puis *Topics* (les sujets s'ajoutent un par un, en minuscules, avec des tirets).

| Dépôt | Description | Sujets |
| --- | --- | --- |
| `Darel-survey` | Formulaire d'enquête et carte de visite. HTML, CSS et JavaScript écrits à la main, sans dépendance. | `html` `css` `javascript` `accessibilite` `github-pages` |
| `lemessiatriomphe.github.io` | Site vitrine d'une cave à vin : sélection, commande, contact. | `site-vitrine` `html` `css` `benin` |
| `whatsapp-analyzer` | Classement des membres d'un groupe WhatsApp à partir de l'export `.txt`. | `react` `vite` `javascript` |
| `business-card` | *(archiver : c'est l'ancienne version de Darel-survey)* | — |

Pour archiver `business-card` : **Settings → zone Danger → Archive this repository**.

## 4. Épingler trois dépôts

Sur la page du profil, bouton **Customize your pins** : garder, dans cet ordre,

1. `lemessiatriomphe.github.io` — le plus proche de ce que vend un client ;
2. `Darel-survey` — la preuve technique (accessibilité, tests, déploiement) ;
3. `whatsapp-analyzer` — la preuve que tu fais aussi des applications.

## 5. Remplacer le README de `whatsapp-analyzer`

Il affiche encore le mode d'emploi de Vite. Remplacer tout le fichier par :

```markdown
# WhatsApp Analyzer

Classement des membres d'un groupe WhatsApp à partir de l'export `.txt` de la conversation.

Une invitation compte `+1` pour celui qui invite, un départ compte `-1`, sans double comptage quand la même personne est invitée deux fois.

## Utilisation

Ouvrir l'application, charger l'export `.txt`, cliquer sur « Analyser ». Tout se passe dans le navigateur : aucun fichier n'est envoyé sur un serveur.

**En ligne :** <https://whatsapp-analyzer-mu.vercel.app/>

## Technique

React et Vite, aucune autre dépendance à l'exécution.

```bash
npm install
npm run dev
npm run build
```
```

## 6. Ce qui ne se fait pas dans la foulée

- **Ne pas** racheter de dépôts vides pour « faire du volume ». Un dépôt sans README ni site déployé fait plus de mal que pas de dépôt du tout.
- **Ne pas** ajouter de badges (build, compteur de visites, « profile views »). Ça se voit immédiatement et ça ne rassure personne.
- **Ne pas** renommer les dépôts tous les mois : les liens partagés cassent et Google perd le fil.
