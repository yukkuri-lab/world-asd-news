import path from 'path';
import dotenv from 'dotenv';

// Load environment variables from .env.local
const envPath = path.resolve(process.cwd(), '.env.local');
console.log(`Loading env from: ${envPath}`);
const result = dotenv.config({ path: envPath });

if (result.error) {
    console.error('Error loading .env.local:', result.error);
}

console.log('GEMINI_API_KEY loaded:', process.env.GEMINI_API_KEY ? 'Yes (Length: ' + process.env.GEMINI_API_KEY.length + ')' : 'No');

import cron from 'node-cron';
import { fetchRSS } from '../lib/rss';
import { summarizeNews } from '../lib/gemini';
import { saveNews, getStoredNews, StoredNewsItem } from '../lib/storage';

async function updateNews() {
    console.log('Starting news update...');
    try {
        const freshNews = await fetchRSS();
        const storedNews = getStoredNews();
        const existingIds = new Set(storedNews.map(item => item.id));

        const newItems: StoredNewsItem[] = [];

        // Process only new items
        for (const item of freshNews) {
            // Create a simple ID based on the link
            const id = Buffer.from(item.link).toString('base64');

            if (!existingIds.has(id)) {
                console.log(`New article found: ${item.title}`);

                // Summarize
                const summary = await summarizeNews(item.title, item.contentSnippet || '', item.source);

                newItems.push({
                    ...item,
                    id,
                    summary,
                    fetchedAt: new Date().toISOString()
                });

                // Wait 5 seconds to respect Gemini Free Tier rate limits (15 RPM)
                console.log('Waiting 5s for rate limit...');
                await new Promise(resolve => setTimeout(resolve, 5000));
            }
        }

        if (newItems.length > 0) {
            // Add new items to the beginning of the list
            const updatedNews = [...newItems, ...storedNews];
            // Keep only the latest 50 items to keep the file size manageable
            const keptNews = updatedNews.slice(0, 50);

            saveNews(keptNews);
            console.log(`Updated news with ${newItems.length} new articles.`);
        } else {
            console.log('No new articles found.');
        }

    } catch (error) {
        console.error('Error updating news:', error);
    }
}

// Manual run argument for testing: npx tsx src/scripts/scheduler.ts --run-now
if (process.argv.includes('--run-now')) {
    updateNews().then(() => process.exit(0));
}

// Schedule the task for 9:00 AM every day
// Cron format: Minute Hour Day Month DayOfWeek
cron.schedule('0 9 * * *', () => {
    console.log('Running scheduled news update at 9:00 AM');
    updateNews();
});

console.log('Scheduler started. Waiting for 9:00 AM...');
