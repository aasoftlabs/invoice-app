export const getPasswordResetTemplate = (resetUrl) => {
  return `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; background-color: #f4f4f4; margin: 0; padding: 0; }
    .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; padding: 20px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
    .header { text-align: center; padding-bottom: 20px; border-bottom: 1px solid #eeeeee; }
    .header h1 { color: #333333; margin: 0; font-size: 24px; }
    .content { padding: 20px 0; color: #555555; line-height: 1.6; }
    .button { display: inline-block; padding: 12px 24px; background-color: #0070f3; color: #ffffff; text-decoration: none; border-radius: 5px; font-weight: bold; margin-top: 20px; }
    .footer { text-align: center; font-size: 12px; color: #999999; margin-top: 20px; border-top: 1px solid #eeeeee; padding-top: 20px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <table align="center" border="0" cellpadding="0" cellspacing="0" role="presentation">
        <tr>
          <td style="vertical-align: middle; padding-right: 8px;">
            <img src="${process.env.NEXTAUTH_URL}/logo.png" alt="AA SoftLabs Logo" width="32" height="32" style="display: block; width: 32px; height: 32px;" />
          </td>
          <td style="vertical-align: middle;">
            <span style="color: #2563eb; font-size: 24px; font-weight: bold;">AA</span>
            <span style="color: #4b5563; font-size: 24px; font-weight: bold;">SoftLabs</span>
            <span style="color: #9ca3af; font-size: 14px; vertical-align: super;">&trade;</span>
          </td>
        </tr>
      </table>
    </div>
    <div class="content">
      <p>Hello,</p>
      <p>We received a request to reset your password for your AASoftLabs account. If you didn't make this request, you can safely ignore this email.</p>
      <p>To reset your password, click the button below:</p>
      <div style="text-align: center;">
        <a href="${resetUrl}" class="button" style="color: #ffffff;">Reset Password</a>
      </div>
      <p>This link will expire in 30 minutes for security reasons.</p>
      <p>If the button doesn't work, copy and paste this link into your browser:</p>
      <p><a href="${resetUrl}">${resetUrl}</a></p>
    </div>
    <div class="footer">
      <p>&copy; ${new Date().getFullYear()} AASoftLabs. All rights reserved.</p>
      <p>This is an automated message, please do not reply.</p>
    </div>
  </div>
</body>
</html>
  `;
};
