import nodemailer from 'nodemailer';
import {CONFIG} from "../backend-config";

const transporter = nodemailer.createTransport({
    host: CONFIG.SMTP_HOST,
    port: Number(CONFIG.SMTP_PORT),
    auth: {
        user: CONFIG.SMTP_USER,
        pass: CONFIG.SMTP_PASSWORD,
    },
});


export function sendEmail(targetEmail: string, subject: string, text: string, html: string) {
    const mailOptions = {
        from: "Official Fullstack <noreply@ofs.org>",
        to: targetEmail,
        subject: subject,
        text: text,
        html: html,
    };

    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.error("Error sending email: ", error);
        }
    });
}
