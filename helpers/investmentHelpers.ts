// helpers/investmentHelpers.ts
export interface Investment {
  id: string;
  playerName: string;
  parsedAmount: number;
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
  return investments.map((inv) => ({
    name: inv.playerName,
    points: inv.parsedAmount,
  }));
}