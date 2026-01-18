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
        <h3>New student interested in joining</h3>
        <p><strong>Email:</strong> ${email}</p>
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
