import { useMemo } from "react";
import {
  CAPACITY_PER_DAY,
  PARKING_SLOTS_PER_DAY,
} from "../utils/reservationLogic";

export default function AdminPanel({ reservations }) {
  const summary = useMemo(() => {
    const grouped = reservations.reduce((acc, r) => {
      acc[r.date] = acc[r.date] || [];
      acc[r.date].push(r);
      return acc;
    }, {});

    return Object.keys(grouped)
      .sort()
      .map((date) => {
        const people = grouped[date].reduce(
          (sum, r) => sum + Number(r.people),
          0
        );
        const parking = grouped[date].filter(
          (r) => r.vehicle && r.vehicle !== "none"
        ).length;
        return { date, people, count: grouped[date].length, parking };
      });
  }, [reservations]);

  const sortedReservations = useMemo(() => {
    return [...reservations].sort((a, b) => a.date.localeCompare(b.date));
  }, [reservations]);

  return (
    <section id="admin" className="panel">
      <div className="panel-head">
        <div>
          <p className="badge">Admin</p>
          <h2>Daily reservations & parking</h2>
          <p className="subhead">
            Monitor headcount, parking usage, and individual QR codes.
          </p>
        </div>
        <div className="pill">
          Capacity per day: <span>{CAPACITY_PER_DAY}</span>
        </div>
        <div className="pill">
          Parking slots: <span>{PARKING_SLOTS_PER_DAY}</span>
        </div>
      </div>

      <div className="admin-grid">
        <div>
          <h3>Per-day summary</h3>
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>People</th>
                <th>Reservations</th>
                <th>Parking used</th>
              </tr>
            </thead>
            <tbody>
              {summary.length === 0 ? (
                <tr>
                  <td colSpan="4">No reservations yet</td>
                </tr>
              ) : (
                summary.map((row) => (
                  <tr key={row.date}>
                    <td>{row.date}</td>
                    <td>{row.people}</td>
                    <td>{row.count}</td>
                    <td>{row.parking}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div>
          <h3>Reservation list</h3>
          <div className="list">
            {sortedReservations.length === 0 ? (
              <div className="item">No reservations</div>
            ) : (
              sortedReservations.map((r) => (
                <div key={r.id} className="item">
                  <div>
                    <strong>{r.name}</strong> · {r.people} people
                  </div>
                  <div>
                    Date: {r.date}
                    {r.originalDate !== r.date
                      ? ` (requested ${r.originalDate})`
                      : ""}
                  </div>
                  <div>
                    Vehicle: {r.vehicle || "none"}
                    {r.plate ? ` · Plate ${r.plate}` : ""}
                  </div>
                  <div>Notes: {r.notes || "—"}</div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
