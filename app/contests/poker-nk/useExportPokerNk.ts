"use client";

import { App } from "antd";
import type { PokerNkEvaluatedPlayer, PokerHandRank } from "@/logic/pokerNkLogic";

const HAND_LABEL: Record<PokerHandRank, string> = {
    Kareta: "Kareta",
    Full: "Full",
    Strit: "Strit",
    Trojka: "Trójka",
    DwiePary: "Dwie Pary",
};

function explainHand(entry: PokerNkEvaluatedPlayer): string {
    const countedDigitsStr = entry.digits.filter((d) => d !== 0).join(" ");
    const hand = entry.hand!;

    switch (hand.rank) {
        case "Kareta":
            return `Cztery cyfry ${hand.tiebreak[0]} (liczone cyfry: ${countedDigitsStr})`;
        case "Full":
            return `Trójka z ${hand.tiebreak[0]} i para z ${hand.tiebreak[1]} (liczone cyfry: ${countedDigitsStr})`;
        case "Strit":
            return `Ciąg kończący się na ${hand.tiebreak[0]} (liczone cyfry: ${countedDigitsStr})`;
        case "Trojka":
            return `Trzy cyfry ${hand.tiebreak[0]} (liczone cyfry: ${countedDigitsStr})`;
        case "DwiePary":
            return `Pary ${hand.tiebreak[0]} i ${hand.tiebreak[1]} (liczone cyfry: ${countedDigitsStr})`;
        default:
            return countedDigitsStr;
    }
}

export function useExportPokerNk() {
    const { message } = App.useApp();

    const exportResults = (results: PokerNkEvaluatedPlayer[] | null) => {
        if (!results || results.length === 0) {
            message.warning("No results to export");
            return;
        }

        const lines = results.map((entry, index) => {
            const place = index + 1;
            const player = entry.player.Player;
            const actions = entry.player.Actions.toLocaleString("pl-PL");
            const hand = HAND_LABEL[entry.hand!.rank];
            const explanation = explainHand(entry);

            return `${place}. ${player} — ${hand}\n   Actions: ${actions}\n   ${explanation}`;
        });

        const header = `Poker NK — wyniki (${new Date().toLocaleString("pl-PL")})\n${"=".repeat(50)}\n\n`;
        const content = header + lines.join("\n\n");

        const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
        const url = URL.createObjectURL(blob);

        const a = document.createElement("a");
        a.href = url;
        a.download = `poker-nk-wyniki-${Date.now()}.txt`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);

        URL.revokeObjectURL(url);

        message.success("Plik został pobrany");
    };

    return { exportResults };
}