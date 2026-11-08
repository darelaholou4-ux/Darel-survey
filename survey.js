/**
 * Progressive enhancements for the survey form.
 * Everything here is optional: without JavaScript the form still validates
 * natively (required, min/max, type="email") and posts to Formspree.
 */
(function () {
  "use strict";

  const form = document.getElementById("survey-form");
  if (!form) return;

  const status = document.getElementById("form-status");
  const submitButton = form.querySelector('button[type="submit"]');
  const counter = document.getElementById("opinion-counter");
  const textarea = document.getElementById("opinion");
  let submitting = false;

  /* ---------------------------------------------------------------------- */
  /* Live character counter                                                  */
  /* ---------------------------------------------------------------------- */
  function updateCounter() {
    if (!counter || !textarea) return;
    const used = textarea.value.length;
    const max = textarea.maxLength > 0 ? textarea.maxLength : 0;
    const target = counter.querySelector("[data-count]");
    if (target) target.textContent = String(used);
    counter.hidden = max === 0;
  }

  if (textarea) {
    textarea.addEventListener("input", updateCounter);
    updateCounter();
  }

  /* ---------------------------------------------------------------------- */
  /* Only show error styling after the user tried to submit                  */
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

  form.addEventListener(
    "invalid",
    () => {
      markValidated();
    },
    true
  );

  /* ---------------------------------------------------------------------- */
  /* Submission: friendly feedback, no accidental double send                */
  /* ---------------------------------------------------------------------- */
  form.addEventListener("submit", (event) => {
    markValidated();

    const invalid = firstInvalidField();
    if (invalid) {
      // Native validation already blocks the submission; just guide the user.
      event.preventDefault();
      if (status) status.textContent = "Please fill in the highlighted fields.";
      invalid.focus({ preventScroll: false });
      return;
    }

    if (submitting) {
      event.preventDefault();
      return;
    }
    submitting = true;

    if (status) status.textContent = "";
    if (submitButton) {
      submitButton.textContent = "Sending…";
      submitButton.setAttribute("aria-busy", "true");
    }

    // If the browser restores this page from the back/forward cache, reset UI.
    window.addEventListener("pageshow", () => {
      submitting = false;
      if (submitButton) {
        submitButton.textContent = "Submit my answers";
        submitButton.removeAttribute("aria-busy");
      }
    });
  });
})();
