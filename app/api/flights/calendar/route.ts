import { NextRequest } from 'next/server';
import { fetchMonthMatrix } from '@/lib/travelpayouts';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;

  const origin = searchParams.get('origin');
  const destination = searchParams.get('destination');
  const month = searchParams.get('month'); // YYYY-MM-DD format
  const currency = searchParams.get('currency') || 'EUR';

  if (!origin || !destination) {
    return Response.json(
      { error: 'Missing required parameters: origin, destination' },
      { status: 400 }
    );
  }

  try {
    const results = await fetchMonthMatrix({
      origin: origin.toUpperCase(),
      destination: destination.toUpperCase(),
      departDate: month || undefined,
      currency,
    });

    // Find cheapest day
    const cheapestDay = results.reduce((cheapest, day) => {
      if (!cheapest || (day.price && day.price < (cheapest.price || Infinity))) {
        return day;
      }
      return cheapest;
    }, results[0] || null);

    return Response.json({
      success: true,
      data: results,
      meta: {
        origin,
        destination,
        month,
        currency,
        count: results.length,
        cheapestDay: cheapestDay || null,
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error('Calendar data error:', error);
    return Response.json(
      { error: 'Failed to fetch calendar data' },
      { status: 500 }
    );
  }
}
