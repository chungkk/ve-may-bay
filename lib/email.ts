// ============================================
// Email Service — Resend
// ============================================

import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);
const FROM_EMAIL = process.env.FROM_EMAIL || 'noreply@vemaybay.de';

interface PriceAlertEmailData {
  to: string;
  userName: string;
  origin: string;
  destination: string;
  currentPrice: number;
  targetPrice: number;
  currency: string;
  bookingUrl?: string;
}

/**
 * Send price drop notification email
 */
export async function sendPriceAlertEmail(data: PriceAlertEmailData): Promise<boolean> {
  const { to, userName, origin, destination, currentPrice, targetPrice, currency, bookingUrl } = data;

  const currencySymbol = currency === 'EUR' ? '€' : currency === 'USD' ? '$' : currency;
  const savings = targetPrice - currentPrice;

  try {
    await resend.emails.send({
      from: `Vé Máy Bay <${FROM_EMAIL}>`,
      to,
      subject: `✈️ Giá vé ${origin} → ${destination} đã giảm xuống ${currencySymbol}${currentPrice}!`,
      html: `
        <div style="font-family: 'Segoe UI', Tahoma, sans-serif; max-width: 600px; margin: 0 auto; background: #0a0a1a; color: #e0e0e0; border-radius: 16px; overflow: hidden;">
          <!-- Header -->
          <div style="background: linear-gradient(135deg, #6366f1, #8b5cf6); padding: 32px; text-align: center;">
            <h1 style="margin: 0; font-size: 24px; color: white;">✈️ Giá Vé Đã Giảm!</h1>
            <p style="margin: 8px 0 0; color: rgba(255,255,255,0.85); font-size: 14px;">Chào ${userName}, có tin vui cho bạn!</p>
          </div>

          <!-- Content -->
          <div style="padding: 32px;">
            <!-- Route -->
            <div style="text-align: center; margin-bottom: 24px;">
              <div style="display: inline-block; background: rgba(99,102,241,0.15); border-radius: 12px; padding: 16px 32px;">
                <span style="font-size: 28px; font-weight: bold; color: #818cf8;">${origin}</span>
                <span style="margin: 0 12px; color: #6366f1;">✈️ →</span>
                <span style="font-size: 28px; font-weight: bold; color: #818cf8;">${destination}</span>
              </div>
            </div>

            <!-- Price -->
            <div style="background: rgba(34,197,94,0.1); border: 1px solid rgba(34,197,94,0.3); border-radius: 12px; padding: 20px; text-align: center; margin-bottom: 24px;">
              <p style="margin: 0 0 4px; font-size: 13px; color: #9ca3af;">Giá hiện tại</p>
              <p style="margin: 0; font-size: 36px; font-weight: bold; color: #22c55e;">${currencySymbol}${currentPrice}</p>
              <p style="margin: 8px 0 0; font-size: 13px; color: #9ca3af;">
                Mục tiêu: ${currencySymbol}${targetPrice} · Tiết kiệm: ${currencySymbol}${savings > 0 ? savings : 0}
              </p>
            </div>

            <!-- CTA -->
            ${bookingUrl ? `
            <div style="text-align: center; margin-bottom: 24px;">
              <a href="${bookingUrl}" style="display: inline-block; background: linear-gradient(135deg, #6366f1, #8b5cf6); color: white; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: 600; font-size: 16px;">
                🎫 Đặt Vé Ngay
              </a>
            </div>
            ` : ''}

            <p style="color: #6b7280; font-size: 12px; text-align: center; margin-top: 32px;">
              Bạn nhận email này vì đã đặt thông báo giá trên Vé Máy Bay.de
              <br />Giá có thể thay đổi bất cứ lúc nào.
            </p>
          </div>
        </div>
      `,
    });

    console.log(`[Email] Sent price alert to ${to}: ${origin}→${destination} at ${currencySymbol}${currentPrice}`);
    return true;
  } catch (error) {
    console.error(`[Email] Failed to send to ${to}:`, error);
    return false;
  }
}
