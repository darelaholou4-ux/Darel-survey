/**
 * Carte de visite : petites attentions qui marchent sans dépendance.
 * Tout est optionnel — les liens mailto/tel et le fichier .vcf statique
 * fonctionnent même sans JavaScript.
 */
(function () {
  "use strict";

  const EMAIL = "darelaholou4@gmail.com";

  const avatar = document.getElementById("avatar");
  const image = document.querySelector(".profile-image");
  const copyButton = document.getElementById("copy-email");
  const shareButton = document.getElementById("share-card");
  const toast = document.getElementById("toast");

  function t(key) {
    return window.I18N ? window.I18N.t(key) : key;
  }

  /** Affiche un message temporaire sous les boutons. */
  let toastTimer = null;
  function showToast(key) {
    if (!toast) return;
    toast.textContent = t(key);
    window.clearTimeout(toastTimer);
    toastTimer = window.setTimeout(() => {
      toast.textContent = "";
    }, 2600);
  }

  /* ---------------------------------------------------------------------- */
  /* Image distante indisponible → monogramme de secours                     */
  /* ---------------------------------------------------------------------- */
  function useFallback() {
    if (avatar) avatar.classList.add("avatar--fallback");
    if (image) image.setAttribute("aria-hidden", "true");
  }

  if (image) {
    if (image.complete && image.naturalWidth === 0) {
      useFallback();
    } else {
      image.addEventListener("error", useFallback);
    }
  }

  /* ---------------------------------------------------------------------- */
  /* Copier l'e-mail                                                         */
  /* ---------------------------------------------------------------------- */
  function legacyCopy(text) {
    const helper = document.createElement("textarea");
    helper.value = text;
    helper.setAttribute("readonly", "");
    helper.style.position = "fixed";
    helper.style.top = "-1000px";
    document.body.appendChild(helper);
    helper.select();
    let ok = false;
    try {
      ok = document.execCommand("copy");
    } catch (error) {
      ok = false;
    }
    document.body.removeChild(helper);
    return ok;
  }

  if (copyButton) {
    copyButton.addEventListener("click", async () => {
      let copied = false;
      try {
        if (navigator.clipboard && window.isSecureContext) {
          await navigator.clipboard.writeText(EMAIL);
          copied = true;
        } else {
          copied = legacyCopy(EMAIL);
        }
      } catch (error) {
        copied = legacyCopy(EMAIL);
      }
      showToast(copied ? "card.copied" : "card.copyFailed");
    });
  }

  /* ---------------------------------------------------------------------- */
  /* Partager la carte (si l'appareil le permet)                             */
  /* ---------------------------------------------------------------------- */
  if (shareButton && typeof navigator.share === "function") {
    shareButton.hidden = false;
    shareButton.addEventListener("click", async () => {
      try {
        await navigator.share({
          title: document.title,
          text: "AHOLOU Crusis Darel — business card",
          url: window.location.href,
        });
      } catch (error) {
        /* partage annulé : rien à signaler */
      }
    });
  }

  // Les libellés traduits peuvent changer après un basculement de langue.
  document.addEventListener("i18n:change", () => {
    if (toast) toast.textContent = "";
  });
})();
