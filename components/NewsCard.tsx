import React from 'react';
import { NewsItem } from './types';
import { differenceInDays } from 'date-fns';
import ReactionButtons from './ReactionButtons';

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

// summaryから箇条書き3行を抽出
function parseSummary(summary: string): string[] {
    if (!summary || summary.includes('要約の生成に失敗') || summary.includes('デモ用要約')) {
        return [];
    }

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
        if (text.startsWith('TITLE:') || text.startsWith('TITLE：')) continue;
        if (text.startsWith('- ')) text = text.slice(2).trim();
        else if (text.startsWith('* ')) text = text.slice(2).trim();
        else if (text.startsWith('• ')) text = text.slice(2).trim();
        else if (/^\d+[.．]\s/.test(text)) text = text.replace(/^\d+[.．]\s/, '').trim();
        else continue;

        text = text.replace(/\*\*/g, '').trim();
        if (text.length > 5) bullets.push(text);
    }

    return bullets.slice(0, 3);
}

// ソースに応じたアクセントカラー
function getSourceColor(source: string): string {
    const map: Record<string, string> = {
        'CDC Autism News': '#16A34A',
        'Spectrum News': '#9333EA',
        'Nature': '#DC2626',
        'ScienceDaily': '#3B82F6',
        'Neuroscience News': '#E11D48',
        'Autism Spectrum News': '#D97706',
        'Autism Awareness Centre': '#0891B2',
    };
    return map[source] ?? '#1A1A1A';
}

// 国コードに応じた国旗絵文字
function getCountryFlag(country?: string): string {
    if (!country) return '';
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

    return (
        <a
            href={news.link}
            target="_blank"
            rel="noopener noreferrer"
            className="article-item"
        >
            <div className="article-content">
                {/* 左側のアクセントバー */}
                <div
                    className="article-accent-bar"
                    style={{ backgroundColor: accentColor }}
                />

                {/* テキストコンテンツ */}
                <div className="article-text">
                    {/* カテゴリ＋ソース行 */}
                    <div className="article-label-row">
                        {news.category && (
                            <span className="section-label">{news.category}</span>
                        )}
                        <span className="article-source">{news.source}</span>
                        {isNew && <span className="new-badge">NEW</span>}
                    </div>

                    {/* タイトル */}
                    <h3 className="article-title">
                        {titleJa || news.title}
                    </h3>

                    {titleJa && (
                        <p className="article-title-en">{news.title}</p>
                    )}

                    {/* 要約（箇条書きを文章形式で） */}
                    {bullets.length > 0 && (
                        <p className="article-summary">
                            {bullets.join('　')}
                        </p>
                    )}

                    {/* メタ情報 */}
                    <div className="article-meta">
                        <span>{formattedDate}</span>
                        {news.country && (
                            <>
                                <span className="article-meta-divider" />
                                <span className="meta-tag--country">
                                    {getCountryFlag(news.country)} {news.country}
                                </span>
                            </>
                        )}
                        {news.reliability && (
                            <>
                                <span className="article-meta-divider" />
                                <span>{news.reliability}</span>
                            </>
                        )}
                    </div>

                    {/* 独自コンテンツ */}
                    {(news.parentMeaning || news.todayAction || news.japanHint) && (
                        <div className="extras-section">
                            {news.parentMeaning && (
                                <div className="extra-item">
                                    <div className="extra-label">
                                        <span>👨‍👩‍👧</span>
                                        保護者への意味
                                    </div>
                                    <p className="extra-text">{news.parentMeaning}</p>
                                </div>
                            )}
                            {news.todayAction && (
                                <div className="extra-item">
                                    <div className="extra-label">
                                        <span>💡</span>
                                        今日の1アクション
                                    </div>
                                    <p className="extra-text">{news.todayAction}</p>
                                </div>
                            )}
                            {news.japanHint && (
                                <div className="extra-item extra-item--japan">
                                    <div className="extra-label">
                                        <span>🇯🇵</span>
                                        日本でのヒント
                                    </div>
                                    <p className="extra-text">{news.japanHint}</p>
                                </div>
                            )}
                        </div>
                    )}

                    {/* リアクション */}
                    <ReactionButtons newsId={news.id} />
                </div>
            </div>
        </a>
    );
};

export default NewsCard;
