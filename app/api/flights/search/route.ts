import { NextRequest } from 'next/server';
import { fetchCheapTickets } from '@/lib/travelpayouts';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;

  const origin = searchParams.get('origin');
  const destination = searchParams.get('destination');
  const departDate = searchParams.get('depart_date') || undefined;
  const returnDate = searchParams.get('return_date') || undefined;
  const currency = searchParams.get('currency') || 'EUR';

  if (!origin || !destination) {
    return Response.json(
      { error: 'Missing required parameters: origin, destination' },
      { status: 400 }
    );
  }

  try {
    const results = await fetchCheapTickets({
      origin: origin.toUpperCase(),
      destination: destination.toUpperCase(),
      departDate,
      returnDate,
      currency,
    });

    return Response.json({
      success: true,
      data: results,
      meta: {
        origin,
        destination,
        departDate,
        returnDate,
        currency,
        count: results.length,
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error('Flight search error:', error);
    return Response.json(
      { error: 'Failed to fetch flight data' },
      { status: 500 }
    );
  }
}
