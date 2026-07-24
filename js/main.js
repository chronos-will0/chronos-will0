/* =========================================================================
   MAIN — page chrome: boot screen, content injection, gallery, lightbox
   ========================================================================= */
document.addEventListener("DOMContentLoaded", () => {
  fillSiteContent();
  runBootSequence();
  setupGallery();
  setupRevealAnimations();
  setupFpsHud();
  setupHoverSfx();
});

/* ---------------- content injection from config.js ---------------- */
function fillSiteContent() {
  if (typeof SITE === "undefined") return;
  document.title = `${SITE.name} — Portfolio`;
  const set = (id, val) => { const el = document.getElementById(id); if (el) el.textContent = val; };
  set("site-name", SITE.name);
  set("hero-title", SITE.name);
  set("hero-role", SITE.role);
  set("hero-tagline", SITE.tagline);
  set("contact-sub", SITE.tagline);

  const emailBtn = document.getElementById("contact-email");
  if (emailBtn && SITE.email) emailBtn.href = `mailto:${SITE.email}`;

  const socialRow = document.getElementById("social-row");
  if (socialRow && SITE.socials) {
    socialRow.innerHTML = SITE.socials
      .map((s) => `<a href="${s.url}" target="_blank" rel="noopener">${s.label}</a>`)
      .join("");
  }
}

/* ---------------- boot screen ---------------- */
function runBootSequence() {
  const boot = document.getElementById("boot-screen");
  if (!boot) return;
  window.addEventListener("load", () => {
    setTimeout(() => {
      boot.classList.add("done");
      window.SFX && SFX.open();
    }, 900);
  });
  // safety net in case 'load' already fired
  setTimeout(() => boot.classList.add("done"), 2500);
}

/* ---------------- gallery ---------------- */
function setupGallery() {
  const imgWrap = document.getElementById("gallery-images");
  const vidWrap = document.getElementById("gallery-videos");
  const emptyMsg = document.getElementById("gallery-empty");
  if (!imgWrap || !vidWrap) return;

  const images = (typeof GALLERY_IMAGES !== "undefined" && GALLERY_IMAGES) || [];
  const videos = (typeof GALLERY_VIDEOS !== "undefined" && GALLERY_VIDEOS) || [];

  imgWrap.innerHTML = images
    .map((it) => `
      <div class="gallery-item" data-type="image" data-src="${it.src}">
        <img src="${it.src}" alt="${it.caption || ""}" loading="lazy" />
        <div class="cap">${it.caption || ""}</div>
      </div>`)
    .join("");

  vidWrap.innerHTML = videos
    .map((it) => `
      <div class="gallery-item" data-type="video" data-src="${it.src}">
        <video src="${it.src}" muted loop playsinline preload="metadata"></video>
        <div class="cap">${it.caption || ""}</div>
      </div>`)
    .join("");

  if (images.length === 0 && videos.length === 0) emptyMsg.style.display = "block";

  // hover-to-preview video playback
  vidWrap.querySelectorAll("video").forEach((v) => {
    v.parentElement.addEventListener("mouseenter", () => v.play().catch(() => {}));
    v.parentElement.addEventListener("mouseleave", () => { v.pause(); v.currentTime = 0; });
  });

  // tabs
  document.querySelectorAll(".gallery-tab").forEach((tab) => {
    tab.addEventListener("click", () => {
      document.querySelectorAll(".gallery-tab").forEach((t) => t.classList.remove("active"));
      tab.classList.add("active");
      const which = tab.dataset.tab;
      imgWrap.style.display = which === "images" ? "grid" : "none";
      vidWrap.style.display = which === "videos" ? "grid" : "none";
      window.SFX && SFX.click();
    });
  });

  // lightbox
  const lightbox = document.getElementById("lightbox");
  const lightboxContent = document.getElementById("lightbox-content");
  document.querySelectorAll(".gallery-item").forEach((item) => {
    item.addEventListener("click", () => {
      const { type, src } = item.dataset;
      lightboxContent.innerHTML =
        type === "video"
          ? `<video src="${src}" controls autoplay></video>`
          : `<img src="${src}" alt="" />`;
      lightbox.classList.add("open");
      window.SFX && SFX.open();
    });
  });
  document.getElementById("lightbox-close").addEventListener("click", closeLightbox);
  lightbox.addEventListener("click", (e) => { if (e.target === lightbox) closeLightbox(); });
  document.addEventListener("keydown", (e) => { if (e.key === "Escape") closeLightbox(); });

  function closeLightbox() {
    lightbox.classList.remove("open");
    lightboxContent.innerHTML = "";
  }
}

/* ---------------- scroll reveal for non-viewport elements ---------------- */
function setupRevealAnimations() {
  document.querySelectorAll(".section-head, .about-grid, .contact-box").forEach((el) => el.classList.add("reveal"));
  const io = new IntersectionObserver(
    (entries) => entries.forEach((e) => e.isIntersecting && e.target.classList.add("in-view")),
    { threshold: 0.15 }
  );
  document.querySelectorAll(".reveal").forEach((el) => io.observe(el));
}

/* ---------------- FPS readout in hero HUD ---------------- */
function setupFpsHud() {
  const el = document.getElementById("hud-fps");
  if (!el) return;
  let frames = 0, last = performance.now();
  function tick(now) {
    frames++;
    if (now - last >= 1000) {
      el.textContent = frames;
      frames = 0;
      last = now;
    }
    requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
}

/* ---------------- light hover sfx on primary buttons ---------------- */
function setupHoverSfx() {
  document.querySelectorAll(".btn, .gallery-tab").forEach((el) => {
    el.addEventListener("mouseenter", () => window.SFX && SFX.hover());
  });
}
