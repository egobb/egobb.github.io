document.addEventListener("DOMContentLoaded", () => {
  const toggle = document.getElementById("mobile-menu-toggle");
  const menu = document.getElementById("mobile-menu");
  if (!toggle || !menu) return;

  const closeMenu = ({ restoreFocus = false } = {}) => {
    menu.classList.add("hidden");
    toggle.setAttribute("aria-expanded", "false");
    if (restoreFocus) toggle.focus();
  };

  const openMenu = () => {
    menu.classList.remove("hidden");
    toggle.setAttribute("aria-expanded", "true");
  };

  toggle.addEventListener("click", event => {
    event.stopPropagation();
    if (toggle.getAttribute("aria-expanded") === "true") {
      closeMenu();
    } else {
      openMenu();
    }
  });

  menu.addEventListener("click", event => {
    if (event.target.closest("a[href]")) closeMenu();
  });

  document.addEventListener("click", event => {
    if (!menu.classList.contains("hidden") && !event.target.closest(".portfolio-mobile-menu-wrap")) {
      closeMenu();
    }
  });

  document.addEventListener("keydown", event => {
    if (event.key === "Escape" && !menu.classList.contains("hidden")) {
      closeMenu({ restoreFocus: true });
    }
  });

  window.addEventListener("resize", () => {
    if (window.innerWidth >= 1024) closeMenu();
  });
});
