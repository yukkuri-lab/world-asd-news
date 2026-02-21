import fs from 'fs';
import path from 'path';
import { NewsItem } from './rss';
import { Redis } from '@upstash/redis';

const DATA_DIR = path.join(process.cwd(), 'data');
const DATA_FILE = path.join(DATA_DIR, 'news.json');

// VercelなどでRedis環境変数が設定されていれば有効化
const redis = process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN
    ? new Redis({
        url: process.env.UPSTASH_REDIS_REST_URL,
        token: process.env.UPSTASH_REDIS_REST_TOKEN,
    })
    : null;

// 保存用の拡張型（独自コンテンツ含む）
export interface StoredNewsItem extends NewsItem {
    id: string;              // ユニークID（リンクのbase64）
    summary: string;         // TITLE + 3行要約
    fetchedAt: string;       // 取得日時
    // ── 独自コンテンツ ──
    country?: string;        // 国コード
    category?: string;       // カテゴリ
    reliability?: string;    // 信頼度
    parentMeaning?: string;  // 親への意味
    todayAction?: string;    // 今日の1アクション
}

export async function saveNews(newsItems: StoredNewsItem[]) {
    // Vercel Redisが設定されている場合はRedisへ保存
    if (redis) {
        await redis.set('world_asd_news', newsItems);
        return;
    }

    // ローカル環境の場合はファイル(news.json)へ保存
    if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(DATA_FILE, JSON.stringify(newsItems, null, 2), 'utf-8');
}

export async function getStoredNews(): Promise<StoredNewsItem[]> {
    // Vercel Redisが設定されている場合はRedisから取得
    if (redis) {
        try {
            const data = await redis.get<StoredNewsItem[]>('world_asd_news');
            return data || [];
        } catch (error) {
            console.error('Error reading from Redis:', error);
            return [];
        }
    }

    // ローカル環境の場合はファイルから取得
    if (!fs.existsSync(DATA_FILE)) {
        return [];
    }
    const data = fs.readFileSync(DATA_FILE, 'utf-8');
    try {
        return JSON.parse(data);
    } catch (error) {
        console.error('Error parsing news.json:', error);
        return [];
    }
}
