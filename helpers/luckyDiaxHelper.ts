// helpers/luckyDiaxHelper.ts
/**
 * Logika biznesowa Lucky Diax
 * Losowanie zwycięzcy spośród uczestników na podstawie ich punktów i daty
 */

export interface Participant {
  name: string;
  points: number;
}

/**
 * Oblicza zwycięzcę Lucky Diax
 * @param participants - tablica uczestników z punktami
 * @param date - data w formacie YYYYMMDD (np. 20260907)
 * @returns sformatowany wynik z historią obliczeń
 */
export function calculateLuckyDiaxWinner(
  participants: Participant[],
  date: number
): string {
  // 1. suma punktów
  const pointsSum = participants.reduce((sum, participant) => sum + participant.points, 0);
  
  // 2. dodajemy datę
  const sumWithDate = pointsSum + date;
  
  // 3. modulo liczby uczestników
  const winnerIndex = sumWithDate % participants.length;
  
  // 4. wybór zwycięzcy
  const winner = participants[winnerIndex].name;

  
  const result = `Diament szczęścia trafia do: ${winner} 🎉`;

  return result;
}

/**
 * Zwraca dzisiejszą datę w formacie YYYYMMDD
 */
export function getTodayAsNumber(): number {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");
  return parseInt(`${year}${month}${day}`);
}