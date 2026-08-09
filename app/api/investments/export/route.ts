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

  const { searchParams } = req.nextUrl;
  const startDate = searchParams.get('startDate');
  const endDate = searchParams.get('endDate');

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

    // Filtruj po zakresie dat
    let filtered = investments;
    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);

      filtered = investments.filter((inv: any) => {
        const invDate = new Date(inv.beautyDate);
        return invDate >= start && invDate <= end;
      });
    }

    // Zsumuj po graczach
    const ranking: Record<string, number> = {};

    filtered.forEach((inv: any) => {
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

    const dateRange = startDate && endDate ? ` (${startDate} do ${endDate})` : '';
    const txt = [
      '=== RANKING DIAXOWANIA ===',
      new Date().toLocaleString('pl-PL') + dateRange,
      '',
      ...sorted,
      '',
      `Razem: ${sorted.length} graczy`,
      `Inwestycji: ${filtered.length}`,
    ].join('\n');

    return new NextResponse(txt, {
      status: 200,
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Content-Disposition': `attachment; filename="diaxowanie-ranking_${startDate}_do_${endDate}.txt"`,
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