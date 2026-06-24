/* ================================================================
   SCRIPT.JS — GSAP + Moving Wave Canvas
   Nebula-style editorial animations for Sujal Umate portfolio
   ================================================================ */
"use strict";

gsap.registerPlugin(ScrollTrigger);

/* ═══════════════════════════════════════════════════════════════
   0.  STICKY NAVBAR — scroll detection + hamburger
═══════════════════════════════════════════════════════════════ */
(function initNavbar() {
  const nav = document.getElementById("siteNav");
  const hamburger = document.getElementById("navHamburger");
  if (!nav) return;

  // Add scrolled class when page scrolled past 40px
  window.addEventListener("scroll", () => {
    if (window.scrollY > 40) {
      nav.classList.add("scrolled");
    } else {
      nav.classList.remove("scrolled");
    }
  }, { passive: true });

  // Hamburger — create a mobile menu overlay
  if (hamburger) {
    hamburger.addEventListener("click", () => {
      let overlay = document.getElementById("mobileMenuOverlay");
      if (overlay) {
        overlay.remove();
        return;
      }
      overlay = document.createElement("div");
      overlay.id = "mobileMenuOverlay";
      overlay.style.cssText = `
        position:fixed; top:68px; left:0; right:0; bottom:0;
        background:rgba(5,5,5,0.97); backdrop-filter:blur(20px);
        z-index:999; display:flex; flex-direction:column;
        align-items:center; justify-content:center; gap:36px;
      `;
      const links = [
        ["#about","About"],["#work","Services"],["#skills","Skills"],
        ["#projects","Work"],["#experience","Experience"],["#contact","Contact"]
      ];
      links.forEach(([href, label]) => {
        const a = document.createElement("a");
        a.href = href;
        a.textContent = label;
        a.style.cssText = `
          font-size:2rem; font-weight:800; color:#fff; letter-spacing:-0.04em;
          text-decoration:none; transition:color 0.2s;
        `;
        a.onmouseenter = () => a.style.color = "#f25a05";
        a.onmouseleave = () => a.style.color = "#fff";
        a.addEventListener("click", () => overlay.remove());
        overlay.appendChild(a);
      });
      document.body.appendChild(overlay);
      gsap.from(overlay.querySelectorAll("a"), {
        y: 20, opacity: 0, stagger: 0.06, duration: 0.5, ease: "power3.out"
      });
    });
  }

  // Smooth active section highlighting on scroll
  const sections = document.querySelectorAll("section[id]");
  const navAnchors = nav.querySelectorAll(".nav-links a");
  if (navAnchors.length > 0) {
    ScrollTrigger.create({
      trigger: document.body,
      start: "top top",
      end: "bottom bottom",
      onUpdate() {
        let current = "";
        sections.forEach(s => {
          if (window.scrollY >= s.offsetTop - 120) current = s.id;
        });
        navAnchors.forEach(a => {
          a.style.color = a.getAttribute("href") === `#${current}`
            ? "#ffffff"
            : "";
        });
      }
    });
  }
})();

/* ═══════════════════════════════════════════════════════════════
   1.  MOVING WAVE CANVAS  (fire / sunset palette)
   Continuously animated sinusoidal waves in warm gradient
═══════════════════════════════════════════════════════════════ */
(function initWave() {
  const canvas = document.getElementById("waveCanvas");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  let W,
    H,
    frame = 0;

  function resize() {
    W = canvas.width = window.innerWidth;
    H = canvas.height = window.innerHeight;
  }

  /* Wave band config */
  const WAVES = [
    {
      yRatio: 0.1,
      amp: 100,
      freq: 0.01,
      speed: 0.008,
      color: "#ff6010",
      alpha: 0.2,
    },
    {
      yRatio: 0.22,
      amp: 80,
      freq: 0.016,
      speed: 0.011,
      color: "#c51800",
      alpha: 0.16,
    },
    {
      yRatio: 0.35,
      amp: 120,
      freq: 0.008,
      speed: 0.005,
      color: "#f25a05",
      alpha: 0.14,
    },
    {
      yRatio: 0.5,
      amp: 65,
      freq: 0.024,
      speed: 0.015,
      color: "#e04000",
      alpha: 0.12,
    },
    {
      yRatio: 0.63,
      amp: 90,
      freq: 0.013,
      speed: 0.009,
      color: "#ff8020",
      alpha: 0.1,
    },
    {
      yRatio: 0.76,
      amp: 50,
      freq: 0.03,
      speed: 0.018,
      color: "#ffb040",
      alpha: 0.09,
    },
    {
      yRatio: 0.88,
      amp: 140,
      freq: 0.006,
      speed: 0.003,
      color: "#901000",
      alpha: 0.08,
    },
  ];

  function render() {
    ctx.clearRect(0, 0, W, H);

    /* ── Base gradient: deep crimson → orange → gold ── */
    const bg = ctx.createLinearGradient(W * 0.1, 0, W * 0.9, H);
    bg.addColorStop(0.0, "#1a0000");
    bg.addColorStop(0.08, "#2c0000");
    bg.addColorStop(0.25, "#9a1400");
    bg.addColorStop(0.48, "#d43a00");
    bg.addColorStop(0.68, "#f05000");
    bg.addColorStop(0.85, "#f5a030");
    bg.addColorStop(1.0, "#f5d060");
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, W, H);

    /* ── Wave bands ── */
    WAVES.forEach((w) => {
      const yBase = w.yRatio * H;

      ctx.beginPath();
      ctx.moveTo(0, H);

      for (let x = 0; x <= W; x += 3) {
        const phase1 = x * w.freq + frame * w.speed;
        const phase2 = x * w.freq * 1.6 + frame * w.speed * 0.7 + 2.1;
        const phase3 = x * w.freq * 0.5 + frame * w.speed * 1.3;

        const y =
          yBase +
          Math.sin(phase1) * w.amp +
          Math.sin(phase2) * (w.amp * 0.35) +
          Math.cos(phase3) * (w.amp * 0.22);

        ctx.lineTo(x, y);
      }

      ctx.lineTo(W, H);
      ctx.closePath();

      /* Per-wave gradient (transparent top → color bottom) */
      const wg = ctx.createLinearGradient(
        0,
        yBase - w.amp * 1.5,
        0,
        yBase + w.amp * 2.5,
      );
      const hex = Math.round(w.alpha * 255)
        .toString(16)
        .padStart(2, "0");
      wg.addColorStop(0, w.color + "00");
      wg.addColorStop(0.5, w.color + hex);
      wg.addColorStop(1, w.color + "00");
      ctx.fillStyle = wg;
      ctx.fill();
    });

    /* ── Upper hot-spot glow (like the orange glow in the screenshot) ── */
    const hotspot = ctx.createRadialGradient(
      W * 0.5,
      0,
      0,
      W * 0.5,
      H * 0.25,
      W * 0.6,
    );
    hotspot.addColorStop(0.0, "rgba(255,120,30,0.28)");
    hotspot.addColorStop(0.4, "rgba(220,80,5,0.12)");
    hotspot.addColorStop(1.0, "rgba(0,0,0,0)");
    ctx.fillStyle = hotspot;
    ctx.fillRect(0, 0, W, H);

    /* ── Bottom fade to solid dark (seamless transition to dark section) ── */
    const fade = ctx.createLinearGradient(0, H * 0.6, 0, H);
    fade.addColorStop(0, "rgba(5,5,5,0)");
    fade.addColorStop(1, "rgba(5,5,5,0.95)");
    ctx.fillStyle = fade;
    ctx.fillRect(0, 0, W, H);

    frame++;
    requestAnimationFrame(render);
  }

  window.addEventListener("resize", resize, { passive: true });
  resize();
  render();

  /* Fade canvas in via GSAP */
  gsap.to(canvas, {
    opacity: 1,
    duration: 2,
    ease: "power2.inOut",
    delay: 0.1,
  });
})();

/* ═══════════════════════════════════════════════════════════════
   2.  PAGE-LOAD ANIMATION SEQUENCE  (GSAP timeline)
═══════════════════════════════════════════════════════════════ */
(function initLoadAnim() {
  const tl = gsap.timeline({
    defaults: { ease: "power4.out" },
    delay: 0.15,
  });

  /* Meta bar drops down */
  tl.from(
    ".meta-bar .meta-col",
    {
      y: -28,
      opacity: 0,
      stagger: 0.07,
      duration: 0.65,
    },
    0.3,
  );

  /* Title rows slide up from clip */
  tl.from(
    ".row-1",
    {
      yPercent: 110,
      opacity: 0,
      duration: 0.9,
      skewY: 3,
    },
    0.45,
  );

  tl.from(
    ".row-2",
    {
      yPercent: 110,
      opacity: 0,
      duration: 1.0,
      skewY: 2,
    },
    0.6,
  );

  tl.from(
    ".row-3",
    {
      yPercent: 110,
      opacity: 0,
      duration: 1.0,
      skewY: 2,
    },
    0.74,
  );

  /* Sub text fades in from right */
  tl.from(
    ".hero-sub",
    {
      x: 40,
      opacity: 0,
      duration: 0.85,
    },
    0.8,
  );

  tl.from(
    ".hero-date",
    {
      y: 16,
      opacity: 0,
      duration: 0.65,
    },
    0.95,
  );

  /* Phone card rises and scales in */
  tl.from(
    ".avatar-phone",
    {
      y: 100,
      opacity: 0,
      scale: 0.88,
      duration: 1.3,
      ease: "power3.out",
    },
    0.65,
  );

  /* Big bg text sweeps in */
  tl.from(
    ".bg-text",
    {
      x: 80,
      opacity: 0,
      duration: 1.8,
      ease: "power2.out",
    },
    0.8,
  );

  /* Absolute elements */
  tl.from(
    ".side-labels",
    {
      x: -24,
      opacity: 0,
      duration: 0.75,
    },
    1.0,
  );

  tl.from(
    ".project-type",
    {
      y: 18,
      opacity: 0,
      duration: 0.65,
    },
    1.1,
  );

  tl.from(
    ".ctrl-btn",
    {
      x: 36,
      opacity: 0,
      stagger: 0.1,
      duration: 0.7,
    },
    1.0,
  );

  tl.from(
    ".skills-list",
    {
      x: 24,
      opacity: 0,
      duration: 0.65,
    },
    1.15,
  );
})();

/* ═══════════════════════════════════════════════════════════════
   3.  PHONE CARD — continuous floating + 3D mouse tilt
═══════════════════════════════════════════════════════════════ */
(function initPhoneAnim() {
  // /* Float */
  // gsap.to(".avatar-phone", {
  //   y: -20,
  //   duration: 3,
  //   ease: "sine.inOut",
  //   yoyo: true,
  //   repeat: -1,
  //   delay: 1.8,
  // });

  /* 3-D tilt on mouse move */
  const card = document.querySelector(".avatar-phone");
  if (!card) return;

  // card.addEventListener("mousemove", (e) => {
  //   const r = card.getBoundingClientRect();
  //   const cx = r.left + r.width / 2;
  //   const cy = r.top + r.height / 2;
  //   const rx = ((e.clientY - cy) / r.height) * -16;
  //   const ry = ((e.clientX - cx) / r.width) * 16;

  //   gsap.to(card, {
  //     rotateX: rx,
  //     rotateY: ry,
  //     transformPerspective: 800,
  //     duration: 0.45,
  //     ease: "power2.out",
  //     overwrite: "auto",
  //   });
  // });

  card.addEventListener("mouseleave", () => {
    gsap.to(card, {
      rotateX: 0,
      rotateY: 0,
      duration: 1,
      ease: "elastic.out(1, 0.45)",
      overwrite: "auto",
    });
  });

  /* Toggle Flashlight button micro-interaction */
  const flashlight = document.getElementById("phoneFlashlight");
  if (flashlight) {
    flashlight.addEventListener("click", (e) => {
      e.stopPropagation();
      flashlight.classList.toggle("active");
      card.classList.toggle("flashlight-on");
    });
  }

  /* Fetch and update real date and time dynamically */
  function updatePhoneDateTime() {
    const timeEls = document.querySelectorAll(".phone-time, .p-clock");
    const dateEl = document.querySelector(".p-date");
    const heroDateEl = document.getElementById("heroDate");

    const now = new Date();
    const hours24 = now.getHours();
    const minutes = String(now.getMinutes()).padStart(2, "0");
    
    // iOS-style 12-hour format (no leading zero, e.g. 9:41)
    let hours12 = hours24 % 12;
    hours12 = hours12 ? hours12 : 12;
    const hours12Str = String(hours12);

    timeEls.forEach((el) => {
      el.textContent = `${hours12Str}:${minutes}`;
    });

    if (dateEl) {
      const options = { weekday: "long", month: "long", day: "numeric" };
      dateEl.textContent = now.toLocaleDateString("en-US", options);
    }

    if (heroDateEl) {
      const pTags = heroDateEl.querySelectorAll("p");
      if (pTags.length >= 2) {
        // Short Month and Day (e.g. "Jun 23")
        const monthDayOptions = { month: "short", day: "numeric" };
        pTags[0].textContent = now.toLocaleDateString("en-US", monthDayOptions);
        // Year (e.g. "2026")
        pTags[1].textContent = now.getFullYear();
      }
    }
  }
  updatePhoneDateTime();
  setInterval(updatePhoneDateTime, 10000); // Check every 10 seconds to keep it sync'd
})();

/* ═══════════════════════════════════════════════════════════════
   3b.  ADVANCED CSS 3D TILT PARALLAX SYSTEM
═══════════════════════════════════════════════════════════════ */
(function init3DTiltSystem() {
  function apply3DTilt(element, maxTilt = 10, scale = 1.02) {
    if (!element) return;

    element.addEventListener("mousemove", (e) => {
      const rect = element.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const midX = rect.width / 2;
      const midY = rect.height / 2;
      
      // Normalized coordinates (-1 to 1)
      const normX = (x - midX) / midX;
      const normY = (y - midY) / midY;
      
      const tiltX = -normY * maxTilt;
      const tiltY = normX * maxTilt;
      
      gsap.to(element, {
        rotateX: tiltX,
        rotateY: tiltY,
        scale: scale,
        transformPerspective: 1000,
        ease: "power2.out",
        duration: 0.45,
        overwrite: "auto"
      });
      
      // Parallax shift for nested elements with data-depth
      const elementsWithDepth = element.querySelectorAll("[data-depth]");
      elementsWithDepth.forEach((el) => {
        const depth = parseFloat(el.getAttribute("data-depth")) || 0.4;
        const moveX = normX * depth * 22;
        const moveY = normY * depth * 22;
        gsap.to(el, {
          x: moveX,
          y: moveY,
          z: depth * 20,
          ease: "power2.out",
          duration: 0.45,
          overwrite: "auto"
        });
      });
    });

    element.addEventListener("mouseleave", () => {
      gsap.to(element, {
        rotateX: 0,
        rotateY: 0,
        scale: 1,
        ease: "elastic.out(1.1, 0.5)",
        duration: 1.2,
        overwrite: "auto"
      });
      
      const elementsWithDepth = element.querySelectorAll("[data-depth]");
      elementsWithDepth.forEach((el) => {
        gsap.to(el, {
          x: 0,
          y: 0,
          z: 0,
          ease: "elastic.out(1.1, 0.5)",
          duration: 1.2,
          overwrite: "auto"
        });
      });
    });
  }

  // Apply tilt to target bento cards and layouts
  const cards = document.querySelectorAll(".bento-skill-card, .achievement-card, .service-pricing-card");
  cards.forEach((card) => apply3DTilt(card, 8, 1.015));

  // Phone mockup gets 3D holographic tilt
  const phoneCard = document.querySelector(".avatar-phone");
  if (phoneCard) {
    apply3DTilt(phoneCard, 14, 1.025);
  }

  // Footer Hire button gets a premium hover tilt
  const footerHireBtn = document.querySelector(".footer-hire-btn");
  if (footerHireBtn) {
    apply3DTilt(footerHireBtn, 12, 1.03);
  }
})();

/* ═══════════════════════════════════════════════════════════════
   4.  BIG TEXT — slow drift + scroll parallax (Disabled to keep fixed)
═══════════════════════════════════════════════════════════════ */
(function initBgTextAnim() {
  // Discarded continuous movement animations to keep background text fixed in place as requested.
})();

/* ═══════════════════════════════════════════════════════════════
   5.  SCROLL ANIMATIONS — DARK SECTION
═══════════════════════════════════════════════════════════════ */
(function initScrollAnims() {
  /* Dark section label */
  gsap.from(".dark-section-label", {
    scrollTrigger: { trigger: ".dark-section", start: "top 92%" },
    x: -30,
    opacity: 0,
    duration: 0.8,
    ease: "power2.out",
  });

  /* Eyebrow */
  gsap.from(".dark-eyebrow", {
    scrollTrigger: { trigger: ".dark-content", start: "top 85%" },
    y: 20,
    opacity: 0,
    duration: 0.7,
    ease: "power2.out",
  });

  /* Dark title — each line staggers */
  gsap.from(".dark-title", {
    scrollTrigger: { trigger: ".dark-content", start: "top 82%" },
    y: 55,
    opacity: 0,
    duration: 1.1,
    ease: "power3.out",
    delay: 0.1,
  });

  /* Stats phone card */
  gsap.from(".stats-phone", {
    scrollTrigger: { trigger: ".dark-content", start: "top 78%" },
    x: 70,
    opacity: 0,
    duration: 1.3,
    ease: "power3.out",
    delay: 0.2,
  });

  /* Stats grid items stagger */
  gsap.from(".sg-item", {
    scrollTrigger: { trigger: ".stats-grid", start: "top 82%" },
    y: 28,
    opacity: 0,
    stagger: 0.11,
    duration: 0.65,
    ease: "power2.out",
    delay: 0.4,
  });

  /* CTA button */
  gsap.from(".sp-cta-btn", {
    scrollTrigger: { trigger: ".sp-cta", start: "top 88%" },
    y: 18,
    opacity: 0,
    duration: 0.7,
    ease: "power2.out",
    delay: 0.6,
  });

  /* About block */
  gsap.from(".dark-about", {
    scrollTrigger: { trigger: ".dark-about", start: "top 90%" },
    y: 28,
    opacity: 0,
    duration: 0.9,
    ease: "power2.out",
  });
})();

/* ═══════════════════════════════════════════════════════════════
   6.  GSAP COUNTER ANIMATION for stats
═══════════════════════════════════════════════════════════════ */
(function initCounters() {
  document.querySelectorAll(".sg-val[data-target]").forEach((el) => {
    const target = parseFloat(el.dataset.target);
    const isDecimal = el.dataset.decimal === "true";
    const suffix = el.dataset.suffix || "";
    const proxy = { val: 0 };

    ScrollTrigger.create({
      trigger: el,
      start: "top 88%",
      once: true,
      onEnter() {
        gsap.to(proxy, {
          val: target,
          duration: 1.8,
          ease: "power2.out",
          onUpdate() {
            el.textContent = isDecimal
              ? proxy.val.toFixed(1) + suffix
              : Math.floor(proxy.val) + suffix;
          },
        });
      },
    });
  });
})();

/* ═══════════════════════════════════════════════════════════════
   7.  MAGNETIC EFFECT on CTA buttons
═══════════════════════════════════════════════════════════════ */
(function initMagnetic() {
  document.querySelectorAll(".ctrl-btn").forEach((btn) => {
    btn.addEventListener("mousemove", (e) => {
      const r = btn.getBoundingClientRect();
      const dx = e.clientX - (r.left + r.width / 2);
      const dy = e.clientY - (r.top + r.height / 2);
      gsap.to(btn, {
        x: dx * 0.32,
        y: dy * 0.32,
        duration: 0.35,
        ease: "power2.out",
        overwrite: "auto",
      });
    });

    btn.addEventListener("mouseleave", () => {
      gsap.to(btn, {
        x: 0,
        y: 0,
        duration: 0.6,
        ease: "elastic.out(1, 0.5)",
        overwrite: "auto",
      });
    });
  });
})();

/* ═══════════════════════════════════════════════════════════════
   8.  PHONE ROLE TYPEWRITER (GSAP crossfade)
═══════════════════════════════════════════════════════════════ */
(function initRoleCycle() {
  const el = document.querySelector(".phone-role");
  if (!el) return;

  const roles = [
    "Full Stack Dev",
    "UI/UX Designer",
    "React Dev",
    "Node.js Dev",
    "Web Builder",
  ];
  let idx = 0;

  setInterval(() => {
    gsap.to(el, {
      y: -10,
      opacity: 0,
      duration: 0.28,
      ease: "power2.in",
      onComplete() {
        idx = (idx + 1) % roles.length;
        el.textContent = roles[idx];
        gsap.fromTo(
          el,
          { y: 10, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.32, ease: "power2.out" },
        );
      },
    });
  }, 2200);
})();

/* ═══════════════════════════════════════════════════════════════
   9.  SCROLL — phone card & hero parallax on scroll
═══════════════════════════════════════════════════════════════ */
(function initHeroParallax() {
  // gsap.to(".avatar-phone", {
  //   scrollTrigger: {
  //     trigger: ".hero",
  //     start: "top top",
  //     end: "bottom top",
  //     scrub: 2.5,
  //   },
  //   y: -80,
  //   ease: "none",
  // });

  gsap.to(".hero-title", {
    scrollTrigger: {
      trigger: ".hero",
      start: "top top",
      end: "bottom top",
      scrub: 1.8,
    },
    y: 50,
    ease: "none",
  });
})();

/* ═══════════════════════════════════════════════════════════════
   10.  ABOUT SECTION — reveal animations + tab interactions
═══════════════════════════════════════════════════════════════ */
(function initAboutAnim() {
  const aboutSection = document.querySelector(".about-section");
  if (!aboutSection) return;

  // Tabs: simple active state + micro animation
  const tabs = document.querySelectorAll(".tab");
  tabs.forEach((tab) =>
    tab.addEventListener("click", () => {
      tabs.forEach((t) => t.classList.remove("active"));
      tab.classList.add("active");
      gsap.fromTo(
        tab,
        { y: 6, opacity: 0.85 },
        { y: 0, opacity: 1, duration: 0.36, ease: "power2.out" },
      );
    }),
  );

  // Reveal the about area on scroll
  gsap.from(".about-tabs", {
    scrollTrigger: { trigger: aboutSection, start: "top 92%" },
    y: -20,
    opacity: 0,
    duration: 0.8,
    ease: "power2.out",
  });

  gsap.from(".profile-card", {
    scrollTrigger: { trigger: aboutSection, start: "top 90%" },
    x: -36,
    opacity: 0,
    duration: 1,
    ease: "power3.out",
  });

  gsap.from(".intro-card", {
    scrollTrigger: { trigger: aboutSection, start: "top 88%" },
    x: 36,
    opacity: 0,
    duration: 1,
    ease: "power3.out",
    delay: 0.06,
  });

  gsap.from(".contact-card", {
    scrollTrigger: { trigger: aboutSection, start: "top 86%" },
    y: 20,
    opacity: 0,
    stagger: 0.12,
    duration: 0.7,
    ease: "power2.out",
    delay: 0.12,
  });

  // Magnetic-like micro movement for contact cards
  document.querySelectorAll(".contact-card").forEach((card) => {
    card.addEventListener("mousemove", (e) => {
      const r = card.getBoundingClientRect();
      const dx = ((e.clientX - (r.left + r.width / 2)) / r.width) * 12;
      const dy = ((e.clientY - (r.top + r.height / 2)) / r.height) * 6;
      gsap.to(card, {
        x: dx,
        y: dy,
        scale: 1.02,
        duration: 0.35,
        ease: "power2.out",
      });
    });

    card.addEventListener("mouseleave", () => {
      gsap.to(card, {
        x: 0,
        y: 0,
        scale: 1,
        duration: 0.6,
        ease: "elastic.out(1, 0.45)",
      });
    });
  });
})();

/* REMOVE: previous SERVICES and PACKAGES animation blocks — replaced by earlier code; safe-guard selectors */
(function tidyServicesAnimations() {
  // nothing to run here; this prevents errors if selectors are missing
  // existing animations that reference removed selectors are left unchanged elsewhere
})();

/* ═══════════════════════════════════════════════════════════════
   11.  SERVICES REFERENCE SECTION — reveal animations
═══════════════════════════════════════════════════════════════ */
(function initServicesRefAnim() {
  const ref = document.querySelector(".services-ref");
  if (!ref) return;

  gsap.from(".services-hero-card", {
    scrollTrigger: { trigger: ref, start: "top 92%" },
    y: -20,
    opacity: 0,
    duration: 0.7,
    ease: "power2.out",
  });

  gsap.from(".chips-inner", {
    scrollTrigger: { trigger: ref, start: "top 90%" },
    y: 12,
    opacity: 0,
    duration: 0.6,
    ease: "power2.out",
  });

  gsap.from(".what-title", {
    scrollTrigger: { trigger: ref, start: "top 88%" },
    y: 18,
    opacity: 0,
    duration: 0.7,
    ease: "power2.out",
  });

  gsap.from(".package-card", {
    scrollTrigger: { trigger: ref, start: "top 86%" },
    y: 26,
    opacity: 0,
    stagger: 0.12,
    duration: 0.9,
    ease: "power3.out",
  });

  gsap.from(".package-card--primary", {
    scrollTrigger: { trigger: ref, start: "top 86%" },
    scale: 0.98,
    duration: 0.9,
    ease: "elastic.out(1,0.6)",
  });

  gsap.from(".clients-logos .cl", {
    scrollTrigger: { trigger: ref, start: "top 84%" },
    y: 12,
    opacity: 0,
    stagger: 0.08,
    duration: 0.6,
    ease: "power2.out",
  });
})();

/* ═══════════════════════════════════════════════════════════════
   12.  SERVICES DETAIL SECTION — reveal animations
═══════════════════════════════════════════════════════════════ */
(function initServicesDetailAnim() {
  const grid = document.querySelector(".services-grid");
  if (!grid) return;

  gsap.from(".service-card", {
    scrollTrigger: { trigger: grid, start: "top 86%" },
    y: 32,
    opacity: 0,
    stagger: 0.12,
    duration: 0.9,
    ease: "power3.out",
  });

  const last = document.querySelector(
    ".services-grid .service-card.service-card--highlight",
  );
  if (last) {
    gsap.from(last, {
      scrollTrigger: { trigger: last, start: "top 88%" },
      scale: 0.98,
      duration: 0.9,
      ease: "elastic.out(1,0.6)",
    });
  }
})();

/* ═══════════════════════════════════════════════════════════════
   PROFILE ABOUT SECTION — Reference Design Animation
═══════════════════════════════════════════════════════════════ */
(function initProfileAboutAnimation() {
  const section = document.querySelector(".profile-about-section");
  if (!section) return;

  gsap.from(".profile-nav", {
    scrollTrigger: {
      trigger: section,
      start: "top 85%",
    },
    y: -30,
    opacity: 0,
    duration: 0.8,
    ease: "power2.out",
  });

  gsap.from(".intro-photo-card", {
    scrollTrigger: {
      trigger: ".about-main-grid",
      start: "top 80%",
    },
    x: -60,
    opacity: 0,
    duration: 1,
    ease: "power3.out",
  });

  gsap.from(".intro-content .section-head-row, .intro-info-card, .contact-card-grid .touch-card", {
    scrollTrigger: {
      trigger: ".about-main-grid",
      start: "top 78%",
    },
    y: 35,
    opacity: 0,
    stagger: 0.12,
    duration: 0.8,
    ease: "power2.out",
  });

  gsap.from(".resume-col", {
    scrollTrigger: {
      trigger: ".resume-grid",
      start: "top 82%",
    },
    y: 45,
    opacity: 0,
    stagger: 0.15,
    duration: 0.9,
    ease: "power3.out",
  });

  gsap.from(".timeline-card, .education-card, .skill-visual-card, .soft-tags span", {
    scrollTrigger: {
      trigger: ".resume-grid",
      start: "top 75%",
    },
    y: 25,
    opacity: 0,
    stagger: 0.08,
    duration: 0.7,
    ease: "power2.out",
  });
})();

/* ═══════════════════════════════════════════════════════════════
   13. SERVICES PRICING SECTIONS REVEAL ANIMATIONS
═══════════════════════════════════════════════════════════════ */
(function initPortfolioServicesReveal() {
  const wrapper = document.querySelector(".portfolio-services-section");
  if (!wrapper) return;

  // Stagger heading animations
  gsap.from(".services-header > *", {
    scrollTrigger: {
      trigger: ".services-header",
      start: "top 88%",
    },
    y: 30,
    opacity: 0,
    stagger: 0.12,
    duration: 0.8,
    ease: "power2.out"
  });

  // Stagger reveal all individual product/tier cards sequentially
  gsap.from(".services-cards-grid .service-pricing-card", {
    scrollTrigger: {
      trigger: ".services-cards-grid",
      start: "top 82%",
    },
    y: 45,
    opacity: 0,
    stagger: 0.15,
    duration: 1,
    ease: "power3.out"
  });
})();

/* ═══════════════════════════════════════════════════════════════
   14. ASYMMETRIC BENTO SKILLS REVEAL ANIMATIONS
═══════════════════════════════════════════════════════════════ */
(function initEditorialSkillsReveal() {
  const container = document.querySelector(".editorial-skills-section");
  if (!container) return;

  // Header element text drift slide-in
  gsap.from(".editorial-grid-row .editorial-marker, .editorial-grid-row .editorial-heading, .editorial-grid-row .editorial-sub-text", {
    scrollTrigger: {
      trigger: ".editorial-grid-row",
      start: "top 88%",
    },
    y: 35,
    opacity: 0,
    stagger: 0.12,
    duration: 0.8,
    ease: "power2.out"
  });

  // Balanced grid bento layout stagger load trigger
  gsap.from(".bento-skills-grid .bento-skill-card", {
    scrollTrigger: {
      trigger: ".bento-skills-grid",
      start: "top 84%",
    },
    y: 40,
    opacity: 0,
    stagger: 0.12,
    duration: 0.9,
    ease: "power3.out"
  });
})();
/* ═══════════════════════════════════════════════════════════════
   15. INTERACTIVE LINEAR PROJECT MATRIX ACCORDION (GSAP TIMELINE)
═══════════════════════════════════════════════════════════════ */
(function initProjectMatrixAccordion() {
  const items = document.querySelectorAll(".project-matrix-row");
  if (items.length === 0) return;

  // Header element text reveal scroll trigger entry
  gsap.from(".projects-section-header > *", {
    scrollTrigger: {
      trigger: ".projects-section-header",
      start: "top 88%",
    },
    y: 30,
    opacity: 0,
    stagger: 0.12,
    duration: 0.8,
    ease: "power2.out"
  });

  // Stagger load the clean list items sequence onto the screen
  gsap.from(".projects-linear-matrix .project-matrix-row", {
    scrollTrigger: {
      trigger: ".projects-linear-matrix",
      start: "top 85%",
    },
    y: 40,
    opacity: 0,
    stagger: 0.15,
    duration: 0.9,
    ease: "power3.out"
  });

  // Setup independent smooth accordion toggles
  items.forEach((item) => {
    const trigger = item.querySelector(".project-row-visible-trigger");
    const panel = item.querySelector(".project-row-expanded-panel");

    trigger.addEventListener("click", () => {
      const isOpen = item.classList.contains("is-expanded");

      // First close all other open instances smoothly to focus visibility
      items.forEach((otherItem) => {
        if (otherItem !== item && otherItem.classList.contains("is-expanded")) {
          otherItem.classList.remove("is-expanded");
          gsap.to(otherItem.querySelector(".project-row-expanded-panel"), {
            height: 0,
            duration: 0.45,
            ease: "power3.out"
          });
        }
      });

      // Toggle state context of clicked card item
      if (isOpen) {
        item.classList.remove("is-expanded");
        gsap.to(panel, {
          height: 0,
          duration: 0.45,
          ease: "power3.out"
        });
      } else {
        item.classList.add("is-expanded");
        // Animate calculated natural auto height layout parameters safely
        gsap.to(panel, {
          height: "auto",
          duration: 0.55,
          ease: "power3.out"
        });
      }
    });
  });
})();
/* ═══════════════════════════════════════════════════════════════
   16. EDITORIAL TIMELINE EXPERIENCE REVEAL ANIMATIONS
═══════════════════════════════════════════════════════════════ */
(function initEditorialExperienceReveal() {
  const targetSection = document.querySelector(".editorial-experience-section");
  if (!targetSection) return;

  // Animate left indicators and central typographic headings smoothly into view
  gsap.from(".experience-grid-row .exp-marker, .experience-grid-row .exp-timeline-meta, .experience-grid-row .exp-main-heading, .experience-grid-row .exp-divider-line", {
    scrollTrigger: {
      trigger: ".experience-grid-row",
      start: "top 88%",
    },
    y: 30,
    opacity: 0,
    stagger: 0.1,
    duration: 0.8,
    ease: "power2.out"
  });

  // Sequentially cascade list responsibility bullet entries item by item
  gsap.from(".exp-responsibilities-list li", {
    scrollTrigger: {
      trigger: ".exp-responsibilities-list",
      start: "top 84%",
    },
    y: 25,
    opacity: 0,
    stagger: 0.12,
    duration: 0.75,
    ease: "power2.out"
  });
})();
/* ═══════════════════════════════════════════════════════════════
   16. INTERACTIVE WORK PROCESS CORE SYSTEM (GSAP LOGIC ENGINE)
═══════════════════════════════════════════════════════════════ */
(function initWorkProcessSystem() {
  const section = document.querySelector(".editorial-process-section");
  if (!section) return;

  // Process data structure representation matrices
  const processStepsData = {
    1: {
      title: "Requirement Understanding",
      desc: "I understand the client’s business, target audience, website goal, pages, features, and design expectations.",
      graphicCode: `<div class="mock-ui-layout"><div class="mock-line-bar macro"></div><div class="mock-line-bar sub"></div><div class="mock-grid-twocol"><div class="mock-box-element"></div><div class="mock-box-element"></div></div></div>`
    },
    2: {
      title: "UI/UX Planning",
      desc: "I create layout ideas, user flow, wireframes, and section planning architectures to map structural interactions safely.",
      graphicCode: `<div class="mock-ui-layout"><div class="mock-grid-twocol" style="grid-template-columns:2fr 1fr;"><div class="mock-box-element" style="height:80px; background:rgba(37,81,255,0.15); border-color:#2551ff;"></div><div class="mock-box-element" style="height:80px;"></div></div><div class="mock-line-bar"></div></div>`
    },
    3: {
      title: "UI Design",
      desc: "I design clean and modern UI sections with proper spacing, typography, color balance, and strict visual hierarchies using Figma.",
      graphicCode: `<div class="mock-ui-layout" style="align-items:center;"><div class="avatar-initials-big" style="width:70px; height:70px; font-size:1.5rem; margin-bottom:8px;">SU</div><div class="mock-line-bar macro" style="width:50%; background:var(--orange);"></div><div class="mock-line-bar sub" style="width:30%;"></div></div>`
    },
    4: {
      title: "Development",
      desc: "I convert modern high-end user designs efficiently into semantic, production-ready full-stack backend and responsive frontend code infrastructure.",
      graphicCode: `<div class="mock-ui-layout" style="font-family:monospace; font-size:11px; color:#2551ff; padding-left:10px;"><div style="color:var(--orange);">&lt;section class="hero"&gt;</div><div style="padding-left:12px;">const framework = "React";</div><div style="padding-left:12px;">mapStackArchitecture();</div><div style="color:var(--orange);">&lt;/section&gt;</div></div>`
    },
    5: {
      title: "Testing",
      desc: "I comprehensively evaluate platform responsiveness, script processing speeds, browser cross-compatibility, active forms, and UX workflow boundaries.",
      graphicCode: `<div class="mock-ui-layout"><div class="mock-line-bar macro" style="background:#2551ff; width:90%;"></div><div style="font-size:12px; color:#f5c060;">✦ Page Speed Optimization: 99% Score</div><div style="font-size:12px; color:#ffffff;">✔ Responsiveness Evaluation: Checked</div></div>`
    },
    6: {
      title: "Deployment",
      desc: "I safely launch your application live onto operational cloud servers and continue providing support for updates, security extensions, and maintenance loops.",
      graphicCode: `<div class="mock-ui-layout" style="align-items:center; justify-content:center; height:100%;"><div style="font-size:3.2rem; filter:drop-shadow(0 0 20px rgba(242,90,5,0.4)); animation:initiGlow 2s infinite alternate;">🚀</div><div style="font-size:11px; opacity:0.6; margin-top:8px;">Server Distribution: Active / Live</div></div>`
    }
  };

  // ScrollTrigger view introduction stagger
  gsap.from(".process-section-header .header-left-meta, .process-section-header .header-right-title", {
    scrollTrigger: {
      trigger: ".process-section-header",
      start: "top 88%",
    },
    y: 35,
    opacity: 0,
    stagger: 0.15,
    duration: 0.8,
    ease: "power2.out"
  });

  gsap.from(".process-nav-list .process-nav-item", {
    scrollTrigger: {
      trigger: ".process-nav-list",
      start: "top 95%",
      once: true,
    },
    x: -20,
    stagger: 0.06,
    duration: 0.55,
    ease: "power2.out"
  });

  gsap.from(".process-display-panel", {
    scrollTrigger: {
      trigger: ".process-split-matrix",
      start: "top 80%",
    },
    scale: 0.95,
    opacity: 0,
    duration: 0.9,
    ease: "power3.out"
  });

  // Navigation Click Actions Integration
  const navItems = document.querySelectorAll(".process-nav-item");
  const panelTitle = document.getElementById("panelStepTitle");
  const panelDesc = document.getElementById("panelStepDesc");
  const panelGraphic = document.getElementById("panelVisualGraphic");
  const displayCard = document.getElementById("processDisplayCard");

  navItems.forEach((btn) => {
    btn.addEventListener("click", () => {
      if (btn.classList.contains("is-active")) return;

      const targetingIdx = btn.dataset.step;
      const targetData = processStepsData[targetingIdx];

      // Remove current layout highlights
      navItems.forEach((i) => i.classList.remove("is-active"));
      btn.classList.add("is-active");

      // Smooth content update micro transition sequence using GSAP
      gsap.to(displayCard, {
        opacity: 0.4,
        y: 8,
        duration: 0.2,
        ease: "power2.in",
        onComplete() {
          // Swap layout inner components safely
          panelTitle.textContent = targetData.title;
          panelDesc.textContent = targetData.desc;
          panelGraphic.innerHTML = targetData.graphicCode;

          // Fade restored components clean back to visual focus balance
          gsap.to(displayCard, {
            opacity: 1,
            y: 0,
            duration: 0.35,
            ease: "power2.out"
          });
        }
      });
    });
  });
})();
/* ═══════════════════════════════════════════════════════════════
   18. KEY ACHIEVEMENTS DISPLAY SECTION (GSAP SCROLLTRIGGER ENGINE)
═══════════════════════════════════════════════════════════════ */
(function initKeyAchievementsReveal() {
  const container = document.querySelector(".editorial-achievements-section");
  if (!container) return;

  // Stagger entry of left panel typography hooks
  gsap.from(".achievements-left-panel > *", {
    scrollTrigger: {
      trigger: ".achievements-left-panel",
      start: "top 88%"
    },
    y: 35,
    opacity: 0,
    stagger: 0.15,
    duration: 0.8,
    ease: "power2.out"
  });

  // Balanced stagger introduction of right bento metric block instances
  gsap.from(".achievements-bento-grid .achievement-card", {
    scrollTrigger: {
      trigger: ".achievements-bento-grid",
      start: "top 84%"
    },
    y: 45,
    opacity: 0,
    stagger: 0.12,
    duration: 0.95,
    ease: "power3.out"
  });
})();
/* ═══════════════════════════════════════════════════════════════
   19. INFINITE MARQUEE TICKER TRACKS (GSAP SCROLLTRIGGER ENGINE)
═══════════════════════════════════════════════════════════════ */
(function initResumeCtaMarquee() {
  const container = document.querySelector(".editorial-resume-cta-section");
  if (!container) return;

  // Reveal main textual components cleanly
  gsap.from(".resume-cta-content-box > *", {
    scrollTrigger: {
      trigger: ".resume-cta-content-box",
      start: "top 88%"
    },
    y: 35,
    opacity: 0,
    stagger: 0.12,
    duration: 0.8,
    ease: "power2.out"
  });

  // Handle infinite x-axis loops for double tracks mirroring layout 08.png
  const forwardTrack = document.querySelector(".track-forward");
  const reverseTrack = document.querySelector(".track-reverse");

  if (forwardTrack) {
    // Clone nodes for layout seamless looping wrappers
    const items = forwardTrack.innerHTML;
    forwardTrack.innerHTML += items;

    gsap.to(forwardTrack, {
      xPercent: -50,
      ease: "none",
      duration: 28,
      repeat: -1
    });
  }

  if (reverseTrack) {
    const items = reverseTrack.innerHTML;
    reverseTrack.innerHTML += items;

    // Set inverted start parameters
    gsap.set(reverseTrack, { xPercent: -50 });

    gsap.to(reverseTrack, {
      xPercent: 0,
      ease: "none",
      duration: 28,
      repeat: -1
    });
  }
})();
/* ═══════════════════════════════════════════════════════════════
   20. REDESIGNED CONTACT & FOOTER INTERACTIVE ACTIONS (GSAP + CANVAS)
═══════════════════════════════════════════════════════════════ */
(function initContactAndFooterInteractive() {
  
  // 1. Cursor Glow Orb Tracking in Contact Section
  const contactSec = document.querySelector(".contact-mega-section");
  const contactOrb = document.getElementById("contactOrb");
  
  if (contactSec && contactOrb) {
    const orbX = gsap.quickTo(contactOrb, "left", { duration: 0.5, ease: "power3.out" });
    const orbY = gsap.quickTo(contactOrb, "top", { duration: 0.5, ease: "power3.out" });
    
    contactSec.addEventListener("mousemove", (e) => {
      const rect = contactSec.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      orbX(x);
      orbY(y);
    });
  }

  // 2. Custom Text Scramble Effect
  function scrambleText(element, originalText, duration = 1) {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789✦★▲▼●■◆";
    const interval = 30; // Milliseconds per cycle
    const steps = (duration * 1000) / interval;
    let currentStep = 0;

    const timer = setInterval(() => {
      currentStep++;
      let result = "";
      
      for (let i = 0; i < originalText.length; i++) {
        if (originalText[i] === " ") {
          result += " ";
          continue;
        }
        
        // Stagger the reveal starting from the left of the string
        const charRevealStep = (i / originalText.length) * steps * 0.7;
        
        if (currentStep > charRevealStep + (steps - charRevealStep) * 0.3) {
          result += originalText[i];
        } else {
          result += chars[Math.floor(Math.random() * chars.length)];
        }
      }
      
      element.textContent = result;
      
      if (currentStep >= steps) {
        element.textContent = originalText;
        clearInterval(timer);
      }
    }, interval);
  }

  // Trigger text scramble on scroll entrance
  ScrollTrigger.create({
    trigger: ".contact-giant-title",
    start: "top 85%",
    onEnter: () => {
      document.querySelectorAll(".contact-giant-title .title-line").forEach((el) => {
        const text = el.getAttribute("data-scramble") || el.textContent;
        scrambleText(el, text, 1.2);
      });
    },
    once: true
  });

  // 3. Staggered Entrance Animations for Info, Center Visual and Glass Form
  gsap.from(".contact-info-col .cinfo-block, .contact-info-col .csocial-item", {
    scrollTrigger: {
      trigger: ".contact-main-grid",
      start: "top 80%",
      once: true
    },
    y: 25,
    opacity: 0,
    stagger: 0.08,
    duration: 0.8,
    ease: "power2.out"
  });

  gsap.from(".contact-center-visual .ccv-inner", {
    scrollTrigger: {
      trigger: ".contact-main-grid",
      start: "top 80%",
      once: true
    },
    scale: 0.95,
    opacity: 0,
    duration: 1.1,
    ease: "power3.out"
  });

  gsap.from(".contact-form-col .contact-glass-form", {
    scrollTrigger: {
      trigger: ".contact-main-grid",
      start: "top 80%",
      once: true
    },
    x: 35,
    opacity: 0,
    duration: 0.9,
    ease: "power2.out"
  });

  // 4. Interactive Glass Form Submission Handler
  const contactForm = document.getElementById("contactForm");
  const formSuccess = document.getElementById("cgfSuccess");
  const submitButton = document.getElementById("cgfSubmitBtn");

  if (contactForm && formSuccess && submitButton) {
    contactForm.addEventListener("submit", (e) => {
      e.preventDefault();
      
      const name = document.getElementById("cf-name").value;
      const email = document.getElementById("cf-email").value;
      const phone = document.getElementById("cf-phone").value;
      const service = document.getElementById("cf-service").value;
      const message = document.getElementById("cf-message").value;

      const whatsappMessage = `*New Project Inquiry*\n` +
                              `----------------------------------\n` +
                              `*Name:* ${name}\n` +
                              `*Email:* ${email}\n` +
                              `*Phone:* ${phone}\n` +
                              `*Service:* ${service}\n` +
                              `*Details:* ${message}`;

      const encodedMessage = encodeURIComponent(whatsappMessage);
      const whatsappUrl = `https://wa.me/917489969740?text=${encodedMessage}`;

      // Open WhatsApp in a new tab immediately to prevent popup blocking
      window.open(whatsappUrl, "_blank");

      const submitTextEl = submitButton.querySelector(".cgf-submit-text");
      const originalText = submitTextEl.textContent;
      submitTextEl.textContent = "Redirecting to WhatsApp...";
      submitButton.style.pointerEvents = "none";
      submitButton.style.opacity = "0.7";

      // Simulate delay for success feedback and reset
      setTimeout(() => {
        formSuccess.classList.add("active");
        submitTextEl.textContent = "Message Sent!";
        
        // Success panel content entrance animation
        gsap.from("#cgfSuccess > *", {
          y: 15,
          opacity: 0,
          stagger: 0.1,
          duration: 0.4,
          ease: "power2.out"
        });

        // Clear and restore form fields after visibility timer
        setTimeout(() => {
          contactForm.reset();
          
          // Reset custom floating label values
          document.querySelectorAll(".cgf-field label").forEach((lbl) => {
            lbl.style.top = "";
            lbl.style.fontSize = "";
          });
          
          formSuccess.classList.remove("active");
          submitTextEl.textContent = originalText;
          submitButton.style.pointerEvents = "auto";
          submitButton.style.opacity = "1";
        }, 3000);

      }, 1000);
    });
  }

  // 5. Canvas Particles Simulation inside Mega Footer
  const footerCanvas = document.getElementById("footerCanvas");
  const footerSec = document.getElementById("footer");

  if (footerCanvas && footerSec) {
    const ctx = footerCanvas.getContext("2d");
    let particlesArray = [];
    let canvasWidth, canvasHeight;
    let mousePos = { x: null, y: null, active: false };

    function initCanvasDimensions() {
      const dpr = window.devicePixelRatio || 1;
      const rect = footerSec.getBoundingClientRect();
      canvasWidth = rect.width;
      canvasHeight = rect.height;
      
      footerCanvas.width = canvasWidth * dpr;
      footerCanvas.height = canvasHeight * dpr;
      footerCanvas.style.width = canvasWidth + "px";
      footerCanvas.style.height = canvasHeight + "px";
      
      ctx.scale(dpr, dpr);
    }

    // Set canvas dimensions
    window.addEventListener("resize", () => {
      initCanvasDimensions();
      repopulateParticles();
    });
    initCanvasDimensions();

    class Particle {
      constructor() {
        this.reset();
        this.x = Math.random() * canvasWidth;
        this.y = Math.random() * canvasHeight;
      }

      reset() {
        this.x = Math.random() * canvasWidth;
        this.y = Math.random() * canvasHeight;
        this.vx = (Math.random() - 0.5) * 0.35;
        this.vy = (Math.random() - 0.5) * 0.35;
        this.size = Math.random() * 1.5 + 0.6;
        this.alpha = Math.random() * 0.35 + 0.15;
      }

      update() {
        this.x += this.vx;
        this.y += this.vy;

        // Wrap around boundaries
        if (this.x < 0) this.x = canvasWidth;
        if (this.x > canvasWidth) this.x = 0;
        if (this.y < 0) this.y = canvasHeight;
        if (this.y > canvasHeight) this.y = 0;

        // Mouse hover interaction
        if (mousePos.active && mousePos.x !== null && mousePos.y !== null) {
          const dx = mousePos.x - this.x;
          const dy = mousePos.y - this.y;
          const dist = Math.hypot(dx, dy);
          
          if (dist < 110) {
            // Gently pull particles toward cursor
            this.x += (dx / dist) * 0.35;
            this.y += (dy / dist) * 0.35;
          }
        }
      }

      draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(242, 90, 5, ${this.alpha})`;
        ctx.fill();
      }
    }

    function repopulateParticles() {
      particlesArray = [];
      const particleDensity = Math.min(65, Math.floor((canvasWidth * canvasHeight) / 9500));
      for (let i = 0; i < particleDensity; i++) {
        particlesArray.push(new Particle());
      }
    }
    repopulateParticles();

    footerSec.addEventListener("mousemove", (e) => {
      const rect = footerSec.getBoundingClientRect();
      mousePos.x = e.clientX - rect.left;
      mousePos.y = e.clientY - rect.top;
      mousePos.active = true;
    });

    footerSec.addEventListener("mouseleave", () => {
      mousePos.active = false;
    });

    function renderParticles() {
      ctx.clearRect(0, 0, canvasWidth, canvasHeight);

      // Render and update each particle
      particlesArray.forEach((p) => {
        p.update();
        p.draw();
      });

      // Draw interactive linking lines
      for (let i = 0; i < particlesArray.length; i++) {
        for (let j = i + 1; j < particlesArray.length; j++) {
          const dx = particlesArray[i].x - particlesArray[j].x;
          const dy = particlesArray[i].y - particlesArray[j].y;
          const dist = Math.hypot(dx, dy);
          
          if (dist < 115) {
            const opacity = (1 - dist / 115) * 0.12;
            ctx.beginPath();
            ctx.moveTo(particlesArray[i].x, particlesArray[i].y);
            ctx.lineTo(particlesArray[j].x, particlesArray[j].y);
            ctx.strokeStyle = `rgba(242, 90, 5, ${opacity})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }
      }

      requestAnimationFrame(renderParticles);
    }
    renderParticles();
  }

  // 6. Back To Top Handler
  const backBtn = document.getElementById("backToTop");
  if (backBtn) {
    backBtn.addEventListener("click", (e) => {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  }

  // 7. Footer Staggered Reveal Elements
  gsap.from(".footer-giant-section .footer-eyebrow-txt, .footer-giant-section .footer-big-name, .footer-giant-section .footer-hire-btn", {
    scrollTrigger: {
      trigger: ".footer-giant-section",
      start: "top 88%",
      once: true
    },
    y: 35,
    opacity: 0,
    stagger: 0.12,
    duration: 0.85,
    ease: "power3.out"
  });

  gsap.from(".footer-grid-section > *", {
    scrollTrigger: {
      trigger: ".footer-grid-section",
      start: "top 90%",
      once: true
    },
    y: 20,
    opacity: 0,
    stagger: 0.07,
    duration: 0.65,
    ease: "power2.out"
  });

  // 8. Magnetic 3D Letter Ripple Hover for Footer Big Name
  (function initFooterTextAnim() {
    const bigName = document.querySelector(".footer-big-name");
    if (!bigName) return;

    const lines = bigName.querySelectorAll(".fbn-line");
    lines.forEach((line) => {
      const text = line.textContent.trim();
      line.innerHTML = "";
      [...text].forEach((char) => {
        const span = document.createElement("span");
        span.innerHTML = char === " " ? "&nbsp;" : char;
        span.className = "fbn-char";
        line.appendChild(span);
      });
    });

    const chars = bigName.querySelectorAll(".fbn-char");
    bigName.addEventListener("mousemove", (e) => {
      const rect = bigName.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      chars.forEach((char) => {
        const charRect = char.getBoundingClientRect();
        const charX = charRect.left + charRect.width / 2 - rect.left;
        const charY = charRect.top + charRect.height / 2 - rect.top;
        
        const dx = x - charX;
        const dy = y - charY;
        const dist = Math.hypot(dx, dy);
        
        if (dist < 120) {
          const factor = (1 - dist / 120);
          gsap.to(char, {
            y: -15 * factor,
            z: 22 * factor,
            rotateX: -dy * 0.12 * factor,
            rotateY: dx * 0.12 * factor,
            color: "var(--orange-bright)",
            duration: 0.3,
            ease: "power2.out",
            overwrite: "auto"
          });
        } else {
          gsap.to(char, {
            y: 0,
            z: 0,
            rotateX: 0,
            rotateY: 0,
            color: "",
            duration: 0.5,
            ease: "power2.out",
            overwrite: "auto"
          });
        }
      });
    });

    bigName.addEventListener("mouseleave", () => {
      gsap.to(chars, {
        y: 0,
        z: 0,
        rotateX: 0,
        rotateY: 0,
        color: "",
        stagger: 0.01,
        duration: 0.7,
        ease: "power2.out",
        overwrite: "auto"
      });
    });
  })();

})();