'use client';

import React from 'react';
import NewsCard from './NewsCard';
import { NewsItem } from './types';

interface NewsFeedProps {
    initialNewsItems: NewsItem[];
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

// summaryから箇条書きを1行テキストにまとめる（ヒーロー用）
function parseFirstBullet(summary: string): string {
    if (!summary || summary.includes('要約の生成に失敗') || summary.includes('デモ用要約')) {
        return '';
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

    return bullets.slice(0, 2).join('　');
}

export default function NewsFeed({ initialNewsItems }: NewsFeedProps) {
    if (initialNewsItems.length === 0) {
        return (
            <div style={{ textAlign: 'center', padding: '80px 24px' }}>
                <div style={{ fontSize: 48, marginBottom: 12 }}>📭</div>
                <p style={{ fontSize: 17, fontWeight: 600, color: '#1A1A1A' }}>
                    記事がまだありません
                </p>
            </div>
        );
    }

    // 最新1件をヒーロー、残りをリスト表示
    const heroItem = initialNewsItems[0];
    const listItems = initialNewsItems.slice(1);
    const heroTitleJa = parseTitleJa(heroItem.summary);
    const heroSummaryText = parseFirstBullet(heroItem.summary);
    const heroDate = new Date(heroItem.pubDate).toLocaleDateString('ja-JP', {
        year: 'numeric', month: 'long', day: 'numeric',
    });

    return (
        <div>
            {/* ─── ヒーロー記事 ─── */}
            <div className="hero-section">
                <a
                    href={heroItem.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hero-card"
                >
                    <div className="hero-label-row">
                        {heroItem.category && (
                            <span className="section-label">{heroItem.category}</span>
                        )}
                        <span className="new-badge">NEW</span>
                    </div>

                    <h1 className="hero-title">
                        {heroTitleJa || heroItem.title}
                    </h1>

                    {heroTitleJa && (
                        <p className="hero-title-en">{heroItem.title}</p>
                    )}

                    {heroSummaryText && (
                        <p className="hero-summary">{heroSummaryText}</p>
                    )}

                    <div className="hero-meta">
                        <span>{heroItem.source}</span>
                        <span className="hero-meta-divider" />
                        <span>{heroDate}</span>
                        {heroItem.country && (
                            <>
                                <span className="hero-meta-divider" />
                                <span>{heroItem.country}</span>
                            </>
                        )}
                    </div>
                </a>
            </div>

            {/* ─── LATEST セクション ─── */}
            {listItems.length > 0 && (
                <>
                    <div className="latest-header">
                        <h2 className="latest-title">Latest</h2>
                        <span className="article-count">{initialNewsItems.length}件の記事</span>
                    </div>

                    <div className="article-list">
                        {listItems.map((item) => (
                            <NewsCard key={item.id} news={item} />
                        ))}
                    </div>
                </>
            )}
        </div>
    );
}
