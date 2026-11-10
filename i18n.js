/**
 * Bascule bilingue EN / FR, sans dépendance.
 * - Les textes traduisibles portent data-i18n, data-i18n-placeholder,
 *   data-i18n-aria-label ou data-i18n-html.
 * - La langue choisie est mémorisée ; sinon on suit la langue du navigateur.
 * - Un événement « i18n:change » est émis pour que les autres scripts
 *   (progression du formulaire, compteur…) se remettent à jour.
 */
(function () {
  "use strict";

  const STORAGE_KEY = "darel-site-lang";
  const SUPPORTED = ["en", "fr"];

  const dict = {
    en: {
      /* Commun ------------------------------------------------------------ */
      "a11y.skip": "Skip to the form",
      "a11y.skipContent": "Skip to the content",
      "nav.label": "Main navigation",
      "nav.more": "Other pages",
      "nav.survey": "Survey",
      "nav.card": "Business card",
      "lang.label": "Language",
      "title.survey": "Survey · Darel isn't he amazing?",
      "title.card": "AHOLOU Crusis Darel · Business card",
      "title.thanks": "Thank you · Darel survey",

      /* Formulaire -------------------------------------------------------- */
      "survey.eyebrow": "Personal questionnaire",
      "survey.title": "Darel isn't he amazing?",
      "survey.description":
        "This is a personal questionnaire that will allow you to give your opinion on whether Darel is amazing or not. It takes about two minutes, and every answer helps.",
      "survey.progressLabel": "Form completion",
      "survey.progress": "{done} of {total} required answers",
      "survey.draftRestored": "Your draft was restored.",
      "survey.draftClear": "Start over",
      "survey.groupAbout": "About you",
      "survey.groupOpinion": "Your honest opinion",
      "survey.name": "Full name",
      "survey.namePlaceholder": "Your name",
      "survey.email": "Email",
      "survey.emailPlaceholder": "your@email.com",
      "survey.age": "Age",
      "survey.ageHint": "(1–120)",
      "survey.relation": "In your opinion, what best describes your relationship with Darel?",
      "survey.relationChoose": "Choose one…",
      "survey.relationFriend": "Friend",
      "survey.relationBest": "Best Friend",
      "survey.relationBrother": "Brother",
      "survey.relationKnow": "Just Knowledge",
      "survey.relationBudding": "Budding love",
      "survey.relationLover": "Lover",
      "survey.relationEx": "Ex-Lover",
      "survey.qLikeable": "Am I detestable or likeable?",
      "survey.likeable": "Likeable",
      "survey.detestable": "Detestable",
      "survey.qAmazing": "In your opinion, am I amazing?",
      "survey.amazing": "Amazing",
      "survey.notAmazing": "Not Amazing",
      "survey.qPerson": "Would you say that I am a good or a bad person?",
      "survey.good": "Good Person",
      "survey.bad": "Bad Person",
      "survey.qImportant": "Am I important to you?",
      "survey.yes": "Yes",
      "survey.no": "No",
      "survey.opinion": "Now briefly tell me what you think of me",
      "survey.optional": "(optional)",
      "survey.opinionPlaceholder": "Your opinion…",
      "survey.characters": "characters",
      "survey.submit": "Submit my answers",
      "survey.sending": "Sending…",
      "survey.reset": "Clear form",
      "survey.invalid": "Please fill in the highlighted fields.",
      "survey.privacy":
        'Answers are delivered to Darel through <a href="https://formspree.io" target="_blank" rel="noopener noreferrer">Formspree</a>.',
      "survey.footer": "Thanks for taking the time — it genuinely means a lot.",

      /* Carte de visite --------------------------------------------------- */
      "card.designation": "Student in Mathematics, Computer Science and Applications (MIA)",
      "card.alt": "Original illustration: a hooded figure facing a red sun at dawn",
      "card.newTab": "(opens in a new tab)",
      "card.portfolio": "Portfolio",
      "card.copyEmail": "Copy email",
      "card.copied": "Email copied!",
      "card.copyFailed": "Copy failed — the address is above.",
      "card.saveContact": "Save contact",
      "card.share": "Share card",
      "card.socialTitle": "Connect with me",
      "card.footer": "Digital business card — tap “Save contact” to add me to your phone.",

      /* Remerciements ----------------------------------------------------- */
      "thanks.eyebrow": "Answer received",
      "thanks.title": "Thank you!",
      "thanks.message":
        "Your answers have been sent to Darel. He reads every single one — even the brutally honest ones.",
      "thanks.back": "Take the survey again",
      "thanks.card": "View business card",
      "thanks.footer": "Made with care in Cotonou, Benin.",
    },

    fr: {
      /* Commun ------------------------------------------------------------ */
      "a11y.skip": "Aller au formulaire",
      "a11y.skipContent": "Aller au contenu",
      "nav.label": "Navigation principale",
      "nav.more": "Autres pages",
      "nav.survey": "Sondage",
      "nav.card": "Carte de visite",
      "lang.label": "Langue",
      "title.survey": "Sondage · Darel n'est-il pas incroyable ?",
      "title.card": "AHOLOU Crusis Darel · Carte de visite",
      "title.thanks": "Merci · Sondage de Darel",

      /* Formulaire -------------------------------------------------------- */
      "survey.eyebrow": "Questionnaire personnel",
      "survey.title": "Darel n'est-il pas incroyable ?",
      "survey.description":
        "Ce questionnaire personnel vous permet de donner votre avis sur Darel, pour savoir s'il est incroyable ou non. Cela prend environ deux minutes, et chaque réponse compte.",
      "survey.progressLabel": "Progression du formulaire",
      "survey.progress": "{done} / {total} réponses obligatoires",
      "survey.draftRestored": "Votre brouillon a été restauré.",
      "survey.draftClear": "Recommencer",
      "survey.groupAbout": "À propos de vous",
      "survey.groupOpinion": "Votre avis sincère",
      "survey.name": "Nom complet",
      "survey.namePlaceholder": "Votre nom",
      "survey.email": "E-mail",
      "survey.emailPlaceholder": "vous@exemple.com",
      "survey.age": "Âge",
      "survey.ageHint": "(1–120)",
      "survey.relation": "Selon vous, quelle est votre relation avec Darel ?",
      "survey.relationChoose": "Choisissez…",
      "survey.relationFriend": "Ami(e)",
      "survey.relationBest": "Meilleur(e) ami(e)",
      "survey.relationBrother": "Frère / sœur",
      "survey.relationKnow": "Simple connaissance",
      "survey.relationBudding": "Amour naissant",
      "survey.relationLover": "Amoureux(se)",
      "survey.relationEx": "Ex",
      "survey.qLikeable": "Suis-je détestable ou sympathique ?",
      "survey.likeable": "Sympathique",
      "survey.detestable": "Détestable",
      "survey.qAmazing": "Selon vous, suis-je incroyable ?",
      "survey.amazing": "Incroyable",
      "survey.notAmazing": "Pas incroyable",
      "survey.qPerson": "Diriez-vous que je suis une bonne ou une mauvaise personne ?",
      "survey.good": "Bonne personne",
      "survey.bad": "Mauvaise personne",
      "survey.qImportant": "Suis-je important pour vous ?",
      "survey.yes": "Oui",
      "survey.no": "Non",
      "survey.opinion": "Dites-moi brièvement ce que vous pensez de moi",
      "survey.optional": "(facultatif)",
      "survey.opinionPlaceholder": "Votre avis…",
      "survey.characters": "caractères",
      "survey.submit": "Envoyer mes réponses",
      "survey.sending": "Envoi en cours…",
      "survey.reset": "Effacer le formulaire",
      "survey.invalid": "Merci de compléter les champs surlignés.",
      "survey.privacy":
        'Les réponses sont transmises à Darel via <a href="https://formspree.io" target="_blank" rel="noopener noreferrer">Formspree</a>.',
      "survey.footer": "Merci d'avoir pris le temps — cela compte vraiment.",

      /* Carte de visite --------------------------------------------------- */
      "card.designation":
        "Étudiant en Mathématiques, Informatique et Applications (MIA)",
      "card.alt": "Illustration originale : silhouette encapuchonnée face au soleil rouge",
      "card.newTab": "(s'ouvre dans un nouvel onglet)",
      "card.portfolio": "Portfolio",
      "card.copyEmail": "Copier l'e-mail",
      "card.copied": "E-mail copié !",
      "card.copyFailed": "Copie impossible — l'adresse est ci-dessus.",
      "card.saveContact": "Ajouter au téléphone",
      "card.share": "Partager la carte",
      "card.socialTitle": "Me contacter",
      "card.footer":
        "Carte de visite numérique — appuyez sur « Ajouter au téléphone ».",

      /* Remerciements ----------------------------------------------------- */
      "thanks.eyebrow": "Réponse reçue",
      "thanks.title": "Merci !",
      "thanks.message":
        "Vos réponses ont été envoyées à Darel. Il les lit toutes, même les plus honnêtes.",
      "thanks.back": "Répondre à nouveau",
      "thanks.card": "Voir la carte de visite",
      "thanks.footer": "Fait avec soin à Cotonou, au Bénin.",
    },
  };

  let lang = "en";

  function readStoredLang() {
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY);
      return SUPPORTED.includes(stored) ? stored : null;
    } catch (error) {
      return null;
    }
  }

  function storeLang(value) {
    try {
      window.localStorage.setItem(STORAGE_KEY, value);
    } catch (error) {
      /* stockage indisponible (navigation privée) : on continue sans mémoire */
    }
  }

  function detectLang() {
    const preferred = (navigator.languages && navigator.languages[0]) || navigator.language || "en";
    return preferred.toLowerCase().startsWith("fr") ? "fr" : "en";
  }

  /** Traduit une clé, avec interpolation simple de {variables}. */
  function t(key, vars) {
    const table = dict[lang] || dict.en;
    let value = table[key];
    if (value === undefined) value = dict.en[key];
    if (value === undefined) return key;
    if (vars) {
      Object.keys(vars).forEach((name) => {
        value = value.split("{" + name + "}").join(String(vars[name]));
      });
    }
    return value;
  }

  /** Applique une langue à toute la page. */
  function apply(nextLang) {
    lang = SUPPORTED.includes(nextLang) ? nextLang : "en";
    document.documentElement.lang = lang;

    document.querySelectorAll("[data-i18n]").forEach((element) => {
      element.textContent = t(element.getAttribute("data-i18n"));
    });

    document.querySelectorAll("[data-i18n-placeholder]").forEach((element) => {
      element.setAttribute("placeholder", t(element.getAttribute("data-i18n-placeholder")));
    });

    document.querySelectorAll("[data-i18n-aria-label]").forEach((element) => {
      element.setAttribute("aria-label", t(element.getAttribute("data-i18n-aria-label")));
    });

    document.querySelectorAll("[data-i18n-html]").forEach((element) => {
      element.innerHTML = t(element.getAttribute("data-i18n-html"));
    });

    document.querySelectorAll("[data-i18n-alt]").forEach((element) => {
      element.setAttribute("alt", t(element.getAttribute("data-i18n-alt")));
    });

    document.querySelectorAll(".lang-switch [data-lang]").forEach((button) => {
      button.setAttribute("aria-pressed", String(button.getAttribute("data-lang") === lang));
    });

    const titleKey = document.body && document.body.getAttribute("data-title-key");
    if (titleKey) document.title = t(titleKey);

    document.dispatchEvent(new CustomEvent("i18n:change", { detail: { lang: lang } }));
  }

  function init() {
    const initial = readStoredLang() || detectLang();
    apply(initial);

    document.querySelectorAll(".lang-switch [data-lang]").forEach((button) => {
      button.addEventListener("click", () => {
        const next = button.getAttribute("data-lang");
        storeLang(next);
        apply(next);
      });
    });
  }

  window.I18N = {
    t: t,
    apply: apply,
    get lang() {
      return lang;
    },
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
