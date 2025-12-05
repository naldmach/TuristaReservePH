import { useState, useEffect } from "react";
import QRCodeComponent from "./QRCode";
import {
  formatDate,
  getTodayLocalDate,
  capacityLeft,
  parkingLeft,
  nextAvailableDate,
} from "../utils/reservationLogic";

export default function ReservationForm({ onReservation, reservations }) {
  const [formData, setFormData] = useState({
    name: "",
    date: "",
    people: 1,
    vehicle: "none",
    plate: "",
    notes: "",
  });
  const [showPlateField, setShowPlateField] = useState(false);
  const [capacityHint, setCapacityHint] = useState("");
  const [confirmation, setConfirmation] = useState(null);
  const [message, setMessage] = useState("");

  const updateCapacityHint = (dateStr) => {
    const left = capacityLeft(reservations, dateStr);
    const parking = parkingLeft(reservations, dateStr);
    setCapacityHint(`People left: ${left} · Parking left: ${parking}`);
  };

  useEffect(() => {
    // Use local date to ensure users see today's date in their timezone
    const todayStr = getTodayLocalDate();
    setFormData((prev) => ({ ...prev, date: todayStr }));
    updateCapacityHint(todayStr);
  }, []);

  useEffect(() => {
    if (formData.date) {
      updateCapacityHint(formData.date);
    }
  }, [formData.date, reservations]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    if (name === "vehicle") {
      setShowPlateField(value !== "none");
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setMessage("");

    const { name, date, people, vehicle, plate, notes } = formData;
    const trimmedName = name.trim();
    const trimmedPlate = plate.trim();
    const trimmedNotes = notes.trim();

    if (!trimmedName || !date || !people || people < 1) {
      setMessage("Please complete the required fields.");
      return;
    }

    const needsParking = vehicle !== "none";
    const assignedDate = nextAvailableDate(
      reservations,
      date,
      people,
      needsParking
    );

    if (!assignedDate) {
      setMessage("No available dates within the next year.");
      return;
    }

    const moved = assignedDate !== date;
    const reservation = {
      id: `RES-${Date.now()}`,
      name: trimmedName,
      originalDate: date,
      date: assignedDate,
      people: Number(people),
      vehicle,
      plate: trimmedPlate,
      notes: trimmedNotes,
      createdAt: new Date().toISOString(),
    };

    onReservation(reservation);

    setConfirmation({
      moved,
      assignedDate,
      originalDate: date,
      needsParking,
      parkingLeft: parkingLeft(reservations, assignedDate),
      reservation,
    });

    setFormData({
      name: "",
      date: getTodayLocalDate(),
      people: 1,
      vehicle: "none",
      plate: "",
      notes: "",
    });
    setShowPlateField(false);
    updateCapacityHint(assignedDate);
  };

  const minDate = getTodayLocalDate();

  return (
    <section id="reserve" className="panel">
      <div className="panel-head">
        <div>
          <p className="badge">Reservation</p>
          <h2>Check capacity and reserve</h2>
          <p className="subhead">
            We automatically move you to the next available day once limits are
            reached.
          </p>
        </div>
        <div className="capacity-hint">{capacityHint}</div>
      </div>

      <form onSubmit={handleSubmit} className="form-grid">
        <label>
          <span>Full name</span>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
            placeholder="Your name"
          />
        </label>

        <label>
          <span>Date you prefer</span>
          <input
            type="date"
            name="date"
            value={formData.date}
            onChange={handleChange}
            min={minDate}
            required
          />
        </label>

        <label>
          <span>Number of people</span>
          <input
            type="number"
            name="people"
            value={formData.people}
            onChange={handleChange}
            required
            min="1"
            max="20"
          />
        </label>

        <label>
          <span>Bringing a vehicle?</span>
          <select
            name="vehicle"
            value={formData.vehicle}
            onChange={handleChange}
          >
            <option value="none">No vehicle</option>
            <option value="car">Car</option>
            <option value="van">Van</option>
            <option value="motorcycle">Motorcycle</option>
          </select>
        </label>

        {showPlateField && (
          <label className="full-row">
            <span>Plate number (optional)</span>
            <input
              type="text"
              name="plate"
              value={formData.plate}
              onChange={handleChange}
              placeholder="ABC-1234"
            />
          </label>
        )}

        <label className="full-row">
          <span>Notes (optional)</span>
          <textarea
            name="notes"
            value={formData.notes}
            onChange={handleChange}
            rows="2"
            placeholder="Accessibility needs, timing, etc."
          ></textarea>
        </label>

        <div className="full-row actions">
          <button type="submit" className="primary-btn">
            Confirm reservation
          </button>
          {message && <p className="message">{message}</p>}
        </div>
      </form>

      {confirmation && (
        <div className="confirmation">
          <div className="confirmation-text">
            <h3>Reservation confirmed</h3>
            <p>
              {confirmation.moved
                ? `We moved you from ${confirmation.originalDate} to ${confirmation.assignedDate} to keep within daily capacity.`
                : `You're confirmed for ${confirmation.assignedDate}.`}
            </p>
            <p>
              {confirmation.needsParking
                ? `Free parking reserved. Slots left for ${confirmation.assignedDate}: ${confirmation.parkingLeft}`
                : "No vehicle noted. Free parking remains available for those who book with a vehicle."}
            </p>
          </div>
          <div className="confirmation-qr">
            <QRCodeComponent
              data={JSON.stringify({
                reservation: confirmation.reservation.id,
                name: confirmation.reservation.name,
                date: confirmation.reservation.date,
                people: confirmation.reservation.people,
                vehicle: confirmation.reservation.vehicle,
              })}
              width={180}
            />
          </div>
        </div>
      )}
    </section>
  );
}
