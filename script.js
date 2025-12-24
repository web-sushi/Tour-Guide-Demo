/* ======================
   ELEMENT REFERENCES
====================== */
const modal = document.getElementById("bookingModal");
const modalTitle = document.getElementById("modalTitle");

const openButtons = document.querySelectorAll(".open-modal");
const closeButton = document.querySelector(".close-modal");

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
    modal.classList.add("active");

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
  modal.classList.remove("active");
  if (modalTitle) modalTitle.textContent = "Book Your Tour";
}

closeButton.addEventListener("click", closeModal);

modal.addEventListener("click", (e) => {
  if (e.target === modal) closeModal();
});

document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") closeModal();
});

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
      peopleOtherInput.focus();
    } else {
      otherPeopleGroup.classList.add("hidden");
      largeGroupWarning.classList.add("hidden");
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
      largeGroupWarning.classList.add("hidden");
      return;
    }

    updateGroupSizeInMessage(value);

    if (value > 10) {
      largeGroupWarning.classList.remove("hidden");
    } else {
      largeGroupWarning.classList.add("hidden");
    }
  });
}

/* ======================
   FORM SUBMIT (NETLIFY)
====================== */
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
