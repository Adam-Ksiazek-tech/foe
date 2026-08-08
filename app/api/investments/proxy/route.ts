import { NextRequest, NextResponse } from 'next/server';

const INVESTMENTS_API = '/api/investments'; // Wewnętrzny endpoint
const API_KEY = process.env.API_SECRET_KEY_FOR_PLUGIN;

export async function GET(req: NextRequest) {
  try {
    // Pobiera dane z wewnętrznego API z kluczem
    const response = await fetch(
      `${req.nextUrl.origin}${INVESTMENTS_API}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': API_KEY || '',
        },
      }
    );

    if (!response.ok) {
      return NextResponse.json(
        { ok: false, error: `API error: ${response.status}` },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Proxy error:', error);
    return NextResponse.json(
      { ok: false, error: 'Failed to fetch investments' },
      { status: 500 }
    );
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();

    const response = await fetch(
      `${req.nextUrl.origin}${INVESTMENTS_API}`,
      {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': API_KEY || '',
        },
        body: JSON.stringify(body),
      }
    );

    if (!response.ok) {
      return NextResponse.json(
        { ok: false, error: `API error: ${response.status}` },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Proxy error:', error);
    return NextResponse.json(
      { ok: false, error: 'Failed to update investment' },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const response = await fetch(
      `${req.nextUrl.origin}/api/investments`,
      {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': API_KEY || '',
        },
      }
    );

    if (!response.ok) {
      return NextResponse.json(
        { ok: false, error: `API error: ${response.status}` },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Proxy error:', error);
    return NextResponse.json(
      { ok: false, error: 'Failed to delete investments' },
      { status: 500 }
    );
  }
}