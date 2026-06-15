const feedCards = [...document.querySelectorAll(".feed-card")];

document.documentElement.classList.add("reveal-ready");

feedCards.forEach((card, index) => {
  card.style.setProperty("--reveal-delay", `${(index % 3) * 90}ms`);
});

if ("IntersectionObserver" in window) {
  const cardObserver = new IntersectionObserver(
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

  feedCards.forEach((card) => {
    cardObserver.observe(card);
  });
} else {
  feedCards.forEach((card) => {
    card.classList.add("is-visible");
  });
}
