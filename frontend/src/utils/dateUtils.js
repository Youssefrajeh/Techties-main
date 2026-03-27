/**
 * Compute age based on date of birth string (YYYY-MM-DD).
 * @param {string} dob - Date of birth in YYYY-MM-DD format.
 * @returns {number|null} Age in years or null if invalid dob.
 */
export function computeAge(dob) {
  if (!dob) return null;
  const [bYear, bMonth, bDay] = dob.split("-").map(Number);
  if (!bYear || !bMonth || !bDay) return null;

  const today = new Date();
  const tYear = today.getFullYear();
  const tMonth = today.getMonth() + 1;
  const tDay = today.getDate();

  let age = tYear - bYear;
  if (tMonth < bMonth || (tMonth === bMonth && tDay < bDay)) {
    age--;
  }
  return age;
}
