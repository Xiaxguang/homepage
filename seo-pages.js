(() => {
  "use strict";

  const navToggle = document.getElementById("navToggle");
  const siteNav = document.getElementById("siteNav");

  navToggle?.addEventListener("click", () => {
    const open = siteNav?.classList.toggle("open") || false;
    navToggle.setAttribute("aria-expanded", String(open));
  });

  siteNav?.querySelectorAll("a").forEach(link => {
    link.addEventListener("click", () => {
      siteNav.classList.remove("open");
      navToggle?.setAttribute("aria-expanded", "false");
    });
  });

  const year = document.getElementById("year");
  if (year) year.textContent = String(new Date().getFullYear());
})();
