'use client';

import { useState, useEffect, useCallback, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Header from '@/components/Header';
import SearchForm from '@/components/SearchForm';
import RealTimeFlightCard from '@/components/RealTimeFlightCard';
import { getAirport, COUNTRY_FLAGS, COUNTRY_GROUPS } from '@/lib/airports';
import { formatPrice } from '@/lib/affiliate';
import type { RealTimeFlightResult } from '@/lib/serpapi';
import styles from './page.module.css';

function SearchResults() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [bestFlights, setBestFlights] = useState<RealTimeFlightResult[]>([]);
  const [otherFlights, setOtherFlights] = useState<RealTimeFlightResult[]>([]);
  const [priceInsights, setPriceInsights] = useState<{
    lowestPrice: number;
    priceLevel: string;
    typicalRange: [number, number];
  } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const origin = searchParams.get('origin') || 'FRA';
  const destination = searchParams.get('destination') || 'SGN';
  const departDate = searchParams.get('depart_date') || '';
  const returnDate = searchParams.get('return_date') || '';

  const getEndpointDisplay = (code: string) => {
    const group = COUNTRY_GROUPS[code];
    if (group) {
      return { flag: group.flag, code: group.flag, city: group.label_vi };
    }
    const airport = getAirport(code);
    if (airport) {
      return {
        flag: COUNTRY_FLAGS[airport.country_code] || '',
        code: code,
        city: airport.city_vi,
      };
    }
    return { flag: '', code: code, city: code };
  };

  const originDisplay = getEndpointDisplay(origin);
  const destDisplay = getEndpointDisplay(destination);

  const fetchResults = useCallback(async () => {
    if (!departDate) return;

    setIsLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams({
        origin,
        destination,
        depart_date: departDate,
        currency: 'EUR',
      });
      if (returnDate) params.set('return_date', returnDate);

      const res = await fetch(`/api/flights/realtime?${params.toString()}`);
      const data = await res.json();

      if (data.success) {
        setBestFlights(data.data.bestFlights);
        setOtherFlights(data.data.otherFlights);
        setPriceInsights(data.priceInsights || null);
      } else {
        setError(data.error || 'Không thể tìm chuyến bay');
      }
    } catch {
      setError('Lỗi kết nối. Vui lòng thử lại.');
    } finally {
      setIsLoading(false);
    }
  }, [origin, destination, departDate, returnDate]);

  useEffect(() => {
    fetchResults();
  }, [fetchResults]);

  const handleSearch = (o: string, d: string, dep: string, ret: string) => {
    const params = new URLSearchParams({
      origin: o,
      destination: d,
      ...(dep && { depart_date: dep }),
      ...(ret && { return_date: ret }),
    });
    router.push(`/search?${params.toString()}`);
  };

  const totalResults = bestFlights.length + otherFlights.length;

  return (
    <>
      <Header />
      <main className={styles.main}>
        {/* Compact search form */}
        <section className={styles.searchSection}>
          <div className="container">
            <div className={styles.searchCard}>
              <SearchForm onSearch={handleSearch} isLoading={isLoading} compact />
            </div>
          </div>
        </section>

        {/* Route header */}
        <section className={styles.routeHeader}>
          <div className="container">
            <div className={styles.routeInfo}>
              <div className={styles.routeEndpoint}>
                <span className={styles.routeFlag}>
                  {originDisplay.flag}
                </span>
                <span className={styles.routeCode}>{originDisplay.code}</span>
                <span className={styles.routeCity}>
                  {originDisplay.city}
                </span>
              </div>
              <div className={styles.routeArrowBig}>
                <div className={styles.routeDash} />
                <span>✈️</span>
                <div className={styles.routeDash} />
              </div>
              <div className={styles.routeEndpoint}>
                <span className={styles.routeFlag}>
                  {destDisplay.flag}
                </span>
                <span className={styles.routeCode}>{destDisplay.code}</span>
                <span className={styles.routeCity}>
                  {destDisplay.city}
                </span>
              </div>
            </div>

            {/* Source badge */}
            <div style={{ textAlign: 'center', marginTop: 'var(--space-2)' }}>
              <span className="badge badge-success" style={{ fontSize: '10px' }}>
                🔴 LIVE — Dữ liệu thời gian thực từ Google Flights
              </span>
            </div>
          </div>
        </section>

        {/* Price Insights */}
        {priceInsights && !isLoading && (
          <section style={{ padding: '0 0 var(--space-4)' }}>
            <div className="container">
              <div className={styles.priceInsights}>
                <span>💡 Giá thấp nhất: <strong>{formatPrice(priceInsights.lowestPrice)}</strong></span>
                <span>📊 Mức giá: <strong>{priceInsights.priceLevel === 'low' ? '🟢 Rẻ' : priceInsights.priceLevel === 'typical' ? '🟡 Trung bình' : '🔴 Cao'}</strong></span>
                {priceInsights.typicalRange && (
                  <span>📈 Giá thường: <strong>{formatPrice(priceInsights.typicalRange[0])} — {formatPrice(priceInsights.typicalRange[1])}</strong></span>
                )}
              </div>
            </div>
          </section>
        )}

        {/* Results */}
        <section className={styles.resultsSection}>
          <div className="container">
            {isLoading && (
              <div className={styles.loadingState}>
                <div className={styles.loadingSpinner}>✈️</div>
                <p>Đang tìm chuyến bay real-time...</p>
                <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>
                  Đang kết nối Google Flights...
                </p>
              </div>
            )}

            {error && !isLoading && (
              <div className={styles.errorState}>
                <p className={styles.errorIcon}>😞</p>
                <p className={styles.errorMessage}>{error}</p>
                <p className={styles.errorHint}>
                  Hãy thử thay đổi ngày bay hoặc điểm đến.
                </p>
                <button className="btn btn-primary" onClick={fetchResults}>
                  🔄 Thử lại
                </button>
              </div>
            )}

            {!isLoading && !error && totalResults === 0 && departDate && (
              <div className={styles.emptyState}>
                <p className={styles.emptyIcon}>🔍</p>
                <p className={styles.emptyMessage}>
                  Không tìm thấy chuyến bay nào cho tuyến này.
                </p>
                <p className={styles.emptyHint}>
                  Hãy thử thay đổi ngày bay hoặc chọn tuyến khác.
                </p>
              </div>
            )}

            {!isLoading && !error && !departDate && (
              <div className={styles.emptyState}>
                <p className={styles.emptyIcon}>📅</p>
                <p className={styles.emptyMessage}>
                  Chọn ngày đi để bắt đầu tìm kiếm.
                </p>
              </div>
            )}

            {/* Best flights */}
            {!isLoading && bestFlights.length > 0 && (
              <>
                <div className={styles.resultsHeader}>
                  <h2>
                    ⭐ Chuyến bay <span className="text-gradient">tốt nhất</span>
                  </h2>
                </div>
                <div className={styles.resultsList}>
                  {bestFlights.map((flight, index) => (
                    <RealTimeFlightCard
                      key={flight.id}
                      flight={flight}
                      index={index}
                    />
                  ))}
                </div>
              </>
            )}

            {/* Other flights */}
            {!isLoading && otherFlights.length > 0 && (
              <>
                <div className={styles.resultsHeader} style={{ marginTop: 'var(--space-8)' }}>
                  <h2>
                    Tìm thấy <span className="text-gradient">{otherFlights.length}</span> chuyến bay khác
                  </h2>
                  <span className={styles.sortLabel}>
                    Sắp xếp: Giá thấp nhất
                  </span>
                </div>
                <div className={styles.resultsList}>
                  {otherFlights.map((flight, index) => (
                    <RealTimeFlightCard
                      key={flight.id}
                      flight={flight}
                      index={index}
                    />
                  ))}
                </div>
              </>
            )}
          </div>
        </section>
      </main>
    </>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        color: 'var(--color-text-secondary)'
      }}>
        ✈️ Đang tải...
      </div>
    }>
      <SearchResults />
    </Suspense>
  );
}
