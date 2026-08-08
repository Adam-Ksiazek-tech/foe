// lib/parseGameDate.ts

const DNI_TYGODNIA: Record<string, number> = {
  'Niedziela': 0, 'Poniedziałek': 1, 'Wtorek': 2, 'Środa': 3,
  'Czwartek': 4, 'Piątek': 5, 'Sobota': 6,
};

export function parseGameDate(raw: string, referenceDate: Date = new Date()): Date {
  // format: "dzisiaj o 18:09" | "wczoraj o 14:50" | "Czwartek o 19:03"
  const match = raw.match(/^(.+?)\s+o\s+(\d{1,2}):(\d{2})$/i);
  if (!match) {
    throw new Error(`Nieznany format daty: "${raw}"`);
  }

  const [, dayPart, hourStr, minStr] = match;
  const hour = parseInt(hourStr, 10);
  const minute = parseInt(minStr, 10);

  const result = new Date(referenceDate);
  result.setHours(hour, minute, 0, 0);

  const dayLower = dayPart.trim().toLowerCase();

  if (dayLower === 'dzisiaj') {
    // nic nie zmieniamy — dzisiejsza data z podaną godziną
  } else if (dayLower === 'wczoraj') {
    result.setDate(result.getDate() - 1);
  } else {
    // nazwa dnia tygodnia, np. "Czwartek" — musimy cofnąć się do najbliższego
    // wystąpienia tego dnia w przeszłości (max 6 dni wstecz)
    const targetDow = DNI_TYGODNIA[dayPart.trim()];
    if (targetDow === undefined) {
      throw new Error(`Nierozpoznana nazwa dnia: "${dayPart}"`);
    }

    const currentDow = referenceDate.getDay();
    let diff = currentDow - targetDow;
    if (diff <= 0) diff += 7; // zawsze cofamy się w przeszłość, nigdy w przyszłość

    result.setDate(result.getDate() - diff);
  }

  return result;
}