import Parser from 'rss-parser';

export interface NewsItem {
  title: string;
  link: string;
  pubDate: string;
  source: string;
  contentSnippet?: string;
}

const parser = new Parser();

const RSS_FEEDS = [
  // ─── ASD専門サイト（直接RSSフィード取得） ───

  // 米国 (CDC): 世界基準の出現率や政府指針。
  { url: 'https://tools.cdc.gov/api/v2/resources/media/132608.rss', source: 'CDC Autism News' },

  // 米国 (Spectrum): 自閉症研究における世界最高峰のニュースサイト。（旧The Transmitter）
  { url: 'https://www.thetransmitter.org/spectrum/feed/', source: 'Spectrum News' },

  // 世界 (Nature): 脳科学や遺伝子などの最新論文・発見。
  { url: 'https://www.nature.com/subjects/autism-spectrum-disorders.rss', source: 'Nature' },

  // ─── その他の有力なASD専門・研究メディア ───
  { url: 'https://www.sciencedaily.com/rss/mind_brain/autism.xml', source: 'ScienceDaily' },
  { url: 'https://neurosciencenews.com/neuroscience-topics/autism/feed/', source: 'Neuroscience News' },
  { url: 'https://autismspectrumnews.org/feed', source: 'Autism Spectrum News' },
  { url: 'https://autismawarenesscentre.com/feed', source: 'Autism Awareness Centre' },
];

// ASD専用サイトや特定キーワード検索のソース（キーワードフィルタをバイパスし全記事取得）
const ASD_DEDICATED_SOURCES = [
  'CDC Autism News',
  'Spectrum News',
  'Nature',
  'ScienceDaily',
  'Neuroscience News',
  'Autism Spectrum News',
  'Autism Awareness Centre',
];

// 一般ニュースサイト用のASD関連キーワード
const ASD_KEYWORDS = ['autism', 'asd', 'spectrum disorder', 'autistic'];

export async function fetchRSS(): Promise<NewsItem[]> {
  const allNews: NewsItem[] = [];

  for (const feedInfo of RSS_FEEDS) {
    try {
      // Custom fetch to handle User-Agent and potentially fix XML
      const response = await fetch(feedInfo.url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept': 'application/rss+xml, application/xml, text/xml;q=0.9, */*;q=0.8'
        }
      });

      if (!response.ok) {
        throw new Error(`Status code ${response.status}`);
      }

      const text = await response.text();

      // Basic safeguard for unescaped ampersands which break some parsers
      // This is a naive fix but helps with common bad RSS feeds
      // We only replace & that is NOT followed by # or a few chars then ;
      // Regex: &(?!(?:[a-z0-9]+|#[0-9]{1,6}|#x[0-9a-f]{1,6});)
      const fixedText = text.replace(/&(?!(?:[a-z0-9]+|#[0-9]{1,6}|#x[0-9a-f]{1,6});)/gi, '&amp;');

      const feed = await parser.parseString(fixedText);

      for (const item of feed.items) {
        // ASD専門サイトはフィルタなし、一般サイトはキーワードでフィルタ
        const isRelevant =
          ASD_DEDICATED_SOURCES.includes(feedInfo.source) ||
          ASD_KEYWORDS.some(keyword =>
            item.title?.toLowerCase().includes(keyword) ||
            item.contentSnippet?.toLowerCase().includes(keyword)
          );

        if (isRelevant && item.title && item.link && item.pubDate) {
          allNews.push({
            title: item.title,
            link: item.link,
            pubDate: item.pubDate,
            source: feedInfo.source,
            contentSnippet: item.contentSnippet
          });
        }
      }
    } catch (error) {
      console.error(`Error fetching feed ${feedInfo.source}:`, error);
    }
  }

  // Sort by date (newest first)
  return allNews.sort((a, b) => new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime());
}
