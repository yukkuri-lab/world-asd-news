import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from '@google/generative-ai';

// Gemini クライアント初期化
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

// Geminiのレスポンスを構造化して返す型
export interface GeminiAnalysis {
    summary: string;         // TITLE + 3行要約（従来形式）
    country: string;         // 国コード
    category: string;        // カテゴリ
    reliability: string;     // 信頼度
    parentMeaning: string;   // 親への意味
    todayAction: string;     // 今日の1アクション
}

/**
 * ニュース記事を分析し、要約＋独自コンテンツを生成
 */
export async function summarizeNews(
    title: string,
    contentSnippet: string,
    source: string
): Promise<GeminiAnalysis> {
    // デフォルト値（APIキー未設定やエラー時に使用）
    const fallback: GeminiAnalysis = {
        summary: `TITLE: ${title}\n- この記事の要約は現在準備中です。\n- 詳しくはリンク先の元記事をご覧ください。\n- APIキーが設定されていない可能性があります。`,
        country: '不明',
        category: '研究',
        reliability: '★★',
        parentMeaning: '詳細は元記事をご確認ください。',
        todayAction: '最新の研究動向に関心を持ち、情報を集めましょう。',
    };

    if (!process.env.GEMINI_API_KEY) {
        console.warn('GEMINI_API_KEY is not set. Using fallback data.');
        return fallback;
    }

    // gemini-2.5-flash（医療系・科学系のニュースが誤ってブロックされないようセーフティを下げる）
    const model = genAI.getGenerativeModel({
        model: 'gemini-2.5-flash',
        safetySettings: [
            {
                category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
                threshold: HarmBlockThreshold.BLOCK_NONE,
            },
            {
                category: HarmCategory.HARM_CATEGORY_HARASSMENT,
                threshold: HarmBlockThreshold.BLOCK_NONE,
            },
            {
                category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
                threshold: HarmBlockThreshold.BLOCK_NONE,
            },
            {
                category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
                threshold: HarmBlockThreshold.BLOCK_NONE,
            },
        ]
    });

    const prompt = `あなたはASD（自閉スペクトラム症）の専門ジャーナリスト兼、特別支援教育の専門家です。
以下のニュース記事を分析し、日本人の保護者（特にASDの小学生を持つ親）向けに情報を整理してください。

【最重要ミッション】
難しい研究や海外の専門的なニュースであっても、「ASDの子どもや、小学生を持つ親の日常・教育・子育てにどう役立つか」という視点を最優先に抽出・意訳してください。専門用語は極力避け、温かく希望を持てる表現を使用してください。

【出力フォーマット（JSON形式で厳守）】
以下のJSON形式で出力してください。JSONのみを出力し、他のテキストは一切含めないでください。

{
  "titleJa": "25文字以内の日本語タイトル",
  "bullets": [
    "要約1行目（必ず「。」で終わる完結した文）",
    "要約2行目（必ず「。」で終わる完結した文）",
    "要約3行目（必ず「。」で終わる完結した文）"
  ],
  "country": "記事の発信国コード（US / UK / AU / JP / EU / CA / 国際 など）",
  "category": "以下から1つ選択: 研究 / 制度・政策 / 支援・療育 / 学校教育 / 当事者の声 / テクノロジー",
  "reliability": "情報源の信頼度を以下から選択: ★★★ / ★★ / ★",
  "parentMeaning": "この記事が保護者にとってどんな意味があるか（40文字以内、具体的に）",
  "todayAction": "この記事を読んだ保護者が今日できる具体的なアクション1つ（40文字以内）"
}

【信頼度の基準】
- ★★★：政府機関（CDC, NIH等）、学会誌、大学の査読付き研究
- ★★：専門メディア（ScienceDaily, Spectrum等）、専門団体
- ★：個人ブログ、体験談、SNS情報

【記事情報】
ソース: ${source}
タイトル: ${title}
内容: ${contentSnippet}

【注意事項】
- 必ず有効なJSON形式で出力すること
- 保護者の不安を煽らず、前向きで実用的な内容にすること
- 「今日の1アクション」は具体的で実行可能なものにすること
- ※重要：もし「内容」が極端に短かったり、「タイトル」と同じであった場合でも、決してエラーにはせず、タイトルから推測して必ず全ての項目を日本語で埋めたJSONを生成してください。`;

    try {
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text().trim();

        // 確実なJSONパース（マークダウン修飾や前後の余計なテキストを排除）
        const jsonMatch = text.match(/\{[\s\S]*?\}/);
        if (!jsonMatch) {
            throw new Error('Valid JSON not found in the response.');
        }

        const parsed = JSON.parse(jsonMatch[0]);

        // TITLE + 箇条書き形式のsummaryを組み立て（従来互換）
        const summaryLines = [
            `TITLE: ${parsed.titleJa || title}`,
            ...((parsed.bullets || []) as string[]).map((b: string) => `- ${b}`),
        ].join('\n');

        return {
            summary: summaryLines,
            country: parsed.country || '不明',
            category: parsed.category || '研究',
            reliability: parsed.reliability || '★★',
            parentMeaning: parsed.parentMeaning || '詳細な内容は記事リンクよりご確認ください。',
            todayAction: parsed.todayAction || '見出しから気になるポイントをチェックしてみましょう。',
        };
    } catch (error) {
        console.error('Error generating summary with Gemini:', error);
        return {
            ...fallback,
            // フォールバック時にも極力「エラー感」を出さず、優しく見せる
            summary: `TITLE: 英語見出しのため準備中\n- こちらの記事は現在、日本語への翻訳・要約処理を行っています。\n- しばらく経ってから「今すぐ更新」を押すか、リンク先の元記事をご確認ください。`,
        };
    }
}
