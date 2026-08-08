// app/api/investments/route.ts
import { parseGameDate } from '@/lib/parseGameDate';
import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';

function parseDiaxAmount(text: string): number | null {
  const match = text.match(/(\d+)\s*[xX]\s*(\d+)|(\d+)\s*$/);
  if (!match) return null;
  if (match[1] && match[2]) return parseInt(match[1], 10) * parseInt(match[2], 10);
  return match[3] ? parseInt(match[3], 10) : null;
}

export async function POST(req: NextRequest) {
  const body = await req.json();

  let beautyDate: Date;
  try {
    beautyDate = parseGameDate(body.gameDate);
  } catch (e) {
    beautyDate = new Date(); // fallback — nie blokuj insertu przez błąd parsowania daty
  }

  const record = await prisma.investment.upsert({
    where: { msgId: BigInt(body.msgId) },
    update: {},
    create: {
      msgId: BigInt(body.msgId),
      conversationId: BigInt(body.conversationId),
      playerId: BigInt(body.playerId),
      playerName: body.playerName,
      text: body.text,
      gameDate: body.gameDate,
      beautyDate,
      parsedAmount: parseDiaxAmount(body.text), // Twój parser z poprzednich kroków
      parsedOk: parseDiaxAmount(body.text) !== null,
    },
  });

  return NextResponse.json({ ok: true, id: record.id });
}

export async function GET() {
  const records = await prisma.investment.findMany({
    orderBy: { receivedAt: 'desc' },
  });

  return NextResponse.json(
    records.map(r => ({
      ...r,
      msgId: r.msgId.toString(),
      conversationId: r.conversationId.toString(),
      playerId: r.playerId.toString(),
    }))
  );
}