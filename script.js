/**
 * Wabantu Technologies — site interactions
 * Navbar, mobile menu, smooth scroll, reveals, FAQ, form validation.
 */

(function () {
  "use strict";

  const header = document.getElementById("site-header");
  const navToggle = document.getElementById("nav-toggle");
  const mobileNav = document.getElementById("mobile-nav");
  const yearEl = document.getElementById("year");
  const themeToggle = document.getElementById("theme-toggle");
  const themeIconMoon = document.getElementById("theme-icon-moon");
  const themeIconSun = document.getElementById("theme-icon-sun");
  var THEME_KEY = "wt-theme";

  /** Current year in footer */
  if (yearEl) {
    yearEl.textContent = String(new Date().getFullYear());
  }

  /** Light / dark theme (class `dark` on <html>; Tailwind darkMode: class) */
  function applyTheme(dark) {
    document.documentElement.classList.toggle("dark", dark);
    try {
      localStorage.setItem(THEME_KEY, dark ? "dark" : "light");
    } catch (e) {}
    syncThemeToggleUi();
  }

  function syncThemeToggleUi() {
    if (!themeToggle) return;
    var dark = document.documentElement.classList.contains("dark");
    themeToggle.setAttribute("aria-pressed", dark ? "true" : "false");
    themeToggle.setAttribute("aria-label", dark ? "Switch to light mode" : "Switch to dark mode");
    if (themeIconMoon && themeIconSun) {
      themeIconMoon.classList.toggle("hidden", dark);
      themeIconSun.classList.toggle("hidden", !dark);
    }
  }

  if (themeToggle) {
    syncThemeToggleUi();
    themeToggle.addEventListener("click", function () {
      applyTheme(!document.documentElement.classList.contains("dark"));
    });
  }

  /** Body ready fade */
  document.body.classList.add("wt-boot");
  window.requestAnimationFrame(function () {
    document.body.classList.add("wt-ready");
    document.body.classList.remove("wt-boot");
  });

  /** Sticky header on scroll */
  function onScroll() {
    if (!header) return;
    const y = window.scrollY || document.documentElement.scrollTop;
    header.classList.toggle("is-scrolled", y > 16);
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /** Mobile navigation */
  function setMobileNav(open) {
    if (!mobileNav || !navToggle) return;
    mobileNav.hidden = !open;
    navToggle.setAttribute("aria-expanded", open ? "true" : "false");
    navToggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    document.body.style.overflow = open ? "hidden" : "";
  }

  if (navToggle && mobileNav) {
    navToggle.addEventListener("click", function () {
      const open = navToggle.getAttribute("aria-expanded") === "true";
      setMobileNav(!open);
    });

    mobileNav.querySelectorAll('a[href^="#"]').forEach(function (link) {
      link.addEventListener("click", function () {
        setMobileNav(false);
      });
    });
  }

  /** Close mobile nav on resize to desktop */
  window.addEventListener(
    "resize",
    function () {
      if (window.matchMedia("(min-width: 1024px)").matches) {
        setMobileNav(false);
      }
    },
    { passive: true }
  );

  /** Smooth scroll + active nav highlight */
  const sections = Array.from(document.querySelectorAll("main section[id]"));
  const navLinks = document.querySelectorAll('.nav-track a[href^="#"]');

  function getCurrentSectionId() {
    const pos = window.scrollY + 120;
    let current = sections[0] && sections[0].id;
    for (const sec of sections) {
      if (sec.offsetTop <= pos) current = sec.id;
    }
    return current;
  }

  function updateActiveNav() {
    const id = getCurrentSectionId();
    navLinks.forEach(function (a) {
      const href = a.getAttribute("href");
      const match = href === "#" + id;
      if (match) {
        a.setAttribute("aria-current", "page");
        a.classList.add("text-cyan-700", "dark:text-cyan-300");
      } else {
        a.removeAttribute("aria-current");
        a.classList.remove("text-cyan-700");
        a.classList.remove("dark:text-cyan-300");
      }
    });
  }

  window.addEventListener("scroll", updateActiveNav, { passive: true });
  updateActiveNav();

  /** IntersectionObserver — scroll reveals */
  const revealEls = document.querySelectorAll(".wt-reveal");
  if ("IntersectionObserver" in window && revealEls.length) {
    const io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (e) {
          if (e.isIntersecting) {
            e.target.classList.add("wt-reveal-visible");
            io.unobserve(e.target);
          }
        });
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.08 }
    );
    revealEls.forEach(function (el) {
      io.observe(el);
    });
  } else {
    revealEls.forEach(function (el) {
      el.classList.add("wt-reveal-visible");
    });
  }

  /** FAQ accordion */
  document.querySelectorAll(".js-faq-btn").forEach(function (btn) {
    const panelId = btn.getAttribute("aria-controls");
    const panel = panelId ? document.getElementById(panelId) : null;

    function setOpen(open) {
      btn.setAttribute("aria-expanded", open ? "true" : "false");
      if (panel) panel.hidden = !open;
    }

    btn.addEventListener("click", function () {
      const wasOpen = btn.getAttribute("aria-expanded") === "true";
      document.querySelectorAll(".js-faq-btn").forEach(function (b) {
        const pid = b.getAttribute("aria-controls");
        const p = pid ? document.getElementById(pid) : null;
        b.setAttribute("aria-expanded", "false");
        if (p) p.hidden = true;
        const icon = b.querySelector(".js-faq-icon");
        if (icon) icon.textContent = "+";
      });
      if (!wasOpen) {
        setOpen(true);
        const icon = btn.querySelector(".js-faq-icon");
        if (icon) icon.textContent = "−";
      }
    });

    btn.addEventListener("keydown", function (e) {
      if (e.key === " " || e.key === "Enter") {
        e.preventDefault();
        btn.click();
      }
    });
  });

  /** --- Form helpers --- */
  function showErrors(form, map) {
    form.querySelectorAll("[data-error-for]").forEach(function (span) {
      const id = span.getAttribute("data-error-for");
      span.textContent = (id && map[id]) || "";
      span.hidden = !(id && map[id]);
    });
    form.querySelectorAll(".js-validate").forEach(function (input) {
      input.classList.remove("wt-input-error", "wt-input-success");
      const id = input.id;
      if (id && map[id]) input.classList.add("wt-input-error");
      else if (input.value.trim()) input.classList.add("wt-input-success");
    });
  }

  function clearFormState(form) {
    showErrors(form, {});
    form.querySelectorAll(".js-validate").forEach(function (i) {
      i.classList.remove("wt-input-error", "wt-input-success");
    });
  }

  function validateDemo(form) {
    const data = new FormData(form);
    const errors = {};
    const name = (data.get("demo_name") || "").toString().trim();
    const company = (data.get("demo_company") || "").toString().trim();
    const email = (data.get("demo_email") || "").toString().trim();
    const product = (data.get("demo_product") || "").toString();

    if (name.length < 2) errors.demo_name = "Please enter your full name.";
    if (company.length < 2) errors.demo_company = "Please enter your organization.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.demo_email = "Enter a valid email address.";
    if (!product) errors.demo_product = "Select a product or solution.";

    return errors;
  }

  function validateContact(form) {
    const data = new FormData(form);
    const errors = {};
    const name = (data.get("contact_name") || "").toString().trim();
    const email = (data.get("contact_email") || "").toString().trim();
    const topic = (data.get("contact_topic") || "").toString();

    if (name.length < 2) errors.contact_name = "Please enter your name.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.contact_email = "Enter a valid email address.";
    if (!topic) errors.contact_topic = "Please choose a topic.";

    return errors;
  }

  /** Demo form */
  const demoForm = document.getElementById("demo-form");
  const demoSuccess = document.getElementById("demo-success");

  if (demoForm) {
    demoForm.addEventListener("submit", function (e) {
      e.preventDefault();
      clearFormState(demoForm);
      const errors = validateDemo(demoForm);
      if (Object.keys(errors).length) {
        showErrors(demoForm, errors);
        const firstErr = demoForm.querySelector(".wt-input-error");
        if (firstErr) firstErr.focus();
        return;
      }
      demoForm.hidden = true;
      if (demoSuccess) {
        demoSuccess.hidden = false;
        demoSuccess.focus();
      }
    });

    demoForm.querySelector('button[type="reset"]')?.addEventListener("click", function () {
      clearFormState(demoForm);
    });
  }

  const demoResetBtn = document.getElementById("demo-reset");
  if (demoResetBtn && demoForm && demoSuccess) {
    demoResetBtn.addEventListener("click", function () {
      demoForm.reset();
      demoSuccess.hidden = true;
      demoForm.hidden = false;
      clearFormState(demoForm);
    });
  }

  /** Contact form */
  const contactForm = document.getElementById("contact-form");
  const contactSuccess = document.getElementById("contact-success");

  if (contactForm) {
    contactForm.addEventListener("submit", function (e) {
      e.preventDefault();
      clearFormState(contactForm);
      const errors = validateContact(contactForm);
      if (Object.keys(errors).length) {
        showErrors(contactForm, errors);
        const firstErr = contactForm.querySelector(".wt-input-error");
        if (firstErr) firstErr.focus();
        return;
      }
      contactForm.hidden = true;
      if (contactSuccess) {
        contactSuccess.hidden = false;
        contactSuccess.focus();
      }
    });
  }

  const contactResetBtn = document.getElementById("contact-reset");
  if (contactResetBtn && contactForm && contactSuccess) {
    contactResetBtn.addEventListener("click", function () {
      contactForm.reset();
      contactSuccess.hidden = true;
      contactForm.hidden = false;
      clearFormState(contactForm);
    });
  }

  /** Partner CTAs — pre-select contact topic */
  document.querySelectorAll('[data-contact-topic]').forEach(function (btn) {
    btn.addEventListener("click", function () {
      const topic = btn.getAttribute("data-contact-topic");
      const select = document.getElementById("contact_topic");
      if (select && topic) {
        select.value = topic;
      }
    });
  });

  /** Hero — featured products carousel (center active, adjacent previews) */
  var WT_PRODUCTS = [
    {
      name: "Fantasy League Software",
      category: "Sports & media",
      summary: "League operations, drafts, scoring, and fan engagement in one place.",
      page: "products/fantasy-league-software.html",
      primaryLabel: "View Details",
      github: null,
      logo: "assets/img/logos/Fanstasy%20League%20Logo.png",
    },
    {
      name: "Duka Langu",
      category: "Retail",
      summary: "POS and shop operations for stores, pharmacies, supermarkets, and retail chains.",
      page: "products/duka-langu.html",
      primaryLabel: "Learn More",
      github: "https://github.com/joshuu10/Duka-Langu",
      logo: "assets/img/logos/Duka%20Langu%20Logo.png",
    },
    {
      name: "School Management Software",
      category: "Education",
      summary: "Admissions, academics, communication, and school administration workflows.",
      page: "products/school-management-software.html",
      primaryLabel: "View Details",
      github: null,
      logo: "assets/img/logos/School%20Management%20System%20Logo.png",
    },
    {
      name: "Hospital Management Software",
      category: "Healthcare",
      summary: "Patient flow, departments, and clinical operations with clear dashboards.",
      page: "products/hospital-management-software.html",
      primaryLabel: "Preview Solution",
      github: null,
      logo: "assets/img/logos/Hospital%20Management%20Logo.png",
    },
    {
      name: "Hotel Management System",
      category: "Hospitality",
      summary: "Hotel processes and personnel coordination—front desk to back office.",
      page: "products/hotel-management-system.html",
      primaryLabel: "View Details",
      github: "https://github.com/joshuu10/Hotel-Management-System",
      logo: "assets/img/logos/Hotel%20Management%20System%20Logo.png",
    },
    {
      name: "Fuel Utilization System",
      category: "Operations",
      summary: "Fuel monitoring and accountability for fleets and high-usage sites.",
      page: "products/fuel-utilization-system.html",
      primaryLabel: "Learn More",
      github: null,
      logo: "assets/img/logos/Fuel%20Utilization%20System%20Logo1.png",
    },
  ];

  function wtEscapeHtml(s) {
    return String(s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function wtCarouselHtml(p, isActive) {
    var descClass = isActive ? "mt-2 text-sm text-slate-600 dark:text-slate-300" : "mt-1 line-clamp-3 text-xs text-slate-600 dark:text-slate-400";
    var titleClass = isActive
      ? "mt-1 font-display text-lg font-semibold leading-snug text-slate-900 dark:text-white sm:text-xl"
      : "mt-1 font-display text-sm font-semibold leading-snug text-slate-900 dark:text-white";
    var btnClass = isActive
      ? "inline-flex flex-1 items-center justify-center rounded-xl bg-gradient-to-r from-cyan-500 to-teal-500 px-4 py-2.5 text-sm font-semibold text-brand-navy shadow-glow transition hover:brightness-110 wt-focus wt-btn-shine"
      : "inline-flex w-full items-center justify-center rounded-lg bg-cyan-500/15 px-3 py-2 text-xs font-semibold text-cyan-900 ring-1 ring-cyan-500/30 hover:bg-cyan-500/25 dark:text-cyan-200 wt-focus";
    var logoHtml = p.logo
      ? '<div class="' +
        (isActive ? "wt-product-logo wt-product-logo--active" : "wt-product-logo") +
        '"><img src="' +
        wtEscapeHtml(p.logo) +
        '" alt="' +
        wtEscapeHtml(p.name) +
        ' logo" loading="lazy" /></div>'
      : "";
    return (
      '<p class="text-[10px] font-semibold uppercase tracking-wider text-cyan-700 dark:text-cyan-300/90">' +
      wtEscapeHtml(p.category) +
      "</p>" +
      "<h3 class=\"" +
      titleClass +
      '">' +
      wtEscapeHtml(p.name) +
      "</h3>" +
      logoHtml +
      '<p class="' +
      descClass +
      '">' +
      wtEscapeHtml(p.summary) +
      "</p>" +
      '<div class="mt-auto flex flex-wrap items-center gap-2 pt-4">' +
      '<a href="' +
      wtEscapeHtml(p.page) +
      '" class="' +
      btnClass +
      '">' +
      wtEscapeHtml(p.primaryLabel) +
      "</a>" +
      "</div>"
    );
  }

  (function initWtCarousel() {
    var root = document.querySelector("[data-wt-carousel]");
    if (!root) return;

    var prevBtn = document.getElementById("wt-carousel-prev");
    var nextBtn = document.getElementById("wt-carousel-next");
    var slotPrev = root.querySelector("[data-wt-carousel-slot=\"prev\"]");
    var slotActive = root.querySelector("[data-wt-carousel-slot=\"active\"]");
    var slotNext = root.querySelector("[data-wt-carousel-slot=\"next\"]");
    var statusEl = document.getElementById("wt-carousel-status");
    var dotsEl = document.getElementById("wt-carousel-dots");
    var n = WT_PRODUCTS.length;
    var i = 0;
    var autoRotateTimer = null;
    var AUTO_ROTATE_MS = 25000;
    var swipeCleanupTimer = null;

    function restartAutoRotate() {
      if (autoRotateTimer) {
        window.clearInterval(autoRotateTimer);
      }
      autoRotateTimer = window.setInterval(function () {
        setIndex(i + 1, false, 1);
      }, AUTO_ROTATE_MS);
    }

    function clearSwipeClasses() {
      if (slotPrev) slotPrev.classList.remove("wt-swipe-next-prev", "wt-swipe-prev-prev");
      if (slotActive) slotActive.classList.remove("wt-swipe-next-active", "wt-swipe-prev-active");
      if (slotNext) slotNext.classList.remove("wt-swipe-next-next", "wt-swipe-prev-next");
    }

    function applySwipe(direction) {
      if (!direction || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
      clearSwipeClasses();
      if (direction > 0) {
        if (slotPrev) slotPrev.classList.add("wt-swipe-next-prev");
        if (slotActive) slotActive.classList.add("wt-swipe-next-active");
        if (slotNext) slotNext.classList.add("wt-swipe-next-next");
      } else {
        if (slotPrev) slotPrev.classList.add("wt-swipe-prev-prev");
        if (slotActive) slotActive.classList.add("wt-swipe-prev-active");
        if (slotNext) slotNext.classList.add("wt-swipe-prev-next");
      }
      if (swipeCleanupTimer) window.clearTimeout(swipeCleanupTimer);
      swipeCleanupTimer = window.setTimeout(clearSwipeClasses, 620);
    }

    function setIndex(idx, fromUser, direction) {
      i = ((idx % n) + n) % n;
      render(direction);
      if (fromUser !== false) {
        restartAutoRotate();
      }
    }

    function render(direction) {
      var prev = WT_PRODUCTS[(i - 1 + n) % n];
      var cur = WT_PRODUCTS[i];
      var next = WT_PRODUCTS[(i + 1) % n];

      if (slotPrev) {
        slotPrev.innerHTML = wtCarouselHtml(prev, false);
        slotPrev.setAttribute("aria-label", "Show as featured: " + prev.name);
      }
      if (slotActive) {
        slotActive.innerHTML = wtCarouselHtml(cur, true);
      }
      if (slotNext) {
        slotNext.innerHTML = wtCarouselHtml(next, false);
        slotNext.setAttribute("aria-label", "Show as featured: " + next.name);
      }

      if (statusEl) {
        statusEl.textContent = "Featured solution " + (i + 1) + " of " + n + ": " + cur.name + ".";
      }

      if (dotsEl) {
        dotsEl.innerHTML = "";
        for (var d = 0; d < n; d++) {
          var b = document.createElement("button");
          b.type = "button";
          b.className =
            "wt-carousel-dot h-2.5 w-2.5 rounded-full border border-slate-300 bg-slate-200 transition dark:border-slate-600 dark:bg-slate-700";
          b.setAttribute("aria-label", "Show product " + (d + 1));
          if (d === i) b.setAttribute("aria-current", "true");
          b.addEventListener(
            "click",
            (function (di) {
              return function () {
                if (di === i) return;
                var raw = di - i;
                if (Math.abs(raw) > n / 2) {
                  raw = raw > 0 ? raw - n : raw + n;
                }
                setIndex(di, true, raw > 0 ? 1 : -1);
              };
            })(d)
          );
          dotsEl.appendChild(b);
        }
      }

      applySwipe(direction);
    }

    if (prevBtn) prevBtn.addEventListener("click", function () { setIndex(i - 1, true, -1); });
    if (nextBtn) nextBtn.addEventListener("click", function () { setIndex(i + 1, true, 1); });

    if (slotPrev) {
      slotPrev.addEventListener("click", function (e) {
        if (e.target.closest("a")) return;
        setIndex(i - 1, true, -1);
      });
      slotPrev.addEventListener("keydown", function (e) {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          setIndex(i - 1, true, -1);
        }
      });
    }
    if (slotNext) {
      slotNext.addEventListener("click", function (e) {
        if (e.target.closest("a")) return;
        setIndex(i + 1, true, 1);
      });
      slotNext.addEventListener("keydown", function (e) {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          setIndex(i + 1, true, 1);
        }
      });
    }

    root.addEventListener("keydown", function (e) {
      if (e.key === "ArrowLeft") {
        e.preventDefault();
        setIndex(i - 1, true, -1);
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        setIndex(i + 1, true, 1);
      }
    });

    if (slotPrev) slotPrev.tabIndex = 0;
    if (slotNext) slotNext.tabIndex = 0;

    render();
    restartAutoRotate();
  })();

  /** Product pages — screenshot carousel with tabs */
  (function initMediaCarousels() {
    var grids = document.querySelectorAll(".wt-media-grid");
    if (!grids.length) return;

    function getSlideLabel(fig, idx) {
      var strong = fig.querySelector("figcaption strong");
      if (strong && strong.textContent) {
        return strong.textContent.replace(/\s*:\s*$/, "").trim();
      }
      return "View " + (idx + 1);
    }

    grids.forEach(function (grid, gridIdx) {
      var figures = Array.prototype.slice.call(grid.querySelectorAll("figure"));
      if (figures.length < 2) return;

      var root = document.createElement("div");
      root.className = "wt-media-carousel";
      root.setAttribute("data-media-carousel", String(gridIdx));
      root.tabIndex = 0;
      root.setAttribute("aria-label", "Product screenshots carousel");
      root.setAttribute("role", "region");

      var viewport = document.createElement("div");
      viewport.className = "wt-media-viewport";

      var track = document.createElement("div");
      track.className = "wt-media-track";

      figures.forEach(function (fig, idx) {
        var slide = document.createElement("div");
        slide.className = "wt-media-slide";
        if (idx === 0) slide.classList.add("is-active");
        slide.appendChild(fig);
        track.appendChild(slide);
      });

      viewport.appendChild(track);
      root.appendChild(viewport);

      var controls = document.createElement("div");
      controls.className = "wt-media-controls";

      var prev = document.createElement("button");
      prev.type = "button";
      prev.className = "wt-media-nav wt-focus";
      prev.setAttribute("aria-label", "Previous screenshot");
      prev.innerHTML =
        '<svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" /></svg>';

      var next = document.createElement("button");
      next.type = "button";
      next.className = "wt-media-nav wt-focus";
      next.setAttribute("aria-label", "Next screenshot");
      next.innerHTML =
        '<svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" /></svg>';

      var tabs = document.createElement("div");
      tabs.className = "wt-media-tabs";
      tabs.setAttribute("role", "tablist");

      var idx = 0;
      var slides = Array.prototype.slice.call(track.children);

      function render() {
        track.style.transform = "translateX(" + -idx * 100 + "%)";
        slides.forEach(function (slide, i) {
          slide.classList.toggle("is-active", i === idx);
        });
        Array.prototype.slice.call(tabs.children).forEach(function (tab, i) {
          tab.classList.toggle("is-active", i === idx);
          tab.setAttribute("aria-selected", i === idx ? "true" : "false");
        });
      }

      slides.forEach(function (slide, i) {
        var tab = document.createElement("button");
        tab.type = "button";
        tab.className = "wt-media-tab wt-focus" + (i === 0 ? " is-active" : "");
        tab.setAttribute("role", "tab");
        tab.setAttribute("aria-selected", i === 0 ? "true" : "false");
        tab.textContent = getSlideLabel(slide.querySelector("figure"), i);
        tab.addEventListener("click", function () {
          idx = i;
          render();
        });
        tabs.appendChild(tab);
      });

      function go(delta) {
        idx = (idx + delta + slides.length) % slides.length;
        render();
      }

      prev.addEventListener("click", function () {
        go(-1);
      });
      next.addEventListener("click", function () {
        go(1);
      });

      root.addEventListener("keydown", function (e) {
        if (e.key === "ArrowLeft") {
          e.preventDefault();
          go(-1);
        } else if (e.key === "ArrowRight") {
          e.preventDefault();
          go(1);
        }
      });

      controls.appendChild(prev);
      controls.appendChild(tabs);
      controls.appendChild(next);
      root.appendChild(controls);

      grid.parentNode.insertBefore(root, grid);
      grid.remove();
      render();
    });
  })();
})();
