'use client';

import { useState } from 'react';
import Link from 'next/link';
import styles from './Header.module.css';

export default function Header() {
  const [locale, setLocale] = useState<'vi' | 'de'>('vi');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className={styles.header}>
      <div className={`container ${styles.headerInner}`}>
        <Link href="/" className={styles.logo}>
          <span className={styles.logoIcon}>✈️</span>
          <span className={styles.logoText}>
            Vé Máy Bay
            <span className={styles.logoDot}>.de</span>
          </span>
        </Link>

        <nav className={`${styles.nav} ${mobileMenuOpen ? styles.navOpen : ''}`}>
          <Link href="/" className={styles.navLink}>
            🏠 {locale === 'vi' ? 'Trang chủ' : 'Startseite'}
          </Link>
          <Link href="/search" className={styles.navLink}>
            🔍 {locale === 'vi' ? 'Tìm vé' : 'Suchen'}
          </Link>
          <Link href="/calendar" className={styles.navLink}>
            📅 {locale === 'vi' ? 'Lịch giá' : 'Kalender'}
          </Link>
        </nav>

        <div className={styles.headerActions}>
          <button
            type="button"
            className={styles.langToggle}
            onClick={() => setLocale(locale === 'vi' ? 'de' : 'vi')}
            aria-label="Switch language"
          >
            {locale === 'vi' ? '🇩🇪 DE' : '🇻🇳 VI'}
          </button>

          <button
            type="button"
            className={styles.mobileMenuBtn}
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? '✕' : '☰'}
          </button>
        </div>
      </div>
    </header>
  );
}
