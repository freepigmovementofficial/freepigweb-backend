import resend from "../config/mailer";

export const sendOTPEmail = async (email: string, otp: string, name: string) => {
  const digits = otp.split("").map(d =>
    `<td style="padding:0 4px;">
      <div style="width:44px;height:52px;background:#222222;border:1px solid #333333;border-radius:8px;color:#ffffff;font-size:24px;font-weight:700;text-align:center;line-height:52px;font-family:Arial,sans-serif;">${d}</div>
    </td>`
  ).join("");

  await resend.emails.send({
    from: "Freepig Movement <onboarding@resend.dev>",
    to: email,
    subject: "Verify your email – Freepig Movement",
    html: `
    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#111111;">
      <tr>
        <td align="center" style="padding:40px 20px;">
          <table width="480" cellpadding="0" cellspacing="0" border="0" style="background:#111111;border-radius:12px;overflow:hidden;">

            <!-- HEADER -->
            <tr>
              <td align="center" style="padding:32px 32px 24px;border-bottom:1px solid #2a2a2a;">
                <span style="color:#ffffff;font-size:13px;font-weight:700;letter-spacing:3px;font-family:Arial,sans-serif;text-transform:uppercase;">Freepig Movement</span>
              </td>
            </tr>

            <!-- BODY -->
            <tr>
              <td style="padding:36px 32px 0;">
                <p style="color:#888888;font-size:11px;text-transform:uppercase;letter-spacing:2px;margin:0 0 12px;font-family:Arial,sans-serif;">Email Verification</p>
                <p style="color:#ffffff;font-size:24px;font-weight:700;margin:0 0 16px;line-height:1.3;font-family:Arial,sans-serif;">Hey, ${name}!<br>Verify your email.</p>
                <p style="color:#888888;font-size:14px;line-height:1.7;margin:0 0 28px;font-family:Arial,sans-serif;">
                  Welcome to the movement. Use the code below to complete your registration. This code expires in <span style="color:#ffffff;font-weight:700;">10 minutes</span>.
                </p>

                <!-- OTP BOX -->
                <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#1a1a1a;border:1px solid #2a2a2a;border-radius:10px;margin-bottom:20px;">
                  <tr>
                    <td align="center" style="padding:24px 16px 12px;">
                      <p style="color:#555555;font-size:11px;text-transform:uppercase;letter-spacing:2px;margin:0 0 16px;font-family:Arial,sans-serif;">Your OTP Code</p>
                      <table cellpadding="0" cellspacing="0" border="0">
                        <tr>${digits}</tr>
                      </table>
                    </td>
                  </tr>
                </table>

                <!-- WARNING -->
                <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:32px;">
                  <tr>
                    <td style="background:#1a1a1a;border-radius:4px;padding:14px 16px;">
                      <p style="color:#666666;font-size:12px;margin:0;line-height:1.6;font-family:Arial,sans-serif;">
                        If you didn't request this, you can safely ignore this email. Never share this code with anyone.
                      </p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>

            <!-- FOOTER -->
            <tr>
              <td style="border-top:1px solid #1e1e1e;padding:20px 32px;">
                <table width="100%" cellpadding="0" cellspacing="0" border="0">
                  <tr>
                    <td style="color:#444444;font-size:11px;font-family:Arial,sans-serif;">© 2025 Freepig Movement</td>
                    <td align="right" style="color:#444444;font-size:11px;font-family:Arial,sans-serif;">Bali, Indonesia</td>
                  </tr>
                </table>
              </td>
            </tr>

          </table>
        </td>
      </tr>
    </table>
    `,
  });
};