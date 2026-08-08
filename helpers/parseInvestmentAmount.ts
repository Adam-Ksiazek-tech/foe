/**
 * Parsuje tekst inwestycji i ekstraktuje kwotę.
 */
export function parseInvestmentAmountAdvanced(text: string): number | null {
  if (!text || typeof text !== 'string') return null;

  let normalized = text.trim().toLowerCase();

  // Wycinanie tekstu po "razem", "sum", "total", etc.
  if (normalized.includes('razem')) {
    normalized = normalized.split('razem')[0].trim();
  }

  const cutoffPatterns = ['sum', 'total', '=', '->'];
  for (const pattern of cutoffPatterns) {
    if (normalized.includes(pattern)) {
      normalized = normalized.split(pattern)[0].trim();
    }
  }

  // Normalizuj: "D4d90" -> "D4d 90", "A190" -> "A1 90"
  // Ale ostrożnie - tylko jeśli mamy litery bezpośrednio przed cyframi
  const preprocessedText = normalized
    .replace(/([a-z]+\d+[a-z]*)(\d{2,})/g, '$1 $2') // "D4d90" -> "D4d 90", "A190" -> "A1 90"
    .replace(/([a-z]\d[a-z]+)\s+x(\d+)/g, '$1 x $2')
    .replace(/\sx(\d+)$/g, ' x $1')
    .replace(/(\d+)x\s+(\d+)/g, '$1 x $2');

  // Rozbij na tokeny
  const tokens = preprocessedText.split(/\s+/).filter(t => t.length > 0);
  let total = 0;
  let i = 0;

  while (i < tokens.length) {
    const token = tokens[i];

    // Pattern: "2*90" lub "2x90" (bez spacji)
    if (/^\d+[x*]\d+$/.test(token)) {
      const match = token.match(/^(\d+)[x*](\d+)$/);
      if (match) {
        total += parseInt(match[1], 10) * parseInt(match[2], 10);
      }
      i++;
      continue;
    }

    // Jeśli to numer pola (B2, D4d, A3v, A1, itd.) - pomiń go
    if (/^[a-z]+\d+[a-z]*$/.test(token)) {
      i++;
      continue;
    }

    // Jeśli to sama liczba
    if (/^\d+$/.test(token)) {
      const num = parseInt(token, 10);

      // Sprawdź czy następny token to operator
      if (i + 1 < tokens.length) {
        const nextToken = tokens[i + 1];

        // "90 x 2" lub "90 * 2" - mnożenie z następnym tokenem
        if (/^[x*]$/.test(nextToken)) {
          if (i + 2 < tokens.length && /^\d+$/.test(tokens[i + 2])) {
            total += num * parseInt(tokens[i + 2], 10);
            i += 3;
            continue;
          }
          // Jeśli "x" bez liczby po nim, po prostu dodaj liczbę
          total += num;
          i++;
          continue;
        }

        // "90 + 50", "90 - 10", etc.
        if (['+', '-', '*', '/'].includes(nextToken) && i + 2 < tokens.length) {
          const thirdToken = tokens[i + 2];
          if (/^\d+$/.test(thirdToken)) {
            const nextNum = parseInt(thirdToken, 10);
            if (nextToken === '+') {
              total += num + nextNum;
            } else if (nextToken === '-') {
              total += num - nextNum;
            } else if (nextToken === '*') {
              total += num * nextNum;
            } else if (nextToken === '/') {
              total += Math.floor(num / nextNum);
            }
            i += 3;
            continue;
          }
        }
      }

      // Brak operatora - dodaj liczbę
      total += num;
      i++;
      continue;
    }

    // Token zawiera "x" - wyciągnij liczbę po x (np. "x90", "x2")
    if (token.includes('x')) {
      const match = token.match(/x(\d+)/);
      if (match) {
        const num = parseInt(match[1], 10);
        total += num;
        i++;
        continue;
      }
    }

    i++;
  }

  return total > 0 ? total : null;
}