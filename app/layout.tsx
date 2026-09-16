import type { Metadata } from "next";
import { Inter } from "next/font/google";
import AuthProvider from "@/components/AuthProvider";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin", "vietnamese", "latin-ext"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Vé Máy Bay Giá Rẻ | Đức ↔ Việt Nam | Săn Vé Rẻ",
  description:
    "Tìm vé máy bay giá rẻ cho chuyến bay Đức - Việt Nam. So sánh giá từ nhiều hãng bay, nhận thông báo khi giá giảm. Dành cho cộng đồng người Việt tại Đức.",
  keywords: [
    "vé máy bay",
    "giá rẻ",
    "Đức Việt Nam",
    "Frankfurt Sài Gòn",
    "München Hà Nội",
    "Berlin Vietnam",
    "Flug Vietnam",
    "günstige Flüge",
  ],
  openGraph: {
    title: "Vé Máy Bay Giá Rẻ | Đức ↔ Việt Nam",
    description:
      "Săn vé máy bay giá tốt nhất cho chuyến bay Đức - Việt Nam và quốc tế.",
    type: "website",
    locale: "vi_VN",
    alternateLocale: "de_DE",
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="vi" className={inter.variable} data-scroll-behavior="smooth">
      <body>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}

