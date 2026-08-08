import { parseGameDate } from '@/lib/parseGameDate';
import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';

const ALLOWED_ORIGIN = 'https://pl8.forgeofempires.com';

const corsHeaders = {
  'Access-Control-Allow-Origin': ALLOWED_ORIGIN,
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, X-API-Key',
};

function parseDiaxAmount(text: string): number | null {
  const match = text.match(/(\d+)\s*\*\s*(\d+)|(\d+)\s*$/);

  if (!match) return null;

  if (match[1] && match[2]) {
    return parseInt(match[1], 10) * parseInt(match[2], 10);
  }

  return match[3] ? parseInt(match[3], 10) : null;
}

// CORS preflight
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: corsHeaders,
  });
}

export async function POST(req: NextRequest) {
  const apiKey = req.headers.get('x-api-key');

  if (apiKey !== process.env.API_SECRET_KEY_FOR_PLUGIN) {
    return NextResponse.json(
      { ok: false, error: 'Unauthorized' },
      {
        status: 401,
        headers: corsHeaders,
      }
    );
  }

  const body = await req.json();

  let beautyDate: Date;

  try {
    beautyDate = parseGameDate(body.gameDate);
  } catch (e) {
    beautyDate = new Date();
  }

  const record = await prisma.investment.upsert({
    where: {
      msgId: BigInt(body.msgId),
    },
    update: {},
    create: {
      msgId: BigInt(body.msgId),
      conversationId: BigInt(body.conversationId),
      playerId: BigInt(body.playerId),
      playerName: body.playerName,
      text: body.text,
      gameDate: body.gameDate,
      beautyDate,
      parsedAmount: parseDiaxAmount(body.text),
      parsedOk: parseDiaxAmount(body.text) !== null,
    },
  });

  return NextResponse.json(
    {
      ok: true,
      id: record.id,
    },
    {
      headers: corsHeaders,
    }
  );
}

export async function GET(req: NextRequest) {
  const apiKey = req.headers.get('x-api-key');

  if (apiKey !== process.env.API_SECRET_KEY_FOR_PLUGIN) {
    return NextResponse.json(
      { ok: false, error: 'Unauthorized' },
      {
        status: 401,
        headers: corsHeaders,
      }
    );
  }

  const records = await prisma.investment.findMany({
    orderBy: {
      receivedAt: 'desc',
    },
  });

  return NextResponse.json(
    records.map((r) => ({
      ...r,
      msgId: r.msgId.toString(),
      conversationId: r.conversationId.toString(),
      playerId: r.playerId.toString(),
    })),
    {
      headers: corsHeaders,
    }
  );
}