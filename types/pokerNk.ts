// Types describing the JSON file uploaded on the "Poker NK" page.
// Shape inferred from the sample file QI-2026-07-29.json (array of player rows).

export type PokerNkPlayer = {
    Player_ID: number;
    Player: string;
    Actions: number;
    Progress: number;
};

// The uploaded file is a plain array of player rows.
export type PokerNkPayload = PokerNkPlayer[];

// Response placeholder for the future business-logic endpoint.
// Extend this once we define what the "Poker NK" processing step returns.
export type PokerNkResponse = {
    status: string;
};