import { Request, Response } from "express";
import axios from "axios";
import { asyncHandler } from "../../utils/asyncHandler";
import { ApiError } from "../../utils/apiError";
import { ApiResponse } from "../../utils/apiResponse";
import {
  BREVO_API_KEY,
  BREVO_SENDER_EMAIL,
  BREVO_SENDER_NAME,
  RECIEVER_EMAIL,
  RECIEVER_NAME,
} from "../../secrets";
import { z } from "zod";

// Validate request body
export const emailSchema = z.object({
  email: z.string().email("Invalid email address"),
});

export const studentLead = asyncHandler(async (req: Request, res: Response) => {
  const parsed = emailSchema.safeParse(req.body);
  if (!parsed.success) {
    throw new ApiError(400, "Validation Failed", parsed.error.issues);
  }

  const { email } = parsed.data; // ✅ student email from request

  try {
    const brevoPayload = {
      sender: {
        name: BREVO_SENDER_NAME,
        email: BREVO_SENDER_EMAIL,
      },
      to: [
        {
          email: RECIEVER_EMAIL,
          name: RECIEVER_NAME,
        },
      ],
      subject: "🎓 New Student Lead",

      htmlContent: `
<!DOCTYPE html>
<html>
  <body style="
    margin:0;
    padding:0;
    background-color:#eef2f7;
    font-family:Arial, Helvetica, sans-serif;
  ">
    <table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 0;">
      <tr>
        <td align="center">

          <!-- Main Container -->
          <table width="680" cellpadding="0" cellspacing="0" style="
            background:#ffffff;
            border-radius:16px;
            overflow:hidden;
            box-shadow:0 10px 30px rgba(0,0,0,0.12);
          ">

            <!-- Header -->
            <tr>
              <td style="
                background:linear-gradient(135deg, #4f46e5, #6366f1);
                padding:35px 40px;
                text-align:center;
                color:#ffffff;
              ">
                <h1 style="
                  margin:0;
                  font-size:28px;
                  letter-spacing:0.5px;
                ">
                  🎓 New Student Lead
                </h1>
                <p style="
                  margin-top:10px;
                  font-size:15px;
                  opacity:0.95;
                ">
                  A student has submitted an inquiry through your website
                </p>
              </td>
            </tr>

            <!-- Body -->
            <tr>
              <td style="padding:40px;">
                <p style="
                  font-size:17px;
                  color:#1f2937;
                  margin-bottom:30px;
                  line-height:1.6;
                ">
                  Hello Team,<br/><br/>
                  You’ve received a new student lead. Please find the details below:
                </p>

                <!-- Lead Card -->
                <table width="100%" cellpadding="0" cellspacing="0" style="
                  background:#f9fafb;
                  border:1px solid #e5e7eb;
                  border-radius:12px;
                  padding:30px;
                  margin-bottom:30px;
                ">
                  <tr>
                    <td>
                      <p style="
                        margin:0;
                        font-size:14px;
                        color:#6b7280;
                        text-transform:uppercase;
                        letter-spacing:1px;
                      ">
                        Student Email
                      </p>

                      <p style="
                        margin:10px 0 0;
                        font-size:20px;
                        font-weight:bold;
                        color:#4f46e5;
                        word-break:break-all;
                      ">
                        ${email}
                      </p>
                    </td>
                  </tr>
                </table>

                <!-- Info -->
                <p style="
                  font-size:14px;
                  color:#6b7280;
                  line-height:1.6;
                ">
                  This inquiry was automatically generated from the student
                  lead form on your official website.
                </p>
              </td>
            </tr>

            <!-- Footer -->
            <tr>
              <td style="
                background:#f3f4f6;
                padding:25px 40px;
                text-align:center;
                font-size:13px;
                color:#6b7280;
                border-top:1px solid #e5e7eb;
              ">
                <p style="margin:0;">
                  © ${new Date().getFullYear()} <strong>LBEF College</strong><br/>
                  All rights reserved.
                </p>
              </td>
            </tr>

          </table>

        </td>
      </tr>
    </table>
  </body>
</html>
`,
    };

    await axios.post("https://api.brevo.com/v3/smtp/email", brevoPayload, {
      headers: {
        "api-key": BREVO_API_KEY,
        "Content-Type": "application/json",
        accept: "application/json",
      },
    });

    return res
      .status(200)
      .json(new ApiResponse(200, null, "Email sent successfully"));
  } catch (error: any) {
    console.error("Brevo email error:", error.response?.data || error.message);
    throw new ApiError(500, "Failed to send email");
  }
});
