'use client';

import React, { useState, useEffect } from 'react';

interface ReactionProps {
    newsId: string;
}

// 5段階の星ラベル
const STAR_LABELS: Record<number, string> = {
    1: '興味なし',
    2: 'あまり...',
    3: '気になる',
    4: '読みたい！',
    5: 'ぜひ読む！',
};

// リアクションボタンの種類
const REACTION_TYPES = [
    { id: 'courage', emoji: '😊', label: '勇気もらった' },
    { id: 'refer',   emoji: '📝', label: '参考になった' },
    { id: 'try',     emoji: '💪', label: 'やってみたい' },
];

export default function ReactionButtons({ newsId }: ReactionProps) {
    // リアクション（ON/OFF）の状態
    const [reactions, setReactions] = useState<Record<string, boolean>>({});
    // 5段階評価スコア（0=未評価）
    const [score, setScore] = useState<number>(0);
    // ホバー中の星
    const [hoverScore, setHoverScore] = useState<number>(0);
    // 評価確定アニメーション用
    const [submitted, setSubmitted] = useState<boolean>(false);

    // localStorage から読み込み
    useEffect(() => {
        const storedReaction = localStorage.getItem(`reaction_${newsId}`);
        if (storedReaction) {
            try { setReactions(JSON.parse(storedReaction)); } catch (_) {}
        }
        const storedScore = localStorage.getItem(`score_${newsId}`);
        if (storedScore) {
            const parsed = parseInt(storedScore, 10);
            if (!isNaN(parsed)) {
                setScore(parsed);
                setSubmitted(true);
            }
        }
    }, [newsId]);

    // リアクションボタンのトグル
    const toggleReaction = (e: React.MouseEvent, type: string) => {
        e.preventDefault();
        e.stopPropagation();
        const newReactions = { ...reactions, [type]: !reactions[type] };
        setReactions(newReactions);
        localStorage.setItem(`reaction_${newsId}`, JSON.stringify(newReactions));
    };

    // 星評価の確定
    const handleScoreClick = (e: React.MouseEvent, s: number) => {
        e.preventDefault();
        e.stopPropagation();
        setScore(s);
        setSubmitted(true);
        localStorage.setItem(`score_${newsId}`, String(s));
    };

    // 星のホバー
    const handleStarHover = (e: React.MouseEvent, s: number) => {
        e.preventDefault();
        e.stopPropagation();
        setHoverScore(s);
    };

    const handleStarLeave = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setHoverScore(0);
    };

    // 表示中の星（ホバー優先）
    const displayScore = hoverScore || score;

    // 「深堀りしたい」対象かどうか
    const isHighInterest = score >= 4;

    return (
        <div className="reaction-wrap" onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}>

            {/* ─── 5段階星評価 ─── */}
            <div className="star-rating-section">
                <p className="star-rating-label">
                    📖 この記事、読みたくなりましたか？
                </p>
                <div className="star-rating-row">
                    {[1, 2, 3, 4, 5].map((s) => (
                        <button
                            key={s}
                            className={`star-btn ${displayScore >= s ? 'star-btn--active' : ''} ${score === s && submitted ? 'star-btn--confirmed' : ''}`}
                            onClick={(e) => handleScoreClick(e, s)}
                            onMouseEnter={(e) => handleStarHover(e, s)}
                            onMouseLeave={handleStarLeave}
                            aria-label={`${s}点: ${STAR_LABELS[s]}`}
                        >
                            ★
                        </button>
                    ))}
                    {/* スコアのラベル */}
                    <span className="star-hint">
                        {displayScore > 0 ? STAR_LABELS[displayScore] : (submitted ? STAR_LABELS[score] : '選んでみてください')}
                    </span>
                </div>

                {/* 評価確定時のフィードバック */}
                {submitted && (
                    <div className={`score-feedback ${isHighInterest ? 'score-feedback--high' : ''}`}>
                        {isHighInterest ? (
                            <>
                                <span className="score-feedback-icon">🔥</span>
                                <span>
                                    高い関心が記録されました！近日中に<strong>深堀り記事</strong>機能をリリース予定です✨
                                </span>
                            </>
                        ) : (
                            <>
                                <span className="score-feedback-icon">📊</span>
                                <span>評価を記録しました。フィードバックありがとうございます！</span>
                            </>
                        )}
                    </div>
                )}

                {/* 4〜5点の場合のみ「深堀りボタン」表示（現在は予告のみ） */}
                {isHighInterest && (
                    <button
                        className="deepdive-btn"
                        onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}
                        disabled
                        title="近日公開予定の機能です"
                    >
                        🔍 AIで深堀りする（coming soon）
                    </button>
                )}
            </div>

            {/* ─── リアクションボタン群 ─── */}
            <div className="reaction-btn-row">
                {REACTION_TYPES.map((t) => (
                    <button
                        key={t.id}
                        onClick={(e) => toggleReaction(e, t.id)}
                        className={`reaction-btn ${reactions[t.id] ? 'reaction-btn--active' : ''}`}
                    >
                        <span className="reaction-emoji">{t.emoji}</span>
                        <span>{t.label}</span>
                    </button>
                ))}
            </div>
        </div>
    );
}
