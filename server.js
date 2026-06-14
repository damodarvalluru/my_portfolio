require("dotenv").config();
const path = require("path");
const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const nodemailer = require("nodemailer");
const twilio = require("twilio");

const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, "public")));

// 🔹 Email Setup
const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

// 🔹 Twilio Setup
const client = twilio(process.env.TWILIO_SID, process.env.TWILIO_AUTH);

// 🔹 Route
app.post("/send", async (req, res) => {
    const { name, phone, email, message } = req.body;

    try {
        // 📧 Send Email
        await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: process.env.EMAIL_USER,
            subject: "📩 New Portfolio Message",
            html: `
                <h3>New Contact Request</h3>
                <p><b>Name:</b> ${name}</p>
                <p><b>Phone:</b> ${phone}</p>
                <p><b>Email:</b> ${email}</p>
                <p><b>Message:</b> ${message}</p>
            `
        });

        // 📲 Send WhatsApp via Twilio
        await client.messages.create({
            from: process.env.TWILIO_WHATSAPP,
            to: process.env.MY_WHATSAPP,
            body: `📩 New Portfolio Message\n\nName: ${name}\nPhone: ${phone}\nEmail: ${email}\nMessage: ${message}`
        });

        // 📲 WhatsApp Redirect Link
        const whatsappURL = `https://wa.me/919573102505?text=${encodeURIComponent(
            `Hello Damodar, I'm ${name}. ${message}`
        )}`;

        res.json({ success: true, whatsappURL });

    } catch (error) {
        console.log(error);
        res.json({ success: false });
    }
});

app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "index.html"));
});

// 🔹 Start Server
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});