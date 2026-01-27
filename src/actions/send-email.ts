"use server";

import nodemailer from 'nodemailer';

interface SendEmailParams {
    to: string | string[];
    subject: string;
    html: string;
}

export async function sendEmail({ to, subject, html }: SendEmailParams) {
    try {
        const smtpEmail = process.env.SMTP_EMAIL;
        const smtpPassword = process.env.SMTP_PASSWORD;

        // Development / Fallback Mode (No Credentials)
        if (!smtpEmail || !smtpPassword) {
            console.log("---------------------------------------------------");
            console.log("⚠️  EMAIL SIMULATION (No SMTP Credentials Found) ⚠️");
            console.log(`To: ${Array.isArray(to) ? to.join(', ') : to}`);
            console.log(`Subject: ${subject}`);
            console.log(`Content (HTML Preview): ${html.substring(0, 100)}...`);
            console.log("---------------------------------------------------");
            return { success: true, message: "Email simulated (check server console)" };
        }

        // Production Mode (Gmail / SMTP)
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: smtpEmail,
                pass: smtpPassword,
            },
        });

        await transporter.verify();

        const mailOptions = {
            from: `"AIREINO Shop" <${smtpEmail}>`,
            to: Array.isArray(to) ? to.join(', ') : to,
            subject: subject,
            html: html,
        };

        await transporter.sendMail(mailOptions);
        return { success: true };

    } catch (error: any) {
        console.error("Failed to send email:", error);
        return { success: false, error: error.message };
    }
}
