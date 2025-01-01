import nodemailer, {SentMessageInfo} from 'nodemailer';
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

    console.log('mailOptions::', mailOptions);

    return new Promise((resolve, reject) => {
        transporter.sendMail(mailOptions, (error: Error | null, info: SentMessageInfo) => {
            if (error) {
                console.error("Error sending email: ", error);
                reject(error);
            } else {
                console.log('Message sent: %s', info.messageId);
                console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
                const mailPreviewUrl = nodemailer.getTestMessageUrl(info)?.toString() || '';
                resolve(mailPreviewUrl);
            }
        });
    });
}
