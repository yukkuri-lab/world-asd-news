import { getStoredNews } from '@/lib/storage';
import NewsCard from '@/components/NewsCard';
import { NewsItem } from '@/components/types';
import UpdateButton from '@/components/UpdateButton';

export const revalidate = 3600;

export default function Home() {
  // 最新記事を上に表示（pubDate降順）
  const newsItems = (getStoredNews() as NewsItem[]).sort((a, b) => {
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

          {/* 更新ボタン */}
          <UpdateButton />
        </div>
      </header>

      {/* ─── ヒーロー ─── */}
      <section
        style={{ padding: '56px 24px 40px', textAlign: 'center' }}
      >
        <div style={{ maxWidth: 560, margin: '0 auto' }}>
          {/* ラベル */}
          <span style={{
            display: 'inline-block',
            fontSize: 11, fontWeight: 600,
            letterSpacing: '0.06em',
            textTransform: 'uppercase',
            color: '#86868B', // Muted Apple gray
            marginBottom: 16,
          }}>
            ASD × AI News Aggregator
          </span>

          {/* キャッチコピー（SF Pro Display Like） */}
          <h2 style={{
            margin: '0 0 16px',
            fontSize: 'clamp(32px, 6vw, 48px)',
            fontWeight: 800,
            lineHeight: 1.15,
            letterSpacing: '-0.03em',
            color: '#1D1D1F',
          }}>
            世界の自閉症研究を、<br />
            <span style={{ color: '#0071E3' }}>3行</span>で明確に。
          </h2>

          {/* サブコピー */}
          <p style={{
            margin: 0,
            fontSize: 16,
            lineHeight: 1.6,
            color: '#515154',
          }}>
            最新のASD研究ニュースを、<br />
            Gemini AIが日本語で要約してお届けします。
          </p>
        </div>
      </section>

      {/* ─── 記事一覧 ─── */}
      <div style={{ maxWidth: 720, margin: '0 auto', padding: '0 24px' }}>

        {/* 記事数バナー */}
        {newsItems.length > 0 && (
          <p style={{
            fontSize: 13, color: '#86868B', fontWeight: 500,
            marginBottom: 20,
          }}>
            {newsItems.length}件の記事
          </p>
        )}

        {/* カード一覧（シングルカラム） */}
        {newsItems.length === 0 ? (
          <div style={{
            textAlign: 'center', padding: '72px 24px',
            background: '#fff', borderRadius: 18,
            border: '1px solid rgba(0, 0, 0, 0.04)',
          }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>📭</div>
            <p style={{ fontSize: 17, fontWeight: 600, color: '#1D1D1F', marginBottom: 8 }}>
              まだ記事がありません
            </p>
            <p style={{ fontSize: 14, color: '#86868B' }}>
              右上の「今すぐ更新」ボタンを押してください
            </p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            {newsItems.map((item) => (
              <NewsCard key={item.id} news={item} />
            ))}
          </div>
        )}
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
