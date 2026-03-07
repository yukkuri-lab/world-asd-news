import React from 'react';
import { NewsItem } from './types';
import { differenceInDays } from 'date-fns';

interface NewsCardProps {
    news: NewsItem;
}

// summaryから「TITLE: 日本語タイトル」を抽出する
function parseTitleJa(summary: string): string | null {
    if (!summary) return null;
    const lines = summary.split('\n');
    for (const line of lines) {
        const t = line.trim();
        if (t.startsWith('TITLE:') || t.startsWith('TITLE：')) {
            const title = t.replace(/^TITLE[：:]\s*/, '').trim();
            return title.length > 2 ? title : null;
        }
    }
    return null;
}

// summaryから箇条書き3行を抽出（文字数制限なし・切り捨てなし）
function parseSummary(summary: string): string[] {
    if (!summary || summary.includes('要約の生成に失敗') || summary.includes('デモ用要約')) {
        return [];
    }

    // AI前置き文を除去
    const cleaned = summary
        .replace(/^はい[、，,].*?\n/gm, '')
        .replace(/^承知(いたしました|しました)[。.]*\n?/gm, '')
        .replace(/^もちろん[、，,].*?\n/gm, '')
        .replace(/\*\*/g, '');

    const lines = cleaned.split('\n');
    const bullets: string[] = [];

    for (const line of lines) {
        let text = line.trim();
        if (!text) continue;

        // TITLE行はスキップ
        if (text.startsWith('TITLE:') || text.startsWith('TITLE：')) continue;

        // 箇条書き記号を除去
        if (text.startsWith('- ')) text = text.slice(2).trim();
        else if (text.startsWith('* ')) text = text.slice(2).trim();
        else if (text.startsWith('• ')) text = text.slice(2).trim();
        else if (/^\d+[.．]\s/.test(text)) text = text.replace(/^\d+[.．]\s/, '').trim();
        else continue;

        text = text.replace(/\*\*/g, '').trim();

        if (text.length > 5) {
            bullets.push(text);
        }
    }

    return bullets.slice(0, 3);
}

// ソースに応じたアクセントカラー
function getSourceColor(source: string): string {
    const map: Record<string, string> = {
        // 主要6大ソース
        'CDC Autism News': '#16A34A',         // 米国基準の信頼あるグリーン
        'National Autistic Society': '#DB2777', // 英国NASの象徴的なピンク系
        'Spectrum News': '#9333EA',           // 知的で深いパープル
        'Nature': '#DC2626',                  // 世界を牽引するNatureレッド
        'NIH News Releases': '#2563EB',       // 米国医療の権威を示すブルー
        'OTARC': '#059669',                   // 豪州の自然なエメラルドグリーン

        // 追加5カ国の権威ある機関
        'Autism-Europe': '#0284C7',           // 欧州の青 (Sky Blue)
        'Autism Canada': '#E11D48',           // カナダのメープルレッド (Rose)
        'Amaze (Australia)': '#F59E0B',       // 豪州のアクティブなアンバー (Amber)
        'Cambridge ARC': '#4338CA',           // ケンブリッジの深いブルー (Indigo)
        'Karolinska Institutet': '#0D9488',   // 北欧の洗練されたティール (Teal)

        // その他
        'ScienceDaily': '#3B82F6',
        'Neuroscience News': '#E11D48',
        'Autism Spectrum News': '#D97706',
        'Autism Awareness Centre': '#0891B2',
    };
    return map[source] ?? '#64748B';
}

// カテゴリに応じた絵文字
function getCategoryEmoji(category?: string): string {
    if (!category) return '📰';
    const map: Record<string, string> = {
        '研究': '🔬',
        '制度・政策': '🏛️',
        '支援・療育': '🤝',
        '学校教育': '🏫',
        '当事者の声': '💬',
        'テクノロジー': '💻',
    };
    return map[category] ?? '📰';
}

// 国コードに応じた国旗絵文字
function getCountryFlag(country?: string): string {
    if (!country) return '🌍';
    const map: Record<string, string> = {
        'US': '🇺🇸', 'UK': '🇬🇧', 'AU': '🇦🇺', 'JP': '🇯🇵',
        'CA': '🇨🇦', 'EU': '🇪🇺', 'DE': '🇩🇪', 'FR': '🇫🇷',
        'KR': '🇰🇷', 'CN': '🇨🇳', 'SE': '🇸🇪', 'IL': '🇮🇱',
        '国際': '🌍',
    };
    return map[country] ?? '🌍';
}

const NewsCard: React.FC<NewsCardProps> = ({ news }) => {
    const date = new Date(news.pubDate);
    const formattedDate = date.toLocaleDateString('ja-JP', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    });

    const isNew = differenceInDays(new Date(), date) <= 14;
    const titleJa = parseTitleJa(news.summary);
    const bullets = parseSummary(news.summary);
    const accentColor = getSourceColor(news.source);

    // 独自コンテンツの有無
    const hasExtras = news.country || news.category || news.reliability;

    return (
        <a
            href={news.link}
            target="_blank"
            rel="noopener noreferrer"
            className="news-card"
            style={{ display: 'block' }}
        >

            {/* ─── ヘッダー：ソース ＋ NEWバッジ ─── */}
            <div className="nc-header">
                <span
                    className="nc-source"
                    style={{ borderLeftColor: accentColor, color: accentColor }}
                >
                    {news.source}
                </span>
                {isNew && <span className="nc-new-badge">NEW</span>}
            </div>

            {/* ─── メタ情報バー（国 / カテゴリ / 信頼度） ─── */}
            {hasExtras && (
                <div className="nc-meta-bar">
                    {news.country && (
                        <span className="nc-meta-tag nc-meta-country">
                            {getCountryFlag(news.country)} {news.country}
                        </span>
                    )}
                    {news.category && (
                        <span className="nc-meta-tag nc-meta-category">
                            {getCategoryEmoji(news.category)} {news.category}
                        </span>
                    )}
                    {news.reliability && (
                        <span className="nc-meta-tag nc-meta-reliability">
                            {news.reliability}
                        </span>
                    )}
                </div>
            )}

            {/* ─── 日本語タイトル（大・メイン） ─── */}
            {titleJa ? (
                <>
                    <span className="nc-title-ja-link">
                        {titleJa}
                    </span>
                    <p className="nc-title-en">{news.title}</p>
                </>
            ) : (
                <span className="nc-title-link">
                    {news.title}
                </span>
            )}

            {/* ─── 日本語要約（箇条書き） ─── */}
            <div className="nc-summary">
                {bullets.length > 0 ? (
                    <ul className="nc-bullets">
                        {bullets.map((point, i) => (
                            <li key={i} className="nc-bullet-item">
                                <span
                                    className="nc-bullet-dot"
                                    style={{ backgroundColor: accentColor }}
                                />
                                <span className="nc-bullet-text">{point}</span>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p className="nc-no-summary">要約を準備中です</p>
                )}
            </div>

            {/* ─── 独自コンテンツ：親への意味＋今日の1アクション ─── */}
            {(news.parentMeaning || news.todayAction || news.japanHint) && (
                <div className="nc-extras">
                    {news.parentMeaning && (
                        <div className="nc-extra-item nc-parent-meaning">
                            <div className="nc-extra-label">
                                <span className="nc-extra-icon">👨‍👩‍👧</span>
                                保護者への意味
                            </div>
                            <p className="nc-extra-text">{news.parentMeaning}</p>
                        </div>
                    )}
                    {news.todayAction && (
                        <div className="nc-extra-item nc-today-action">
                            <div className="nc-extra-label">
                                <span className="nc-extra-icon">💡</span>
                                今日の1アクション
                            </div>
                            <p className="nc-extra-text">{news.todayAction}</p>
                        </div>
                    )}
                    {news.japanHint && (
                        <div className="nc-extra-item nc-japan-hint" style={{ background: 'rgba(52, 199, 89, 0.08)', border: '1px solid rgba(52, 199, 89, 0.2)' }}>
                            <div className="nc-extra-label" style={{ color: '#15803D' }}>
                                <span className="nc-extra-icon" style={{ fontSize: '15px' }}>👨‍👩‍👧‍👦</span>
                                パパの視点 / 日本でのヒント
                            </div>
                            <p className="nc-extra-text" style={{ color: '#166534', fontWeight: 500 }}>{news.japanHint}</p>
                        </div>
                    )}
                </div>
            )}

            {/* ─── フッター ─── */}
            <div className="nc-footer">
                <time className="nc-date">{formattedDate}</time>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span
                        style={{ fontSize: 11, fontWeight: 600, color: 'var(--fg-muted)', letterSpacing: '0.05em' }}
                    >
                        クリックして
                    </span>
                    <span
                        className="nc-read-btn"
                        style={{ color: accentColor, borderColor: accentColor }}
                    >
                        元のサイトを読む ↗
                    </span>
                </div>
            </div>
        </a>
    );
};

export default NewsCard;
