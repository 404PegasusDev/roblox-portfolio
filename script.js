const revealItems = document.querySelectorAll(".reveal");
const toTopButton = document.getElementById("toTop");
const heroContent = document.querySelector(".hero-content");
const staggerItems = document.querySelectorAll(".project-card, .stat-card");
const copyButtons = document.querySelectorAll(".copy-btn");
const scrollRevealItems = document.querySelectorAll(".scroll-reveal");
const countUpItems = document.querySelectorAll(".count-up");

staggerItems.forEach((item, index) => {
  item.style.transitionDelay = `${Math.min(index * 70, 280)}ms`;
});

const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
      }
    });
  },
  { threshold: 0.14 }
);

revealItems.forEach((item) => revealObserver.observe(item));

const modellingRevealItems = document.querySelectorAll("#modelling .scroll-reveal");

scrollRevealItems.forEach((item, index) => {
  if (item.closest("#modelling")) return;
  const delay = Math.min((index % 6) * 90, 450);
  item.style.setProperty("--delay", `${delay}ms`);
});

modellingRevealItems.forEach((item, index) => {
  item.style.setProperty("--delay", `${Math.min(index * 25, 75)}ms`);
});

const isMobileView = window.matchMedia("(max-width: 768px)").matches;

const contentRevealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("in-view");
      } else if (!isMobileView) {
        entry.target.classList.remove("in-view");
      }
    });
  },
  isMobileView
    ? { threshold: 0.01, rootMargin: "0px 0px 30% 0px" }
    : { threshold: 0.05, rootMargin: "0px 0px 18% 0px" }
);

function revealItemsInViewport() {
  scrollRevealItems.forEach((item) => {
    const rect = item.getBoundingClientRect();
    if (rect.top < window.innerHeight * 0.95 && rect.bottom > 0) {
      item.classList.add("in-view");
    }
  });
}

scrollRevealItems.forEach((item) => contentRevealObserver.observe(item));
revealItemsInViewport();
window.addEventListener("load", revealItemsInViewport);
window.addEventListener("resize", revealItemsInViewport);

const activeCountAnimations = new WeakMap();

function startCountAnimation(element) {
  const target = Number.parseInt(element.dataset.target || "0", 10);
  const suffix = element.dataset.suffix || "";
  const duration = 1600;
  const start = performance.now();

  const existingRaf = activeCountAnimations.get(element);
  if (existingRaf) {
    cancelAnimationFrame(existingRaf);
  }

  function tick(now) {
    const progress = Math.min((now - start) / duration, 1);
    const eased = 1 - (1 - progress) * (1 - progress) * (1 - progress);
    const current = Math.round(target * eased);
    element.textContent = `${current}${suffix}`;

    if (progress < 1) {
      const rafId = requestAnimationFrame(tick);
      activeCountAnimations.set(element, rafId);
    } else {
      element.textContent = `${target}${suffix}`;
      activeCountAnimations.delete(element);
    }
  }

  const rafId = requestAnimationFrame(tick);
  activeCountAnimations.set(element, rafId);
}

const countObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        startCountAnimation(entry.target);
      } else {
        const suffix = entry.target.dataset.suffix || "";
        entry.target.textContent = `0${suffix}`;
      }
    });
  },
  { threshold: 0.65 }
);

countUpItems.forEach((item) => countObserver.observe(item));

window.addEventListener("scroll", () => {
  if (window.scrollY > 500) {
    toTopButton.classList.add("show");
  } else {
    toTopButton.classList.remove("show");
  }

  if (heroContent) {
    const offset = Math.min(window.scrollY * 0.12, 36);
    heroContent.style.transform = `translateY(${offset}px)`;
  }
});

toTopButton.addEventListener("click", () => {
  window.scrollTo({ top: 0, behavior: "smooth" });
});

const imageLightbox = document.getElementById("imageLightbox");
const lightboxImage = document.querySelector(".lightbox-image");
const lightboxClose = document.querySelector(".lightbox-close");
const expandableImages = document.querySelectorAll(
  "#modelling .modelling-batch img, #modelling .modelling-showcase img"
);

function openImageLightbox(img) {
  if (!imageLightbox || !lightboxImage) return;
  lightboxImage.src = img.src;
  lightboxImage.alt = img.alt;
  imageLightbox.classList.add("open");
  imageLightbox.setAttribute("aria-hidden", "false");
  document.body.style.overflow = "hidden";
}

function closeImageLightbox() {
  if (!imageLightbox || !lightboxImage) return;
  imageLightbox.classList.remove("open");
  imageLightbox.setAttribute("aria-hidden", "true");
  lightboxImage.removeAttribute("src");
  document.body.style.overflow = "";
}

expandableImages.forEach((img) => {
  img.classList.add("expandable-image");
  img.setAttribute("title", "Click to view fullscreen");
  img.addEventListener("click", () => openImageLightbox(img));
});

imageLightbox?.addEventListener("click", (event) => {
  if (event.target === imageLightbox) {
    closeImageLightbox();
  }
});

lightboxClose?.addEventListener("click", closeImageLightbox);

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && imageLightbox?.classList.contains("open")) {
    closeImageLightbox();
  }
});

copyButtons.forEach((button) => {
  button.addEventListener("click", async () => {
    const value = button.dataset.copy;
    if (!value) return;

    try {
      await navigator.clipboard.writeText(value);
      button.classList.add("copied");
      setTimeout(() => button.classList.remove("copied"), 900);
    } catch {
      const textArea = document.createElement("textarea");
      textArea.value = value;
      textArea.setAttribute("readonly", "");
      textArea.style.position = "absolute";
      textArea.style.left = "-9999px";
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand("copy");
      document.body.removeChild(textArea);
      button.classList.add("copied");
      setTimeout(() => button.classList.remove("copied"), 900);
    }
  });
});
