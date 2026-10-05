import { resend } from "../../../config/resend";

export const sendVerificationEmail = async (
    email: string,
    token: string
) => {
    // Frontend verification page
    const url = `https://www.veci-latin.com/en/verify/${token}`;

    await resend.emails.send({
        from: process.env.EMAIL_FROM!,
        to: email,
        subject: "Welcome to VECI — Verify your email",
        html: `
        <div
            style="
                margin:0;
                padding:40px 20px;
                background:#F9FAFB;
                font-family:Arial,Helvetica,sans-serif;
            "
        >
            <div
                style="
                    max-width:520px;
                    margin:0 auto;
                    background:#FFFFFF;
                    border-radius:20px;
                    overflow:hidden;
                    box-shadow:0 4px 20px rgba(0,0,0,0.08);
                "
            >

                <!-- Header -->
                <div
                    style="
                        background:#111827;
                        padding:28px 24px;
                        text-align:center;
                    "
                >
                    <div
                        style="
                            display:inline-block;
                            padding:10px 18px;
                            border-radius:12px;
                            background:#F2C94C;
                            color:#111827;
                            font-size:24px;
                            font-weight:800;
                            letter-spacing:1px;
                        "
                    >
                        VECI
                    </div>
                </div>

                <!-- Content -->
                <div
                    style="
                        padding:36px 32px;
                        text-align:center;
                    "
                >

                    <div
                        style="
                            font-size:42px;
                            line-height:1;
                            margin-bottom:20px;
                        "
                    >
                        ✉️
                    </div>

                    <h1
                        style="
                            margin:0 0 12px 0;
                            color:#111827;
                            font-size:26px;
                            line-height:1.3;
                        "
                    >
                        Welcome to Veci!
                    </h1>

                    <p
                        style="
                            margin:0 auto 24px auto;
                            color:#4B5563;
                            font-size:15px;
                            line-height:1.6;
                            max-width:420px;
                        "
                    >
                        You're one step away from discovering your
                        Latin community in Europe.
                    </p>

                    <!-- Benefits -->
                    <div
                        style="
                            background:#F9FAFB;
                            border-radius:14px;
                            padding:20px;
                            margin-bottom:28px;
                            text-align:left;
                        "
                    >
                        <p
                            style="
                                margin:0 0 12px 0;
                                color:#111827;
                                font-size:14px;
                                font-weight:bold;
                            "
                        >
                            Discover on Veci:
                        </p>

                        <p
                            style="
                                margin:8px 0;
                                color:#4B5563;
                                font-size:14px;
                            "
                        >
                            🎉 Events &amp; activities
                        </p>

                        <p
                            style="
                                margin:8px 0;
                                color:#4B5563;
                                font-size:14px;
                            "
                        >
                            🍴 Latin businesses &amp; food
                        </p>

                        <p
                            style="
                                margin:8px 0;
                                color:#4B5563;
                                font-size:14px;
                            "
                        >
                            🌎 People &amp; community
                        </p>
                    </div>

                    <!-- CTA -->
                    <a
                        href="${url}"
                        style="
                            display:inline-block;
                            background:#FF7A00;
                            color:#FFFFFF;
                            padding:15px 28px;
                            border-radius:12px;
                            text-decoration:none;
                            font-size:15px;
                            font-weight:bold;
                        "
                    >
                        Verify my email
                    </a>

                    <p
                        style="
                            margin:22px 0 0 0;
                            color:#6B7280;
                            font-size:12px;
                            line-height:1.5;
                        "
                    >
                        This verification link expires in 24 hours.
                    </p>

                    <p
                        style="
                            margin:10px 0 0 0;
                            color:#9CA3AF;
                            font-size:12px;
                            line-height:1.5;
                        "
                    >
                        If you didn't create a Veci account,
                        you can safely ignore this email.
                    </p>

                </div>

                <!-- Footer -->
                <div
                    style="
                        padding:20px;
                        background:#F9FAFB;
                        border-top:1px solid #E5E7EB;
                        text-align:center;
                    "
                >
                    <p
                        style="
                            margin:0;
                            color:#6B7280;
                            font-size:12px;
                        "
                    >
                        Discover your community. Discover Veci.
                    </p>

                    <p
                        style="
                            margin:8px 0 0 0;
                            color:#9CA3AF;
                            font-size:11px;
                        "
                    >
                        © Veci — Your Latin community in Europe
                    </p>
                </div>

            </div>
        </div>
        `,
    });
};

export const sendPasswordResetEmail = async (
    email: string,
    token: string
) => {
    const url = `https://www.veci-latin.com/en/reset-password/${token}`;

    await resend.emails.send({
        from: process.env.EMAIL_FROM!,
        to: email,
        subject: "Reset your VECI password",
        html: `
        <div
            style="
                background:#0B0F1A;
                padding:40px 20px;
                font-family:Arial,sans-serif;
            "
        >
            <div
                style="
                    max-width:480px;
                    margin:0 auto;
                    background:#121826;
                    border-radius:16px;
                    padding:30px;
                    text-align:center;
                "
            >

                <h1 style="color:#FF7A00;">
                    VECI
                </h1>

                <h2 style="color:#FFFFFF;">
                    Reset your password
                </h2>

                <p style="color:#9CA3AF;">
                    We received a request to reset your password.
                    If you requested this, click the button below.
                </p>

                <a
                    href="${url}"
                    style="
                        display:inline-block;
                        background:#FF7A00;
                        color:#FFFFFF;
                        padding:14px 22px;
                        border-radius:12px;
                        text-decoration:none;
                        font-weight:bold;
                        margin-top:20px;
                    "
                >
                    Reset password
                </a>

                <p
                    style="
                        color:#6B7280;
                        font-size:12px;
                        margin-top:20px;
                    "
                >
                    This link expires in 15 minutes.
                </p>

                <p
                    style="
                        color:#6B7280;
                        font-size:12px;
                    "
                >
                    If you didn't request a password reset,
                    you can safely ignore this email.
                </p>

            </div>
        </div>
        `,
    });
};