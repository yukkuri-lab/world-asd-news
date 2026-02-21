import fs from 'fs';
import path from 'path';
import { NewsItem } from './rss';

const DATA_DIR = path.join(process.cwd(), 'data');
const DATA_FILE = path.join(DATA_DIR, 'news.json');

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

export function saveNews(newsItems: StoredNewsItem[]) {
    if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(DATA_FILE, JSON.stringify(newsItems, null, 2), 'utf-8');
}

export function getStoredNews(): StoredNewsItem[] {
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
