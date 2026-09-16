import { NextRequest } from 'next/server';
import { searchGoogleFlights } from '@/lib/serpapi';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;

  const origin = searchParams.get('origin');
  const destination = searchParams.get('destination');
  const departDate = searchParams.get('depart_date');
  const returnDate = searchParams.get('return_date') || undefined;
  const currency = searchParams.get('currency') || 'EUR';

  if (!origin || !destination || !departDate) {
    return Response.json(
      { error: 'Thiếu thông tin: origin, destination, depart_date là bắt buộc' },
      { status: 400 }
    );
  }

  try {
    const results = await searchGoogleFlights({
      origin: origin.toUpperCase(),
      destination: destination.toUpperCase(),
      departDate,
      returnDate,
      currency,
    });

    return Response.json({
      success: true,
      data: {
        bestFlights: results.bestFlights,
        otherFlights: results.otherFlights,
      },
      priceInsights: results.priceInsights,
      meta: {
        origin,
        destination,
        departDate,
        returnDate,
        currency,
        totalResults: results.bestFlights.length + results.otherFlights.length,
        cached: results.cached,
        timestamp: new Date().toISOString(),
        source: 'google_flights',
      },
    });
  } catch (error) {
    console.error('Google Flights search error:', error);
    return Response.json(
      { error: 'Không thể tìm chuyến bay. Vui lòng thử lại.' },
      { status: 500 }
    );
  }
}
