(function () {
  "use strict";

  const header = document.querySelector(".site-header");
  const navToggle = document.querySelector(".nav-toggle");
  const mobileMenu = document.getElementById("mobile-menu");
  const infoModal = document.getElementById("info-modal");
  const toast = document.querySelector(".toast");
  let toastTimer = null;

  /* Header state */
  const onScroll = function () {
    if (header) header.classList.toggle("is-scrolled", window.scrollY > 10);
  };
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* Mobile menu */
  function setMenu(open) {
    if (!navToggle || !mobileMenu) return;
    navToggle.setAttribute("aria-expanded", String(open));
    navToggle.setAttribute("aria-label", open ? "Tutup menu" : "Buka menu");
    mobileMenu.hidden = !open;
  }

  if (navToggle && mobileMenu) {
    navToggle.addEventListener("click", function () {
      setMenu(mobileMenu.hidden);
    });

    mobileMenu.querySelectorAll("a, button").forEach(function (el) {
      el.addEventListener("click", function () {
        setMenu(false);
      });
    });

    window.addEventListener("resize", function () {
      if (window.innerWidth > 900) setMenu(false);
    });
  }

  /* Info dialog */
  function modalIsOpen() {
    return infoModal && infoModal.open;
  }

  function openInfo() {
    if (!infoModal) return;
    setMenu(false);
    if (typeof infoModal.showModal === "function") {
      infoModal.showModal();
    } else {
      infoModal.setAttribute("open", "");
    }
    document.body.classList.add("modal-open");
  }

  function closeInfo() {
    if (!infoModal || !infoModal.open) return;
    infoModal.close();
  }

  document.querySelectorAll("[data-open-info]").forEach(function (el) {
    el.addEventListener("click", function (event) {
      event.preventDefault();
      openInfo();
    });
  });

  document.querySelectorAll("[data-close-info]").forEach(function (el) {
    el.addEventListener("click", closeInfo);
  });

  if (infoModal) {
    infoModal.addEventListener("click", function (event) {
      if (event.target === infoModal) closeInfo();
    });

    infoModal.addEventListener("close", function () {
      document.body.classList.remove("modal-open");
    });

    infoModal.addEventListener("cancel", function () {
      document.body.classList.remove("modal-open");
    });
  }

  /* Toast for demo actions */
  function showToast(message) {
    if (!toast) return;
    window.clearTimeout(toastTimer);
    toast.textContent = message;
    toast.classList.add("is-visible");
    toastTimer = window.setTimeout(function () {
      toast.classList.remove("is-visible");
    }, 3600);
  }

  document.querySelectorAll("[data-demo]").forEach(function (el) {
    el.addEventListener("click", function (event) {
      event.preventDefault();
      const label = el.getAttribute("data-demo") || "Fitur ini";
      if (modalIsOpen()) closeInfo();
      showToast(label + " segera hadir. Sementara itu, jelajahi cara kerja PANGANLOOP.");
    });
  });

  /* Surplus aktif filter (demo) */
  const surplusForm = document.querySelector(".surplus-filters");
  if (surplusForm) {
    const surplusCards = Array.from(document.querySelectorAll(".surplus-card"));
    const surplusEmpty = document.querySelector(".surplus-empty");
    const searchField = surplusForm.querySelector('input[type="search"]');
    const selects = Array.from(surplusForm.querySelectorAll("select"));

    const applyFilters = function () {
      const term = (searchField ? searchField.value : "").trim().toLowerCase();
      const category = selects[0] ? selects[0].value : "";
      const pickupWindow = selects[1] ? selects[1].value : "";
      const maxDistance = selects[2] ? selects[2].value : "";
      let visible = 0;

      surplusCards.forEach(function (card) {
        const matchesTerm = !term || card.textContent.toLowerCase().indexOf(term) !== -1;
        const matchesCategory = !category || card.dataset.category === category;
        const matchesWindow = !pickupWindow || card.dataset.window === pickupWindow;
        const matchesDistance = !maxDistance || Number(card.dataset.distance) <= Number(maxDistance);
        const isMatch = matchesTerm && matchesCategory && matchesWindow && matchesDistance;
        card.hidden = !isMatch;
        if (isMatch) visible += 1;
      });

      if (surplusEmpty) surplusEmpty.hidden = visible !== 0;
    };

    surplusForm.addEventListener("submit", function (event) {
      event.preventDefault();
      applyFilters();
      showToast("Filter diterapkan. Menampilkan surplus yang paling cocok.");
    });

    if (searchField) searchField.addEventListener("input", applyFilters);
    selects.forEach(function (select) {
      select.addEventListener("change", applyFilters);
    });
  }

  /* Escape closes the mobile drawer */
  document.addEventListener("keydown", function (event) {
    if (event.key === "Escape" && mobileMenu && !mobileMenu.hidden) {
      setMenu(false);
      if (navToggle) navToggle.focus();
    }
  });

  /* Close the drawer after choosing an in-page anchor */
  document.querySelectorAll('a[href^="#"]:not([href="#"])').forEach(function (link) {
    link.addEventListener("click", function () {
      setMenu(false);
    });
  });
})();
