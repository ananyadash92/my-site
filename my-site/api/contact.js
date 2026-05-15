module.exports = async function handler(req, res) {
  const { name, email, interest, message } = req.body;
  if (!name || !email) return res.status(400).json({ error: 'Name and email are required.' });

  const htmlContent = `
    <h2>New Contact Form Submission</h2>
    <p><strong>Name:</strong> ${name}</p>
    <p><strong>Email:</strong> ${email}</p>
    <p><strong>Interest:</strong> ${interest || 'N/A'}</p>
    <p><strong>Message:</strong><br/>${message || 'N/A'}</p>
  `;

  try {
    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
      console.error('RESEND_API_KEY missing from .env');
      return res.status(500).json({ error: 'Server misconfiguration' });
    }

    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        from: 'Contact Form <onboarding@resend.dev>',
        to: 'ananyadash92@gmail.com',
        subject: `New Contact from ${name}`,
        html: htmlContent,
        reply_to: email
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Failed to send email:', errorText);
      return res.status(500).json({ error: 'Failed to send email via Resend' });
    }

    res.json({ success: true });
  } catch (err) {
    console.error('Error sending email:', err);
    res.status(500).json({ error: 'Internal server error while sending email' });
  }
};
