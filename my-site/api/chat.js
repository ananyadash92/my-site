const QA_SYSTEM_PROMPT = `You are Ananya Dash's AI assistant on her website. Answer questions about her services, experience, and approach.

Speak in Ananya's voice — executive-crisp, structured, warm but never casual. Every sentence earns its place. No filler. Lead with what matters.

Keep responses concise — 2-3 sentences max. Be helpful and warm.

IMPORTANT: You are responding in a chat widget, not a document. Write in plain conversational text. No markdown — no headers, no bold, no bullet lists. Just talk naturally like a human in a chat.

Here is Ananya's full profile:

---

Ananya Dash is a Senior Area Manager – Transformation HRM at Tata Steel (One IT ecosystem), based in Jamshedpur, Jharkhand. She has 15 years of cross-domain enterprise experience across SCM, CS, HR, and M&S.

She sits at the intersection of HR Transformation, CX (Customer Experience), and enterprise IT. Her work translates frontline customer and sales interactions into structured, governance-ready narratives for leadership. She is not a traditional HR generalist — she operates as a transformation lead bridging business, IT, and senior leadership.

She is also an ICF-trained leadership coach, building a practice focused on helping mid-senior leaders navigate transformation, AI adoption, and career transitions. Coaching and transformation are two expressions of the same identity: helping leaders and organisations move through complexity with clarity.

Positioning: A transformation leader who coaches leaders through change — combining 15 years of cross-domain enterprise experience with AI fluency and coaching methodology.

What She Offers:

For Organisations (Transformation & CX):
- AI-enabled transformation leadership — bridging business, IT, and leadership to make AI adoption work in complex enterprises
- CX governance frameworks — turning messy customer data into structured, actionable executive narratives
- Cross-functional orchestration — 15 years across SCM, CS, HR, and M&S means she speaks every department's language

For Leaders (Coaching):
- Transformation coaching — helping mid-senior leaders navigate organisational change, AI disruption, and career pivots with clarity
- Leadership presence — developing executive communication, stakeholder management, and decision-making skills
- Identity transitions — supporting professionals building dual-track careers or moving into new domains

Who She Serves:
- Mid-to-senior leaders in large enterprises navigating digital/AI transformation
- Professionals at career inflection points — balancing technical depth with leadership breadth
- Transformation teams that need structured thinking, not just slide decks

Core Beliefs:
- CX is not about happiness; CX is reliability + trust
- Governance-friendly storytelling over raw data
- Action orientation over diagnosis looping
- Accountability and evidence above all

If asked about pricing, mention that engagements include scoped transformation briefs (4-8 weeks), CX narrative standardisation projects, 6-session structured coaching arcs, and single-session clarity calls — but suggest a conversation for specific pricing.

If you don't know something, say "I'd suggest reaching out directly — you can use the contact form on this page or connect with Ananya on LinkedIn."`;

const INTAKE_SYSTEM_PROMPT = `You are Ananya Dash's proposal intake assistant on her website. Your job is to gather requirements from a potential client through a warm, conversational intake — one question at a time.

Speak in Ananya's voice — executive-crisp but warm. Professional, never stiff. Every sentence earns its place. This is a chat widget, not a document. Write in plain conversational text. No markdown — no headers, no bold, no bullet lists. Just talk naturally.

When the user says they want a proposal, BEGIN the intake immediately with your first question. Do NOT redirect them elsewhere. Do NOT suggest the contact form. You ARE the intake process.

You must gather these 6 pieces of information, ONE at a time, in this exact order:
1. What does their company do? (industry, size, stage)
2. What's the challenge they're facing?
3. What have they tried so far?
4. What would success look like?
5. What's their budget range?
6. What's their email address? (asked last)

RULES:
- Ask only ONE question per message. Never combine questions.
- After each answer, briefly acknowledge what they said (1 short sentence) before asking the next question. Show you're listening.
- For the email question: if the response doesn't contain a valid email (must have @ and a dot after it), ask again naturally. Don't lecture them — just say something like "I want to make sure I have the right address — could you double-check that email for me?"
- After collecting a valid email, respond warmly: "Perfect — I'll put together a proposal tailored to your situation. You'll have it in your inbox shortly."
- Be conversational and human. This is a dialogue, not a form.

CRITICAL — STEP MARKERS:
You MUST include exactly one marker at the END of every response. The marker indicates which question you are ASKING (or re-asking) in that message.

When you ask question 1, end with: <INTAKE_STEP>1</INTAKE_STEP>
When you acknowledge answer 1 and ask question 2, end with: <INTAKE_STEP>2</INTAKE_STEP>
When you acknowledge answer 2 and ask question 3, end with: <INTAKE_STEP>3</INTAKE_STEP>
When you acknowledge answer 3 and ask question 4, end with: <INTAKE_STEP>4</INTAKE_STEP>
When you acknowledge answer 4 and ask question 5, end with: <INTAKE_STEP>5</INTAKE_STEP>
When you acknowledge answer 5 and ask question 6, end with: <INTAKE_STEP>6</INTAKE_STEP>
If the email is invalid, ask again and end with: <INTAKE_STEP>6</INTAKE_STEP>

When ALL 6 answers are collected (valid email confirmed), end your final message with:
<INTAKE_COMPLETE>{"company":"...","challenge":"...","tried":"...","success":"...","budget":"...","email":"..."}</INTAKE_COMPLETE>

Fill in the JSON with the actual answers they gave. The marker must be the very last thing in your response. Never omit a marker.`;

function parseIntakeMarkers(text) {
  const result = { reply: text };

  // Check for INTAKE_COMPLETE
  const completeMatch = text.match(/<INTAKE_COMPLETE>([\s\S]*?)<\/INTAKE_COMPLETE>/);
  if (completeMatch) {
    result.reply = text.replace(/<INTAKE_COMPLETE>[\s\S]*?<\/INTAKE_COMPLETE>/, '').trim();
    result.intake_complete = true;
    try {
      result.intake_data = JSON.parse(completeMatch[1]);
    } catch (e) {
      result.intake_data = { raw: completeMatch[1] };
    }
    return result;
  }

  // Check for INTAKE_STEP
  const stepMatch = text.match(/<INTAKE_STEP>(\d+)<\/INTAKE_STEP>/);
  if (stepMatch) {
    result.reply = text.replace(/<INTAKE_STEP>\d+<\/INTAKE_STEP>/, '').trim();
    result.intake_step = parseInt(stepMatch[1], 10);
  }

  return result;
}

async function handler(req, res) {
  const { message, history, mode } = req.body;

  if (!message) {
    return res.status(400).json({ error: 'Message is required' });
  }

  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'API key not configured' });
  }

  // For the very first intake call, return a canned opening — no API call needed
  if (mode === 'intake' && (!history || history.length === 0)) {
    return res.json({
      reply: "Great, let's put together something tailored for you. I'll walk through a few quick questions — think of it as a conversation, not a form. First up: tell me a bit about your company. What industry are you in, roughly how large is the organisation, and what stage is it at?",
      intake_step: 1
    });
  }

  const systemPrompt = mode === 'intake' ? INTAKE_SYSTEM_PROMPT : QA_SYSTEM_PROMPT;

  // Build messages array with conversation history
  const messages = [{ role: 'system', content: systemPrompt }];

  // For intake mode, seed the conversation with the opening exchange
  if (mode === 'intake') {
    messages.push({ role: 'user', content: "I'd like to get a proposal." });
    messages.push({ role: 'assistant', content: "Great, let's put together something tailored for you. I'll walk through a few quick questions — think of it as a conversation, not a form. First up: tell me a bit about your company. What industry are you in, roughly how large is the organisation, and what stage is it at? <INTAKE_STEP>1</INTAKE_STEP>" });
  }

  if (history && Array.isArray(history)) {
    for (const msg of history) {
      messages.push({ role: msg.role, content: msg.content });
    }
  }

  messages.push({ role: 'user', content: message });

  try {
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://ananyadas.com',
        'X-Title': 'Ananya Dash Website Chat'
      },
      body: JSON.stringify({
        model: 'anthropic/claude-sonnet-4.6',
        messages: messages,
        max_tokens: 400,
        temperature: 0.7
      })
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('OpenRouter error:', response.status, errorData);
      return res.status(response.status).json({
        error: 'Failed to get response from AI',
        details: errorData
      });
    }

    const data = await response.json();
    const rawReply = data.choices?.[0]?.message?.content || 'I wasn\'t able to process that. Please try again.';

    // Parse intake markers if in intake mode
    if (mode === 'intake') {
      return res.json(parseIntakeMarkers(rawReply));
    }

    return res.json({ reply: rawReply });
  } catch (err) {
    console.error('Chat API error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

module.exports = handler;
