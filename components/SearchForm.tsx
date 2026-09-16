'use client';

import { useState, useRef, useEffect } from 'react';
import { ALL_AIRPORTS, GERMAN_AIRPORTS, VIETNAM_AIRPORTS, EUROPE_AIRPORTS, COUNTRY_FLAGS } from '@/lib/airports';
import type { Airport } from '@/lib/airports';
import styles from './SearchForm.module.css';

interface SearchFormProps {
  onSearch: (origin: string, destination: string, departDate: string, returnDate: string) => void;
  isLoading?: boolean;
  compact?: boolean;
}

export default function SearchForm({ onSearch, isLoading, compact }: SearchFormProps) {
  const [origin, setOrigin] = useState('FRA');
  const [destination, setDestination] = useState('SGN');
  const [departDate, setDepartDate] = useState('');
  const [returnDate, setReturnDate] = useState('');
  const [showOriginDropdown, setShowOriginDropdown] = useState(false);
  const [showDestDropdown, setShowDestDropdown] = useState(false);
  const [originSearch, setOriginSearch] = useState('');
  const [destSearch, setDestSearch] = useState('');

  const originRef = useRef<HTMLDivElement>(null);
  const destRef = useRef<HTMLDivElement>(null);

  // Set default dates (next month)
  useEffect(() => {
    const now = new Date();
    const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 15);
    const returnMonth = new Date(now.getFullYear(), now.getMonth() + 2, 15);
    setDepartDate(nextMonth.toISOString().slice(0, 7));
    setReturnDate(returnMonth.toISOString().slice(0, 7));
  }, []);

  // Close dropdowns on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (originRef.current && !originRef.current.contains(e.target as Node)) {
        setShowOriginDropdown(false);
      }
      if (destRef.current && !destRef.current.contains(e.target as Node)) {
        setShowDestDropdown(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filterAirports = (query: string): Airport[] => {
    if (!query) return ALL_AIRPORTS;
    const q = query.toLowerCase();
    return ALL_AIRPORTS.filter(
      (a) =>
        a.code.toLowerCase().includes(q) ||
        a.city_vi.toLowerCase().includes(q) ||
        a.city_de.toLowerCase().includes(q) ||
        a.name_vi.toLowerCase().includes(q) ||
        a.country_vi.toLowerCase().includes(q)
    );
  };

  const getAirportLabel = (code: string): string => {
    const airport = ALL_AIRPORTS.find((a) => a.code === code);
    if (!airport) return code;
    const flag = COUNTRY_FLAGS[airport.country_code] || '';
    return `${flag} ${airport.city_vi} (${airport.code})`;
  };

  const swapAirports = () => {
    const temp = origin;
    setOrigin(destination);
    setDestination(temp);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(origin, destination, departDate, returnDate);
  };

  const renderDropdown = (
    airports: Airport[],
    onSelect: (code: string) => void,
    type: 'origin' | 'destination'
  ) => {
    const grouped = [
      { label: '🇩🇪 Đức', airports: airports.filter((a) => GERMAN_AIRPORTS.some((g) => g.code === a.code)) },
      { label: '🇻🇳 Việt Nam', airports: airports.filter((a) => VIETNAM_AIRPORTS.some((v) => v.code === a.code)) },
      { label: '🌏 Quốc tế', airports: airports.filter((a) => EUROPE_AIRPORTS.some((e) => e.code === a.code)) },
    ].filter((g) => g.airports.length > 0);

    return (
      <div className={styles.dropdown}>
        {grouped.map((group) => (
          <div key={group.label} className={styles.dropdownGroup}>
            <div className={styles.dropdownGroupLabel}>{group.label}</div>
            {group.airports.map((airport) => (
              <button
                key={airport.code}
                type="button"
                className={styles.dropdownItem}
                onClick={() => {
                  onSelect(airport.code);
                  if (type === 'origin') {
                    setShowOriginDropdown(false);
                    setOriginSearch('');
                  } else {
                    setShowDestDropdown(false);
                    setDestSearch('');
                  }
                }}
              >
                <span className={styles.dropdownItemCode}>{airport.code}</span>
                <span className={styles.dropdownItemCity}>{airport.city_vi}</span>
                <span className={styles.dropdownItemCountry}>
                  {COUNTRY_FLAGS[airport.country_code]}
                </span>
              </button>
            ))}
          </div>
        ))}
      </div>
    );
  };

  return (
    <form
      className={`${styles.form} ${compact ? styles.compact : ''}`}
      onSubmit={handleSubmit}
    >
      <div className={styles.formGrid}>
        {/* Origin */}
        <div className={styles.fieldWrapper} ref={originRef}>
          <label className="input-label" htmlFor="search-origin">
            ✈️ Điểm đi
          </label>
          <div className={styles.selectWrapper}>
            <button
              type="button"
              id="search-origin"
              className={`input-field ${styles.airportSelect}`}
              onClick={() => setShowOriginDropdown(!showOriginDropdown)}
            >
              {getAirportLabel(origin)}
            </button>
            {showOriginDropdown && (
              <div className={styles.dropdownContainer}>
                <input
                  type="text"
                  className={`input-field ${styles.dropdownSearch}`}
                  placeholder="Tìm sân bay..."
                  value={originSearch}
                  onChange={(e) => setOriginSearch(e.target.value)}
                  autoFocus
                />
                {renderDropdown(filterAirports(originSearch), setOrigin, 'origin')}
              </div>
            )}
          </div>
        </div>

        {/* Swap Button */}
        <button
          type="button"
          className={styles.swapBtn}
          onClick={swapAirports}
          aria-label="Swap airports"
        >
          ⇄
        </button>

        {/* Destination */}
        <div className={styles.fieldWrapper} ref={destRef}>
          <label className="input-label" htmlFor="search-destination">
            📍 Điểm đến
          </label>
          <div className={styles.selectWrapper}>
            <button
              type="button"
              id="search-destination"
              className={`input-field ${styles.airportSelect}`}
              onClick={() => setShowDestDropdown(!showDestDropdown)}
            >
              {getAirportLabel(destination)}
            </button>
            {showDestDropdown && (
              <div className={styles.dropdownContainer}>
                <input
                  type="text"
                  className={`input-field ${styles.dropdownSearch}`}
                  placeholder="Tìm sân bay..."
                  value={destSearch}
                  onChange={(e) => setDestSearch(e.target.value)}
                  autoFocus
                />
                {renderDropdown(filterAirports(destSearch), setDestination, 'destination')}
              </div>
            )}
          </div>
        </div>

        {/* Depart Date */}
        <div className={styles.fieldWrapper}>
          <label className="input-label" htmlFor="search-depart">
            📅 Tháng đi
          </label>
          <input
            type="month"
            id="search-depart"
            className="input-field"
            value={departDate}
            onChange={(e) => setDepartDate(e.target.value)}
          />
        </div>

        {/* Return Date */}
        <div className={styles.fieldWrapper}>
          <label className="input-label" htmlFor="search-return">
            📅 Tháng về
          </label>
          <input
            type="month"
            id="search-return"
            className="input-field"
            value={returnDate}
            onChange={(e) => setReturnDate(e.target.value)}
          />
        </div>

        {/* Submit */}
        <button
          type="submit"
          className={`btn btn-primary btn-lg ${styles.submitBtn}`}
          disabled={isLoading}
        >
          {isLoading ? (
            <span className={styles.spinner}>⏳</span>
          ) : (
            <>🔍 Tìm vé</>
          )}
        </button>
      </div>
    </form>
  );
}
