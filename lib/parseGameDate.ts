// lib/parseGameDate.ts

const DNI_TYGODNIA: Record<string, number> = {
  'Niedziela': 0, 'Poniedziałek': 1, 'Wtorek': 2, 'Środa': 3,
  'Czwartek': 4, 'Piątek': 5, 'Sobota': 6,
};

// Zwraca offset Warszawy (w minutach) względem UTC dla danej daty (uwzględnia CET/CEST)
function warsawOffsetMinutes(year: number, month: number, day: number, hour: number, minute: number): number {
  // Tworzymy datę "jakby UTC" i sprawdzamy, jak Intl widzi ją w Europe/Warsaw
  const utcGuess = new Date(Date.UTC(year, month - 1, day, hour, minute));

  const dtf = new Intl.DateTimeFormat('en-US', {
    timeZone: 'Europe/Warsaw',
    hourCycle: 'h23',
    year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', second: '2-digit',
  });

  const parts = dtf.formatToParts(utcGuess).reduce((acc, p) => {
    acc[p.type] = p.value;
    return acc;
  }, {} as Record<string, string>);

  const asIfLocal = Date.UTC(
    Number(parts.year), Number(parts.month) - 1, Number(parts.day),
    Number(parts.hour), Number(parts.minute), Number(parts.second)
  );

  // różnica między tym co "chcieliśmy" a tym co UTC-guess wygenerował w Warszawie
  return (utcGuess.getTime() - asIfLocal) / 60000;
}

function makeWarsawDate(year: number, month: number, day: number, hour: number, minute: number): Date {
  const offsetMin = warsawOffsetMinutes(year, month, day, hour, minute);
  return new Date(Date.UTC(year, month - 1, day, hour, minute) + offsetMin * 60000);
}

export function parseGameDate(raw: string, referenceDate: Date = new Date()): Date {
  const trimmed = raw.trim();

  // format: "31.07.2026 o 06:01"
  const fullDateMatch = trimmed.match(/^(\d{1,2})\.(\d{1,2})\.(\d{4})\s+o\s+(\d{1,2}):(\d{2})$/i);
  if (fullDateMatch) {
    const [, dayStr, monthStr, yearStr, hourStr, minStr] = fullDateMatch;
    return makeWarsawDate(
      parseInt(yearStr, 10), parseInt(monthStr, 10), parseInt(dayStr, 10),
      parseInt(hourStr, 10), parseInt(minStr, 10)
    );
  }

  // format: "dzisiaj o 18:09" | "wczoraj o 14:50" | "Poniedziałek o 07:54"
  const match = trimmed.match(/^(.+?)\s+o\s+(\d{1,2}):(\d{2})$/i);
  if (!match) {
    throw new Error(`Nieznany format daty: "${raw}"`);
  }

  const [, dayPart, hourStr, minStr] = match;
  const hour = parseInt(hourStr, 10);
  const minute = parseInt(minStr, 10);

  // referenceDate traktujemy jako "teraz" w czasie Warszawy — wyciągamy rok/miesiąc/dzień wg Warszawy
  const dtf = new Intl.DateTimeFormat('en-US', {
    timeZone: 'Europe/Warsaw',
    year: 'numeric', month: '2-digit', day: '2-digit', weekday: 'long',
  });
  const parts = dtf.formatToParts(referenceDate).reduce((acc, p) => {
    acc[p.type] = p.value;
    return acc;
  }, {} as Record<string, string>);

  let year = Number(parts.year);
  let month = Number(parts.month);
  let day = Number(parts.day);

  const dayLower = dayPart.trim().toLowerCase();

  const shiftDay = (delta: number) => {
    const tmp = new Date(Date.UTC(year, month - 1, day));
    tmp.setUTCDate(tmp.getUTCDate() + delta);
    year = tmp.getUTCFullYear();
    month = tmp.getUTCMonth() + 1;
    day = tmp.getUTCDate();
  };

  if (dayLower === 'dzisiaj') {
    // zostaje bez zmian
  } else if (dayLower === 'wczoraj') {
    shiftDay(-1);
  } else {
    const targetDow = DNI_TYGODNIA[dayPart.trim()];
    if (targetDow === undefined) {
      throw new Error(`Nierozpoznana nazwa dnia: "${dayPart}"`);
    }

    // aktualny dzień tygodnia wg Warszawy
    const weekdayMap: Record<string, number> = {
      'Sunday': 0, 'Monday': 1, 'Tuesday': 2, 'Wednesday': 3,
      'Thursday': 4, 'Friday': 5, 'Saturday': 6,
    };
    const currentDow = weekdayMap[parts.weekday];

    let diff = currentDow - targetDow;
    if (diff <= 0) diff += 7;

    shiftDay(-diff);
  }

  return makeWarsawDate(year, month, day, hour, minute);
}