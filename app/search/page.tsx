'use client';

import { useState, useEffect, useCallback, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Header from '@/components/Header';
import SearchForm from '@/components/SearchForm';
import FlightCard from '@/components/FlightCard';
import { getAirport, COUNTRY_FLAGS } from '@/lib/airports';
import type { FlightResult } from '@/lib/types';
import styles from './page.module.css';

function SearchResults() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [results, setResults] = useState<FlightResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const origin = searchParams.get('origin') || 'FRA';
  const destination = searchParams.get('destination') || 'SGN';
  const departDate = searchParams.get('depart_date') || '';
  const returnDate = searchParams.get('return_date') || '';

  const originAirport = getAirport(origin);
  const destAirport = getAirport(destination);

  const fetchResults = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams({ origin, destination, currency: 'EUR' });
      if (departDate) params.set('depart_date', departDate);
      if (returnDate) params.set('return_date', returnDate);

      const res = await fetch(`/api/flights/search?${params.toString()}`);
      const data = await res.json();

      if (data.success) {
        setResults(data.data);
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

  const cheapestPrice = results.length > 0 ? Math.min(...results.map(r => r.price)) : undefined;

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
                  {originAirport ? COUNTRY_FLAGS[originAirport.country_code] : ''}
                </span>
                <span className={styles.routeCode}>{origin}</span>
                <span className={styles.routeCity}>
                  {originAirport?.city_vi || origin}
                </span>
              </div>
              <div className={styles.routeArrowBig}>
                <div className={styles.routeDash} />
                <span>✈️</span>
                <div className={styles.routeDash} />
              </div>
              <div className={styles.routeEndpoint}>
                <span className={styles.routeFlag}>
                  {destAirport ? COUNTRY_FLAGS[destAirport.country_code] : ''}
                </span>
                <span className={styles.routeCode}>{destination}</span>
                <span className={styles.routeCity}>
                  {destAirport?.city_vi || destination}
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* Results */}
        <section className={styles.resultsSection}>
          <div className="container">
            {isLoading && (
              <div className={styles.loadingState}>
                <div className={styles.loadingSpinner}>✈️</div>
                <p>Đang tìm giá tốt nhất cho bạn...</p>
              </div>
            )}

            {error && !isLoading && (
              <div className={styles.errorState}>
                <p className={styles.errorIcon}>😞</p>
                <p className={styles.errorMessage}>{error}</p>
                <p className={styles.errorHint}>
                  Hãy thử thay đổi ngày bay hoặc điểm đến. Nếu bạn chưa cấu hình API token,
                  hãy thêm <code>TRAVELPAYOUTS_API_TOKEN</code> vào file <code>.env.local</code>
                </p>
                <button className="btn btn-primary" onClick={fetchResults}>
                  🔄 Thử lại
                </button>
              </div>
            )}

            {!isLoading && !error && results.length === 0 && (
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

            {!isLoading && results.length > 0 && (
              <>
                <div className={styles.resultsHeader}>
                  <h2>
                    Tìm thấy <span className="text-gradient">{results.length}</span> chuyến bay
                  </h2>
                  <span className={styles.sortLabel}>
                    Sắp xếp: Giá thấp nhất
                  </span>
                </div>

                <div className={styles.resultsList}>
                  {results.map((flight, index) => (
                    <FlightCard
                      key={flight.id}
                      flight={flight}
                      cheapestPrice={cheapestPrice}
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
