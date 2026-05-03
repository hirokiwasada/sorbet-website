/* sorbet corporate site — site.js */

(function () {
  "use strict";

  // Mark JS-enabled so reveal animations apply only when JS is available.
  // Skip animations entirely when ?noreveal is present (used for crawlers/screenshots).
  const skipReveal = /[?&]noreveal\b/.test(window.location.search);
  if (!skipReveal) document.documentElement.classList.add("js");

  /* ---------- 1. Nav scroll state ---------- */
  const nav = document.getElementById("nav");
  const setNavScrolled = () => {
    if (window.scrollY > 12) nav.classList.add("scrolled");
    else nav.classList.remove("scrolled");
  };
  setNavScrolled();
  window.addEventListener("scroll", setNavScrolled, { passive: true });

  /* ---------- 2. Hamburger toggle ---------- */
  const hamburger = document.getElementById("hamburger");
  hamburger.addEventListener("click", () => {
    nav.classList.toggle("open");
    hamburger.classList.toggle("open");
  });
  // Close on menu link click (mobile)
  document.querySelectorAll(".nav__menu a").forEach((a) => {
    a.addEventListener("click", () => {
      nav.classList.remove("open");
      hamburger.classList.remove("open");
    });
  });

  /* ---------- 3. Reveal on scroll ---------- */
  const revealEls = document.querySelectorAll(".reveal");
  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
          revealObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12, rootMargin: "0px 0px -8% 0px" }
  );
  revealEls.forEach((el) => revealObserver.observe(el));

  /* ---------- 4. Nav active state ---------- */
  const sections = document.querySelectorAll("section[id]");
  const navLinks = document.querySelectorAll(".nav__menu a");
  const setActiveNav = () => {
    const scrollY = window.scrollY + 140;
    let currentId = "";
    sections.forEach((sec) => {
      if (scrollY >= sec.offsetTop) currentId = sec.id;
    });
    navLinks.forEach((link) => {
      const href = link.getAttribute("href") || "";
      if (href === "#" + currentId) link.classList.add("active");
      else link.classList.remove("active");
    });
  };
  setActiveNav();
  window.addEventListener("scroll", setActiveNav, { passive: true });
})();
