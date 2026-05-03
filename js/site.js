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
  document.querySelectorAll(".nav__menu a").forEach((a) => {
    a.addEventListener("click", () => {
      nav.classList.remove("open");
      hamburger.classList.remove("open");
    });
  });

  /* ---------- 3. Reveal on scroll ---------- */
  const revealEls = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window) {
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
  } else {
    revealEls.forEach((el) => el.classList.add("visible"));
  }

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

  /* ---------- 5. Hero tagline split-text reveal ---------- */
  const tagline = document.getElementById("heroTagline");
  if (tagline && !skipReveal) {
    requestAnimationFrame(() => {
      // Add stagger to inner spans
      const innerSpans = tagline.querySelectorAll(".word > span");
      innerSpans.forEach((s, i) => {
        s.style.transitionDelay = (0.15 + i * 0.18) + "s";
      });
      // Trigger reveal on next frame
      setTimeout(() => tagline.classList.add("in"), 120);
    });
  }

  /* ---------- 6. Magnetic cursor (desktop only) ---------- */
  const isFinePointer = window.matchMedia("(pointer: fine)").matches;
  if (isFinePointer && !skipReveal) {
    const cursor = document.createElement("div");
    cursor.className = "mag-cursor";
    const dot = document.createElement("div");
    dot.className = "mag-cursor__dot";
    cursor.appendChild(dot);
    document.body.appendChild(cursor);

    let mx = window.innerWidth / 2;
    let my = window.innerHeight / 2;
    let cx = mx, cy = my;

    document.addEventListener("mousemove", (e) => {
      mx = e.clientX;
      my = e.clientY;
    });

    const tick = () => {
      cx += (mx - cx) * 0.18;
      cy += (my - cy) * 0.18;
      cursor.style.transform = `translate3d(${cx}px, ${cy}px, 0)`;
      requestAnimationFrame(tick);
    };
    tick();

    // Hover targets — enlarge cursor when hovering interactive elements
    const hoverSelectors = "a, button, .card, .strength, .service, .phase, .pillar, .career__step, .contact__email, .nav__cta, .btn";
    document.querySelectorAll(hoverSelectors).forEach((el) => {
      el.addEventListener("mouseenter", () => cursor.classList.add("is-hover"));
      el.addEventListener("mouseleave", () => cursor.classList.remove("is-hover"));
    });

    // Hide cursor near edges (avoids flicker)
    document.addEventListener("mouseleave", () => cursor.classList.add("is-hidden"));
    document.addEventListener("mouseenter", () => cursor.classList.remove("is-hidden"));
  }

  /* ---------- 7. Count-up numbers (data-count attribute) ---------- */
  const counters = document.querySelectorAll("[data-count]");
  if (counters.length && "IntersectionObserver" in window) {
    const animateCount = (el) => {
      const target = parseFloat(el.getAttribute("data-count")) || 0;
      const duration = 1600;
      const start = performance.now();
      const suffix = el.getAttribute("data-count-suffix") || "";
      const decimals = parseInt(el.getAttribute("data-count-decimals") || "0", 10);

      const step = (now) => {
        const t = Math.min(1, (now - start) / duration);
        // ease-out cubic
        const eased = 1 - Math.pow(1 - t, 3);
        const current = target * eased;
        el.textContent = current.toFixed(decimals) + suffix;
        if (t < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    };

    const countObs = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            animateCount(entry.target);
            countObs.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.4 }
    );
    counters.forEach((el) => countObs.observe(el));
  }

  /* ---------- 8. Reduced motion respect ---------- */
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    document.documentElement.classList.remove("js");
    document.querySelectorAll(".reveal").forEach((el) => el.classList.add("visible"));
    if (tagline) tagline.classList.add("in");
  }
})();
