import { resend } from "../../../config/resend";

export const sendVerificationEmail = async (
    email: string,
    token: string
) => {
    const url = `http://localhost:5000/api/v1/auth/verify/${token}`;
    console.log("EMAIL BEFORE SEND:", email);
    await resend.emails.send({
        from: process.env.EMAIL_FROM!,
        to: email,
        subject: "Welcome to VECI — Verify your account",
        html: `
        <div style="background:#0B0F1A;padding:40px 20px;font-family:Arial,sans-serif;">
            <div style="max-width:480px;margin:0 auto;background:#121826;border-radius:16px;padding:30px;text-align:center;">
                
                <h1 style="color:#FF7A00;margin-bottom:10px;">VECI</h1>

                <h2 style="color:#FFFFFF;margin-bottom:10px;">
                Welcome to your Latin community 🌎
                </h2>

                <p style="color:#9CA3AF;font-size:14px;margin-bottom:25px;">
                You're one step away from discovering events, food, music and people that feel like home.
                </p>

                <a href="${url}" 
                style="
                    display:inline-block;
                    background:#FF7A00;
                    color:#FFFFFF;
                    padding:14px 22px;
                    border-radius:12px;
                    text-decoration:none;
                    font-weight:bold;
                    margin-bottom:20px;
                ">
                Verify my account
                </a>

                <p style="color:#6B7280;font-size:12px;">
                This link expires in 24 hours.
                </p>

            </div>

            <p style="text-align:center;color:#6B7280;font-size:12px;margin-top:20px;">
                © VECI — Your Latin community in Europe
            </p>
</div>
        `,
    });
};