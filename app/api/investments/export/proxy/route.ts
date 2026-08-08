import { NextRequest, NextResponse } from 'next/server';

const API_KEY = process.env.API_SECRET_KEY_FOR_PLUGIN;

export async function GET(req: NextRequest) {
  try {
    const response = await fetch(
      `${req.nextUrl.origin}/api/investments/export`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'text/plain',
          'X-API-Key': API_KEY || '',
        },
      }
    );

    if (!response.ok) {
      return NextResponse.json(
        { ok: false, error: 'Failed to export' },
        { status: response.status }
      );
    }

    const text = await response.text();

    return new NextResponse(text, {
      status: 200,
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Content-Disposition': 'attachment; filename="diaxowanie-ranking.txt"',
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