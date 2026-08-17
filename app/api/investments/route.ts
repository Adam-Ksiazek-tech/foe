import { parseGameDate } from '@/lib/parseGameDate';
import { prisma } from '@/lib/prisma';
import { parseInvestmentAmountAdvanced } from '@/helpers/parseInvestmentAmount';
import { NextRequest, NextResponse } from 'next/server';

const ALLOWED_ORIGIN = 'https://pl8.forgeofempires.com';

const corsHeaders = {
  'Access-Control-Allow-Origin': ALLOWED_ORIGIN,
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, X-API-Key',
};

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

  const parsedAmount = parseInvestmentAmountAdvanced(body.text);

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
      parsedAmount,
      parsedOk: parsedAmount !== null,
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
    records.map((r) => {
      const transformed = {
        ...r,
        id: r.id.toString(),
        msgId: r.msgId.toString(),
        conversationId: r.conversationId.toString(),
        playerId: r.playerId.toString(),
      };
      return transformed;
    }),
    {
      headers: corsHeaders,
    }
  );
}

export async function PATCH(req: NextRequest) {
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
  const { id, parsedAmount } = body;

  if (!id || parsedAmount === undefined) {
    return NextResponse.json(
      { ok: false, error: 'Missing id or parsedAmount' },
      {
        status: 400,
        headers: corsHeaders,
      }
    );
  }

  try {
    const record = await prisma.investment.update({
      where: { id: Number(id) },
      data: { parsedAmount: parsedAmount === null ? null : Number(parsedAmount) },
    });

    return NextResponse.json(
      {
        ok: true,
        data: {
          ...record,
          id: record.id.toString(),
          msgId: record.msgId.toString(),
          conversationId: record.conversationId.toString(),
          playerId: record.playerId.toString(),
        },
      },
      {
        headers: corsHeaders,
      }
    );
  } catch (error) {
    return NextResponse.json(
      { ok: false, error: 'Failed to update investment' },
      {
        status: 500,
        headers: corsHeaders,
      }
    );
  }
}

export async function DELETE(req: NextRequest) {
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

  try {
    const result = await prisma.investment.deleteMany();

    return NextResponse.json(
      {
        ok: true,
        deletedCount: result.count,
      },
      {
        headers: corsHeaders,
      }
    );
  } catch (error) {
    return NextResponse.json(
      { ok: false, error: 'Failed to delete investments' },
      {
        status: 500,
        headers: corsHeaders,
      }
    );
  }
}