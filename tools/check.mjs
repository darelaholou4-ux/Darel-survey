#!/usr/bin/env node
/**
 * Vérifications statiques du site, sans aucune dépendance.
 *   node tools/check.mjs
 *
 * Contrôle notamment :
 *  - la structure minimale de chaque page (lang, viewport, description, canonical) ;
 *  - l'unicité des identifiants et la validité des `for` / `aria-labelledby` ;
 *  - la présence de tous les textes bilingues (data-i18n) dans i18n.js ;
 *  - l'existence des fichiers locaux référencés (css, js, images, vcf…) ;
 *  - les éléments attendus par le formulaire freeCodeCamp.
 */
import { readFileSync, existsSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const read = (file) => readFileSync(join(root, file), "utf8");

const errors = [];
const warnings = [];
const fail = (message) => errors.push(message);
const warn = (message) => warnings.push(message);

const htmlFiles = ["index.html", "business-card.html", "thanks.html"];
const pages = Object.fromEntries(htmlFiles.map((file) => [file, read(file)]));

/* ------------------------------------------------------------------------ */
/* 1. Structure minimale                                                     */
/* ------------------------------------------------------------------------ */
for (const [file, html] of Object.entries(pages)) {
  if (!/^<!DOCTYPE html>/i.test(html.trimStart())) fail(`${file} : DOCTYPE manquant`);
  if (!/<html[^>]+lang="[a-z]{2}"/i.test(html)) fail(`${file} : attribut lang manquant`);
  if (!/<meta[^>]+name="viewport"/i.test(html)) fail(`${file} : meta viewport manquant`);
  if (!/<meta[^>]+name="description"/i.test(html)) fail(`${file} : meta description manquante`);
  if (!/<title>[^<]+<\/title>/.test(html)) fail(`${file} : <title> manquant`);
  if (!/rel="canonical"/.test(html)) warn(`${file} : lien canonical absent`);
  if (!/rel="manifest"/.test(html)) warn(`${file} : manifeste absent`);
  if (!/<main[\s>]/.test(html)) fail(`${file} : élément <main> manquant`);
  if (!/<h1[\s>]/.test(html)) fail(`${file} : titre principal <h1> manquant`);
  if (/<img(?![^>]*alt=)[^>]*>/.test(html)) fail(`${file} : image sans attribut alt`);
}

/* ------------------------------------------------------------------------ */
/* 2. Identifiants, labels, aria-labelledby                                  */
/* ------------------------------------------------------------------------ */
for (const [file, html] of Object.entries(pages)) {
  const ids = [...html.matchAll(/\sid="([^"]+)"/g)].map((match) => match[1]);
  const duplicates = ids.filter((id, index) => ids.indexOf(id) !== index);
  if (duplicates.length) fail(`${file} : identifiants dupliqués → ${[...new Set(duplicates)].join(", ")}`);

  for (const match of html.matchAll(/<label[^>]*\sfor="([^"]+)"/g)) {
    if (!ids.includes(match[1])) fail(`${file} : <label for="${match[1]}"> ne cible aucun id`);
  }

  for (const match of html.matchAll(/aria-labelledby="([^"]+)"/g)) {
    for (const id of match[1].split(/\s+/)) {
      if (!ids.includes(id)) fail(`${file} : aria-labelledby="${id}" inconnu`);
    }
  }

  for (const match of html.matchAll(/aria-describedby="([^"]+)"/g)) {
    for (const id of match[1].split(/\s+/)) {
      if (!ids.includes(id)) fail(`${file} : aria-describedby="${id}" inconnu`);
    }
  }
}

/* ------------------------------------------------------------------------ */
/* 3. Textes bilingues                                                       */
/* ------------------------------------------------------------------------ */
const i18nSource = read("i18n.js");
const frenchStart = i18nSource.indexOf("fr: {");
if (frenchStart === -1) fail("i18n.js : bloc « fr » introuvable");

const enBlock = i18nSource.slice(0, frenchStart);
const frBlock = i18nSource.slice(frenchStart);

const keysOf = (block) => new Set([...block.matchAll(/"([a-zA-Z0-9_-]+\.[a-zA-Z0-9_.-]+)":/g)].map((m) => m[1]));
const enKeys = keysOf(enBlock);
const frKeys = keysOf(frBlock);

for (const key of enKeys) if (!frKeys.has(key)) fail(`i18n.js : clé « ${key} » absente en français`);
for (const key of frKeys) if (!enKeys.has(key)) fail(`i18n.js : clé « ${key} » absente en anglais`);

const usedKeys = new Set();
const scriptSources = ["survey.js", "business-card.js", "i18n.js"]
  .filter((file) => existsSync(join(root, file)))
  .map((file) => read(file));
for (const source of scriptSources) {
  for (const key of enKeys) {
    if (source.includes(`"${key}"`)) usedKeys.add(key);
  }
}
for (const [file, html] of Object.entries(pages)) {
  for (const match of html.matchAll(/data-i18n(?:-placeholder|-aria-label|-html|-alt)?="([^"]+)"/g)) {
    usedKeys.add(match[1]);
    if (!enKeys.has(match[1])) fail(`${file} : clé de traduction inconnue « ${match[1]} »`);
  }
  const titleKey = html.match(/data-title-key="([^"]+)"/)?.[1];
  if (!titleKey) fail(`${file} : data-title-key manquant`);
  else if (!enKeys.has(titleKey)) fail(`${file} : clé de titre inconnue « ${titleKey} »`);
}

for (const key of enKeys) {
  if (!usedKeys.has(key) && !/^title\.|^a11y\.|^nav\.|^lang\./.test(key)) {
    warn(`i18n.js : clé « ${key} » définie mais jamais utilisée`);
  }
}

/* ------------------------------------------------------------------------ */
/* 4. Fichiers référencés                                                    */
/* ------------------------------------------------------------------------ */
const assetPattern = /(?:href|src)="([^"#:?]+\.(?:html|css|js|svg|png|jpe?g|webp|vcf|webmanifest|xml|txt|json))"/g;
for (const [file, html] of Object.entries(pages)) {
  for (const match of html.matchAll(assetPattern)) {
    if (!existsSync(join(root, match[1]))) fail(`${file} : fichier introuvable → ${match[1]}`);
  }
}

// Polices et images référencées depuis les feuilles de style
for (const sheet of ["base.css", "survey.css", "business-card.css", "thanks.css"]) {
  if (!existsSync(join(root, sheet))) continue;
  for (const match of read(sheet).matchAll(/url\("([^"]+)"\)/g)) {
    if (!existsSync(join(root, match[1]))) fail(`${sheet} : ressource introuvable → ${match[1]}`);
  }
}

/* ------------------------------------------------------------------------ */
/* 5. Exigences freeCodeCamp (formulaire + carte de visite)                  */
/* ------------------------------------------------------------------------ */
const survey = pages["index.html"];
const surveyRequirements = {
  "h1#title": /<h1[^>]*id="title"/,
  "#description": /id="description"/,
  "form#survey-form": /<form[^>]*id="survey-form"/,
  "#name-label + #name": /id="name-label"/,
  "#email-label + #email": /id="email-label"/,
  "#number avec min/max/placeholder": /id="number"[\s\S]{0,200}min="1"[\s\S]{0,80}max="120"/,
  "#dropdown avec 2+ options": /id="dropdown"/,
  "#submit type=submit": /<button[^>]*id="submit"[^>]*type="submit"/,
  "textarea avec placeholder": /<textarea[\s\S]{0,400}placeholder=/,
};
for (const [label, pattern] of Object.entries(surveyRequirements)) {
  if (!pattern.test(survey)) fail(`index.html : exigence manquante → ${label}`);
}
if ((survey.match(/type="radio"/g) || []).length < 2) fail("index.html : au moins deux boutons radio requis");
if ((survey.match(/type="checkbox"/g) || []).length < 2) fail("index.html : au moins deux cases à cocher requises");
if ((survey.match(/<option/g) || []).length < 2) fail("index.html : au moins deux options requises");
// Un seul bouton de soumission, sinon le formulaire devient ambigu.
if ((survey.match(/type="submit"/g) || []).length !== 1) fail("index.html : un seul bouton submit attendu");

const card = pages["business-card.html"];
const cardRequirements = {
  ".business-card": /class="business-card"/,
  ".profile-image": /class="profile-image"/,
  ".full-name": /class="full-name"/,
  ".designation": /class="designation"/,
  ".company": /class="company"/,
  ".portfolio-link target=_blank": /class="portfolio-link"[\s\S]{0,300}target="_blank"/,
  ".social-media": /class="social-media"/,
  "lien mailto": /href="mailto:/,
  "séparateur <hr>": /<hr\s*\/?>/,
};
for (const [label, pattern] of Object.entries(cardRequirements)) {
  if (!pattern.test(card)) fail(`business-card.html : exigence manquante → ${label}`);
}

/* ------------------------------------------------------------------------ */
/* 6. Autres fichiers de qualité                                             */
/* ------------------------------------------------------------------------ */
for (const file of ["robots.txt", "sitemap.xml", "site.webmanifest", "icon.svg", ".nojekyll", "assets/crusis-darel-aholou.vcf"]) {
  if (!existsSync(join(root, file))) fail(`fichier attendu manquant → ${file}`);
}

const pagesWorkflow = ".github/workflows/pages.yml";
if (!existsSync(join(root, pagesWorkflow))) {
  fail(`workflow de déploiement manquant → ${pagesWorkflow} (Pages resterait figé)`);
} else {
  const workflow = read(pagesWorkflow);
  for (const action of ["actions/configure-pages", "actions/upload-pages-artifact", "actions/deploy-pages"]) {
    if (!workflow.includes(action)) fail(`${pagesWorkflow} : action manquante → ${action}`);
  }
  if (!/branches:\s*\[?"?main"?\]?/.test(workflow)) {
    warn(`${pagesWorkflow} : le déclenchement sur main n'a pas été reconnu`);
  }
}

/* ------------------------------------------------------------------------ */
/* 7. Cohérence de la marque                                                 */
/* ------------------------------------------------------------------------ */
const company = (card.match(/class="company"[^>]*>([^<]+)</) || [])[1]?.trim();
const vcf = read("assets/crusis-darel-aholou.vcf");
const org = (vcf.match(/^ORG:(.+)$/m) || [])[1]?.trim();

if (!company) fail("business-card.html : nom d'entreprise introuvable dans .company");
if (!org) fail("vCard : champ ORG manquant");
if (company && org && company.toLowerCase() !== org.toLowerCase()) {
  fail(`marque incohérente : carte « ${company} » ≠ vCard « ${org} »`);
}

const monograms = new Set();
for (const [file, html] of Object.entries(pages)) {
  const found = html.match(/class="topbar__brand"[^>]*>([^<]+)</);
  if (!found) fail(`${file} : monogramme absent de la barre (lien d'accueil)`);
  else monograms.add(found[1].trim());
}
if (monograms.size > 1) fail(`monogrammes différents selon les pages : ${[...monograms].join(" / ")}`);

const iconMonogram = (read("icon.svg").match(/<text[\s\S]*?>([^<]+)<\/text>/) || [])[1]?.trim();
if (monograms.size === 1 && iconMonogram && iconMonogram !== [...monograms][0]) {
  fail(`favicon incohérent : icon.svg « ${iconMonogram} » ≠ barre « ${[...monograms][0]} »`);
}
if (monograms.size === 1 && !new RegExp(`aria-label="${[...monograms][0]}[^"]*home page"`).test(card)) {
  warn("business-card.html : le libellé d'accessibilité du logo ne reprend pas le monogramme");
}

/* ------------------------------------------------------------------------ */
/* 8. Portfolio (servi sous /portfolio/)                                     */
/* ------------------------------------------------------------------------ */
const pagesPortfolio = [
  { fichier: "portfolio/index.html", feuille: "portfolio/style.css", canonical: true, donneesStructurees: true },
];

for (const page of pagesPortfolio) {
  const nom = page.fichier.replace("portfolio/", "");

  if (!existsSync(join(root, page.fichier))) {
    fail(`portfolio manquant → ${page.fichier}`);
    continue;
  }

  const folio = read(page.fichier);
  const folioCss = existsSync(join(root, page.feuille)) ? read(page.feuille) : "";

  if (!folioCss) fail(`${nom} : feuille de style absente → ${page.feuille}`);
  if (!/^<!DOCTYPE html>/i.test(folio.trimStart())) fail(`${nom} : DOCTYPE manquant`);
  if (!/<html[^>]+lang="fr"/i.test(folio)) fail(`${nom} : langue française attendue`);
  if ((folio.match(/<h1[\s>]/g) || []).length !== 1) fail(`${nom} : un seul <h1> attendu`);
  if (!/<meta[^>]+name="description"/.test(folio)) fail(`${nom} : meta description manquante`);
  if (page.canonical && !/rel="canonical"/.test(folio)) warn(`${nom} : lien canonical absent`);

  // Aucune ressource chargée depuis un autre domaine (les liens sortants, si).
  const ressources = [
    ...folio.matchAll(/<(?:img|script)[^>]+src="([^"]+)"/g),
    // un <link> ne charge une ressource que pour ces relations-là
    ...[...folio.matchAll(/<link[^>]*>/g)]
      .filter((m) => /rel="(stylesheet|preload|icon|apple-touch-icon|manifest)"/.test(m[0]))
      .map((m) => [null, (m[0].match(/href="([^"]+)"/) || [])[1]]),
    ...folioCss.matchAll(/url\(["']?([^"')]+)["']?\)/g),
  ]
    .map((m) => m[1])
    .filter(Boolean);

  for (const url of ressources) {
    if (/^(https?:)?\/\//.test(url)) fail(`${nom} : ressource externe → ${url}`);
    else if (!url.startsWith("data:") && !existsSync(join(root, "portfolio", url.replace(/^\.\//, "")))) {
      fail(`${nom} : fichier introuvable → ${url}`);
    }
  }

  for (const police of ["inter-latin-wght-normal.woff2", "instrument-serif-latin-400-normal.woff2"]) {
    if (folioCss && !folioCss.includes(police)) fail(`${nom} : police non déclarée → ${police}`);
  }

  // Aucun script externe. Un petit script en ligne est toléré (révélation des aperçus).
  const scripts = [...folio.matchAll(/<script([^>]*)>([\s\S]*?)<\/script>/g)]
    .filter((m) => !/type="application\/ld\+json"/.test(m[1]));
  for (const [, attributs, corps] of scripts) {
    if (/\bsrc=/.test(attributs)) fail(`${nom} : script externe → ${attributs.trim()}`);
    if (corps.length > 800) warn(`${nom} : script en ligne trop long (${corps.length} caractères)`);
  }

  if (page.donneesStructurees) {
    try {
      JSON.parse(folio.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/)[1]);
    } catch {
      warn(`${nom} : données structurées illisibles`);
    }
  }
}

try {
  JSON.parse(read("site.webmanifest"));
} catch (error) {
  fail(`site.webmanifest invalide : ${error.message}`);
}

/* ------------------------------------------------------------------------ */
/* Rapport                                                                   */
/* ------------------------------------------------------------------------ */
for (const message of warnings) console.warn(`⚠  ${message}`);
for (const message of errors) console.error(`✖  ${message}`);

if (errors.length) {
  console.error(`\n${errors.length} problème(s) détecté(s).`);
  process.exit(1);
}

console.log(
  `✔ ${errors.length} erreur, ${warnings.length} avertissement — ${htmlFiles.length} pages vérifiées.`
);
