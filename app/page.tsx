'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/Header';
import SearchForm from '@/components/SearchForm';
import { POPULAR_ROUTES } from '@/lib/airports';
import { formatPrice } from '@/lib/affiliate';
import styles from './page.module.css';

// Mock popular prices for demo (will be replaced with real API data)
const MOCK_PRICES: Record<string, number> = {
  'FRA-SGN': 487,
  'FRA-HAN': 512,
  'MUC-SGN': 523,
  'BER-SGN': 498,
  'BER-HAN': 535,
  'FRA-DAD': 548,
  'FRA-BKK': 412,
  'FRA-ICN': 465,
};

export default function HomePage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const handleSearch = (origin: string, destination: string, departDate: string, returnDate: string) => {
    setIsLoading(true);
    const params = new URLSearchParams({
      origin,
      destination,
      ...(departDate && { depart_date: departDate }),
      ...(returnDate && { return_date: returnDate }),
    });
    router.push(`/search?${params.toString()}`);
  };

  return (
    <>
      <Header />
      <main>
        {/* Hero Section */}
        <section className={styles.hero}>
          <div className={styles.heroBackground}>
            <div className={styles.heroOrb1} />
            <div className={styles.heroOrb2} />
            <div className={styles.heroOrb3} />
          </div>
          <div className={`container ${styles.heroContent}`}>
            <div className={styles.heroText}>
              <div className={styles.heroBadge}>
                <span>🇩🇪</span>
                <span className={styles.heroBadgeLine} />
                <span>✈️</span>
                <span className={styles.heroBadgeLine} />
                <span>🇻🇳</span>
              </div>
              <h1 className={styles.heroTitle}>
                Săn Vé Máy Bay
                <br />
                <span className="text-gradient">Giá Rẻ Nhất</span>
              </h1>
              <p className={styles.heroSubtitle}>
                Tìm giá tốt nhất cho chuyến bay Đức ↔ Việt Nam và quốc tế.
                <br />
                Nhận thông báo khi giá giảm. Dành cho cộng đồng người Việt tại Đức.
              </p>
            </div>

            <div className={styles.searchCard}>
              <SearchForm onSearch={handleSearch} isLoading={isLoading} />
            </div>
          </div>
        </section>

        {/* Popular Routes */}
        <section className={styles.popularSection}>
          <div className="container">
            <div className={styles.sectionHeader}>
              <h2 className={styles.sectionTitle}>
                🔥 Tuyến bay phổ biến
              </h2>
              <p className={styles.sectionSubtitle}>
                Giá tham khảo cho các tuyến bay Đức - Việt Nam được tìm nhiều nhất
              </p>
            </div>

            <div className={styles.routeGrid}>
              {POPULAR_ROUTES.map((route, index) => {
                const key = `${route.origin}-${route.destination}`;
                const price = MOCK_PRICES[key];
                return (
                  <button
                    key={key}
                    className={`${styles.routeCard} animate-slideUp`}
                    style={{ animationDelay: `${index * 0.06}s` }}
                    onClick={() => handleSearch(route.origin, route.destination, '', '')}
                  >
                    <div className={styles.routeCardHeader}>
                      <span className={styles.routeEmoji}>{route.emoji}</span>
                      <span className={styles.routeLabel}>{route.label_vi}</span>
                    </div>
                    <div className={styles.routeCardBody}>
                      <div className={styles.routeCodes}>
                        <span className={styles.routeCodeBig}>{route.origin}</span>
                        <span className={styles.routeArrow}>→</span>
                        <span className={styles.routeCodeBig}>{route.destination}</span>
                      </div>
                      {price && (
                        <div className={styles.routePrice}>
                          <span className={styles.routePriceLabel}>Giá từ</span>
                          <span className={styles.routePriceValue}>
                            {formatPrice(price)}
                          </span>
                        </div>
                      )}
                    </div>
                    <div className={styles.routeCardFooter}>
                      <span>Xem giá →</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </section>

        {/* Features */}
        <section className={styles.featuresSection}>
          <div className="container">
            <div className={styles.sectionHeader}>
              <h2 className={styles.sectionTitle}>
                ✨ Tại sao chọn chúng tôi?
              </h2>
            </div>

            <div className={styles.featuresGrid}>
              <div className={`${styles.featureCard} glass-card animate-slideUp delay-1`}>
                <span className={styles.featureIcon}>🔍</span>
                <h3 className={styles.featureTitle}>So sánh giá thông minh</h3>
                <p className={styles.featureDesc}>
                  Tổng hợp giá từ nhiều hãng bay và đại lý, giúp bạn tìm được giá tốt nhất.
                </p>
              </div>

              <div className={`${styles.featureCard} glass-card animate-slideUp delay-2`}>
                <span className={styles.featureIcon}>🔔</span>
                <h3 className={styles.featureTitle}>Thông báo giá giảm</h3>
                <p className={styles.featureDesc}>
                  Đặt mục tiêu giá, nhận email thông báo ngay khi giá vé giảm xuống mức bạn muốn.
                </p>
              </div>

              <div className={`${styles.featureCard} glass-card animate-slideUp delay-3`}>
                <span className={styles.featureIcon}>📅</span>
                <h3 className={styles.featureTitle}>Lịch giá linh hoạt</h3>
                <p className={styles.featureDesc}>
                  Xem giá theo từng ngày trong tháng, chọn ngày bay rẻ nhất dễ dàng.
                </p>
              </div>

              <div className={`${styles.featureCard} glass-card animate-slideUp delay-4`}>
                <span className={styles.featureIcon}>🇩🇪🇻🇳</span>
                <h3 className={styles.featureTitle}>Dành cho người Việt tại Đức</h3>
                <p className={styles.featureDesc}>
                  Giao diện song ngữ Việt-Đức, tối ưu cho tuyến bay Đức ↔ Việt Nam.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className={styles.footer}>
          <div className="container">
            <div className={styles.footerContent}>
              <div className={styles.footerBrand}>
                <span className={styles.footerLogo}>✈️ Vé Máy Bay<span className={styles.logoDot}>.de</span></span>
                <p className={styles.footerDesc}>
                  Dành cho cộng đồng người Việt tại Đức
                </p>
              </div>
              <div className={styles.footerDisclaimer}>
                <p>
                  Giá vé có thể thay đổi. Giá hiển thị là giá tham khảo từ các trang đặt vé.
                  Khi bạn đặt vé qua liên kết của chúng tôi, chúng tôi có thể nhận được hoa hồng.
                </p>
              </div>
              <div className={styles.footerCopy}>
                © 2026 Vé Máy Bay. Made with ❤️ in Deutschland.
              </div>
            </div>
          </div>
        </footer>
      </main>
    </>
  );
}
