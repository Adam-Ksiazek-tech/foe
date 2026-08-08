import { NextRequest, NextResponse } from 'next/server';

const API_KEY = process.env.API_SECRET_KEY_FOR_PLUGIN;

export async function GET(req: NextRequest) {
  const apiKey = req.headers.get('x-api-key');

  if (apiKey !== API_KEY) {
    return NextResponse.json(
      { ok: false, error: 'Unauthorized' },
      { status: 401 }
    );
  }

  try {
    const response = await fetch(
      `${req.nextUrl.origin}/api/investments`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': API_KEY || '',
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch investments`);
    }

    const investments = await response.json();

    // Zsumuj po graczach
    const ranking: Record<string, number> = {};

    investments.forEach((inv: any) => {
      if (inv.parsedAmount && inv.parsedAmount > 0) {
        if (!ranking[inv.playerName]) {
          ranking[inv.playerName] = 0;
        }
        ranking[inv.playerName] += inv.parsedAmount;
      }
    });

    // Sortuj malejąco
    const sorted = Object.entries(ranking)
      .sort((a, b) => b[1] - a[1])
      .map(([name, amount], index) => `${index + 1}. ${name}: ${amount.toLocaleString('pl-PL')}`);

    const txt = [
      '=== RANKING DIAXOWANIA ===',
      new Date().toLocaleString('pl-PL'),
      '',
      ...sorted,
      '',
      `Razem: ${sorted.length} graczy`,
    ].join('\n');

    return new NextResponse(txt, {
      status: 200,
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Content-Disposition': 'attachment; filename="diaxowanie-ranking.txt"',
      },
    });
  } catch (error) {
    console.error('Export error:', error);
    return NextResponse.json(
      { ok: false, error: 'Failed to generate ranking' },
      { status: 500 }
    );
  }
}