const STYLE_SYSTEM_PROMPT = `You are an expert Image Consultant and Personal Stylist working for Ananya Dash, an ICF-trained Image & Presence Coach. You create detailed, personalized style recommendations based on a client's profile.

You MUST respond with valid JSON only — no markdown, no explanation text outside the JSON.

Your response must be a JSON object with exactly this structure:
{
  "client_summary": "A brief 2-sentence summary of the client's style profile and what you're optimizing for",
  "color_palette": {
    "primary": ["color1", "color2", "color3"],
    "accent": ["color1", "color2"],
    "avoid": ["color1", "color2"]
  },
  "occasions": [
    {
      "occasion": "Daily Office Wear",
      "icon": "🏢",
      "hairstyle": "Specific hairstyle recommendation",
      "makeup": "Specific makeup recommendation (or grooming for men)",
      "apparel": "Specific clothing items with fit, fabric, and style details",
      "print_pattern": "Recommended prints/patterns",
      "shoes": "Specific shoe type, color, and style",
      "accessories": "Specific accessories with materials and styles",
      "color_combinations": "2-3 specific outfit color combinations",
      "sketch_prompt": "A detailed prompt to generate a fashion illustration of this complete look. Include: the gender, body type, skin tone, exact outfit description with colors and fabrics, hairstyle, shoes, accessories, and the setting/background. Write it as a single descriptive paragraph for an AI image generator. Example format: elegant fashion illustration of a [gender] [body type] professional wearing [specific outfit details with colors], [hairstyle], [shoes], [accessories], [setting]. Style: clean fashion sketch, editorial illustration, watercolor fashion plate",
      "dos": ["do1", "do2", "do3"],
      "donts": ["dont1", "dont2", "dont3"]
    }
  ]
}

The "occasions" array must have exactly 5 items in this order:
1. Daily Office Wear (icon: 🏢)
2. Important Meetings (icon: 📊)
3. Friday Dressing (icon: 🎉)
4. Official Parties (icon: 🥂)
5. LinkedIn Profile Picture (icon: 📸)

RULES:
- Recommendations MUST be specific (brand names, exact colors, exact styles) — not generic
- Consider the client's body type, skin tone, and height/weight for flattering fits
- Consider their budget and preferred brands — suggest within their range
- Consider their city and company culture for appropriateness
- Consider their target role — dress for the position they aspire to
- Consider their values — style should express these values visually
- Factor in their best/worst look descriptions to understand what works for them
- For LinkedIn photo: include background color, pose suggestion, and expression guidance
- Be gender-appropriate in all recommendations
- If budget is limited, prioritize versatile pieces that work across occasions
- For sketch_prompt: write a vivid, detailed prompt that an AI image generator can use to create a beautiful fashion illustration. Include the client's physical features (gender, body type, skin tone, hair), the complete outfit with specific colors and fabrics, and an appropriate background. Always end with "Style: elegant fashion illustration, watercolor fashion plate, editorial sketch"`;

async function handler(req, res) {
  const { formData } = req.body;

  if (!formData) {
    return res.status(400).json({ error: 'Form data is required' });
  }

  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'API key not configured' });
  }

  // Build a detailed prompt from form data
  const clientProfile = `
CLIENT PROFILE:
- Name: ${formData.name}
- Gender: ${formData.gender}
- Age Range: ${formData.ageRange || 'Not specified'}

VALUES & ASPIRATIONS:
- Core Values: ${formData.values ? formData.values.join(', ') : 'Not specified'}
- Current Role: ${formData.currentRole}
- Target Role/Position: ${formData.targetRole}
- Industry: ${formData.industry}

PHYSICAL PROFILE:
- Body Type: ${formData.bodyType}
- Height: ${formData.height}
- Weight Range: ${formData.weightRange}
- Skin Tone: ${formData.skinTone}
- Hair Color: ${formData.hairColor}
- Hair Type: ${formData.hairType}

PROFESSIONAL CONTEXT:
- City: ${formData.city}
- Company: ${formData.company}
- Dress Code: ${formData.dressCode}
- Monthly Budget: ₹${formData.budget}
- Preferred Brands: ${formData.brands || 'No preference'}

STYLE HISTORY:
- Best Look Description: ${formData.bestLookDesc || 'Not provided'}
- Worst Look Description: ${formData.worstLookDesc || 'Not provided'}
- LinkedIn URL: ${formData.linkedinUrl || 'Not provided'}
${formData.photoAnalysis ? `
PHOTO ANALYSIS (from AI vision analysis of client's uploaded photos):
${formData.photoAnalysis}
Use these insights to make sketch_prompt extremely specific to this person's actual appearance.` : ''}

Generate a comprehensive, personalized style blueprint for this client across all 5 occasions. Be extremely specific — name exact garment types, fabrics, colors (using the client's flattering palette based on their skin tone), and brands within their budget.`;

  const messages = [
    { role: 'system', content: STYLE_SYSTEM_PROMPT },
    { role: 'user', content: clientProfile }
  ];

  try {
    // Free models on OpenRouter — multiple fallbacks in case one is rate-limited
    const models = [
      'google/gemma-4-31b-it:free',
      'openai/gpt-oss-120b:free',
      'nvidia/nemotron-3-super-120b-a12b:free',
      'meta-llama/llama-3.2-3b-instruct:free',
      'inclusionai/ring-2.6-1t:free',
      'openrouter/free'
    ];
    let lastError = null;

    for (const model of models) {
      try {
        console.log(`[Style Architect] Trying model: ${model}`);
        const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
            'HTTP-Referer': 'https://ananyadas.com',
            'X-Title': 'Ananya Dash Style Architect'
          },
          body: JSON.stringify({
            model: model,
            messages: messages,
            max_tokens: 4000,
            temperature: 0.7
          })
        });

        if (!response.ok) {
          const errorData = await response.text();
          console.error(`[Style Architect] ${model} failed:`, response.status, errorData);
          lastError = { status: response.status, data: errorData };
          continue; // try next model
        }

        const data = await response.json();
        const rawReply = data.choices?.[0]?.message?.content || '';
        console.log(`[Style Architect] ${model} succeeded, reply length: ${rawReply.length}`);

        // Parse JSON from the AI response (handles <think> tags, markdown, bare JSON)
        try {
          let jsonStr = rawReply;

          // 1. Strip <think>...</think> blocks (Qwen reasoning models)
          jsonStr = jsonStr.replace(/<think>[\s\S]*?<\/think>/gi, '').trim();

          // 2. Try to extract from markdown code block
          const mdMatch = jsonStr.match(/```(?:json)?\s*([\s\S]*?)```/);
          if (mdMatch) {
            jsonStr = mdMatch[1].trim();
          } else {
            // 3. Find first { to last } to extract raw JSON
            const start = jsonStr.indexOf('{');
            const end = jsonStr.lastIndexOf('}');
            if (start !== -1 && end !== -1 && end > start) {
              jsonStr = jsonStr.slice(start, end + 1);
            }
          }

          const recommendations = JSON.parse(jsonStr);
          return res.json({ success: true, recommendations });
        } catch (parseErr) {
          console.error(`[Style Architect] ${model} JSON parse error:`, parseErr.message);
          console.error('Raw reply (first 500):', rawReply.substring(0, 500));
          lastError = { status: 500, data: 'Failed to parse AI response' };
          continue; // try next model
        }
      } catch (fetchErr) {
        console.error(`[Style Architect] ${model} fetch error:`, fetchErr);
        lastError = { status: 500, data: fetchErr.message };
        continue;
      }
    }

    // All models failed
    return res.status(lastError?.status || 500).json({
      error: 'All AI models failed. Please check your OpenRouter API key at openrouter.ai/settings/keys and ensure it has credits.',
      details: lastError?.data || 'Unknown error'
    });

  } catch (err) {
    console.error('Style Architect API error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

module.exports = handler;
