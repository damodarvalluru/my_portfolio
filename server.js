require("dotenv").config();
const path = require("path");
const express = require("express");
const cors = require("cors");
const nodemailer = require("nodemailer");
const twilio = require("twilio");

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "/")));

// 🔹 1. Robust Nodemailer Transporter Setup
const transporter = nodemailer.createTransport({
    service: "gmail",
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    },
    tls: {
        rejectUnauthorized: false
    }
});

// Verify SMTP connection on server startup
transporter.verify((error, success) => {
    if (error) {
        console.warn("⚠️ [Nodemailer Warning] SMTP verification error:", error.message);
        console.warn("💡 Tip: Verify Gmail App Password (16 characters) and 2-Step Verification in Google Account.");
    } else {
        console.log("✅ [Nodemailer] SMTP Connection established and ready to send emails.");
    }
});

// 🔹 2. Twilio Client Setup
let twilioClient = null;
if (process.env.TWILIO_SID && process.env.TWILIO_AUTH) {
    try {
        twilioClient = twilio(process.env.TWILIO_SID, process.env.TWILIO_AUTH);
        console.log("✅ [Twilio] WhatsApp client initialized.");
    } catch (err) {
        console.warn("⚠️ [Twilio Warning] Failed to initialize client:", err.message);
    }
}

// 🔹 3. Contact & Proposal Dispatch Route
app.post("/send", async (req, res) => {
    const { name, phone, email, message } = req.body;

    // Validation
    if (!name || !email || !message) {
        return res.status(400).json({
            success: false,
            error: "Missing required fields (name, email, and message are required)."
        });
    }

    const timestamp = new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" });
    const directWhatsAppURL = `https://wa.me/919573102505?text=${encodeURIComponent(
        `Hello Damodar, I am ${name} (${phone || "No phone provided"}, ${email}). ${message}`
    )}`;

    let emailSent = false;
    let whatsappSent = false;
    let emailErrorMsg = null;
    let whatsappErrorMsg = null;

    // Task 1: Send Email via Nodemailer
    const emailPromise = (async () => {
        try {
            await transporter.sendMail({
                from: `"Portfolio Dossier" <${process.env.EMAIL_USER}>`,
                to: process.env.EMAIL_USER,
                replyTo: email, // Crucial: Allows replying directly to the sender!
                subject: `📩 [Portfolio Contact] New Proposal from ${name}`,
                html: `
                    <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #0c1520; color: #f0f4f8; border: 1px solid #c5a059; border-radius: 16px; overflow: hidden;">
                        <div style="background: linear-gradient(135deg, #101c29, #080d14); padding: 24px; border-bottom: 2px solid #c5a059;">
                            <span style="font-family: monospace; font-size: 11px; color: #c5a059; letter-spacing: 2px;">[ INCOMING DOSSIER PROPOSAL ]</span>
                            <h2 style="margin: 8px 0 0; color: #ffffff; font-size: 22px;">New Contact Submission</h2>
                        </div>
                        <div style="padding: 28px;">
                            <table style="width: 100%; border-collapse: collapse;">
                                <tr>
                                    <td style="padding: 10px 0; color: #9ca3af; font-weight: 600; width: 100px;">Full Name:</td>
                                    <td style="padding: 10px 0; color: #ffffff; font-weight: 700;">${name}</td>
                                </tr>
                                <tr>
                                    <td style="padding: 10px 0; color: #9ca3af; font-weight: 600;">Email:</td>
                                    <td style="padding: 10px 0; color: #38bdf8;"><a href="mailto:${email}" style="color: #38bdf8; text-decoration: none;">${email}</a></td>
                                </tr>
                                <tr>
                                    <td style="padding: 10px 0; color: #9ca3af; font-weight: 600;">Phone:</td>
                                    <td style="padding: 10px 0; color: #ffffff;">${phone || "Not provided"}</td>
                                </tr>
                                <tr>
                                    <td style="padding: 10px 0; color: #9ca3af; font-weight: 600;">Received:</td>
                                    <td style="padding: 10px 0; color: #c5a059; font-family: monospace;">${timestamp} IST</td>
                                </tr>
                            </table>
                            <div style="margin-top: 24px; padding: 20px; background: rgba(255,255,255,0.04); border-left: 3px solid #c5a059; border-radius: 8px;">
                                <div style="font-size: 12px; font-family: monospace; color: #c5a059; margin-bottom: 8px;">MESSAGE PAYLOAD:</div>
                                <p style="margin: 0; line-height: 1.7; color: #e5e7eb; white-space: pre-wrap;">${message}</p>
                            </div>
                            <div style="margin-top: 28px; text-align: center;">
                                <a href="mailto:${email}" style="display: inline-block; background: #c5a059; color: #060a0f; font-weight: 700; padding: 12px 28px; border-radius: 25px; text-decoration: none; text-transform: uppercase; font-size: 13px;">Reply to ${name}</a>
                            </div>
                        </div>
                        <div style="background: #060a0f; padding: 14px 24px; font-size: 11px; color: #6b7280; text-align: center; border-top: 1px solid rgba(255,255,255,0.06);">
                            Damodar Valluru Portfolio &bull; Automated Dispatch System
                        </div>
                    </div>
                `
            });
            emailSent = true;
            console.log(`✅ [Nodemailer] Email successfully sent to ${process.env.EMAIL_USER}`);
        } catch (err) {
            emailErrorMsg = err.message;
            console.error("❌ [Nodemailer Error]:", err.message);
        }
    })();

    // Task 2: Send WhatsApp via Twilio
    const twilioPromise = (async () => {
        if (!twilioClient) {
            whatsappErrorMsg = "Twilio client not configured in environment variables.";
            return;
        }

        try {
            // Ensure numbers have the 'whatsapp:' prefix
            const fromNumber = process.env.TWILIO_WHATSAPP.startsWith("whatsapp:")
                ? process.env.TWILIO_WHATSAPP
                : `whatsapp:${process.env.TWILIO_WHATSAPP}`;

            const toNumber = process.env.MY_WHATSAPP.startsWith("whatsapp:")
                ? process.env.MY_WHATSAPP
                : `whatsapp:${process.env.MY_WHATSAPP}`;

            const waBody = 
                `📩 *New Portfolio Message*\n\n` +
                `👤 *Name:* ${name}\n` +
                `📱 *Phone:* ${phone || "N/A"}\n` +
                `📧 *Email:* ${email}\n` +
                `💬 *Message:*\n${message}\n\n` +
                `⏰ *Time:* ${timestamp} IST`;

            const msg = await twilioClient.messages.create({
                from: fromNumber,
                to: toNumber,
                body: waBody
            });

            whatsappSent = true;
            console.log(`✅ [Twilio] WhatsApp message queued. SID: ${msg.sid}`);
        } catch (err) {
            whatsappErrorMsg = err.message;
            console.error("❌ [Twilio WhatsApp Error]:", err.message);
            if (err.code === 21610 || err.code === 63007 || err.code === 63015) {
                console.warn("💡 Twilio Sandbox Notice: To receive messages, your phone number must join the Twilio sandbox every 72 hours.");
            }
        }
    })();

    // Concurrently await both services without letting one failure kill the other
    await Promise.allSettled([emailPromise, twilioPromise]);

    const isOverallSuccess = emailSent || whatsappSent;

    res.json({
        success: isOverallSuccess,
        emailSent,
        whatsappSent,
        whatsappURL: directWhatsAppURL,
        diagnostics: {
            emailError: emailErrorMsg,
            whatsappError: whatsappErrorMsg
        },
        message: isOverallSuccess 
            ? "Your proposal has been transmitted successfully." 
            : "Direct delivery encountered a server delay; please use the provided WhatsApp link."
    });
});

// Root & Health check
app.get("/api/health", (req, res) => {
    res.json({
        status: "online",
        timestamp: new Date().toISOString(),
        emailConfigured: Boolean(process.env.EMAIL_USER && process.env.EMAIL_PASS),
        twilioConfigured: Boolean(process.env.TWILIO_SID && process.env.TWILIO_AUTH)
    });
});

app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "index.html"));
});

// Start Server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`🚀 Portfolio Server running at http://localhost:${PORT}`);
});