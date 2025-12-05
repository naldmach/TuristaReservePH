import { useState, useEffect } from "react";

const STORAGE_KEY = "turista-reservations";

export function useReservations() {
  const [reservations, setReservations] = useState(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch (err) {
      console.error("Failed to load reservations", err);
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(reservations));
  }, [reservations]);

  const addReservation = (reservation) => {
    setReservations((prev) => [...prev, reservation]);
  };

  return { reservations, addReservation };
}
