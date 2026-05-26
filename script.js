document.documentElement.classList.add("js");

const body = document.body;
const menuToggle = document.querySelector("[data-menu-toggle]");
const mobileNav = document.querySelector("[data-mobile-nav]");

if (menuToggle && mobileNav) {
  const closeMenu = () => {
    body.classList.remove("menu-open");
    menuToggle.setAttribute("aria-expanded", "false");
  };

  menuToggle.addEventListener("click", () => {
    const isOpen = body.classList.toggle("menu-open");
    menuToggle.setAttribute("aria-expanded", String(isOpen));
  });

  mobileNav.querySelectorAll("a").forEach((link) => link.addEventListener("click", closeMenu));
}

const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

if (!reducedMotion) {
  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          revealObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.15, rootMargin: "0px 0px -40px 0px" },
  );

  document.querySelectorAll("[data-reveal]").forEach((element) => revealObserver.observe(element));

  let ticking = false;
  const updateHeroShift = () => {
    document.documentElement.style.setProperty("--hero-shift", `${Math.min(window.scrollY * 0.04, 26)}px`);
    ticking = false;
  };

  window.addEventListener(
    "scroll",
    () => {
      if (!ticking) {
        window.requestAnimationFrame(updateHeroShift);
        ticking = true;
      }
    },
    { passive: true },
  );
}

if (!reducedMotion && window.matchMedia("(hover: hover)").matches) {
  document.querySelectorAll(".collection-card").forEach((card) => {
    card.addEventListener("mousemove", (event) => {
      const rect = card.getBoundingClientRect();
      const x = (event.clientX - rect.left) / rect.width - 0.5;
      const y = (event.clientY - rect.top) / rect.height - 0.5;
      card.style.setProperty("--ry", `${x * 7}deg`);
      card.style.setProperty("--rx", `${y * -7}deg`);
    });

    card.addEventListener("mouseleave", () => {
      card.style.setProperty("--ry", "0deg");
      card.style.setProperty("--rx", "0deg");
    });
  });
}

const selections = {
  occasion: "мами",
  tone: "пудрово-ягідній",
  format: "подарункову коробку",
};

const titleByFormat = {
  "подарункову коробку": "Подарункова коробка",
  "вечірній букет": "Вечірній букет",
  "міні набір": "Міні набір",
};

const resultTitle = document.querySelector("[data-result-title]");
const resultCopy = document.querySelector("[data-result-copy]");

const updateGiftResult = () => {
  if (!resultTitle || !resultCopy) return;

  const title = titleByFormat[selections.format] || "Подарунок";
  resultTitle.textContent = `${title} для ${selections.occasion}`;
  resultCopy.textContent = `Оберіть ${selections.format} у ${selections.tone} палітрі: м'яко, тепло і дуже особисто.`;
};

document.querySelectorAll(".selector-group").forEach((group) => {
  const groupName = group.dataset.group;

  group.querySelectorAll("button").forEach((button) => {
    button.addEventListener("click", () => {
      group.querySelectorAll("button").forEach((item) => item.setAttribute("aria-pressed", "false"));
      button.setAttribute("aria-pressed", "true");
      selections[groupName] = button.dataset.value;
      updateGiftResult();
    });
  });
});

updateGiftResult();
