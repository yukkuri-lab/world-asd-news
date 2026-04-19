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
    <main style={{ minHeight: '100vh', paddingBottom: 80, background: 'var(--bg)' }}>

      {/* ─── ヘッダー ─── */}
      <header
        style={{
          position: 'sticky', top: 0, zIndex: 50,
          background: 'rgba(245, 245, 247, 0.72)', // Apple Translucent Light Gray
          backdropFilter: 'saturate(180%) blur(20px)',
          WebkitBackdropFilter: 'saturate(180%) blur(20px)',
          borderBottom: '1px solid rgba(0, 0, 0, 0.05)',
          transition: 'all 0.3s',
        }}
      >
        <div style={{
          maxWidth: 720, margin: '0 auto',
          padding: '0 24px',
          height: 56,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          {/* ロゴ：Apple風の洗練されたミニマリズム */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 32, height: 32,
              background: '#1D1D1F', // Apple Black
              borderRadius: 8,       // Subtle squircle
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 16, fontWeight: 700, color: '#fff',
            }}>A</div>
            <span style={{ fontSize: 18, fontWeight: 700, color: '#1D1D1F', letterSpacing: '-0.02em' }}>
              World ASD News
            </span>
          </div>
        </div>
      </header>

      {/* ─── ヒーロー ─── */}
      <section
        style={{ padding: '72px 24px 56px', textAlign: 'center' }}
      >
        <div style={{ maxWidth: 640, margin: '0 auto' }}>
          {/* ラベル */}
          <h1 style={{
            margin: '0 0 16px',
            fontSize: 'max(36px, 5vw)',
            fontWeight: 800,
            letterSpacing: '-0.025em',
            color: '#1D1D1F',
            lineHeight: 1.15
          }}>
            ASD × AI News Aggregator
          </h1>

          {/* サブコピー */}
          <p style={{
            margin: 0,
            fontSize: 18,
            lineHeight: 1.6,
            color: '#515154',
            fontWeight: 500,
            letterSpacing: '-0.01em'
          }}>
            最新のASD研究ニュースを、<br />
            Gemini AIが日本語で要約してお届けします。
          </p>
        </div>
      </section>

      {/* ─── 記事一覧 ─── */}
      <div style={{ maxWidth: 720, margin: '0 auto', padding: '0 24px' }}>

        <NewsFeed initialNewsItems={newsItems} />
      </div>

      {/* ─── フッター ─── */}
      <footer style={{
        marginTop: 80,
        borderTop: '1px solid rgba(0, 0, 0, 0.05)',
        padding: '24px',
        textAlign: 'center',
      }}>
        <p style={{ fontSize: 12, color: '#86868B', margin: 0 }}>
          © {new Date().getFullYear()} World ASD News — 情報は参考用です。医療的判断は専門家にご相談ください。
        </p>
      </footer>

    </main>
  );
}
