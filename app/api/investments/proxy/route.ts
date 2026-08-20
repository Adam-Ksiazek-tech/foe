import { NextRequest, NextResponse } from 'next/server';

const API_KEY = process.env.API_SECRET_KEY_FOR_PLUGIN;

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const startDate = searchParams.get('startDate');
  const endDate = searchParams.get('endDate');

  try {
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);

    // Użyj req.headers.host zamiast req.nextUrl.origin
    const host = req.headers.get('host');
    const protocol = req.headers.get('x-forwarded-proto') || 'https';
    const baseUrl = `${protocol}://${host}`;
    
    const exportUrl = `${baseUrl}/api/investments/export?${params.toString()}`;

    const response = await fetch(exportUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'text/plain',
        'X-API-Key': API_KEY || '',
      },
    });

    if (!response.ok) {
      return NextResponse.json(
        { ok: false, error: `Failed to export: ${response.status}` },
        { status: response.status }
      );
    }

    const text = await response.text();

    return new NextResponse(text, {
      status: 200,
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Content-Disposition': `attachment; filename="diaxowanie-ranking_${startDate}_do_${endDate}.txt"`,
      },
    });
  } catch (error) {
    console.error('Proxy export error:', error);
    return NextResponse.json(
      { ok: false, error: 'Failed to export ranking' },
      { status: 500 }
    );
  }
}