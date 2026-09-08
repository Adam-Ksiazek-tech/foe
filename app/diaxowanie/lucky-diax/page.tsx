// app/diaxowanie/lucky-diax/page.tsx
"use client";

import { useState } from "react";
import { Button, Space, Collapse, message } from "antd";
import { App } from "antd";
import { ReloadOutlined, SendOutlined } from "@ant-design/icons";
import { PageHeader } from "@/components/PageHeader";
import { useTheme } from "@/app/theme-context";
import { calculateLuckyDiaxWinner, getTodayAsNumber, type Participant } from "@/helpers/luckyDiaxHelper";

// Testowa tablica uczestników
const TEST_PARTICIPANTS: Participant[] = [
  { name: "IDudek", points: 720 },
  { name: "Baracuda", points: 630 },
  { name: "rba99", points: 555 },
  { name: "Fabricator", points: 360 },
  { name: "Kris.74", points: 360 },
  { name: "aatib", points: 360 },
  { name: "Niepokorna Kicia", points: 270 },
  { name: "DOLANGA1971", points: 270 },
  { name: "Sokrates Myśliciel", points: 180 },
  { name: "Rusia8", points: 180 },
  { name: "Jabbar", points: 180 },
  { name: "Broken vodoo", points: 180 },
  { name: "duperele", points: 180 },
  { name: "Aureliusz Wspaniały", points: 180 },
  { name: "komandir555", points: 90 },
  { name: "FELYSE", points: 90 },
  { name: "OdrzutowaMarchewka", points: 90 },
  { name: "Piootrh", points: 90 },
];

export default function LuckyDiax() {
  const { isDark } = useTheme();
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSendingToDiscord, setIsSendingToDiscord] = useState(false);
  const [luckyDiaxResult, setLuckyDiaxResult] = useState<string>("");
  const [showLuckyDiaxPreview, setShowLuckyDiaxPreview] = useState(false);

  // Generuje Lucky Diax i wyświetla preview
  const handleGenerateLuckyDiax = async () => {
    try {
      setIsGenerating(true);
      // Symulacja opóźnienia
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Obliczenie zwycięzcy
      const today = getTodayAsNumber();
      const result = calculateLuckyDiaxWinner(TEST_PARTICIPANTS, today);

      setLuckyDiaxResult(result);
      setShowLuckyDiaxPreview(true);
      message.success("Lucky Diax wygenerowany");
    } catch (err) {
      message.error("Błąd podczas generowania Lucky Diax");
      console.error(err);
    } finally {
      setIsGenerating(false);
    }
  };

  // Wysyła Lucky Diax na Discord
  const handleSendToDiscord = async () => {
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

  return (
    <App>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          height: "100vh",
          padding: "24px",
          overflow: "hidden",
        }}
      >
        <PageHeader title="Lucky Diax" subtitle="Wygeneruj szczęśliwy los" />

        <div
          style={{
            marginBottom: "16px",
            padding: "12px",
            backgroundColor: isDark
              ? "rgba(255,255,255,0.05)"
              : "rgba(0,0,0,0.02)",
            borderRadius: "4px",
          }}
        >
          <Space direction="vertical" style={{ width: "100%" }}>
            <div
              style={{
                display: "flex",
                gap: "16px",
                alignItems: "flex-end",
                flexWrap: "wrap",
              }}
            >
              <Button
                type="primary"
                icon={<ReloadOutlined />}
                onClick={handleGenerateLuckyDiax}
                loading={isGenerating}
              >
                Generuj Lucky Diax
              </Button>
              <Button
                icon={<SendOutlined />}
                onClick={handleSendToDiscord}
                loading={isSendingToDiscord}
                disabled={!luckyDiaxResult}
              >
                Wyślij na Discord
              </Button>
            </div>
          </Space>
        </div>

        {/* Lucky Diax Preview Collapse */}
        {luckyDiaxResult && (
          <div style={{ marginBottom: "16px", flex: 1, overflow: "auto", minHeight: 0 }}>
            <Collapse
              items={[
                {
                  key: "1",
                  label: `Podgląd Lucky Diax`,
                  children: (
                    <div
                      style={{
                        backgroundColor: isDark
                          ? "rgba(0,0,0,0.45)"
                          : "rgba(0,0,0,0.02)",
                        padding: "12px",
                        borderRadius: "4px",
                        fontFamily: "monospace",
                        fontSize: "12px",
                        whiteSpace: "pre-wrap",
                        wordBreak: "break-word",
                        maxHeight: "600px",
                        overflow: "auto",
                        color: isDark
                          ? "rgba(255,255,255,0.85)"
                          : "inherit",
                        lineHeight: "1.6",
                      }}
                    >
                      {luckyDiaxResult}
                    </div>
                  ),
                },
              ]}
              activeKey={showLuckyDiaxPreview ? ["1"] : []}
              onChange={(keys) => setShowLuckyDiaxPreview(keys.includes("1"))}
            />
          </div>
        )}
      </div>
    </App>
  );
}