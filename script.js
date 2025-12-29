/* ======================
   ELEMENT REFERENCES
====================== */
const modal = document.getElementById("bookingModal");
const modalTitle = document.getElementById("modalTitle");

const openButtons = document.querySelectorAll(".open-modal");
const closeButton = document.querySelector(".close-modal");

const hamburger = document.querySelector(".hamburger");
const navMenu = document.querySelector(".nav-menu");

const form = document.getElementById("modalForm");
const status = document.getElementById("modalStatus");

const tourDateInput = document.getElementById("tourDate");
const peopleSelect = document.getElementById("peopleSelect");
const otherPeopleGroup = document.getElementById("otherPeopleGroup");
const peopleOtherInput = document.getElementById("peopleOtherInput");
const interestsField = document.getElementById("interestsField");
const largeGroupWarning = document.getElementById("largeGroupWarning");

/* ======================
   MODAL OPEN (WITH TOUR CONTEXT)
====================== */
openButtons.forEach((btn) => {
  btn.addEventListener("click", () => {
    if (modal) {
      modal.classList.add("active");
      modal.setAttribute("aria-hidden", "false");
    }
    // Close hamburger menu if open
    if (hamburger && navMenu) {
      hamburger.classList.remove("active");
      navMenu.classList.remove("active");
      hamburger.setAttribute("aria-expanded", "false");
    }

    const selectedTour = btn.getAttribute("data-tour");

    // Update modal title
    if (modalTitle) {
      modalTitle.textContent = selectedTour
        ? `Book: ${selectedTour}`
        : "Book Your Tour";
    }

    // Inject selected tour into interests
    if (interestsField) {
      const lines = interestsField.value
        .split("\n")
        .filter((line) => !line.startsWith("Selected tour:"));

      if (selectedTour) {
        interestsField.value = [
          `Selected tour: ${selectedTour}`,
          ...lines.filter(Boolean),
        ].join("\n");
      } else {
        // No tour selected → clear previous tour context
        interestsField.value = lines.join("\n").trim();
      }
    }
  });
});

/* ======================
   MODAL CLOSE CONTROLS
====================== */
function closeModal() {
  if (modal) {
    modal.classList.remove("active");
    modal.setAttribute("aria-hidden", "true");
  }
  if (modalTitle) modalTitle.textContent = "Book Your Tour";
}

if (closeButton) {
  closeButton.addEventListener("click", closeModal);
}

if (modal) {
  modal.addEventListener("click", (e) => {
    if (e.target === modal) closeModal();
  });
}

document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && modal && modal.classList.contains("active")) {
    closeModal();
  }
});

/* ======================
   HAMBURGER MENU
====================== */
if (hamburger && navMenu) {
  hamburger.addEventListener("click", () => {
    hamburger.classList.toggle("active");
    navMenu.classList.toggle("active");
    const isExpanded = hamburger.classList.contains("active");
    hamburger.setAttribute("aria-expanded", isExpanded);
  });

  // Close menu when clicking on a link
  const navLinks = navMenu.querySelectorAll("a");
  navLinks.forEach((link) => {
    link.addEventListener("click", () => {
      hamburger.classList.remove("active");
      navMenu.classList.remove("active");
      hamburger.setAttribute("aria-expanded", "false");
    });
  });

  // Close menu when clicking outside
  document.addEventListener("click", (e) => {
    if (
      navMenu.classList.contains("active") &&
      !navMenu.contains(e.target) &&
      !hamburger.contains(e.target)
    ) {
      hamburger.classList.remove("active");
      navMenu.classList.remove("active");
      hamburger.setAttribute("aria-expanded", "false");
    }
  });
}

/* ======================
   DISABLE PAST DATES
====================== */
if (tourDateInput) {
  const today = new Date();
  const yyyy = today.getFullYear();
  const mm = String(today.getMonth() + 1).padStart(2, "0");
  const dd = String(today.getDate()).padStart(2, "0");
  tourDateInput.min = `${yyyy}-${mm}-${dd}`;
}

/* ======================
   GROUP SIZE MESSAGE HANDLER
====================== */
function updateGroupSizeInMessage(size) {
  if (!interestsField) return;

  const lines = interestsField.value
    .split("\n")
    .filter((line) => !line.startsWith("Group size:"));

  if (size && size >= 7) {
    lines.push(`Group size: ${size} people`);
  }

  interestsField.value = lines.join("\n").trim();
}

/* ======================
   PEOPLE SELECT LOGIC
====================== */
if (peopleSelect && otherPeopleGroup) {
  peopleSelect.addEventListener("change", () => {
    if (peopleSelect.value === "other") {
      otherPeopleGroup.classList.remove("hidden");
      if (peopleOtherInput) peopleOtherInput.focus();
    } else {
      otherPeopleGroup.classList.add("hidden");
      if (largeGroupWarning) largeGroupWarning.classList.add("hidden");
      peopleOtherInput.value = "";
      updateGroupSizeInMessage(null);
    }
  });
}

/* ======================
   LARGE GROUP INPUT LOGIC
====================== */
if (peopleOtherInput) {
  peopleOtherInput.addEventListener("input", () => {
    const value = parseInt(peopleOtherInput.value, 10);

    if (!value || value < 7) {
      updateGroupSizeInMessage(null);
      if (largeGroupWarning) largeGroupWarning.classList.add("hidden");
      return;
    }

    updateGroupSizeInMessage(value);

    if (value > 10) {
      if (largeGroupWarning) largeGroupWarning.classList.remove("hidden");
    } else {
      if (largeGroupWarning) largeGroupWarning.classList.add("hidden");
    }
  });
}

/* ======================
   FORM SUBMIT (NETLIFY)
====================== */
if (form) {
  form.addEventListener("submit", function (e) {
  e.preventDefault();

  status.textContent = "";

  const submitButton = form.querySelector('button[type="submit"]');
  submitButton.disabled = true;
  submitButton.textContent = "Sending...";

  const data = new FormData(form);

  // Date validation
  const selectedDate = new Date(data.get("date"));
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  if (selectedDate < today) {
    status.textContent = "Please select a valid future date.";
    submitButton.disabled = false;
    submitButton.textContent = "Send Inquiry";
    return;
  }

  // Netlify submit
  fetch(form.getAttribute("action") || "/", {
    method: "POST",
    body: data,
  })
    .then(() => {
      status.textContent = "Thank you! Your inquiry has been sent.";
      form.reset();

      setTimeout(() => {
        closeModal();
        status.textContent = "";
        submitButton.disabled = false;
        submitButton.textContent = "Send Inquiry";
      }, 1500);
    })
    .catch(() => {
      status.textContent = "Something went wrong. Please try again.";
      submitButton.disabled = false;
      submitButton.textContent = "Send Inquiry";
    });
  });
}

/* ======================
   GALLERY CAROUSEL
====================== */
const carouselTrack = document.querySelector(".carousel-track");
const carouselSlides = document.querySelectorAll(".carousel-slide");
const indicators = document.querySelectorAll(".indicator");
const prevBtn = document.querySelector(".carousel-prev");
const nextBtn = document.querySelector(".carousel-next");

let currentSlide = 0;
let carouselInterval;

function updateCarousel() {
  // Update slides
  carouselSlides.forEach((slide, index) => {
    slide.classList.toggle("active", index === currentSlide);
  });

  // Update indicators
  indicators.forEach((indicator, index) => {
    indicator.classList.toggle("active", index === currentSlide);
  });

  // Update track position
  if (carouselTrack) {
    carouselTrack.style.transform = `translateX(-${currentSlide * 100}%)`;
  }
}

function nextSlide() {
  currentSlide = (currentSlide + 1) % carouselSlides.length;
  updateCarousel();
  resetCarouselInterval();
}

function prevSlide() {
  currentSlide = (currentSlide - 1 + carouselSlides.length) % carouselSlides.length;
  updateCarousel();
  resetCarouselInterval();
}

function goToSlide(index) {
  currentSlide = index;
  updateCarousel();
  resetCarouselInterval();
}

function startCarouselInterval() {
  carouselInterval = setInterval(nextSlide, 5000);
}

function resetCarouselInterval() {
  clearInterval(carouselInterval);
  startCarouselInterval();
}

// Initialize carousel
if (carouselSlides.length > 0) {
  updateCarousel();
  startCarouselInterval();

  // Event listeners
  if (nextBtn) {
    nextBtn.addEventListener("click", nextSlide);
  }

  if (prevBtn) {
    prevBtn.addEventListener("click", prevSlide);
  }

  indicators.forEach((indicator, index) => {
    indicator.addEventListener("click", () => goToSlide(index));
  });

  // Pause on hover
  const carouselContainer = document.querySelector(".gallery-carousel");
  if (carouselContainer) {
    carouselContainer.addEventListener("mouseenter", () => {
      clearInterval(carouselInterval);
    });

    carouselContainer.addEventListener("mouseleave", () => {
      startCarouselInterval();
    });
  }

  // Keyboard navigation
  document.addEventListener("keydown", (e) => {
    if (document.querySelector(".gallery-carousel")) {
      if (e.key === "ArrowLeft") {
        prevSlide();
      } else if (e.key === "ArrowRight") {
        nextSlide();
      }
    }
  });
}

/* ======================
   BACK TO TOP BUTTON
====================== */
const backToTopButton = document.getElementById("backToTop");

function toggleBackToTop() {
  if (window.scrollY > 300) {
    backToTopButton.classList.add("show");
  } else {
    backToTopButton.classList.remove("show");
  }
}

function scrollToTop() {
  window.scrollTo({
    top: 0,
    behavior: "smooth"
  });
}

if (backToTopButton) {
  // Show/hide button based on scroll position
  window.addEventListener("scroll", toggleBackToTop);
  
  // Scroll to top on click
  backToTopButton.addEventListener("click", scrollToTop);
  
  // Initial check
  toggleBackToTop();
}
