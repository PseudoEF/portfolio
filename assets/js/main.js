(() => {
  "use strict";

  const header = document.querySelector("[data-header]");
  const navToggle = document.querySelector("[data-nav-toggle]");
  const nav = document.querySelector("[data-nav]");
  const navLabel = document.querySelector("[data-nav-toggle-label]");
  const mobileQuery = window.matchMedia("(max-width: 860px)");
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const openLabel = "Меню";
  const closeLabel = "Закрыть";

  const setNav = (open) => {
    if (!nav || !navToggle) return;

    nav.classList.toggle("is-open", open);
    navToggle.setAttribute("aria-expanded", String(open));
    navToggle.setAttribute("aria-label", open ? "Закрыть меню" : "Открыть меню");
    document.body.classList.toggle("nav-open", open);

    if (navLabel) {
      navLabel.textContent = open ? closeLabel : openLabel;
    }
  };

  if (nav && navToggle) {
    navToggle.addEventListener("click", () => {
      setNav(navToggle.getAttribute("aria-expanded") !== "true");
    });

    nav.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", () => {
        if (mobileQuery.matches) setNav(false);
      });
    });

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && nav.classList.contains("is-open")) {
        setNav(false);
        navToggle.focus();
      }
    });

    mobileQuery.addEventListener("change", (event) => {
      if (!event.matches) setNav(false);
    });
  }

  if (header) {
    const updateHeader = () => {
      header.classList.toggle("is-scrolled", window.scrollY > 8);
    };

    updateHeader();
    window.addEventListener("scroll", updateHeader, { passive: true });
  }

  const revealItems = Array.from(document.querySelectorAll(".reveal"));

  if (revealItems.length > 0) {
    if (!("IntersectionObserver" in window) || reducedMotion.matches) {
      revealItems.forEach((item) => item.classList.add("is-visible"));
    } else {
      document.documentElement.classList.add("js");

      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (!entry.isIntersecting) return;
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          });
        },
        {
          rootMargin: "0px 0px -6% 0px",
          threshold: 0.08,
        }
      );

      revealItems.forEach((item) => observer.observe(item));
    }
  }

  const copyStatus = document.querySelector("[data-copy-status]");
  const copyButtons = document.querySelectorAll("[data-copy]");
  const copyTimers = new WeakMap();
  let statusTimer;

  const showStatus = (message) => {
    if (!copyStatus) return;

    copyStatus.textContent = message;
    copyStatus.classList.add("is-visible");
    window.clearTimeout(statusTimer);
    statusTimer = window.setTimeout(() => {
      copyStatus.classList.remove("is-visible");
    }, 2800);
  };

  const legacyCopy = (text) => {
    const helper = document.createElement("textarea");
    helper.className = "clipboard-helper";
    helper.value = text;
    helper.setAttribute("readonly", "");
    helper.setAttribute("aria-hidden", "true");
    document.body.appendChild(helper);
    helper.select();
    helper.setSelectionRange(0, helper.value.length);

    let copied = false;
    try {
      copied = document.execCommand("copy");
    } catch {
      copied = false;
    }

    helper.remove();
    return copied;
  };

  const copyText = async (text) => {
    if (navigator.clipboard && window.isSecureContext) {
      try {
        await navigator.clipboard.writeText(text);
        return true;
      } catch {
        return legacyCopy(text);
      }
    }

    return legacyCopy(text);
  };

  copyButtons.forEach((button) => {
    const originalLabel = button.getAttribute("aria-label") || "Скопировать";
    const label = button.querySelector("[data-copy-label]");

    const resetButton = () => {
      button.classList.remove("is-copied");
      button.setAttribute("aria-label", originalLabel);
      if (label) label.textContent = "Копировать";
    };

    button.addEventListener("click", async () => {
      const text = button.getAttribute("data-copy");
      const name = button.getAttribute("data-copy-name") || "Текст";
      if (!text) return;

      const copied = await copyText(text);
      window.clearTimeout(copyTimers.get(button));

      if (copied) {
        button.classList.add("is-copied");
        button.setAttribute("aria-label", `${name} скопирован`);
        if (label) label.textContent = "Скопировано";
        showStatus(`Скопировано: ${name}`);
        copyTimers.set(button, window.setTimeout(resetButton, 2400));
        return;
      }

      const targetId = button.getAttribute("data-copy-target");
      const target = targetId ? document.getElementById(targetId) : null;

      if (target) {
        target.focus();
        const selection = window.getSelection();
        if (selection) {
          const range = document.createRange();
          range.selectNodeContents(target);
          selection.removeAllRanges();
          selection.addRange(range);
        }
      }

      showStatus(`Не удалось скопировать. ${name} выделен — скопируйте вручную.`);
    });
  });

  document.querySelectorAll("[data-year]").forEach((year) => {
    year.textContent = String(new Date().getFullYear());
  });
})();
