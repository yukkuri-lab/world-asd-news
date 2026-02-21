import { NextResponse } from 'next/server';
import { fetchRSS } from '@/lib/rss';
import { summarizeNews } from '@/lib/gemini';
import { saveNews, getStoredNews, StoredNewsItem } from '@/lib/storage';

// 動的ルートとしてキャッシュを無効化
export const dynamic = 'force-dynamic';

// 指定ミリ秒待機するユーティリティ関数
const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// 1回の更新で処理する最大記事数（レート制限対策）
const MAX_ARTICLES_PER_UPDATE = 10;

// 記事ごとのAPIリクエスト間隔（ミリ秒）
const DELAY_BETWEEN_REQUESTS_MS = 4500;

export async function POST(request: Request) {
    try {
        console.log('🔄 手動更新リクエストを受信しました...');

        // ネット公開時の連打防止（環境変数 UPDATE_PASSWORD が設定されていればチェック）
        if (process.env.UPDATE_PASSWORD) {
            const body = await request.json().catch(() => ({}));
            if (body.password !== process.env.UPDATE_PASSWORD) {
                console.warn('⚠️ 不正な更新リクエストをブロックしました（パスワード不一致）');
                return NextResponse.json(
                    { success: false, error: '更新パスワードが違います' },
                    { status: 401 }
                );
            }
        }

        // RSSフィードを取得
        const rawFreshNews = await fetchRSS();

        // 1. 取得したフィード内でタイトルによる重複を排除（UK版とAU版の重複対策）
        const seenTitlesInFresh = new Set<string>();
        const freshNews = rawFreshNews.filter(item => {
            if (!item.title || seenTitlesInFresh.has(item.title)) return false;
            seenTitlesInFresh.add(item.title);
            return true;
        });

        // データベース（またはローカルファイル）から既存記事を取得
        const storedNews = await getStoredNews();
        const existingIds = new Set(storedNews.map(item => item.id));
        // 2. 過去の保存済み記事とのタイトル重複もチェック
        const existingTitles = new Set(storedNews.map(item => item.title));

        const newItems: StoredNewsItem[] = [];

        // 新規記事のみをフィルタリング（IDとタイトルの両方で判定）
        const unprocessedArticles = freshNews.filter(item => {
            const id = Buffer.from(item.link).toString('base64');
            return !existingIds.has(id) && !existingTitles.has(item.title);
        });

        console.log(`📋 新規記事: ${unprocessedArticles.length}件 (今回は最大${MAX_ARTICLES_PER_UPDATE}件を処理します)`);

        // 最大件数に制限してから処理
        const articlesToProcess = unprocessedArticles.slice(0, MAX_ARTICLES_PER_UPDATE);

        for (let i = 0; i < articlesToProcess.length; i++) {
            const item = articlesToProcess[i];
            const id = Buffer.from(item.link).toString('base64');

            console.log(`📰 [${i + 1}/${articlesToProcess.length}] 処理中: ${item.title}`);

            // Gemini APIで要約＋独自コンテンツ生成
            const analysis = await summarizeNews(
                item.title,
                item.contentSnippet || '',
                item.source
            );

            newItems.push({
                ...item,
                id,
                summary: analysis.summary,
                country: analysis.country,
                category: analysis.category,
                reliability: analysis.reliability,
                parentMeaning: analysis.parentMeaning,
                todayAction: analysis.todayAction,
                fetchedAt: new Date().toISOString()
            });

            // 最後の記事以外はレート制限対策でディレイを挟む
            if (i < articlesToProcess.length - 1) {
                console.log(`⏳ レート制限対策: ${DELAY_BETWEEN_REQUESTS_MS / 1000}秒待機中...`);
                await sleep(DELAY_BETWEEN_REQUESTS_MS);
            }
        }

        if (newItems.length > 0) {
            // 既存データと結合し、最新50件を保持
            const updatedNews = [...newItems, ...storedNews];
            const keptNews = updatedNews.slice(0, 50);
            await saveNews(keptNews);

            const remaining = unprocessedArticles.length - newItems.length;
            const message = remaining > 0
                ? `${newItems.length}件を追加しました。残り${remaining}件は次回更新で処理されます。`
                : `${newItems.length}件の新しい記事を追加しました。`;

            console.log(`✅ ${message}`);
            return NextResponse.json({
                success: true,
                message,
                count: newItems.length
            });
        } else {
            console.log('ℹ️ 新規記事はありませんでした。');
            return NextResponse.json({
                success: true,
                message: '新しい記事はありませんでした。',
                count: 0
            });
        }

    } catch (error) {
        console.error('❌ 更新処理でエラーが発生しました:', error);
        return NextResponse.json(
            { success: false, error: 'ニュースの更新に失敗しました。' },
            { status: 500 }
        );
    }
}
