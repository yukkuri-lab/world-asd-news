// ニュース記事の型定義
export interface NewsItem {
    id: string;
    title: string;
    link: string;
    pubDate: string;
    source: string;
    contentSnippet?: string;
    summary: string;
    fetchedAt: string;

    // ── 独自コンテンツ（Gemini AIが生成） ──
    country?: string;          // 国コード（US / UK / AU / JP など）
    category?: string;         // カテゴリ（研究 / 制度 / 成功事例 / 学校支援）
    reliability?: string;      // 信頼度（★★★ / ★★ / ★）
    parentMeaning?: string;    // 親への意味（具体的メリット）
    todayAction?: string;      // 今日の1アクション（家庭でできること）
}
