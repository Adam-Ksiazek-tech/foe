// app/api/discord/send-lucky-diax/route.ts
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { message } = await request.json();

    if (!message) {
      return NextResponse.json(
        { error: "Brak wiadomości" },
        { status: 400 }
      );
    }

    // Pobierz webhook URL z env variables
    const webhookUrl = process.env.DISCORD_WEBHOOK_URL;
    if (!webhookUrl) {
      return NextResponse.json(
        { error: "Discord webhook URL nie skonfigurowany" },
        { status: 500 }
      );
    }

    // Wysłanie na Discord
    const response = await fetch(webhookUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        content: `\`\`\`\n${message}\n\`\`\``,
      }),
    });

    if (!response.ok) {
      throw new Error(`Discord API error: ${response.statusText}`);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Błąd wysyłania do Discord:", error);
    return NextResponse.json(
      { error: "Błąd podczas wysyłania na Discord" },
      { status: 500 }
    );
  }
}