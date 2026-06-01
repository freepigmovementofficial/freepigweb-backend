import nodemailer from "nodemailer";
import dns from 'dns';

// Memaksa Node.js untuk selalu memprioritaskan IPv4 saat me-resolve DNS
// Ini memperbaiki error "ENETUNREACH 2607:f8b0..." (IPv6 block) di Railway
dns.setDefaultResultOrder('ipv4first');

const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: {
        user: process.env.GMAIL_USER!,
        pass: process.env.GMAIL_APP_PASSWORD!,
    },
});

export default transporter;