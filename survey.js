/**
 * Améliorations progressives du formulaire d'enquête.
 * Sans JavaScript, tout continue de fonctionner : validation native
 * (required, type="email", min/max) et envoi classique vers Formspree.
 */
(function () {
  "use strict";

  const form = document.getElementById("survey-form");
  if (!form) return;

  const status = document.getElementById("form-status");
  const submitButton = form.querySelector('button[type="submit"]');
  const counter = document.getElementById("opinion-counter");
  const textarea = document.getElementById("opinion");
  const notice = document.getElementById("draft-notice");
  const clearDraftButton = document.getElementById("clear-draft");
  const progressBar = document.getElementById("progress");
  const progressFill = document.getElementById("progress-fill");
  const progressLabel = document.getElementById("progress-label");

  const DRAFT_KEY = "darel-survey-draft-v1";
  const REQUIRED_GROUPS = [
    "name",
    "email",
    "age",
    "relation",
    "likeable_or_detestable",
    "amazing_or_not",
  ];

  let submitting = false;

  function t(key, vars) {
    return window.I18N ? window.I18N.t(key, vars) : key;
  }

  function storage() {
    try {
      return window.localStorage;
    } catch (error) {
      return null;
    }
  }

  /* ---------------------------------------------------------------------- */
  /* Barre de progression                                                    */
  /* ---------------------------------------------------------------------- */
  function isAnswered(groupName) {
    const fields = form.querySelectorAll('[name="' + groupName + '"]');
    return Array.prototype.some.call(
      fields,
      (field) => field.type === "radio" || field.type === "checkbox"
        ? field.checked
        : field.value.trim() !== ""
    );
  }

  function updateProgress() {
    const total = REQUIRED_GROUPS.length;
    const done = REQUIRED_GROUPS.filter(isAnswered).length;

    if (progressFill) progressFill.style.width = (done / total) * 100 + "%";
    if (progressBar) {
      progressBar.setAttribute("aria-valuemax", String(total));
      progressBar.setAttribute("aria-valuenow", String(done));
      progressBar.setAttribute(
        "aria-valuetext",
        t("survey.progress", { done: done, total: total })
      );
    }
    if (progressLabel) {
      progressLabel.textContent = t("survey.progress", { done: done, total: total });
    }
  }

  /* ---------------------------------------------------------------------- */
  /* Compteur de caractères                                                  */
  /* ---------------------------------------------------------------------- */
  function updateCounter() {
    if (!counter || !textarea) return;
    const target = counter.querySelector("[data-count]");
    if (target) target.textContent = String(textarea.value.length);
  }

  /* ---------------------------------------------------------------------- */
  /* Brouillon automatique (localStorage)                                    */
  /* ---------------------------------------------------------------------- */
  function saveDraft() {
    const store = storage();
    if (!store) return;

    const draft = {};
    Array.prototype.forEach.call(form.elements, (field) => {
      if (!field.name || field.name.startsWith("_")) return;
      if (field.type === "radio" || field.type === "checkbox") {
        if (!field.checked) return;
        draft[field.name] = draft[field.name] || [];
        draft[field.name].push(field.value);
        return;
      }
      if (field.value.trim() === "") return;
      draft[field.name] = field.value;
    });

    try {
      if (Object.keys(draft).length === 0) {
        store.removeItem(DRAFT_KEY);
      } else {
        store.setItem(DRAFT_KEY, JSON.stringify(draft));
      }
    } catch (error) {
      /* quota atteint ou stockage bloqué : on ignore */
    }
  }

  function restoreDraft() {
    const store = storage();
    if (!store) return;

    let draft;
    try {
      draft = JSON.parse(store.getItem(DRAFT_KEY) || "null");
    } catch (error) {
      return;
    }
    if (!draft || typeof draft !== "object") return;

    let restored = false;

    Object.keys(draft).forEach((name) => {
      const values = [].concat(draft[name]);
      const fields = form.querySelectorAll('[name="' + name + '"]');

      Array.prototype.forEach.call(fields, (field) => {
        if (field.type === "radio" || field.type === "checkbox") {
          field.checked = values.indexOf(field.value) !== -1;
          if (field.checked) restored = true;
          return;
        }
        if (field.tagName === "SELECT") {
          const optionExists = Array.prototype.some.call(
            field.options,
            (option) => option.value === draft[name]
          );
          if (optionExists) {
            field.value = draft[name];
            restored = true;
          }
          return;
        }
        field.value = draft[name];
        if (field.value !== "") restored = true;
      });
    });

    if (restored && notice) notice.hidden = false;
  }

  function forgetDraft() {
    const store = storage();
    if (store) {
      try {
        store.removeItem(DRAFT_KEY);
      } catch (error) {
        /* ignore */
      }
    }
    if (notice) notice.hidden = true;
  }

  /* ---------------------------------------------------------------------- */
  /* Validation : ne surligner qu'après une première tentative               */
  /* ---------------------------------------------------------------------- */
  function markValidated() {
    form.classList.add("was-validated");
  }

  function firstInvalidField() {
    return form.querySelector(":invalid");
  }

  form.addEventListener(
    "blur",
    (event) => {
      if (event.target.matches("input, select, textarea")) markValidated();
    },
    true
  );

  // La validation native bloque l'événement submit : on affiche donc le
  // message d'aide dès le premier champ invalide détecté.
  form.addEventListener(
    "invalid",
    () => {
      markValidated();
      if (status) status.textContent = t("survey.invalid");
    },
    true
  );

  /* ---------------------------------------------------------------------- */
  /* Mises à jour                                                    */
  /* ---------------------------------------------------------------------- */
  let draftTimer = null;
  function scheduleDraftSave() {
    window.clearTimeout(draftTimer);
    draftTimer = window.setTimeout(saveDraft, 250);
  }

  form.addEventListener("input", () => {
    if (status) status.textContent = "";
    updateCounter();
    updateProgress();
    scheduleDraftSave();
  });

  form.addEventListener("change", () => {
    updateProgress();
    scheduleDraftSave();
  });

  form.addEventListener("reset", () => {
    window.setTimeout(() => {
      forgetDraft();
      updateCounter();
      updateProgress();
      if (status) status.textContent = "";
    }, 0);
  });

  if (clearDraftButton) {
    clearDraftButton.addEventListener("click", () => {
      form.reset();
      forgetDraft();
      updateCounter();
      updateProgress();
      const name = document.getElementById("name");
      if (name) name.focus();
    });
  }

  /* ---------------------------------------------------------------------- */
  /* Envoi                                                                   */
  /* ---------------------------------------------------------------------- */
  form.addEventListener("submit", (event) => {
    markValidated();

    const invalid = firstInvalidField();
    if (invalid) {
      event.preventDefault();
      if (status) status.textContent = t("survey.invalid");
      invalid.focus({ preventScroll: false });
      return;
    }

    if (submitting) {
      event.preventDefault();
      return;
    }
    submitting = true;

    if (status) status.textContent = "";
    forgetDraft();
    if (submitButton) {
      submitButton.setAttribute("aria-busy", "true");
      submitButton.textContent = t("survey.sending");
    }
  });

  // Retour arrière depuis Formspree (bfcache) : on remet le bouton en état.
  window.addEventListener("pageshow", () => {
    submitting = false;
    if (submitButton) {
      submitButton.removeAttribute("aria-busy");
      submitButton.textContent = t("survey.submit");
    }
  });

  /* ---------------------------------------------------------------------- */
  /* Initialisation                                                          */
  /* ---------------------------------------------------------------------- */
  restoreDraft();
  updateCounter();
  updateProgress();

  document.addEventListener("i18n:change", () => {
    updateProgress();
    if (submitButton && !submitting) submitButton.textContent = t("survey.submit");
  });
})();
