// This is the entire content of the file: /api/analyze.js

export default async function handler(request, response) {
  // Only allow POST requests
  if (request.method !== 'POST') {
    return response.status(405).json({ message: 'Method Not Allowed' });
  }

  // Get the secret API key from the environment variables
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    return response.status(500).json({ error: 'API key not configured.' });
  }

  try {
    const trade = request.body.trade; // Get the trade data sent from the front-end

    // Create the prompt for the AI
    const prompt = `
      Act as a professional trading coach. Analyze the following trade and provide constructive feedback.
      Be concise and encouraging. Structure your feedback into "What Went Well" and "Areas for Improvement".

      Trade Details:
      - Asset: ${trade.symbol} (${trade.assetType || 'Stock'})
      - Direction: ${trade.direction}
      - Strategy / Reason for Entry: ${trade.strategy || 'Not specified'}
      - Trader's Notes / Lesson Learned: ${trade.notes || 'Not specified'}

      Provide your analysis based only on this information.
    `;
    
    // The Gemini API endpoint
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${apiKey}`;

    // Call the Gemini API from the server-side
    const geminiResponse = await fetch(apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
      }),
    });

    if (!geminiResponse.ok) {
        const errorBody = await geminiResponse.json();
        console.error("Gemini API Error:", errorBody);
        throw new Error('Failed to fetch analysis from Gemini API.');
    }

    const data = await geminiResponse.json();
    
    // Send the successful response back to the front-end
    response.status(200).json(data);

  } catch (error) {
    console.error(error);
    response.status(500).json({ error: error.message });
  }
}