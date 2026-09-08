// helpers/rankingParser.ts
/**
 * Parser formatu tekstowego rankingu z Diaxowania
 * Konwertuje tekst na tablicę uczestników
 */

export interface Participant {
  name: string;
  points: number;
}

/**
 * Parsuje tekst rankingu i zwraca tablicę uczestników
 * Format oczekiwany: "Lp. Nick Punkty" z wierszami w formacie "1. Nick 720"
 */
export function parseRankingText(text: string): Participant[] {
  const lines = text.split('\n').filter(line => line.trim());
  const participants: Participant[] = [];

  for (const line of lines) {
    // Regex: "1. NickName 720" lub "1	NickName	720"
    const match = line.match(/^\d+[\.\s]+(.+?)\s+(\d+)\s*$/);
    if (match) {
      const name = match[1].trim();
      const points = parseInt(match[2], 10);
      if (name && !isNaN(points)) {
        participants.push({ name, points });
      }
    }
  }

  return participants;
}