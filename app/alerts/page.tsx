'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Header from '@/components/Header';
import { AIRPORTS_MAP, COUNTRY_GROUPS } from '@/lib/airports';
import { formatPrice } from '@/lib/affiliate';
import type { DbPriceAlert } from '@/lib/db';
import styles from './page.module.css';

export default function AlertsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [alerts, setAlerts] = useState<DbPriceAlert[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  // Form state
  const [origin, setOrigin] = useState('FRA');
  const [destination, setDestination] = useState('SGN');
  const [targetPrice, setTargetPrice] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [formError, setFormError] = useState('');
  const [formLoading, setFormLoading] = useState(false);

  // Redirect if not authenticated
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, router]);

  // Fetch alerts
  const fetchAlerts = useCallback(async () => {
    try {
      const res = await fetch('/api/alerts');
      const data = await res.json();
      if (data.success) {
        setAlerts(data.data);
      }
    } catch (err) {
      console.error('Failed to fetch alerts:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (status === 'authenticated') {
      fetchAlerts();
    }
  }, [status, fetchAlerts]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    setFormLoading(true);

    try {
      const res = await fetch('/api/alerts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          origin,
          destination,
          target_price: parseFloat(targetPrice),
          depart_date_from: dateFrom || undefined,
          depart_date_to: dateTo || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setFormError(data.error);
        return;
      }

      setShowForm(false);
      setTargetPrice('');
      setDateFrom('');
      setDateTo('');
      fetchAlerts();
    } catch {
      setFormError('Không thể tạo thông báo');
    } finally {
      setFormLoading(false);
    }
  };

  const handleToggle = async (id: string) => {
    try {
      await fetch('/api/alerts', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });
      fetchAlerts();
    } catch (err) {
      console.error('Toggle failed:', err);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Bạn có chắc muốn xóa thông báo này?')) return;
    try {
      await fetch(`/api/alerts?id=${id}`, { method: 'DELETE' });
      fetchAlerts();
    } catch (err) {
      console.error('Delete failed:', err);
    }
  };

  const getLocationName = (code: string) => {
    const group = COUNTRY_GROUPS[code];
    if (group) return group.label_vi;
    const airport = AIRPORTS_MAP[code];
    return airport ? airport.city_vi : code;
  };

  if (status === 'loading' || status === 'unauthenticated') {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', color: 'var(--color-text-secondary)' }}>
        ⏳ Đang tải...
      </div>
    );
  }

  return (
    <>
      <Header />
      <main className={styles.main}>
        <div className="container">
          {/* Page Header */}
          <div className={styles.pageHeader}>
            <div>
              <h1 className={styles.pageTitle}>
                🔔 Thông Báo <span className="text-gradient">Giá Vé</span>
              </h1>
              <p className={styles.pageSubtitle}>
                Xin chào {session?.user?.name}! Quản lý thông báo giá vé của bạn tại đây.
              </p>
            </div>
            <button
              className={styles.createBtn}
              onClick={() => setShowForm(!showForm)}
            >
              {showForm ? '✕ Đóng' : '➕ Tạo Thông Báo'}
            </button>
          </div>

          {/* Create Form */}
          {showForm && (
            <div className={styles.formCard}>
              <h3 className={styles.formTitle}>Tạo Thông Báo Mới</h3>
              <form onSubmit={handleCreate} className={styles.alertForm}>
                {formError && (
                  <div className={styles.errorAlert}>⚠️ {formError}</div>
                )}

                <div className={styles.formRow}>
                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>Điểm đi</label>
                    <select
                      className={styles.formSelect}
                      value={origin}
                      onChange={(e) => setOrigin(e.target.value)}
                    >
                      <optgroup label="Nhóm quốc gia">
                        {Object.entries(COUNTRY_GROUPS).map(([code, g]) => (
                          <option key={code} value={code}>{g.flag} {g.label_vi}</option>
                        ))}
                      </optgroup>
                      <optgroup label="Sân bay">
                        {Object.entries(AIRPORTS_MAP).map(([code, a]) => (
                          <option key={code} value={code}>{code} — {a.city_vi}</option>
                        ))}
                      </optgroup>
                    </select>
                  </div>

                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>Điểm đến</label>
                    <select
                      className={styles.formSelect}
                      value={destination}
                      onChange={(e) => setDestination(e.target.value)}
                    >
                      <optgroup label="Nhóm quốc gia">
                        {Object.entries(COUNTRY_GROUPS).map(([code, g]) => (
                          <option key={code} value={code}>{g.flag} {g.label_vi}</option>
                        ))}
                      </optgroup>
                      <optgroup label="Sân bay">
                        {Object.entries(AIRPORTS_MAP).map(([code, a]) => (
                          <option key={code} value={code}>{code} — {a.city_vi}</option>
                        ))}
                      </optgroup>
                    </select>
                  </div>
                </div>

                <div className={styles.formRow}>
                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>Giá mục tiêu (€)</label>
                    <input
                      type="number"
                      className={styles.formInput}
                      placeholder="VD: 450"
                      value={targetPrice}
                      onChange={(e) => setTargetPrice(e.target.value)}
                      required
                      min="1"
                      step="1"
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>Từ ngày (tùy chọn)</label>
                    <input
                      type="date"
                      className={styles.formInput}
                      value={dateFrom}
                      onChange={(e) => setDateFrom(e.target.value)}
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>Đến ngày (tùy chọn)</label>
                    <input
                      type="date"
                      className={styles.formInput}
                      value={dateTo}
                      onChange={(e) => setDateTo(e.target.value)}
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className={styles.submitBtn}
                  disabled={formLoading}
                >
                  {formLoading ? '⏳ Đang tạo...' : '🔔 Tạo Thông Báo'}
                </button>
              </form>
            </div>
          )}

          {/* Alerts List */}
          {isLoading ? (
            <div className={styles.loadingState}>
              <div className={styles.spinner}>🔔</div>
              <p>Đang tải thông báo...</p>
            </div>
          ) : alerts.length === 0 ? (
            <div className={styles.emptyState}>
              <p className={styles.emptyIcon}>🔔</p>
              <p className={styles.emptyTitle}>Chưa có thông báo nào</p>
              <p className={styles.emptyDesc}>
                Tạo thông báo đầu tiên để nhận email khi giá vé giảm xuống mức bạn mong muốn.
              </p>
              <button
                className={styles.createBtn}
                onClick={() => setShowForm(true)}
              >
                ➕ Tạo Thông Báo Đầu Tiên
              </button>
            </div>
          ) : (
            <div className={styles.alertsList}>
              {alerts.map((alert) => (
                <div
                  key={alert.id}
                  className={`${styles.alertCard} ${!alert.is_active ? styles.alertInactive : ''}`}
                >
                  <div className={styles.alertRoute}>
                    <span className={styles.alertCode}>{alert.origin}</span>
                    <span className={styles.alertArrow}>✈️ →</span>
                    <span className={styles.alertCode}>{alert.destination}</span>
                    <span className={styles.alertCity}>
                      {getLocationName(alert.origin)} → {getLocationName(alert.destination)}
                    </span>
                  </div>

                  <div className={styles.alertDetails}>
                    <div className={styles.alertPrice}>
                      <span className={styles.alertPriceLabel}>Giá mục tiêu</span>
                      <span className={styles.alertPriceValue}>
                        {formatPrice(alert.target_price, alert.currency)}
                      </span>
                    </div>

                    {alert.last_checked_price && (
                      <div className={styles.alertLastPrice}>
                        <span className={styles.alertPriceLabel}>Giá gần nhất</span>
                        <span>{formatPrice(alert.last_checked_price, alert.currency)}</span>
                      </div>
                    )}

                    {alert.depart_date_from && (
                      <div className={styles.alertDates}>
                        📅 {alert.depart_date_from}{alert.depart_date_to ? ` → ${alert.depart_date_to}` : ''}
                      </div>
                    )}

                    <div className={styles.alertMeta}>
                      <span className={`${styles.alertStatus} ${alert.is_active ? styles.statusActive : styles.statusPaused}`}>
                        {alert.is_active ? '🟢 Đang theo dõi' : '⏸️ Tạm dừng'}
                      </span>
                      {alert.notify_count > 0 && (
                        <span className={styles.alertNotifyCount}>
                          📩 Đã gửi {alert.notify_count} lần
                        </span>
                      )}
                    </div>
                  </div>

                  <div className={styles.alertActions}>
                    <button
                      className={styles.toggleBtn}
                      onClick={() => handleToggle(alert.id)}
                      title={alert.is_active ? 'Tạm dừng' : 'Bật lại'}
                    >
                      {alert.is_active ? '⏸️' : '▶️'}
                    </button>
                    <button
                      className={styles.deleteBtn}
                      onClick={() => handleDelete(alert.id)}
                      title="Xóa"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </>
  );
}
