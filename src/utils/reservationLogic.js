export const CAPACITY_PER_DAY = 80;
export const PARKING_SLOTS_PER_DAY = 30;

/**
 * Formats a Date object as YYYY-MM-DD using local timezone.
 * This avoids timezone shifts that occur with toISOString() which uses UTC.
 * For example, in UTC+13, toISOString() could shift Dec 5 to Dec 4.
 */
export function formatDate(date) {
  // Use local date formatting instead of UTC to avoid timezone shifts
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/**
 * Returns today's date as YYYY-MM-DD string in local timezone.
 * This ensures users see their local date, not UTC date.
 */
export function getTodayLocalDate() {
  return formatDate(new Date());
}

export function capacityUsed(reservations, dateStr) {
  return reservations
    .filter((r) => r.date === dateStr)
    .reduce((sum, r) => sum + Number(r.people), 0);
}

export function parkingUsed(reservations, dateStr) {
  return reservations.filter(
    (r) => r.date === dateStr && r.vehicle && r.vehicle !== "none"
  ).length;
}

export function capacityLeft(reservations, dateStr) {
  return CAPACITY_PER_DAY - capacityUsed(reservations, dateStr);
}

export function parkingLeft(reservations, dateStr) {
  return PARKING_SLOTS_PER_DAY - parkingUsed(reservations, dateStr);
}

export function nextAvailableDate(
  reservations,
  startDateStr,
  people,
  needsParking
) {
  // Parse date string as local date to avoid UTC timezone shifts
  // Date strings in YYYY-MM-DD format are parsed as UTC by default
  const [year, month, day] = startDateStr.split("-").map(Number);
  let cursor = new Date(year, month - 1, day); // month is 0-indexed

  for (let i = 0; i < 365; i++) {
    const dateStr = formatDate(cursor);
    const fitsCapacity = capacityLeft(reservations, dateStr) >= people;
    const fitsParking = !needsParking || parkingLeft(reservations, dateStr) > 0;
    if (fitsCapacity && fitsParking) return dateStr;
    cursor.setDate(cursor.getDate() + 1);
  }
  return null;
}
