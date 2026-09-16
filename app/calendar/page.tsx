'use client';

import { useState, useEffect, useCallback, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Header from '@/components/Header';
import { getAirport, COUNTRY_FLAGS, GERMAN_AIRPORTS, VIETNAM_AIRPORTS, ALL_AIRPORTS } from '@/lib/airports';
import { formatPrice, generateAffiliateLink } from '@/lib/affiliate';
import type { PriceCalendarDay } from '@/lib/types';
import styles from './page.module.css';

function CalendarContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [origin, setOrigin] = useState(searchParams.get('origin') || 'FRA');
  const [destination, setDestination] = useState(searchParams.get('destination') || 'SGN');
  const [currentMonth, setCurrentMonth] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 2).padStart(2, '0')}`;
  });
  const [calendarData, setCalendarData] = useState<PriceCalendarDay[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchCalendar = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const monthDate = `${currentMonth}-01`;
      const params = new URLSearchParams({
        origin,
        destination,
        month: monthDate,
        currency: 'EUR',
      });

      const res = await fetch(`/api/flights/calendar?${params.toString()}`);
      const data = await res.json();

      if (data.success) {
        setCalendarData(data.data);
      } else {
        setError(data.error || 'Không thể tải dữ liệu lịch giá');
      }
    } catch {
      setError('Lỗi kết nối. Vui lòng thử lại.');
    } finally {
      setIsLoading(false);
    }
  }, [origin, destination, currentMonth]);

  useEffect(() => {
    fetchCalendar();
  }, [fetchCalendar]);

  // Calendar rendering logic
  const year = parseInt(currentMonth.split('-')[0]);
  const month = parseInt(currentMonth.split('-')[1]) - 1;
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const adjustedFirstDay = firstDay === 0 ? 6 : firstDay - 1; // Monday start

  const monthNames = [
    'Tháng 1', 'Tháng 2', 'Tháng 3', 'Tháng 4', 'Tháng 5', 'Tháng 6',
    'Tháng 7', 'Tháng 8', 'Tháng 9', 'Tháng 10', 'Tháng 11', 'Tháng 12'
  ];

  const dayNames = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'];

  // Map prices to days
  const dayPrices: Record<number, PriceCalendarDay> = {};
  calendarData.forEach(item => {
    const day = new Date(item.date).getDate();
    dayPrices[day] = item;
  });

  // Find cheapest and most expensive for color scaling
  const prices = calendarData.filter(d => d.price !== null).map(d => d.price as number);
  const minPrice = prices.length > 0 ? Math.min(...prices) : 0;
  const maxPrice = prices.length > 0 ? Math.max(...prices) : 0;

  const getPriceColor = (price: number): string => {
    if (maxPrice === minPrice) return 'var(--color-success)';
    const ratio = (price - minPrice) / (maxPrice - minPrice);
    if (ratio <= 0.3) return 'var(--color-success)';
    if (ratio <= 0.6) return 'var(--color-warning)';
    return 'var(--color-danger)';
  };

  const navigateMonth = (direction: number) => {
    const date = new Date(year, month + direction, 1);
    setCurrentMonth(`${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`);
  };

  const originAirport = getAirport(origin);
  const destAirport = getAirport(destination);

  return (
    <>
      <Header />
      <main className={styles.main}>
        <div className="container">
          {/* Page Header */}
          <div className={styles.pageHeader}>
            <h1 className={styles.pageTitle}>
              📅 Lịch Giá Vé
            </h1>
            <p className={styles.pageSubtitle}>
              Xem giá rẻ nhất theo từng ngày trong tháng
            </p>
          </div>

          {/* Route selector */}
          <div className={styles.controlBar}>
            <div className={styles.routeSelect}>
              <select
                className="input-field"
                value={origin}
                onChange={(e) => setOrigin(e.target.value)}
              >
                <optgroup label="🇩🇪 Đức">
                  {GERMAN_AIRPORTS.map(a => (
                    <option key={a.code} value={a.code}>
                      {COUNTRY_FLAGS[a.country_code]} {a.city_vi} ({a.code})
                    </option>
                  ))}
                </optgroup>
                <optgroup label="🇻🇳 Việt Nam">
                  {VIETNAM_AIRPORTS.map(a => (
                    <option key={a.code} value={a.code}>
                      {COUNTRY_FLAGS[a.country_code]} {a.city_vi} ({a.code})
                    </option>
                  ))}
                </optgroup>
              </select>

              <span className={styles.routeSelectArrow}>→</span>

              <select
                className="input-field"
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
              >
                <optgroup label="🇻🇳 Việt Nam">
                  {VIETNAM_AIRPORTS.map(a => (
                    <option key={a.code} value={a.code}>
                      {COUNTRY_FLAGS[a.country_code]} {a.city_vi} ({a.code})
                    </option>
                  ))}
                </optgroup>
                <optgroup label="🇩🇪 Đức">
                  {GERMAN_AIRPORTS.map(a => (
                    <option key={a.code} value={a.code}>
                      {COUNTRY_FLAGS[a.country_code]} {a.city_vi} ({a.code})
                    </option>
                  ))}
                </optgroup>
              </select>
            </div>
          </div>

          {/* Month navigation */}
          <div className={styles.monthNav}>
            <button
              className="btn btn-ghost"
              onClick={() => navigateMonth(-1)}
            >
              ← Tháng trước
            </button>
            <h2 className={styles.monthTitle}>
              {monthNames[month]} {year}
            </h2>
            <button
              className="btn btn-ghost"
              onClick={() => navigateMonth(1)}
            >
              Tháng sau →
            </button>
          </div>

          {/* Legend */}
          <div className={styles.legend}>
            <div className={styles.legendItem}>
              <span className={styles.legendDot} style={{ background: 'var(--color-success)' }} />
              <span>Giá rẻ</span>
            </div>
            <div className={styles.legendItem}>
              <span className={styles.legendDot} style={{ background: 'var(--color-warning)' }} />
              <span>Giá trung bình</span>
            </div>
            <div className={styles.legendItem}>
              <span className={styles.legendDot} style={{ background: 'var(--color-danger)' }} />
              <span>Giá cao</span>
            </div>
          </div>

          {/* Calendar Grid */}
          {isLoading ? (
            <div className={styles.loadingState}>
              <div className={styles.loadingSpinner}>📅</div>
              <p>Đang tải lịch giá...</p>
            </div>
          ) : error ? (
            <div className={styles.errorState}>
              <p>😞 {error}</p>
              <button className="btn btn-primary" onClick={fetchCalendar}>
                🔄 Thử lại
              </button>
            </div>
          ) : (
            <div className={styles.calendar}>
              {/* Day headers */}
              {dayNames.map(day => (
                <div key={day} className={styles.calendarDayHeader}>
                  {day}
                </div>
              ))}

              {/* Empty cells before first day */}
              {Array.from({ length: adjustedFirstDay }, (_, i) => (
                <div key={`empty-${i}`} className={styles.calendarDayEmpty} />
              ))}

              {/* Day cells */}
              {Array.from({ length: daysInMonth }, (_, i) => {
                const day = i + 1;
                const dayData = dayPrices[day];
                const hasPrice = dayData?.price != null;
                const isCheapest = hasPrice && dayData.price === minPrice;
                const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

                return (
                  <div
                    key={day}
                    className={`${styles.calendarDay} ${hasPrice ? styles.calendarDayHasPrice : ''} ${isCheapest ? styles.calendarDayCheapest : ''}`}
                    onClick={() => {
                      if (hasPrice) {
                        const url = generateAffiliateLink(origin, destination, dateStr);
                        window.open(url, '_blank');
                      }
                    }}
                    style={hasPrice ? { cursor: 'pointer' } : undefined}
                  >
                    <span className={styles.dayNumber}>{day}</span>
                    {hasPrice && (
                      <span
                        className={styles.dayPrice}
                        style={{ color: getPriceColor(dayData.price as number) }}
                      >
                        {formatPrice(dayData.price as number)}
                      </span>
                    )}
                    {isCheapest && (
                      <span className={styles.cheapestLabel}>🏷️</span>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* Cheapest day callout */}
          {!isLoading && minPrice > 0 && (
            <div className={styles.cheapestCallout}>
              <span className={styles.cheapestCalloutIcon}>🏷️</span>
              <div className={styles.cheapestCalloutText}>
                <strong>Ngày rẻ nhất:</strong> {formatPrice(minPrice)} cho tuyến{' '}
                {originAirport?.city_vi || origin} → {destAirport?.city_vi || destination}
              </div>
            </div>
          )}
        </div>
      </main>
    </>
  );
}

export default function CalendarPage() {
  return (
    <Suspense fallback={
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        color: 'var(--color-text-secondary)',
      }}>
        📅 Đang tải...
      </div>
    }>
      <CalendarContent />
    </Suspense>
  );
}
