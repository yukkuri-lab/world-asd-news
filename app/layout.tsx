import type { Metadata } from 'next';
import { Noto_Sans_JP, Noto_Serif_JP } from 'next/font/google';
import './globals.css';

// 本文・UI用のサンセリフ体
const notoSansJP = Noto_Sans_JP({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  preload: true,
  display: 'swap',
  variable: '--font-sans',
});

// 見出し用のセリフ体（MONOCLE風のエディトリアル感）
const notoSerifJP = Noto_Serif_JP({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '900'],
  preload: true,
  display: 'swap',
  variable: '--font-serif',
});

export const metadata: Metadata = {
  title: 'World ASD News',
  description: '世界の自閉症ニュースを、やさしい日本語で。',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja">
      <body className={`${notoSansJP.variable} ${notoSerifJP.variable} antialiased`}>
        {children}
      </body>
    </html>
  );
}
