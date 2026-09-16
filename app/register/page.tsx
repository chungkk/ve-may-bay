'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import styles from '../login/page.module.css';

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Mật khẩu xác nhận không khớp');
      return;
    }

    if (password.length < 6) {
      setError('Mật khẩu phải có ít nhất 6 ký tự');
      return;
    }

    setIsLoading(true);

    try {
      // Register
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, name }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Đăng ký thất bại');
        return;
      }

      // Auto login after register
      const loginResult = await signIn('credentials', {
        email,
        password,
        redirect: false,
      });

      if (loginResult?.error) {
        // Register succeeded but auto-login failed — redirect to login
        router.push('/login');
      } else {
        router.push('/');
        router.refresh();
      }
    } catch {
      setError('Đã xảy ra lỗi. Vui lòng thử lại.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    signIn('google', { callbackUrl: '/' });
  };

  return (
    <div className={styles.authPage}>
      <div className={styles.authBackground}>
        <div className={styles.authOrb1} />
        <div className={styles.authOrb2} />
      </div>

      <div className={styles.authCard}>
        <div className={styles.authHeader}>
          <Link href="/" className={styles.authLogo}>
            ✈️ Vé Máy Bay<span className={styles.logoDot}>.de</span>
          </Link>
          <h1 className={styles.authTitle}>Tạo Tài Khoản</h1>
          <p className={styles.authSubtitle}>
            Đăng ký miễn phí để nhận thông báo khi giá vé giảm.
          </p>
        </div>

        {/* Google */}
        <button
          type="button"
          className={styles.googleBtn}
          onClick={handleGoogleLogin}
        >
          <svg width="20" height="20" viewBox="0 0 24 24">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
          </svg>
          Đăng ký bằng Google
        </button>

        <div className={styles.divider}>
          <span>hoặc</span>
        </div>

        <form onSubmit={handleSubmit} className={styles.authForm}>
          {error && (
            <div className={styles.errorAlert}>
              ⚠️ {error}
            </div>
          )}

          <div className={styles.formGroup}>
            <label htmlFor="reg-name" className={styles.formLabel}>Tên hiển thị</label>
            <input
              id="reg-name"
              type="text"
              className={styles.formInput}
              placeholder="Nguyen Van A"
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoComplete="name"
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="reg-email" className={styles.formLabel}>Email</label>
            <input
              id="reg-email"
              type="email"
              className={styles.formInput}
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="reg-password" className={styles.formLabel}>Mật khẩu</label>
            <input
              id="reg-password"
              type="password"
              className={styles.formInput}
              placeholder="Ít nhất 6 ký tự"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              autoComplete="new-password"
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="reg-confirm" className={styles.formLabel}>Xác nhận mật khẩu</label>
            <input
              id="reg-confirm"
              type="password"
              className={styles.formInput}
              placeholder="Nhập lại mật khẩu"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              minLength={6}
              autoComplete="new-password"
            />
          </div>

          <button
            type="submit"
            className={styles.submitBtn}
            disabled={isLoading}
          >
            {isLoading ? '⏳ Đang xử lý...' : '🚀 Tạo Tài Khoản'}
          </button>
        </form>

        <p className={styles.authFooter}>
          Đã có tài khoản?{' '}
          <Link href="/login" className={styles.authLink}>
            Đăng nhập
          </Link>
        </p>
      </div>
    </div>
  );
}
