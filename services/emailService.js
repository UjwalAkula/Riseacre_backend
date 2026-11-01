const nodemailer = require('nodemailer');

const escapeHtml = (value = '') => String(value).replace(/[&<>"']/g, (character) => ({
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;',
}[character]));

const getListingUrl = (propertyId) => {
  const configuredUrl = (process.env.FRONTEND_URL || 'https://riseacre.vercel.app').replace(/\/+$/, '');
  return `${configuredUrl}/propertyinfo/${encodeURIComponent(propertyId)}`;
};

const sendListingLeadEmail = async ({ to, seekerName, seekerEmail, property, requesterId }) => {
  if (!to) return { sent: false, reason: 'owner_email_missing' };
  const gmailUser = process.env.GMAIL_USER;
  const appPassword = process.env.GMAIL_APP_PASSWORD?.replace(/\s/g, '');
  if (!gmailUser || !appPassword) return { sent: false, reason: 'not_configured' };

  const propertyName = property.propertyName || 'your property';
  const locality = [property.locality, property.city].filter(Boolean).join(', ') || 'Location not provided';
  const listingUrl = getListingUrl(property._id);
  const priceLabel = property.purpose === 'Lease' ? 'Monthly rent' : 'Asking price';
  const rawPrice = property.purpose === 'Lease' ? property.monthlyRent : property.expectedPrice;
  const price = Number.isFinite(Number(rawPrice)) && Number(rawPrice) > 0
    ? `₹${new Intl.NumberFormat('en-IN', { maximumFractionDigits: 0 }).format(Number(rawPrice))}${property.purpose === 'Lease' ? ' / month' : ''}`
    : 'Not specified';
  const name = seekerName || 'Riseacre user';
  const subject = `New enquiry for ${propertyName}`.replace(/[\r\n]+/g, ' ').slice(0, 150);
  const text = [
    `Hello,`,
    '',
    `Someone is interested in your Riseacre listing, ${propertyName}.`,
    '',
    'PROPERTY DETAILS',
    `Location: ${locality}`,
    `${priceLabel}: ${price}`,
    `View listing: ${listingUrl}`,
    '',
    'INTERESTED SEEKER',
    `Name: ${name}`,
    `Email: ${seekerEmail}`,
    '',
    'Reply directly to this email to contact the seeker.',
    '',
    'Riseacre | Find a place to call home',
  ].join('\n');

  const html = `
    <!doctype html>
    <html lang="en">
      <head><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
      <body style="margin:0;padding:0;background:#f1f5f9;font-family:Arial,Helvetica,sans-serif;color:#172554;">
        <div style="display:none;max-height:0;overflow:hidden;opacity:0;color:transparent;">
          ${escapeHtml(name)} is interested in ${escapeHtml(propertyName)}.
        </div>
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#f1f5f9;padding:32px 12px;">
          <tr><td align="center">
            <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:600px;background:#ffffff;border:1px solid #e2e8f0;border-radius:16px;overflow:hidden;">
              <tr>
                <td style="padding:22px 28px;background:#102a43;color:#ffffff;">
                  <div style="font-size:22px;font-weight:700;letter-spacing:-0.4px;">riseacre<span style="color:#5eead4;">.</span></div>
                  <div style="margin-top:5px;font-size:12px;color:#cbd5e1;">A better way to find a place to call home</div>
                </td>
              </tr>
              <tr>
                <td style="padding:30px 28px 22px;">
                  <div style="display:inline-block;padding:6px 10px;border-radius:999px;background:#ccfbf1;color:#0f766e;font-size:11px;font-weight:700;letter-spacing:0.8px;">NEW PROPERTY ENQUIRY</div>
                  <h1 style="margin:16px 0 8px;font-size:25px;line-height:1.3;color:#102a43;">Someone is interested in your listing</h1>
                  <p style="margin:0;color:#526477;font-size:15px;line-height:1.6;">A seeker has asked about your property. You can reply directly to this email to connect.</p>
                </td>
              </tr>
              <tr>
                <td style="padding:0 28px 22px;">
                  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:12px;">
                    <tr><td style="padding:19px 20px;">
                      <div style="font-size:11px;font-weight:700;letter-spacing:0.7px;color:#64748b;">YOUR LISTING</div>
                      <div style="margin-top:8px;font-size:19px;font-weight:700;line-height:1.4;color:#102a43;">${escapeHtml(propertyName)}</div>
                      <div style="margin-top:5px;font-size:14px;color:#526477;">${escapeHtml(locality)}</div>
                      <div style="margin-top:15px;font-size:13px;color:#526477;">${escapeHtml(priceLabel)}</div>
                      <div style="margin-top:3px;font-size:17px;font-weight:700;color:#0f766e;">${escapeHtml(price)}</div>
                    </td></tr>
                  </table>
                </td>
              </tr>
              <tr>
                <td style="padding:0 28px 26px;">
                  <table role="presentation" cellspacing="0" cellpadding="0"><tr>
                    <td style="border-radius:8px;background:#0f766e;">
                      <a href="${escapeHtml(listingUrl)}" style="display:inline-block;padding:13px 19px;color:#ffffff;text-decoration:none;font-size:14px;font-weight:700;">View property details</a>
                    </td>
                  </tr></table>
                </td>
              </tr>
              <tr>
                <td style="padding:22px 28px;background:#f8fafc;border-top:1px solid #e2e8f0;">
                  <div style="font-size:11px;font-weight:700;letter-spacing:0.7px;color:#64748b;">INTERESTED SEEKER</div>
                  <div style="margin-top:10px;font-size:16px;font-weight:700;color:#102a43;">${escapeHtml(name)}</div>
                  <div style="margin-top:5px;font-size:14px;color:#526477;">
                    <a href="mailto:${escapeHtml(seekerEmail)}" style="color:#0f766e;text-decoration:underline;">${escapeHtml(seekerEmail)}</a>
                  </div>
                  <p style="margin:15px 0 0;font-size:13px;line-height:1.6;color:#64748b;">Reply to this message to reach the seeker directly.</p>
                </td>
              </tr>
              <tr>
                <td align="center" style="padding:20px 28px;color:#94a3b8;font-size:12px;line-height:1.6;">
                  Sent by Riseacre because a seeker contacted your listing.<br>
                  <span style="color:#64748b;font-weight:700;">Riseacre</span> · Find a place to call home
                </td>
              </tr>
            </table>
          </td></tr>
        </table>
      </body>
    </html>`;

  try {
    const transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 465,
      secure: true,
      auth: { user: gmailUser, pass: appPassword },
    });
    await transporter.sendMail({
      from: `Riseacre enquiries <${gmailUser}>`,
      to,
      replyTo: seekerEmail,
      subject,
      text,
      html,
      headers: { 'X-Riseacre-Lead': `${property._id}-${requesterId}` },
    });
    return { sent: true };
  } catch (error) {
    console.error('Could not send listing enquiry email:', error.message);
    return { sent: false, reason: 'delivery_failed' };
  }
};

module.exports = { sendListingLeadEmail };
