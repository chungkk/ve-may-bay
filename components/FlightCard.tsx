import { getAirlineLogo, getAirlineName } from '@/lib/airports';
import { formatPrice, formatDate, getStopsLabel, getPriceLevel } from '@/lib/affiliate';
import type { FlightResult } from '@/lib/types';
import styles from './FlightCard.module.css';

interface FlightCardProps {
  flight: FlightResult;
  cheapestPrice?: number;
  index?: number;
  onSetAlert?: (flight: FlightResult) => void;
}

export default function FlightCard({ flight, cheapestPrice, index = 0, onSetAlert }: FlightCardProps) {
  const priceLevel = cheapestPrice ? getPriceLevel(flight.price, cheapestPrice) : 'cheap';
  const isCheapest = cheapestPrice !== undefined && flight.price === cheapestPrice;

  return (
    <div
      className={`${styles.card} animate-slideUp`}
      style={{ animationDelay: `${index * 0.08}s` }}
    >
      {isCheapest && (
        <div className={styles.cheapestBadge}>
          <span>🏷️ Giá rẻ nhất</span>
        </div>
      )}

      <div className={styles.cardContent}>
        {/* Airline */}
        <div className={styles.airline}>
          <img
            src={getAirlineLogo(flight.airline)}
            alt={getAirlineName(flight.airline)}
            className={styles.airlineLogo}
            width={36}
            height={36}
            loading="lazy"
          />
          <div className={styles.airlineInfo}>
            <span className={styles.airlineName}>{getAirlineName(flight.airline)}</span>
            <span className={styles.flightNumber}>
              {flight.airline}{flight.flightNumber}
            </span>
          </div>
        </div>

        {/* Route */}
        <div className={styles.route}>
          <div className={styles.routePoint}>
            <span className={styles.routeCode}>{flight.origin}</span>
            <span className={styles.routeDate}>{formatDate(flight.departureAt)}</span>
          </div>
          <div className={styles.routeLine}>
            <div className={styles.routeLineInner} />
            <span className={`badge ${
              flight.stops === 0 ? 'badge-success' : 
              flight.stops === 1 ? 'badge-warning' : 'badge-danger'
            } ${styles.stopsLabel}`}>
              {getStopsLabel(flight.stops)}
            </span>
            <div className={styles.planeIcon}>✈</div>
          </div>
          <div className={styles.routePoint}>
            <span className={styles.routeCode}>{flight.destination}</span>
            {flight.returnAt && (
              <span className={styles.routeDate}>{formatDate(flight.returnAt)}</span>
            )}
          </div>
        </div>

        {/* Price & Action */}
        <div className={styles.priceSection}>
          <div className={`price-tag price-tag--${priceLevel}`}>
            {formatPrice(flight.price, flight.currency)}
          </div>
          <span className={styles.priceLabel}>
            {flight.returnAt ? 'Khứ hồi / người' : 'Một chiều / người'}
          </span>

          <div className={styles.actions}>
            <a
              href={flight.affiliateUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-primary"
            >
              Đặt vé ngay →
            </a>
            {onSetAlert && (
              <button
                type="button"
                className="btn btn-ghost btn-sm"
                onClick={() => onSetAlert(flight)}
              >
                🔔 Theo dõi giá
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
