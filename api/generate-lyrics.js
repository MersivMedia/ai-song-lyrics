const { OpenAI } = require('openai');

let openai;
if (process.env.OPENAI_API_KEY) {
    openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
}

export default async function handler(req, res) {
    // CORS headers
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
    res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { text: inputData } = req.body;

    if (!inputData || inputData.trim().length === 0) {
        return res.status(400).json({ error: 'Input text is required' });
    }

    try {
        // Demo mode fallback when no API key
        if (!openai) {
            return res.json({
                result: `**"Summer Love" - Pop Song Lyrics**\n\n**Verse 1:**\nSunset colors paint the sky\nWarm breeze dancing, you and I\nFootprints scattered in the sand\nThis is how our story began\n\n**Pre-Chorus:**\nEvery moment feels like gold\nMemories that won't grow old\n\n**Chorus:**\nSummer love, burning bright\nUnderneath the starlit night\nHearts on fire, souls align\nIn this perfect summertime\nSummer love, summer love\nNothing else we're dreaming of\n\n**Verse 2:**\nBeach café and morning rain\nLaughing through the joy and pain\nPolaroids and whispered dreams\nLife is more than what it seems\n\n**(Repeat Pre-Chorus & Chorus)**\n\n**Bridge:**\nSeptember's calling, seasons change\nBut this feeling will remain\nForever young, forever true\nSummer love, I found in you`,
                demo: true,
                message: "This is a demo response. Add OPENAI_API_KEY environment variable for live AI generation."
            });
        }

        // Real OpenAI API call
        const completion = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [
                {
                    role: "system",
                    content: `You are a talented songwriter and lyricist who has written hits across multiple genres. Create engaging, emotionally resonant lyrics with strong hooks, memorable phrases, and clear verse-chorus structure. Match the mood and style to the requested genre.`
                },
                {
                    role: "user", 
                    content: inputData
                }
            ],
            max_tokens: 2000,
            temperature: 0.7,
        });

        const result = completion.choices[0].message.content;

        res.json({
            result: result,
            demo: false
        });

    } catch (error) {
        console.error('Error:', error);
        
        // Fallback to demo response on error
        res.json({
            result: `**"Summer Love" - Pop Song Lyrics**\n\n**Verse 1:**\nSunset colors paint the sky\nWarm breeze dancing, you and I\nFootprints scattered in the sand\nThis is how our story began\n\n**Pre-Chorus:**\nEvery moment feels like gold\nMemories that won't grow old\n\n**Chorus:**\nSummer love, burning bright\nUnderneath the starlit night\nHearts on fire, souls align\nIn this perfect summertime\nSummer love, summer love\nNothing else we're dreaming of\n\n**Verse 2:**\nBeach café and morning rain\nLaughing through the joy and pain\nPolaroids and whispered dreams\nLife is more than what it seems\n\n**(Repeat Pre-Chorus & Chorus)**\n\n**Bridge:**\nSeptember's calling, seasons change\nBut this feeling will remain\nForever young, forever true\nSummer love, I found in you`,
            demo: true,
            message: "Temporary issue with AI service. Showing demo response.",
            error: error.message
        });
    }
}