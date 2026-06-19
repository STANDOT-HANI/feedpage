const feedCards = [...document.querySelectorAll(".feed-card")].sort(
  (cardA, cardB) => Number(cardA.dataset.order) - Number(cardB.dataset.order),
);
const filterButtons = [...document.querySelectorAll(".feed-filter-button")];
const siteHeader = document.querySelector(".site-header");
const mobileMenuToggle = document.querySelector(".mobile-menu-toggle");
const viewMoreButton = document.querySelector(".feed-view-more");

document.documentElement.classList.add("reveal-ready");

let activeFilter = "all";
let cardObserver;
let currentColumnCount = 3;
let resizeTimer;
let isMobileExpanded = false;

const getColumnCount = () => {
  if (window.matchMedia("(max-width: 760px)").matches) return 1;
  if (window.matchMedia("(max-width: 1180px)").matches) return 2;
  return 3;
};

const observeCards = (cards) => {
  cards.forEach((card, index) => {
    card.style.setProperty("--reveal-delay", `${(index % currentColumnCount) * 90}ms`);
    card.classList.remove("is-visible");

    if (cardObserver) {
      cardObserver.observe(card);
    } else {
      card.classList.add("is-visible");
    }
  });
};

if ("IntersectionObserver" in window) {
  cardObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;

        entry.target.classList.add("is-visible");
        cardObserver.unobserve(entry.target);
      });
    },
    {
      rootMargin: "0px 0px -12% 0px",
      threshold: 0.12,
    },
  );
}

const applyFilter = (filter) => {
  if (filter !== activeFilter) isMobileExpanded = false;
  activeFilter = filter;
  currentColumnCount = getColumnCount();

  filterButtons.forEach((button) => {
    const isActive = button.dataset.filter === filter;
    button.classList.toggle("is-active", isActive);
    button.setAttribute("aria-selected", String(isActive));
  });

  const filteredCards = feedCards.filter(
    (card) => filter === "all" || card.dataset.category === filter,
  );
  const displayedCards =
    currentColumnCount === 1 && !isMobileExpanded
      ? filteredCards.slice(0, 4)
      : filteredCards;

  feedCards.forEach((card) => {
    cardObserver?.unobserve(card);
    card.classList.remove("is-visible");
    card.hidden = !displayedCards.includes(card);
    card.style.order = card.dataset.order;
  });

  const matchingCards = displayedCards;

  if (viewMoreButton) {
    const canExpand = currentColumnCount === 1 && filteredCards.length > 4;
    viewMoreButton.hidden = !canExpand || isMobileExpanded;
    viewMoreButton.setAttribute("aria-expanded", String(isMobileExpanded));
  }

  requestAnimationFrame(() => {
    requestAnimationFrame(() => observeCards(matchingCards));
  });
};

filterButtons.forEach((button, buttonIndex) => {
  button.addEventListener("click", () => {
    isMobileExpanded = false;
    applyFilter(button.dataset.filter);
  });

  button.addEventListener("keydown", (event) => {
    if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;

    event.preventDefault();
    const direction = event.key === "ArrowRight" ? 1 : -1;
    const nextIndex =
      (buttonIndex + direction + filterButtons.length) % filterButtons.length;
    filterButtons[nextIndex].focus();
    isMobileExpanded = false;
    applyFilter(filterButtons[nextIndex].dataset.filter);
  });
});

applyFilter(activeFilter);

window.addEventListener("resize", () => {
  window.clearTimeout(resizeTimer);
  resizeTimer = window.setTimeout(() => {
    if (currentColumnCount !== getColumnCount()) {
      isMobileExpanded = false;
      applyFilter(activeFilter);
    }
  }, 140);
});

viewMoreButton?.addEventListener("click", () => {
  isMobileExpanded = true;
  applyFilter(activeFilter);
});

mobileMenuToggle?.addEventListener("click", () => {
  const isOpen = siteHeader.classList.toggle("is-menu-open");
  mobileMenuToggle.setAttribute("aria-expanded", String(isOpen));
  mobileMenuToggle.setAttribute("aria-label", isOpen ? "메뉴 닫기" : "메뉴 열기");
});

document.querySelectorAll(".primary-nav a").forEach((link) => {
  link.addEventListener("click", () => {
    siteHeader.classList.remove("is-menu-open");
    mobileMenuToggle?.setAttribute("aria-expanded", "false");
    mobileMenuToggle?.setAttribute("aria-label", "메뉴 열기");
  });
});
