import { NextRequest } from 'next/server';
import { fetchCheapTickets } from '@/lib/travelpayouts';
import { resolveAirportCodes } from '@/lib/airports';
import type { FlightResult } from '@/lib/types';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;

  const originParam = searchParams.get('origin');
  const destinationParam = searchParams.get('destination');
  const departDate = searchParams.get('depart_date') || undefined;
  const returnDate = searchParams.get('return_date') || undefined;
  const currency = searchParams.get('currency') || 'EUR';

  if (!originParam || !destinationParam) {
    return Response.json(
      { error: 'Missing required parameters: origin, destination' },
      { status: 400 }
    );
  }

  try {
    // Resolve country groups to individual airport codes
    const origins = resolveAirportCodes(originParam.toUpperCase());
    const destinations = resolveAirportCodes(destinationParam.toUpperCase());

    // Build all origin-destination pairs
    const pairs: Array<{ origin: string; destination: string }> = [];
    for (const o of origins) {
      for (const d of destinations) {
        if (o !== d) {
          pairs.push({ origin: o, destination: d });
        }
      }
    }

    // Fetch all pairs in parallel (max 5 concurrent)
    const allResults: FlightResult[] = [];
    const chunks: Array<typeof pairs> = [];
    for (let i = 0; i < pairs.length; i += 5) {
      chunks.push(pairs.slice(i, i + 5));
    }

    for (const chunk of chunks) {
      const promises = chunk.map(async (pair) => {
        try {
          return await fetchCheapTickets({
            origin: pair.origin,
            destination: pair.destination,
            departDate,
            returnDate,
            currency,
          });
        } catch (err) {
          console.error(`Error fetching ${pair.origin}->${pair.destination}:`, err);
          return [];
        }
      });

      const chunkResults = await Promise.all(promises);
      for (const results of chunkResults) {
        allResults.push(...results);
      }
    }

    // Deduplicate by id and sort by price
    const seen = new Set<string>();
    const uniqueResults = allResults.filter((r) => {
      if (seen.has(r.id)) return false;
      seen.add(r.id);
      return true;
    });
    uniqueResults.sort((a, b) => a.price - b.price);

    return Response.json({
      success: true,
      data: uniqueResults,
      meta: {
        origin: originParam,
        destination: destinationParam,
        origins,
        destinations,
        pairsSearched: pairs.length,
        departDate,
        returnDate,
        currency,
        count: uniqueResults.length,
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
