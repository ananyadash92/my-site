/**
 * Sketch Proxy — fetches image from Pollinations.ai server-side and pipes to browser.
 * This avoids CORS/403 issues that occur when the browser fetches directly.
 */
async function handler(req, res) {
  const { prompt, seed = 1 } = req.query;

  if (!prompt) {
    return res.status(400).json({ error: 'prompt required' });
  }

  const url = `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?width=512&height=680&seed=${seed}&nologo=true&model=flux`;

  try {
    console.log(`[Sketch Proxy] Fetching: ${url.substring(0, 100)}...`);
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': 'image/*,*/*'
      },
      signal: AbortSignal.timeout(60000) // 60s timeout
    });

    if (!response.ok) {
      console.error(`[Sketch Proxy] Pollinations returned ${response.status}`);
      return res.status(response.status).json({ error: `Image generation failed: ${response.status}` });
    }

    const contentType = response.headers.get('content-type') || 'image/jpeg';
    res.setHeader('Content-Type', contentType);
    res.setHeader('Cache-Control', 'public, max-age=3600'); // cache for 1 hour

    // Pipe the image stream directly to our response
    const buffer = await response.arrayBuffer();
    res.end(Buffer.from(buffer));
    console.log(`[Sketch Proxy] Delivered ${buffer.byteLength} bytes for seed=${seed}`);
  } catch (err) {
    console.error('[Sketch Proxy] Error:', err.message);
    res.status(504).json({ error: 'Image generation timed out or failed' });
  }
}

module.exports = handler;
