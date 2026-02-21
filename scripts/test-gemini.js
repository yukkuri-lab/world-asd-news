
const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config({ path: '.env.local' });

async function testGemini() {
    console.log('Testing Gemini API...');
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
        console.error('❌ GEMINI_API_KEY is missing in .env.local');
        return;
    }

    const genAI = new GoogleGenerativeAI(apiKey);

    // List models
    try {
        console.log('Fetching available models...');
        // Note: listModels might not be available on the main instance in some versions, 
        // need to check how to list models via SDK or REST if SDK doesn't expose it easily.
        // Actually, for this SDK:
        // const model = genAI.getGenerativeModel({ model: "..." });
        // It doesn't seem to have a direct listModels on genAI instance in early versions.
        // We will just try a few known models.
    } catch (e) {
        console.log('Could not list models directly via SDK helper.');
    }

    const modelsToTry = [
        'gemini-1.5-flash-001',
        'gemini-1.5-flash-002',
        'gemini-1.5-flash-8b',
        'gemini-1.5-flash-latest',
        'gemini-pro'
    ];

    for (const modelName of modelsToTry) {
        console.log(`\n--- Trying model: ${modelName} ---`);
        try {
            const model = genAI.getGenerativeModel({ model: modelName });
            const result = await model.generateContent('Hello, are you working?');
            const response = await result.response;
            console.log(`✅ Success with ${modelName}!`);
            console.log('Response:', response.text());
            return; // Exit on first success
        } catch (error) {
            console.error(`❌ Failed with ${modelName}:`, error.message);
        }
    }
}

testGemini();
