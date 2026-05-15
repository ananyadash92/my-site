/**
 * Photo Analysis using Google Gemini 2.0 Flash (free tier via AI Studio)
 * Falls back to OpenRouter free vision models if GEMINI_API_KEY not set.
 */

const ANALYSIS_PROMPT = `You are an expert image coach and style analyst. Carefully analyze this photo and provide a professional assessment.

Respond with VALID JSON ONLY — no markdown, no text before or after the JSON.

{
  "face_shape": "Oval / Round / Square / Heart / Diamond / Oblong — with 1 sentence explanation",
  "skin_tone": "Fair / Light / Medium / Olive / Tan / Brown / Dark — with 1 sentence on undertone",
  "hair": "Describe hair color, texture, and current style in 1 sentence",
  "body_type": "Apple / Pear / Rectangle / Hourglass / Inverted Triangle — with 1 sentence explanation based on visible proportions",
  "posture": "Brief note on posture and how it affects executive presence",
  "current_style": "Describe what the person is wearing and the overall style impression in 1-2 sentences",
  "strengths": ["visual strength 1", "visual strength 2", "visual strength 3"],
  "areas_to_enhance": ["practical enhancement suggestion 1", "suggestion 2", "suggestion 3"],
  "hairstyle_tips": "Specific hairstyle recommendations based on their face shape",
  "color_advice": "Color recommendations that complement their skin tone and undertone"
}`;

async function analyzeWithGemini(imageBase64, mimeType, apiKey) {
  // Try multiple models in case one is rate-limited
  const geminiModels = ['gemini-1.5-flash', 'gemini-2.0-flash', 'gemini-1.5-pro'];

  for (const model of geminiModels) {
    try {
      console.log(`[Photo Analysis] Trying Gemini: ${model}`);
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
      const body = {
        contents: [{
          parts: [
            { inline_data: { mime_type: mimeType || 'image/jpeg', data: imageBase64 } },
            { text: ANALYSIS_PROMPT }
          ]
        }],
        generationConfig: { temperature: 0.3, maxOutputTokens: 1000 }
      };

      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });

      if (!response.ok) {
        const err = await response.text();
        console.error(`[Photo Analysis] Gemini ${model} failed: ${response.status}`);
        continue;
      }

      const data = await response.json();
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
      if (text) {
        console.log(`[Photo Analysis] Gemini ${model} succeeded`);
        return text;
      }
    } catch (e) {
      console.error(`[Photo Analysis] Gemini ${model} error:`, e.message);
      continue;
    }
  }
  throw new Error('All Gemini models failed');
}

async function analyzeWithOpenRouter(imageBase64, mimeType, apiKey) {
  // Free vision-capable models on OpenRouter
  const visionModels = [
    'nvidia/nemotron-nano-12b-v2-vl:free',
    'google/gemma-4-31b-it:free',
    'meta-llama/llama-3.2-3b-instruct:free'
  ];

  for (const model of visionModels) {
    try {
      console.log(`[Photo Analysis] Trying OpenRouter: ${model}`);
      const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': 'https://ananyadas.com'
        },
        body: JSON.stringify({
          model,
          messages: [{
            role: 'user',
            content: [
              { type: 'image_url', image_url: { url: `data:${mimeType || 'image/jpeg'};base64,${imageBase64}` } },
              { type: 'text', text: ANALYSIS_PROMPT }
            ]
          }],
          max_tokens: 1000,
          temperature: 0.3
        })
      });

      if (!response.ok) {
        const err = await response.text();
        console.error(`[Photo Analysis] ${model} failed: ${response.status}`);
        continue;
      }

      const data = await response.json();
      const text = data.choices?.[0]?.message?.content || '';
      if (text) return text;
    } catch (e) {
      console.error(`[Photo Analysis] ${model} error:`, e.message);
      continue;
    }
  }
  throw new Error('All vision models failed');
}

function parseAnalysis(rawText) {
  let jsonStr = rawText.trim();
  const match = rawText.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (match) jsonStr = match[1].trim();
  // Find JSON object
  const start = jsonStr.indexOf('{');
  const end = jsonStr.lastIndexOf('}');
  if (start !== -1 && end !== -1) jsonStr = jsonStr.slice(start, end + 1);
  return JSON.parse(jsonStr);
}

async function handler(req, res) {
  const { imageBase64, mimeType } = req.body;

  if (!imageBase64) {
    return res.status(400).json({ error: 'Image data is required' });
  }

  const geminiKey = process.env.GEMINI_API_KEY;
  const openrouterKey = process.env.OPENROUTER_API_KEY;

  let rawText = null;

  // Try Gemini first (free, no credits needed)
  if (geminiKey) {
    try {
      console.log('[Photo Analysis] Using Gemini free API');
      rawText = await analyzeWithGemini(imageBase64, mimeType, geminiKey);
    } catch (e) {
      console.error('[Photo Analysis] Gemini failed:', e.message);
    }
  }

  // Fallback: OpenRouter free vision models
  if (!rawText && openrouterKey) {
    try {
      console.log('[Photo Analysis] Falling back to OpenRouter vision models');
      rawText = await analyzeWithOpenRouter(imageBase64, mimeType, openrouterKey);
    } catch (e) {
      console.error('[Photo Analysis] OpenRouter vision failed:', e.message);
    }
  }

  if (!rawText) {
    return res.status(503).json({
      error: 'Photo analysis unavailable. Add a free GEMINI_API_KEY to enable this feature.',
      hint: 'Get a free key at https://aistudio.google.com/apikey (no payment required)'
    });
  }

  try {
    const analysis = parseAnalysis(rawText);
    return res.json({ success: true, analysis });
  } catch (parseErr) {
    console.error('[Photo Analysis] JSON parse error:', parseErr.message);
    console.error('Raw:', rawText.substring(0, 300));
    return res.status(500).json({ error: 'Could not parse analysis. Please try a clearer photo.' });
  }
}

module.exports = handler;
