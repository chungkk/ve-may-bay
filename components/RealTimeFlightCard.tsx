import type { RealTimeFlightResult } from '@/lib/serpapi';
import { formatDuration } from '@/lib/serpapi';
import { formatPrice, generateAffiliateLink } from '@/lib/affiliate';
import styles from './RealTimeFlightCard.module.css';

interface Props {
  flight: RealTimeFlightResult;
  index?: number;
}

export default function RealTimeFlightCard({ flight, index = 0 }: Props) {
  const stopsLabel = flight.stops === 0
    ? 'Bay thẳng'
    : `${flight.stops} điểm dừng`;

  const stopsClass = flight.stops === 0
    ? 'badge-success'
    : flight.stops === 1
    ? 'badge-warning'
    : 'badge-danger';

  return (
    <div
      className={`${styles.card} ${flight.isBest ? styles.bestFlight : ''} animate-slideUp`}
      style={{ animationDelay: `${index * 0.06}s` }}
    >
      {/* Best flight badge */}
      {flight.isBest && (
        <div className={styles.bestBadge}>
          ⭐ Chuyến bay tốt nhất
        </div>
      )}

      <div className={styles.cardBody}>
        {/* Main flight info */}
        <div className={styles.mainInfo}>
          {/* Each leg */}
          {flight.legs.map((leg, i) => (
            <div key={i} className={styles.legRow}>
              {/* Airline */}
              <div className={styles.airline}>
                <img
                  src={leg.airlineLogo}
                  alt={leg.airline}
                  width={28}
                  height={28}
                  className={styles.airlineLogo}
                />
                <div className={styles.airlineInfo}>
                  <span className={styles.airlineName}>{leg.airline}</span>
                  <span className={styles.flightNum}>{leg.flightNumber}</span>
                </div>
              </div>

              {/* Times */}
              <div className={styles.times}>
                <div className={styles.timePoint}>
                  <span className={styles.time}>{leg.departTime}</span>
                  <span className={styles.airport}>{leg.from}</span>
                </div>

                <div className={styles.routeLine}>
                  <span className={styles.duration}>{formatDuration(leg.duration)}</span>
                  <div className={styles.line}>
                    <div className={styles.dot} />
                    <div className={styles.dash} />
                    <div className={styles.dot} />
                  </div>
                  {leg.airplane && (
                    <span className={styles.airplane}>{leg.airplane}</span>
                  )}
                </div>

                <div className={styles.timePoint}>
                  <span className={styles.time}>{leg.arriveTime}</span>
                  <span className={styles.airport}>{leg.to}</span>
                </div>
              </div>
            </div>
          ))}

          {/* Layover info between legs */}
          {flight.layovers.map((layover, i) => (
            <div key={i} className={styles.layover}>
              <span className={styles.layoverIcon}>⏱️</span>
              <span>
                Nối chuyến tại <strong>{layover.city}</strong> ({layover.code}) — {formatDuration(layover.duration)}
              </span>
            </div>
          ))}
        </div>

        {/* Summary & Price */}
        <div className={styles.priceCol}>
          {/* Total duration & stops */}
          <div className={styles.summary}>
            <span className={styles.totalDuration}>
              🕐 {formatDuration(flight.totalDuration)}
            </span>
            <span className={`badge ${stopsClass}`}>
              {stopsLabel}
            </span>
          </div>

          {/* Price */}
          <div className={styles.price}>
            {formatPrice(flight.price, flight.currency)}
          </div>
          <span className={styles.priceLabel}>Khứ hồi / người</span>

          {/* Book button */}
          <a
            href={generateAffiliateLink(
              flight.origin,
              flight.destination,
              flight.departDate,
              flight.returnDate
            )}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-primary"
          >
            Đặt vé ngay →
          </a>

          {/* Carbon */}
          {flight.carbonEmissions && (
            <span className={styles.carbon}>
              🌱 {Math.round(flight.carbonEmissions / 1000)} kg CO₂
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
