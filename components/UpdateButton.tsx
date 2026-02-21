'use client';

import { useState } from 'react';

// 更新ステータスの型定義
type UpdateStatus = 'idle' | 'loading' | 'success' | 'error';

export default function UpdateButton() {
    const [status, setStatus] = useState<UpdateStatus>('idle');
    const [message, setMessage] = useState('');

    // 「今すぐ更新」ボタンのクリックハンドラー
    const handleUpdate = async () => {
        setStatus('loading');
        setMessage('');

        try {
            const response = await fetch('/api/update', {
                method: 'POST',
            });

            const data = await response.json();

            if (data.success) {
                setStatus('success');
                setMessage(data.message);

                // 成功後にページをリロードして最新記事を表示
                if (data.count > 0) {
                    setTimeout(() => {
                        window.location.reload();
                    }, 2000);
                }
            } else {
                setStatus('error');
                setMessage(data.error || 'エラーが発生しました。');
            }
        } catch {
            setStatus('error');
            setMessage('ネットワークエラーが発生しました。');
        }

        // 5秒後にアイドル状態に戻す（新記事なしの場合）
        if (status !== 'success') {
            setTimeout(() => setStatus('idle'), 5000);
        }
    };

    return (
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            {/* 更新ボタン */}
            <button
                id="update-news-button"
                onClick={handleUpdate}
                disabled={status === 'loading'}
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '8px 16px',
                    borderRadius: '999px',
                    border: 'none',
                    fontSize: '13px',
                    fontWeight: 600,
                    letterSpacing: '0.01em',
                    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)',
                    cursor: status === 'loading' ? 'not-allowed' : 'pointer',
                    transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                    background:
                        status === 'success' ? '#34C759' :   // Standard Apple Green
                            status === 'error' ? '#FF3B30' :     // Standard Apple Red
                                status === 'loading' ? '#F2F2F7' :   // Standard Apple Light Gray
                                    '#1D1D1F',                       // Solid Apple Black
                    color: status === 'loading' ? '#86868B' : 'white',
                    transform: status === 'loading' ? 'scale(0.98)' : 'scale(1)'
                }}
            >
                {/* ローディングスピナーまたはアイコン */}
                {status === 'loading' ? (
                    <span style={{
                        display: 'inline-block',
                        width: '12px',
                        height: '12px',
                        border: '2px solid #86868B',
                        borderTopColor: 'transparent',
                        borderRadius: '50%',
                        animation: 'spin 0.8s linear infinite',
                    }} />
                ) : status === 'success' ? '✓' : status === 'error' ? '✕' : '↻'}

                {/* ボタンテキスト */}
                {status === 'loading' ? '更新中...' :
                    status === 'success' ? '完了' :
                        status === 'error' ? 'エラー' :
                            '今すぐ更新'}
            </button>

            {/* ステータスメッセージ */}
            {message && (
                <span style={{
                    fontSize: '12px',
                    color: status === 'success' ? '#34C759' : '#FF3B30',
                    maxWidth: '200px',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                }}>
                    {message}
                </span>
            )}

            {/* スピナーのCSSアニメーション */}
            <style jsx>{`
                @keyframes spin {
                    to { transform: rotate(360deg); }
                }
            `}</style>
        </div>
    );
}
