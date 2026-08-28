document.addEventListener("DOMContentLoaded", () => {
  const toggles = Array.from(document.querySelectorAll(".portfolio-theme-toggle"));
  if (!toggles.length) return;

  const resolveDark = () => document.documentElement.classList.contains("dark");
  const syncState = () => {
    const pressed = resolveDark() ? "true" : "false";
    toggles.forEach(toggle => toggle.setAttribute("aria-pressed", pressed));
  };

  syncState();

  toggles.forEach(toggle => {
    toggle.addEventListener("click", () => {
      const nextTheme = resolveDark() ? "light" : "dark";
      localStorage.setItem("theme", nextTheme);
      document.documentElement.classList.toggle("dark", nextTheme === "dark");
      syncState();
      window.dispatchEvent(new CustomEvent("themeChanged", {
        detail: {
          colorScheme: localStorage.getItem("colorScheme") || document.documentElement.getAttribute("data-theme") || "default",
          theme: nextTheme,
        },
      }));
    });
  });
});
