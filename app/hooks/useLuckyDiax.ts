// app/hooks/useLuckyDiax.ts
import { useState } from "react";
import { message } from "antd";
import { calculateLuckyDiaxWinner, getTodayAsNumber, type Participant } from "@/helpers/luckyDiaxHelper";

export interface UseLuckyDiaxReturn {
  skipCount: number;
  setSkipCount: (count: number) => void;
  luckyDiaxResult: string;
  showLuckyDiaxPreview: boolean;
  setShowLuckyDiaxPreview: (show: boolean) => void;
  isGeneratingLuckyDiax: boolean;
  isSendingToDiscord: boolean;
  generateLuckyDiax: (participants: Participant[]) => Promise<void>;
  sendToDiscord: () => Promise<void>;
}

export function useLuckyDiax(): UseLuckyDiaxReturn {
  const [skipCount, setSkipCount] = useState<number>(3);
  const [luckyDiaxResult, setLuckyDiaxResult] = useState<string>("");
  const [showLuckyDiaxPreview, setShowLuckyDiaxPreview] = useState(false);
  const [isGeneratingLuckyDiax, setIsGeneratingLuckyDiax] = useState(false);
  const [isSendingToDiscord, setIsSendingToDiscord] = useState(false);

  const generateLuckyDiax = async (participants: Participant[]) => {
    if (participants.length === 0) {
      message.warning("Najpierw wygeneruj ranking dla wybranego przedziału dat");
      return;
    }

    try {
      setIsGeneratingLuckyDiax(true);
      await new Promise((resolve) => setTimeout(resolve, 1000));

      const participantsToUse = participants.slice(skipCount);

      if (participantsToUse.length === 0) {
        message.error("Nie ma wystarczającej liczby uczestników po pominięciu");
        setIsGeneratingLuckyDiax(false);
        return;
      }

      const today = getTodayAsNumber();
      const result = calculateLuckyDiaxWinner(participantsToUse, today);

      setLuckyDiaxResult(result);
      setShowLuckyDiaxPreview(true);
      message.success("Lucky Diax wygenerowany");
    } catch (err) {
      message.error("Błąd podczas generowania Lucky Diax");
      console.error(err);
    } finally {
      setIsGeneratingLuckyDiax(false);
    }
  };

  const sendToDiscord = async () => {
    if (!luckyDiaxResult) {
      message.warning("Najpierw wygeneruj Lucky Diax");
      return;
    }

    try {
      setIsSendingToDiscord(true);

      const response = await fetch("/api/discord/send-lucky-diax", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: luckyDiaxResult,
        }),
      });

      if (!response.ok) {
        throw new Error("Błąd podczas wysyłania na Discord");
      }

      message.success("Lucky Diax wysłany na Discord");
    } catch (err) {
      message.error("Błąd podczas wysyłania na Discord");
      console.error(err);
    } finally {
      setIsSendingToDiscord(false);
    }
  };

  return {
    skipCount,
    setSkipCount,
    luckyDiaxResult,
    showLuckyDiaxPreview,
    setShowLuckyDiaxPreview,
    isGeneratingLuckyDiax,
    isSendingToDiscord,
    generateLuckyDiax,
    sendToDiscord,
  };
}