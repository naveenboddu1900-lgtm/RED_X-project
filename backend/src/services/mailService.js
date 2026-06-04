const nodemailer = require('nodemailer');

const hasMailConfig = !!(
  process.env.EMAIL_HOST &&
  process.env.EMAIL_USER &&
  process.env.EMAIL_PASS
);

let transporter = null;

if (hasMailConfig) {
  transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: parseInt(process.env.EMAIL_PORT) || 587,
    secure: parseInt(process.env.EMAIL_PORT) === 465,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });
  console.log('\x1b[32m[Service] Nodemailer Mailer Service Initialized\x1b[0m');
} else {
  console.log('\x1b[33m[Service] Mail SMTP configs absent. Email notifications will log to console.\x1b[0m');
}

/**
 * Sends order confirmation emails
 * @param {string} toEmail - Customer email
 * @param {object} orderDetails - Order data payload
 */
const sendOrderConfirmationEmail = async (toEmail, orderDetails) => {
  const subject = `Order Confirmation - ${orderDetails.orderNumber}`;
  const htmlContent = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eaeaea; border-radius: 8px;">
      <h2 style="color: #6366f1; text-align: center;">RED_x Multi-Tenant E-Commerce</h2>
      <h3>Thank you for your order, ${orderDetails.customerInfo.name}!</h3>
      <p>Your order <strong>${orderDetails.orderNumber}</strong> has been successfully placed.</p>
      
      <table style="width: 100%; border-collapse: collapse; margin-top: 15px;">
        <thead>
          <tr style="border-bottom: 2px solid #eaeaea; text-align: left;">
            <th style="padding: 8px;">Item</th>
            <th style="padding: 8px;">Qty</th>
            <th style="padding: 8px;">Price</th>
          </tr>
        </thead>
        <tbody>
          ${orderDetails.items
            .map(
              (item) => `
            <tr style="border-bottom: 1px solid #eaeaea;">
              <td style="padding: 8px;">${item.name} <small style="color: #666;">(${item.variant || 'Default'})</small></td>
              <td style="padding: 8px;">${item.quantity}</td>
              <td style="padding: 8px;">$${item.price.toFixed(2)}</td>
            </tr>
          `
            )
            .join('')}
        </tbody>
      </table>
      
      <h3 style="text-align: right; margin-top: 20px; color: #333;">Total Paid: $${orderDetails.total.toFixed(2)}</h3>
      <hr style="border: 0; border-top: 1px solid #eaeaea;" />
      <p style="font-size: 12px; color: #777; text-align: center;">
        Shipped to: ${orderDetails.customerInfo.shippingAddress}<br />
        This is an automated transaction email for your SaaS purchases.
      </p>
    </div>
  `;

  if (hasMailConfig && transporter) {
    try {
      await transporter.sendMail({
        from: process.env.EMAIL_FROM || '"RED_x SaaS Platform" <noreply@redx-saas.com>',
        to: toEmail,
        subject: subject,
        html: htmlContent,
      });
      console.log(`[Mail Service] Order receipt email sent to: ${toEmail}`);
    } catch (err) {
      console.error('[Mail Service] Error sending SMTP email:', err.message);
    }
  } else {
    // Elegant terminal output logger
    console.log('\n\x1b[35m================= TRANSACTIONAL EMAIL LOG =================\x1b[0m');
    console.log(`\x1b[36mTo:\x1b[0m ${toEmail}`);
    console.log(`\x1b[36mSubject:\x1b[0m ${subject}`);
    console.log(`\x1b[36mRecipient Address:\x1b[0m ${orderDetails.customerInfo.shippingAddress}`);
    console.log(`\x1b[36mOrder Total:\x1b[0m $${orderDetails.total.toFixed(2)}`);
    console.log('\x1b[36mItems List:\x1b[0m');
    orderDetails.items.forEach((item) => {
      console.log(` - ${item.name} [x${item.quantity}] - $${item.price.toFixed(2)} (${item.variant || 'Standard'})`);
    });
    console.log('\x1b[35m============================================================\x1b[0m\n');
  }
};

module.exports = {
  sendOrderConfirmationEmail,
};
