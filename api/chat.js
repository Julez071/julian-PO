export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { messages } = req.body;

    if (!messages) {
        return res.status(400).json({ error: 'Berichten ontbreken in de request.' });
    }

    // Lees direct uit Vercel (of node) environment
    const API_KEY = process.env.AZURE_API_KEY;
    const API_URL = "https://kraatsaihub4921089588.openai.azure.com/openai/deployments/gpt-5.2-chat/chat/completions?api-version=2024-02-15-preview";

    if (!API_KEY) {
        return res.status(500).json({ error: "AZURE_API_KEY is niet ingesteld in de server environment." });
    }

    try {
        const response = await fetch(API_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "api-key": API_KEY
            },
            body: JSON.stringify({
                messages: messages,
                max_completion_tokens: 500
            })
        });

        if (!response.ok) {
            const errorText = await response.text();
            return res.status(response.status).json({ error: `Azure HTTP Fout: ${errorText}` });
        }

        const data = await response.json();
        return res.status(200).json(data);
    } catch (error) {
        console.error("Vercel Backend Error:", error);
        return res.status(500).json({ error: error.message });
    }
}
