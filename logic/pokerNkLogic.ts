import type { PokerNkPlayer } from "@/types/pokerNk";

const DIGIT_LENGTH = 7; // padding width, based on max observed Actions value

export type PokerHandRank =
    | "Kareta"
    | "Full"
    | "Strit"
    | "Trojka"
    | "DwiePary";

export type PokerHandResult = {
    rank: PokerHandRank;
    rankValue: number; // 5 = Kareta ... 1 = Dwie Pary, used for comparing categories
    tiebreak: number[]; // ordered list of digits used to break ties within same rank
};

export type PokerNkEvaluatedPlayer = {
    player: PokerNkPlayer;
    digits: number[];
    hand: PokerHandResult | null; // null = no qualifying hand, player is eliminated
};

const RANK_VALUE: Record<PokerHandRank, number> = {
    Kareta: 5,
    Full: 4,
    Strit: 3,
    Trojka: 2,
    DwiePary: 1,
};

/**
 * Splits Actions into its real digits — no left-padding zeros.
 * Padding to a fixed width was breaking hand evaluation: artificial leading
 * zeros could form a Kareta/Trójka/Full that doesn't exist in the player's
 * actual score. `Actions: 0` itself has no digits to form a hand and is
 * excluded from the contest entirely (handled in evaluateHand/evaluatePokerNk).
 */
export function getDigits(actions: number): number[] {
    return String(actions).split("").map(Number);
}

function countDigits(digits: number[]): Map<number, number> {
    const counts = new Map<number, number>();
    for (const d of digits) {
        counts.set(d, (counts.get(d) ?? 0) + 1);
    }
    return counts;
}

/** Finds the longest run of consecutive digit values present in the set (for Strit). */
function findStraightHighCard(digits: number[]): number | null {
    const present = new Set(digits);
    let bestHigh: number | null = null;

    for (let start = 0; start <= 5; start++) {
        let hasRun = true;
        for (let offset = 0; offset < 5; offset++) {
            if (!present.has(start + offset)) {
                hasRun = false;
                break;
            }
        }
        if (hasRun) {
            const high = start + 4;
            if (bestHigh === null || high > bestHigh) {
                bestHigh = high;
            }
        }
    }

    return bestHigh;
}

/** Evaluates the poker hand for a single player's digit set. Returns null if no qualifying hand. */
export function evaluateHand(digits: number[]): PokerHandResult | null {
    // Zera nie biorą udziału w konkursie — ani z paddingu, ani występujące
    // naturalnie w liczbie. Liczą się tylko cyfry 1-9.
    const nonZeroDigits = digits.filter((d) => d !== 0);

    const counts = countDigits(nonZeroDigits);
    const entries = [...counts.entries()]; // [digit, count]

    const quads = entries.filter(([, c]) => c === 4).map(([d]) => d);
    const trips = entries.filter(([, c]) => c === 3).map(([d]) => d);
    const pairs = entries.filter(([, c]) => c === 2).map(([d]) => d);

    // Kareta
    if (quads.length > 0) {
        const digit = Math.max(...quads);
        return { rank: "Kareta", rankValue: RANK_VALUE.Kareta, tiebreak: [digit] };
    }

    // Full: trójka + para (jeśli więcej niż jedna trójka, wyższa trójka + druga jako para)
    if (trips.length >= 2) {
        const sortedTrips = [...trips].sort((a, b) => b - a);
        return {
            rank: "Full",
            rankValue: RANK_VALUE.Full,
            tiebreak: [sortedTrips[0], sortedTrips[1]],
        };
    }
    if (trips.length === 1 && pairs.length >= 1) {
        const tripDigit = trips[0];
        const pairDigit = Math.max(...pairs);
        return {
            rank: "Full",
            rankValue: RANK_VALUE.Full,
            tiebreak: [tripDigit, pairDigit],
        };
    }

    // Strit
    const straightHigh = findStraightHighCard(nonZeroDigits);
    if (straightHigh !== null) {
        return { rank: "Strit", rankValue: RANK_VALUE.Strit, tiebreak: [straightHigh] };
    }

    // Trójka
    if (trips.length === 1) {
        return { rank: "Trojka", rankValue: RANK_VALUE.Trojka, tiebreak: [trips[0]] };
    }

    // Dwie Pary
    if (pairs.length >= 2) {
        const sortedPairs = [...pairs].sort((a, b) => b - a);
        return {
            rank: "DwiePary",
            rankValue: RANK_VALUE.DwiePary,
            tiebreak: [sortedPairs[0], sortedPairs[1]],
        };
    }

    return null;
}

function compareHands(a: PokerNkEvaluatedPlayer, b: PokerNkEvaluatedPlayer): number {
    // both must have a hand at this point (eliminated players filtered out earlier)
    const handA = a.hand!;
    const handB = b.hand!;

    if (handA.rankValue !== handB.rankValue) {
        return handB.rankValue - handA.rankValue;
    }

    for (let i = 0; i < Math.max(handA.tiebreak.length, handB.tiebreak.length); i++) {
        const da = handA.tiebreak[i] ?? -1;
        const db = handB.tiebreak[i] ?? -1;
        if (da !== db) return db - da;
    }

    // still tied -> higher Actions wins
    return b.player.Actions - a.player.Actions;
}

/** Evaluates all players, filters out those with no qualifying hand, and ranks the rest. */
export function evaluatePokerNk(players: PokerNkPlayer[]): PokerNkEvaluatedPlayer[] {
    const evaluated: PokerNkEvaluatedPlayer[] = players.map((player) => {
        if (player.Actions === 0) {
            return { player, digits: [], hand: null };
        }
        const digits = getDigits(player.Actions);
        const hand = evaluateHand(digits);
        return { player, digits, hand };
    });

    const qualified = evaluated.filter((e) => e.hand !== null);
    qualified.sort(compareHands);

    return qualified;
}

/** Convenience wrapper returning just the winner, or null if nobody qualifies. */
export function getPokerNkWinner(players: PokerNkPlayer[]): PokerNkEvaluatedPlayer | null {
    const ranked = evaluatePokerNk(players);
    return ranked[0] ?? null;
}