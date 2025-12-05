const CAPACITY_PER_DAY = 80;
const PARKING_SLOTS_PER_DAY = 30;
const STORAGE_KEY = "turista-reservations";

const form = document.getElementById("reservation-form");
const capacityHint = document.getElementById("capacity-hint");
const confirmation = document.getElementById("confirmation");
const confirmationDetails = document.getElementById("confirmation-details");
const parkingDetails = document.getElementById("parking-details");
const reservationQr = document.getElementById("reservation-qr");
const landingQr = document.getElementById("landing-qr");
const plateField = document.getElementById("plate-field");
const vehicleSelect = document.getElementById("vehicle-select");
const summaryTableBody = document.querySelector("#summary-table tbody");
const reservationList = document.getElementById("reservation-list");
const adminCapacity = document.getElementById("admin-capacity");
const adminParking = document.getElementById("admin-parking");
const scrollAdmin = document.getElementById("scroll-admin");
const message = document.getElementById("form-message");

let reservations = loadReservations();

function loadReservations() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (err) {
    console.error("Failed to load reservations", err);
    return [];
  }
}

function saveReservations() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(reservations));
}

function formatDate(date) {
  return date.toISOString().split("T")[0];
}

function capacityUsed(dateStr) {
  return reservations
    .filter((r) => r.date === dateStr)
    .reduce((sum, r) => sum + Number(r.people), 0);
}

function parkingUsed(dateStr) {
  return reservations
    .filter((r) => r.date === dateStr && r.vehicle && r.vehicle !== "none")
    .length;
}

function capacityLeft(dateStr) {
  return CAPACITY_PER_DAY - capacityUsed(dateStr);
}

function parkingLeft(dateStr) {
  return PARKING_SLOTS_PER_DAY - parkingUsed(dateStr);
}

function nextAvailableDate(startDateStr, people, needsParking) {
  let cursor = new Date(startDateStr);
  for (let i = 0; i < 365; i++) {
    const dateStr = formatDate(cursor);
    const fitsCapacity = capacityLeft(dateStr) >= people;
    const fitsParking = !needsParking || parkingLeft(dateStr) > 0;
    if (fitsCapacity && fitsParking) return dateStr;
    cursor.setDate(cursor.getDate() + 1);
  }
  return null;
}

function renderLandingQr() {
  QRCode.toCanvas(landingQr, window.location.href, { width: 170 });
}

function renderCapacityHint(dateStr) {
  const left = capacityLeft(dateStr);
  const parking = parkingLeft(dateStr);
  capacityHint.textContent = `People left: ${left} · Parking left: ${parking}`;
}

function updateAdmin() {
  adminCapacity.textContent = CAPACITY_PER_DAY;
  adminParking.textContent = PARKING_SLOTS_PER_DAY;

  const grouped = reservations.reduce((acc, r) => {
    acc[r.date] = acc[r.date] || [];
    acc[r.date].push(r);
    return acc;
  }, {});

  const rows = Object.keys(grouped)
    .sort()
    .map((date) => {
      const people = grouped[date].reduce((sum, r) => sum + Number(r.people), 0);
      const parking = grouped[date].filter((r) => r.vehicle && r.vehicle !== "none").length;
      return { date, people, count: grouped[date].length, parking };
    });

  summaryTableBody.innerHTML = rows
    .map(
      (row) =>
        `<tr><td>${row.date}</td><td>${row.people}</td><td>${row.count}</td><td>${row.parking}</td></tr>`
    )
    .join("") || `<tr><td colspan="4">No reservations yet</td></tr>`;

  reservationList.innerHTML =
    reservations
      .slice()
      .sort((a, b) => a.date.localeCompare(b.date))
      .map(
        (r) =>
          `<div class="item">
            <div><strong>${r.name}</strong> · ${r.people} people</div>
            <div>Date: ${r.date}${r.originalDate !== r.date ? ` (requested ${r.originalDate})` : ""}</div>
            <div>Vehicle: ${r.vehicle || "none"}${r.plate ? ` · Plate ${r.plate}` : ""}</div>
            <div>Notes: ${r.notes || "—"}</div>
          </div>`
      )
      .join("") || `<div class="item">No reservations</div>`;
}

function generateReservationQr(data) {
  const payload = JSON.stringify(data, null, 0);
  QRCode.toCanvas(reservationQr, payload, { width: 180 });
}

function setDefaultDate() {
  const today = new Date();
  const dateInput = form.querySelector('input[name="date"]');
  dateInput.min = formatDate(today);
  dateInput.value = formatDate(today);
  renderCapacityHint(dateInput.value);
}

vehicleSelect.addEventListener("change", () => {
  const hasVehicle = vehicleSelect.value !== "none";
  plateField.classList.toggle("hidden", !hasVehicle);
});

form.addEventListener("input", (evt) => {
  if (evt.target.name === "date") {
    renderCapacityHint(evt.target.value);
  }
});

scrollAdmin.addEventListener("click", () => {
  document.getElementById("admin").scrollIntoView({ behavior: "smooth" });
});

form.addEventListener("submit", (evt) => {
  evt.preventDefault();
  message.textContent = "";

  const formData = new FormData(form);
  const name = formData.get("name").trim();
  const datePreferred = formData.get("date");
  const people = Number(formData.get("people"));
  const vehicle = formData.get("vehicle");
  const plate = formData.get("plate").trim();
  const notes = formData.get("notes").trim();
  const needsParking = vehicle !== "none";

  if (!name || !datePreferred || !people || people < 1) {
    message.textContent = "Please complete the required fields.";
    return;
  }

  const assignedDate = nextAvailableDate(datePreferred, people, needsParking);
  if (!assignedDate) {
    message.textContent = "No available dates within the next year.";
    return;
  }

  const moved = assignedDate !== datePreferred;
  const reservation = {
    id: `RES-${Date.now()}`,
    name,
    originalDate: datePreferred,
    date: assignedDate,
    people,
    vehicle,
    plate,
    notes,
    createdAt: new Date().toISOString(),
  };

  reservations.push(reservation);
  saveReservations();
  renderCapacityHint(assignedDate);
  updateAdmin();

  confirmationDetails.textContent = moved
    ? `We moved you from ${datePreferred} to ${assignedDate} to keep within daily capacity.`
    : `You're confirmed for ${assignedDate}.`;

  parkingDetails.textContent = needsParking
    ? `Free parking reserved. Slots left for ${assignedDate}: ${parkingLeft(assignedDate)}`
    : "No vehicle noted. Free parking remains available for those who book with a vehicle.";

  generateReservationQr({
    reservation: reservation.id,
    name: reservation.name,
    date: reservation.date,
    people: reservation.people,
    vehicle: reservation.vehicle,
  });

  confirmation.classList.remove("hidden");
  form.reset();
  setDefaultDate();
});

// Init
renderLandingQr();
setDefaultDate();
updateAdmin();

