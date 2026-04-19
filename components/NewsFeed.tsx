'use client';

import React from 'react';
import NewsCard from './NewsCard';
import { NewsItem } from './types';

interface NewsFeedProps {
    initialNewsItems: NewsItem[];
}

export default function NewsFeed({ initialNewsItems }: NewsFeedProps) {
    return (
        <div>
            {/* ─── 記事数バナー ─── */}
            <p style={{
                fontSize: 13, color: '#86868B', fontWeight: 500,
                marginBottom: 20,
            }}>
                {initialNewsItems.length}件の記事
            </p>

            {/* ─── 記事一覧 ─── */}
            {initialNewsItems.length === 0 ? (
                <div style={{
                    textAlign: 'center', padding: '72px 24px',
                    background: '#fff', borderRadius: 18,
                    border: '1px solid rgba(0, 0, 0, 0.04)',
                }}>
                    <div style={{ fontSize: 48, marginBottom: 12 }}>📭</div>
                    <p style={{ fontSize: 17, fontWeight: 600, color: '#1D1D1F', marginBottom: 8 }}>
                        記事がまだありません
                    </p>
                </div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                    {initialNewsItems.map((item) => (
                        <NewsCard key={item.id} news={item} />
                    ))}
                </div>
            )}
        </div>
    );
}
