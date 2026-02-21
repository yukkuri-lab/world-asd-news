import { NextResponse } from 'next/server';
import { fetchRSS } from '@/lib/rss';
import { summarizeNews } from '@/lib/gemini';
import { saveNews, getStoredNews, StoredNewsItem } from '@/lib/storage';

// Force dynamic to avoid caching this route
export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
    try {
        const authHeader = request.headers.get('authorization');
        if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
            return new Response('Unauthorized', {
                status: 401,
            });
        }

        console.log('Manual news update triggered via API...');
        const freshNews = await fetchRSS();
        const storedNews = getStoredNews();
        const existingIds = new Set(storedNews.map(item => item.id));

        const newItems: StoredNewsItem[] = [];

        for (const item of freshNews) {
            const id = Buffer.from(item.link).toString('base64');

            if (!existingIds.has(id)) {
                console.log(`New article found: ${item.title}`);
                const summary = await summarizeNews(item.title, item.contentSnippet || '', item.source);

                newItems.push({
                    ...item,
                    id,
                    summary,
                    fetchedAt: new Date().toISOString()
                });
            }
        }

        if (newItems.length > 0) {
            const updatedNews = [...newItems, ...storedNews];
            const keptNews = updatedNews.slice(0, 50);
            saveNews(keptNews);
            return NextResponse.json({ success: true, message: `Updated with ${newItems.length} new articles.` });
        } else {
            return NextResponse.json({ success: true, message: 'No new articles found.' });
        }

    } catch (error) {
        console.error('Error in manual update:', error);
        return NextResponse.json({ success: false, error: 'Failed to update news.' }, { status: 500 });
    }
}
