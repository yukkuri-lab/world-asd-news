import { getStoredNews } from '@/lib/storage';
import { NewsItem } from '@/components/types';
import NewsFeed from '@/components/NewsFeed';

export const revalidate = 3600;

export default async function Home() {
  // 最新記事を上に表示（pubDate降順）
  const storedNews = await getStoredNews();
  const newsItems = (storedNews as NewsItem[]).sort((a, b) => {
    const dateA = new Date(a.pubDate || a.fetchedAt).getTime();
    const dateB = new Date(b.pubDate || b.fetchedAt).getTime();
    return dateB - dateA; // 新しい順
  });

  return (
    <main style={{ minHeight: '100vh', background: 'var(--bg)' }}>

      {/* ─── ヘッダー（MONOCLE風） ─── */}
      <header className="site-header">
        <div className="header-inner">
          <span className="site-logo">World ASD News</span>
          <span className="header-tagline">Powered by Gemini AI</span>
        </div>
      </header>

      {/* ─── 記事一覧 ─── */}
      <NewsFeed initialNewsItems={newsItems} />

      {/* ─── フッター ─── */}
      <footer className="site-footer">
        <p>
          © {new Date().getFullYear()} World ASD News — 情報は参考用です。医療的判断は専門家にご相談ください。
        </p>
      </footer>

    </main>
  );
}
