import { Request, Response } from "express";
import nodemailer from "nodemailer";
import { asyncHandler } from "../../utils/asyncHandler";
import { ApiError } from "../../utils/apiError";
import { ApiResponse } from "../../utils/apiResponse";
import { EMAIL_PASS, EMAIL_USER } from "../../secrets";

export const studentLead = asyncHandler(async (req: Request, res: Response) => {
  const { email } = req.body;

  if (!email || !email.trim()) {
    throw new ApiError(400, "Email is required");
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    throw new ApiError(400, "Invalid email format");
  }

  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: EMAIL_USER,
        pass: EMAIL_PASS,
      },
    });

    await transporter.sendMail({
      from: `"Student Leads" <${EMAIL_USER}>`,
      to: EMAIL_USER, // Send to yourself
      subject: "🎓 New Student Lead",
      html: `
  <div style="
    background-color:#f4f6f8;
    padding:30px;
    font-family:Arial, Helvetica, sans-serif;
  ">
    <div style="
      max-width:500px;
      margin:0 auto;
      background:#ffffff;
      border-radius:8px;
      overflow:hidden;
      box-shadow:0 4px 12px rgba(0,0,0,0.08);
    ">
      
      <!-- Header -->
      <div style="
        background:#4f46e5;
        padding:20px;
        text-align:center;
        color:#ffffff;
      ">
        <h2 style="margin:0;font-size:20px;">
          🎓 New Student Lead
        </h2>
        <p style="margin:5px 0 0;font-size:14px;opacity:0.9;">
          You have received a new inquiry from your website
        </p>
      </div>

      <!-- Body -->
      <div style="padding:24px;">
        <p style="
          font-size:14px;
          color:#555;
          margin:0 0 16px;
        ">
          This message was submitted through the website by a student who is interested in joining.
        </p>

        <div style="
          background:#f9fafb;
          border:1px solid #e5e7eb;
          border-radius:6px;
          padding:16px;
        ">
          <p style="
            margin:0;
            font-size:15px;
            color:#111827;
          ">
            <strong>Student Email</strong>
          </p>
          <p style="
            margin:6px 0 0;
            font-size:14px;
            color:#4f46e5;
            word-break:break-all;
          ">
            ${email}
          </p>
        </div>
      </div>

      <!-- Footer -->
      <div style="
        background:#f9fafb;
        padding:14px;
        text-align:center;
        font-size:12px;
        color:#6b7280;
        border-top:1px solid #e5e7eb;
      ">
        You are receiving this email because a form was submitted on your website.
        <br />
        © ${new Date().getFullYear()} LBEF College. All rights reserved.
      </div>

    </div>
  </div>
`,
    });

    return res
      .status(200)
      .json(new ApiResponse(200, null, "Email sent successfully"));
  } catch (err: any) {
    console.error("Email sending error:", err);
    throw new ApiError(500, "Failed to send email");
  }
});
