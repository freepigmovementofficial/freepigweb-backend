import resend from "../config/mailer";

export const sendOTPEmail = async (email: string, otp: string, name: string) => {
  await resend.emails.send({
    from: "onboarding@resend.dev", // pakai domain resend dulu sebelum punya custom domain
    to: email,
    subject: "Verify Your Email - Freepig Movement",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto; padding: 32px; background-color: #f9f9f9; border-radius: 8px;">
        <h2 style="color: #252525; margin-bottom: 8px;">Hey, ${name}! 🏄</h2>
        <p style="color: #555; margin-bottom: 24px;">
          Thanks for registering at <strong>Freepig Movement</strong>. 
          Use the OTP below to verify your email address.
        </p>
        <div style="background-color: #252525; color: #ffffff; font-size: 32px; font-weight: bold; letter-spacing: 8px; text-align: center; padding: 20px; border-radius: 8px; margin-bottom: 24px;">
          ${otp}
        </div>
        <p style="color: #999; font-size: 13px;">
          This OTP is valid for <strong>10 minutes</strong>. Do not share it with anyone.
        </p>
        <hr style="border: none; border-top: 1px solid #eee; margin: 24px 0;" />
        <p style="color: #ccc; font-size: 12px; text-align: center;">
          © 2025 Freepig Movement. All rights reserved.
        </p>
      </div>
    `,
  });
};