import { useState, useEffect } from "react";
import Hero from "./components/Hero";
import ReservationForm from "./components/ReservationForm";
import AdminPanel from "./components/AdminPanel";
import { useReservations } from "./hooks/useReservations";

function App() {
  const { reservations, addReservation } = useReservations();

  const scrollToAdmin = () => {
    document.getElementById("admin")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <>
      <Hero onViewAdmin={scrollToAdmin} />
      <main>
        <ReservationForm
          onReservation={addReservation}
          reservations={reservations}
        />
        <AdminPanel reservations={reservations} />
      </main>
      <footer>
        <p>TuristaReserve PH · QR-based visitor control MVP</p>
      </footer>
    </>
  );
}

export default App;
