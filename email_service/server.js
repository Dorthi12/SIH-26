import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import jwt from "jsonwebtoken";
import nodemailer from "nodemailer";
import { Kafka } from "kafkajs";
import axios from "axios";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5001;

app.use(cors());
app.use(express.json());

// ── Nodemailer Transporter Setup ──────────────────────────────────────────
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "smtp.gmail.com",
  port: parseInt(process.env.SMTP_PORT || "465"),
  secure: process.env.SMTP_SECURE === "true",
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

// Verify connection configuration
transporter.verify((error, success) => {
  if (error) {
    console.error("SMTP transporter connection error:", error);
  } else {
    console.log("SMTP server is ready to deliver messages");
  }
});

// ── Gorgeous Dark-Themed Email Template ──────────────────────────────────
function getVerificationEmailHtml(name, verificationLink) {
  return `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Verify Your AgriSense Account</title>
    <style>
      body {
        margin: 0;
        padding: 0;
        background-color: #0b120f;
        font-family: 'Inter', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
        color: #e2e8f0;
      }
      .container {
        max-width: 600px;
        margin: 40px auto;
        background-color: #111a16;
        border: 1px border #1e3028;
        border-radius: 16px;
        overflow: hidden;
        box-shadow: 0 10px 30px rgba(0, 0, 0, 0.4);
      }
      .header {
        background-color: #16241e;
        padding: 30px 40px;
        text-align: center;
        border-b: 1px solid #23372e;
      }
      .logo-icon {
        display: inline-block;
        background-color: #2e6f40;
        color: #ffffff;
        width: 44px;
        height: 44px;
        line-height: 44px;
        border-radius: 12px;
        font-size: 22px;
        font-weight: bold;
        margin-bottom: 12px;
      }
      .brand-name {
        font-size: 24px;
        font-weight: 800;
        color: #ffffff;
        letter-spacing: -0.5px;
      }
      .brand-highlight {
        color: #2e6f40;
      }
      .content {
        padding: 40px;
        line-height: 1.6;
      }
      h1 {
        font-size: 22px;
        color: #ffffff;
        margin-top: 0;
        margin-bottom: 20px;
        font-weight: 700;
      }
      p {
        color: #94a3b8;
        font-size: 15px;
        margin-bottom: 24px;
      }
      .btn-container {
        text-align: center;
        margin: 35px 0;
      }
      .btn {
        background-color: #2e6f40;
        color: #ffffff !important;
        text-decoration: none;
        padding: 14px 32px;
        border-radius: 10px;
        font-size: 15px;
        font-weight: 600;
        display: inline-block;
        transition: background-color 0.2s;
        box-shadow: 0 4px 12px rgba(46, 111, 64, 0.25);
      }
      .btn:hover {
        background-color: #245932;
      }
      .divider {
        height: 1px;
        background-color: #23372e;
        margin: 30px 0;
      }
      .footer {
        padding: 0 40px 40px 40px;
        text-align: center;
        font-size: 12px;
        color: #64748b;
      }
      .footer a {
        color: #2e6f40;
        text-decoration: none;
      }
    </style>
  </head>
  <body>
    <div class="container">
      <div class="header">
        <div class="logo-icon">🌿</div>
        <div class="brand-name">Agri<span class="brand-highlight">Sense</span></div>
      </div>
      <div class="content">
        <h1>Welcome to AgriSense, ${name}!</h1>
        <p>Thank you for signing up for AgriSense. To complete your registration and unlock your farm dashboard, crop recommendations, and community feed, please verify your email address by clicking the button below:</p>
        
        <div class="btn-container">
          <a href="${verificationLink}" class="btn" target="_blank">Verify My Email</a>
        </div>
        
        <p style="font-size: 13px; color: #64748b; word-break: break-all;">
          If the button doesn't work, copy and paste this link in your browser:<br>
          <a href="${verificationLink}" style="color: #2e6f40;">${verificationLink}</a>
        </p>
        
        <div class="divider"></div>
        <p style="font-size: 13px; color: #64748b; margin-bottom: 0;">This verification link will expire in 24 hours. If you did not sign up for an AgriSense account, you can safely ignore this email.</p>
      </div>
      <div class="footer">
        &copy; 2026 AgriSense. All rights reserved.<br>
        Providing intelligent insights for sustainable farming.
      </div>
    </div>
  </body>
  </html>
  `;
}

// ── REST Routes ───────────────────────────────────────────────────────────

// 1. Explicit API endpoint to send emails manually
app.post("/send-mail", async (req, res) => {
  try {
    const { email, subject, body } = req.body;
    if (!email || !subject || !body) {
      return res.status(400).json({ success: false, message: "Missing required fields" });
    }

    const mailOptions = {
      from: `"AgriSense Support" <${process.env.SMTP_USER}>`,
      to: email,
      subject: subject,
      text: body,
      // Minimal dark layout fallback
      html: `<div style="background:#0b120f; color:#e2e8f0; padding:30px; font-family:sans-serif; border-radius:10px;">
        <h2 style="color:#ffffff;">AgriSense Notification</h2>
        <p style="color:#94a3b8; font-size:15px; line-height:1.5;">${body}</p>
      </div>`,
    };

    await transporter.sendMail(mailOptions);
    res.json({ success: true, message: "Email sent successfully" });
  } catch (error) {
    console.error("Send mail error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// 2. Email verification link endpoint clicked by users
app.get("/verify-mail", async (req, res) => {
  const { token } = req.query;
  const frontendUrl = (process.env.FRONTEND_URL || "http://localhost:5173").replace(/\/$/, "");
  const backendUrl = (process.env.BACKEND_URL || "http://localhost:5000").replace(/\/$/, "");

  if (!token) {
    return res.redirect(`${frontendUrl}/login?verified=false&error=missing_token`);
  }

  try {
    // Loosely coupled verification: forward the token verification to the main backend API
    const response = await axios.get(`${backendUrl}/api/auth/verify-email`, {
      params: { token },
    });

    if (response.data && response.data.success) {
      // Redirect back to frontend login with a verification success message
      return res.redirect(`${frontendUrl}/login?verified=true`);
    } else {
      return res.redirect(`${frontendUrl}/login?verified=false&error=verification_failed`);
    }
  } catch (error) {
    console.error("Verification forward failed:", error.response?.data || error.message);
    const errMsg = error.response?.data?.message || "internal_error";
    return res.redirect(`${frontendUrl}/login?verified=false&error=${encodeURIComponent(errMsg)}`);
  }
});

app.listen(PORT, () => {
  console.log(`Email microservice listening on port ${PORT}`);
});

// ── Kafka Consumer Setup ──────────────────────────────────────────────────
const kafkaBrokers = process.env.KAFKA_BROKERS
  ? process.env.KAFKA_BROKERS.split(",").map((b) => b.trim())
  : ["localhost:9092"];

const kafka = new Kafka({
  clientId: process.env.KAFKA_CLIENT_ID || "agrisense-email-service",
  brokers: kafkaBrokers,
});

const consumer = kafka.consumer({ groupId: "agrisense-email-group" });

const runConsumer = async () => {
  try {
    await consumer.connect();
    console.log("Kafka Consumer Connected inside Email Service");
    await consumer.subscribe({ topic: "user-registered", fromBeginning: false });

    await consumer.run({
      eachMessage: async ({ topic, partition, message }) => {
        try {
          const payload = JSON.parse(message.value.toString());
          console.log(`Received user-registered event for email: ${payload.email}`);

          const { email, name } = payload;
          if (!email) return;

          // Generate verification token (signed with JWT_SECRET, expires in 24h)
          const token = jwt.sign(
            { email },
            process.env.JWT_SECRET || "AgriSense_JWT_Super_Secret_Key_2026",
            { expiresIn: "24h" }
          );

          // Verification Link points to this email service's EC2 host / port
          const verificationLink = `http://localhost:${PORT}/verify-mail?token=${token}`;

          const mailOptions = {
            from: `"AgriSense Support" <${process.env.SMTP_USER}>`,
            to: email,
            subject: "Verify Your AgriSense Account",
            html: getVerificationEmailHtml(name || "Farmer", verificationLink),
          };

          await transporter.sendMail(mailOptions);
          console.log(`Verification email sent successfully to ${email}`);
        } catch (msgErr) {
          console.error("Error processing user-registered message:", msgErr);
        }
      },
    });
  } catch (err) {
    console.error("Kafka consumer error:", err);
  }
};

runConsumer();
