// ═══════════════════════════════════════════════════════════
// SAKHA v1 — AI CASCADE SYSTEM (ai.js)
// ═══════════════════════════════════════════════════════════

export async function generateInsight(archetypeKey, scores, config) {
    const geminiKey = import.meta.env.VITE_GEMINI_API_KEY;

    // Fallback if no API key is provided in the .env file
    if (!geminiKey) {
        return "Your AI insights are currently locked. Please configure the Gemini API key in your environment variables to unlock personalized analysis.";
    }

    const prompt = `
    You are an empathetic, highly intelligent psychological guide for Indian students.
    A student just completed a diagnostic test. 
    Their dominant personality archetype is: ${archetypeKey}.
    Their overall dropout risk / stress score is: ${scores.overallRisk}%.
    
    Please write a short, 3-sentence personalized insight addressing their current state. 
    Be encouraging, insightful, and do not use robotic language. Keep it under 60 words.
  `;

    try {
        // Attempt standard fetch to Google's Gemini API
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiKey}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ parts: [{ text: prompt }] }]
            })
        });

        if (!response.ok) throw new Error('Failed to connect to Gemini API');

        const data = await response.json();
        return data.candidates[0].content.parts[0].text;

    } catch (error) {
        console.error("AI Generation Error:", error);
        return "We encountered a temporary issue generating your deep AI insights. Please rely on the standard framework metrics above for now.";
    }
}