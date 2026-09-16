'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import styles from './Header.module.css';

export default function Header() {
  const { data: session } = useSession();
  const [locale, setLocale] = useState<'vi' | 'de'>('vi');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

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
          {session && (
            <Link href="/alerts" className={styles.navLink}>
              🔔 {locale === 'vi' ? 'Thông báo' : 'Benachrichtigung'}
            </Link>
          )}
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

          {/* Auth Buttons */}
          {session ? (
            <div className={styles.userMenu}>
              <button
                type="button"
                className={styles.userBtn}
                onClick={() => setUserMenuOpen(!userMenuOpen)}
              >
                {session.user?.image ? (
                  <img
                    src={session.user.image}
                    alt=""
                    className={styles.userAvatar}
                    width={28}
                    height={28}
                  />
                ) : (
                  <span className={styles.userAvatarFallback}>
                    {(session.user?.name || session.user?.email || '?')[0].toUpperCase()}
                  </span>
                )}
                <span className={styles.userName}>
                  {session.user?.name || session.user?.email?.split('@')[0]}
                </span>
              </button>

              {userMenuOpen && (
                <>
                  <div
                    className={styles.userMenuOverlay}
                    onClick={() => setUserMenuOpen(false)}
                  />
                  <div className={styles.userDropdown}>
                    <div className={styles.dropdownHeader}>
                      <span className={styles.dropdownEmail}>
                        {session.user?.email}
                      </span>
                    </div>
                    <Link
                      href="/alerts"
                      className={styles.dropdownItem}
                      onClick={() => setUserMenuOpen(false)}
                    >
                      🔔 Thông báo giá
                    </Link>
                    <button
                      className={styles.dropdownItem}
                      onClick={() => signOut({ callbackUrl: '/' })}
                    >
                      🚪 Đăng xuất
                    </button>
                  </div>
                </>
              )}
            </div>
          ) : (
            <Link href="/login" className={styles.loginBtn}>
              Đăng nhập
            </Link>
          )}

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
