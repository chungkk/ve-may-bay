'use client';

import { useState, useEffect, useCallback, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Header from '@/components/Header';
import { getAirport, getAirlineLogo, getAirlineName, COUNTRY_FLAGS, GERMAN_AIRPORTS, VIETNAM_AIRPORTS, ALL_AIRPORTS } from '@/lib/airports';
import { formatPrice, formatDate, getStopsLabel, generateAffiliateLink } from '@/lib/affiliate';
import type { PriceCalendarDay, FlightResult } from '@/lib/types';
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

  // Day detail popup state
  const [selectedDay, setSelectedDay] = useState<string | null>(null);
  const [dayFlights, setDayFlights] = useState<FlightResult[]>([]);
  const [isDayLoading, setIsDayLoading] = useState(false);

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

  // Fetch flight details for a specific day
  const fetchDayFlights = async (dateStr: string) => {
    setSelectedDay(dateStr);
    setIsDayLoading(true);
    setDayFlights([]);

    try {
      const params = new URLSearchParams({
        origin,
        destination,
        depart_date: dateStr,
        currency: 'EUR',
      });

      const res = await fetch(`/api/flights/search?${params.toString()}`);
      const data = await res.json();

      if (data.success) {
        setDayFlights(data.data);
      }
    } catch {
      // silently fail
    } finally {
      setIsDayLoading(false);
    }
  };

  const closeDayPopup = () => {
    setSelectedDay(null);
    setDayFlights([]);
  };

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
              Xem giá rẻ nhất theo từng ngày — bấm vào ngày để xem chi tiết chuyến bay
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
                        fetchDayFlights(dateStr);
                      }
                    }}
                    style={hasPrice ? { cursor: 'pointer' } : undefined}
                  >
                    <span className={styles.dayNumber}>{day}</span>
                    {hasPrice && (
                      <>
                        <span
                          className={styles.dayPrice}
                          style={{ color: getPriceColor(dayData.price as number) }}
                        >
                          {formatPrice(dayData.price as number)}
                        </span>
                        <span className={styles.dayStops}>
                          {dayData.stops === 0 ? '✈ thẳng' : `${dayData.stops} dừng`}
                        </span>
                      </>
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

        {/* Day Detail Popup */}
        {selectedDay && (
          <div className={styles.popupOverlay} onClick={closeDayPopup}>
            <div className={styles.popupContent} onClick={(e) => e.stopPropagation()}>
              <div className={styles.popupHeader}>
                <h3 className={styles.popupTitle}>
                  ✈️ Chuyến bay ngày {formatDate(selectedDay)}
                </h3>
                <span className={styles.popupRoute}>
                  {originAirport?.city_vi || origin} → {destAirport?.city_vi || destination}
                </span>
                <button className={styles.popupClose} onClick={closeDayPopup}>✕</button>
              </div>

              <div className={styles.popupBody}>
                {isDayLoading ? (
                  <div className={styles.popupLoading}>
                    <span>✈️</span> Đang tìm chuyến bay...
                  </div>
                ) : dayFlights.length === 0 ? (
                  <div className={styles.popupEmpty}>
                    Không tìm thấy chuyến bay cho ngày này.
                  </div>
                ) : (
                  <div className={styles.popupFlightList}>
                    {dayFlights.map((flight) => (
                      <div key={flight.id} className={styles.popupFlight}>
                        <div className={styles.popupFlightAirline}>
                          <img
                            src={getAirlineLogo(flight.airline)}
                            alt={getAirlineName(flight.airline)}
                            width={32}
                            height={32}
                            className={styles.popupAirlineLogo}
                          />
                          <div>
                            <div className={styles.popupAirlineName}>
                              {getAirlineName(flight.airline)}
                            </div>
                            <div className={styles.popupFlightNumber}>
                              {flight.airline}{flight.flightNumber}
                            </div>
                          </div>
                        </div>

                        <div className={styles.popupFlightRoute}>
                          <span className={styles.popupRouteCode}>{flight.origin}</span>
                          <span className={styles.popupRouteArrow}>→</span>
                          <span className={styles.popupRouteCode}>{flight.destination}</span>
                          <span className={`badge ${
                            flight.stops === 0 ? 'badge-success' :
                            flight.stops === 1 ? 'badge-warning' : 'badge-danger'
                          }`}>
                            {getStopsLabel(flight.stops)}
                          </span>
                        </div>

                        <div className={styles.popupFlightDates}>
                          <div>🛫 {formatDate(flight.departureAt)}</div>
                          {flight.returnAt && (
                            <div>🛬 {formatDate(flight.returnAt)}</div>
                          )}
                        </div>

                        <div className={styles.popupFlightPrice}>
                          <span className={styles.popupPrice}>
                            {formatPrice(flight.price, flight.currency)}
                          </span>
                          <a
                            href={flight.affiliateUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="btn btn-primary btn-sm"
                          >
                            Đặt vé →
                          </a>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
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
