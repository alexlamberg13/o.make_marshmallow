const header = document.querySelector("[data-header]");
const menuToggle = document.querySelector(".menu-toggle");
const menuClose = document.querySelector(".menu-close");
const mobileMenu = document.querySelector(".mobile-menu");
const menuLinks = document.querySelectorAll(".mobile-menu a");
const revealItems = document.querySelectorAll(".reveal");
const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

function setHeaderState() {
  header?.classList.toggle("is-scrolled", window.scrollY > 18);
}

function setMenu(open) {
  document.body.classList.toggle("menu-open", open);
  mobileMenu?.classList.toggle("is-open", open);
  mobileMenu?.setAttribute("aria-hidden", String(!open));
  menuToggle?.setAttribute("aria-expanded", String(open));
}

setHeaderState();
window.addEventListener("scroll", setHeaderState, { passive: true });

menuToggle?.addEventListener("click", () => setMenu(true));
menuClose?.addEventListener("click", () => setMenu(false));
menuLinks.forEach((link) => link.addEventListener("click", () => setMenu(false)));

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") setMenu(false);
});

if (!reducedMotion && "IntersectionObserver" in window) {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      });
    },
    { threshold: 0.14, rootMargin: "0px 0px -40px 0px" },
  );

  revealItems.forEach((item) => observer.observe(item));
} else {
  revealItems.forEach((item) => item.classList.add("is-visible"));
}

if (!reducedMotion && window.matchMedia("(hover: hover)").matches) {
  document.querySelectorAll(".tilt-card, .catalogue-card").forEach((card) => {
    card.addEventListener("mousemove", (event) => {
      const rect = card.getBoundingClientRect();
      const x = (event.clientX - rect.left) / rect.width - 0.5;
      const y = (event.clientY - rect.top) / rect.height - 0.5;

      card.style.setProperty("--ry", `${x * 5.5}deg`);
      card.style.setProperty("--rx", `${y * -5.5}deg`);
    });

    card.addEventListener("mouseleave", () => {
      card.style.setProperty("--ry", "0deg");
      card.style.setProperty("--rx", "0deg");
    });
  });
}

function playVideo(video) {
  video.muted = true;
  video.playsInline = true;

  const playPromise = video.play();
  if (playPromise && typeof playPromise.catch === "function") {
    playPromise.catch(() => {
      video.controls = true;
    });
  }
}

const videos = document.querySelectorAll("video");

if ("IntersectionObserver" in window) {
  const videoObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        const video = entry.target;

        if (entry.isIntersecting) {
          playVideo(video);
        } else {
          video.pause();
        }
      });
    },
    { threshold: 0.28 },
  );

  videos.forEach((video) => videoObserver.observe(video));
} else {
  videos.forEach(playVideo);
}
