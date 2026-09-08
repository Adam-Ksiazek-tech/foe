// helpers/investmentHelpers.ts
export interface Investment {
  id: string;
  playerName: string;
  parsedAmount: number | null; // Dodaj | null
  beautyDate: string;
  [key: string]: any;
}

export interface Participant {
  name: string;
  points: number;
}

/**
 * Konwertuje Investment[] na Participant[]
 */
export function convertInvestmentsToParticipants(
  investments: Investment[]
): Participant[] {
  return investments
    .filter((inv) => inv.parsedAmount !== null) // Filtruj nulle
    .map((inv) => ({
      name: inv.playerName,
      points: inv.parsedAmount as number, // Type assertion po filtrze
    }));
}