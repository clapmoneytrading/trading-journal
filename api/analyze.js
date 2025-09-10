// This is the entire updated content for: /api/analyze.js

export default async function handler(request, response) {
  // Define which domain is allowed to access this function
  const allowedOrigin = 'https://clapmoneytrading.com';

  // Set the CORS headers to allow requests from your WordPress site
  response.setHeader('Access-Control-Allow-Origin', allowedOrigin);
  response.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  response.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle the browser's preflight OPTIONS request
  if (request.method === 'OPTIONS') {
    return response.status(200).end();
  }

  // Only allow POST requests for the actual analysis
  if (request.method !== 'POST') {
    return response.status(405).json({ message: 'Method Not Allowed' });
  }

  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    return response.status(500).json({ error: 'API key not configured.' });
  }

  try {
    const trade = request.body.trade;
    const prompt = `
      Act as a professional trading coach. Analyze the following trade and provide constructive feedback.
      Be concise and encouraging. Structure your feedback into 'What Went Well' and 'Areas for Improvement'.
      Trade Details:
      - Asset: ${trade.symbol} (${trade.assetType || 'Stock'})
      - Direction: ${trade.direction}
      - Strategy: ${trade.strategy || 'Not specified'}
      - Notes: ${trade.notes || 'Not specified'}`;
    
    // =================================================================
    // THE FIX IS ON THIS LINE: Using a newer, recommended model name
    // =================================================================
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${apiKey}`;

    const geminiResponse = await fetch(apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
      }),
    });

    if (!geminiResponse.ok) {
        const errorBody = await geminiResponse.json();
        // Pass the specific error from Google back to the front-end
        throw new Error(errorBody.error?.message || 'Failed to fetch analysis from Gemini API.');
    }

    const data = await geminiResponse.json();
    response.status(200).json(data);

  } catch (error) {
    console.error("Error in serverless function:", error);
    response.status(500).json({ error: error.message });
  }
}
