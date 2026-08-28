document.addEventListener("DOMContentLoaded", () => {
  const toggle = document.getElementById("portfolio-theme-toggle");
  if (!toggle) return;

  const resolveDark = () => document.documentElement.classList.contains("dark");
  const syncState = () => toggle.setAttribute("aria-pressed", resolveDark() ? "true" : "false");

  syncState();

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
