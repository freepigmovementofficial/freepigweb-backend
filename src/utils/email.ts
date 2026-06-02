import resend from "../config/mailer";

export const sendOTPEmail = async (email: string, otp: string, name: string) => {
  const digits = otp.split("").map(d =>
    `<span style="display:inline-block;width:44px;height:52px;background:#222;border:1px solid #333;border-radius:8px;color:#fff;font-size:24px;font-weight:700;line-height:52px;text-align:center;">${d}</span>`
  ).join("");

  await resend.emails.send({
    from: "Freepig Movement <onboarding@resend.dev>",
    to: email,
    subject: "Verify your email – Freepig Movement",
    html: `
    <div style="max-width:480px;margin:0 auto;background:#111111;border-radius:12px;overflow:hidden;font-family:Arial,sans-serif;">
      <div style="background:#111111;padding:32px 32px 0;text-align:center;">
        <div style="display:inline-flex;align-items:center;gap:10px;margin-bottom:24px;">
          <span style="color:#ffffff;font-size:15px;font-weight:600;letter-spacing:1.5px;text-transform:uppercase;">Freepig Movement</span>
        </div>
        <div style="border-top:1px solid #2a2a2a;margin:0 -32px;"></div>
      </div>
      <div style="padding:36px 32px 0;">
        <p style="color:#888;font-size:12px;text-transform:uppercase;letter-spacing:2px;margin:0 0 12px;">Email Verification</p>
        <h1 style="color:#ffffff;font-size:26px;font-weight:700;margin:0 0 16px;line-height:1.2;">Hey, ${name}!<br>Verify your email.</h1>
        <p style="color:#888888;font-size:14px;line-height:1.7;margin:0 0 28px;">
          Welcome to the movement. Use the code below to complete your registration. This code expires in <span style="color:#ffffff;">10 minutes</span>.
        </p>
        <div style="background:#1a1a1a;border:1px solid #2a2a2a;border-radius:10px;padding:24px;text-align:center;margin-bottom:28px;">
          <p style="color:#555;font-size:11px;text-transform:uppercase;letter-spacing:2px;margin:0 0 12px;">Your OTP Code</p>
          <div style="display:flex;justify-content:center;gap:10px;">${digits}</div>
        </div>
        <div style="background:#1a1a1a;border-radius:4px;padding:14px 16px;margin-bottom:32px;">
          <p style="color:#666;font-size:12px;margin:0;line-height:1.6;">
            If you didn't request this, you can safely ignore this email. Never share this code with anyone.
          </p>
        </div>
      </div>
      <div style="border-top:1px solid #1e1e1e;padding:20px 32px;display:flex;align-items:center;justify-content:space-between;">
        <span style="color:#444;font-size:11px;">© 2025 Freepig Movement</span>
        <span style="color:#444;font-size:11px;">Bali, Indonesia</span>
      </div>
    </div>
    `,
  });
};