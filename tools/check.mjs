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
