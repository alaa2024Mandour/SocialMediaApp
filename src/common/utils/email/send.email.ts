import nodemailer from "nodemailer";
import * as configService from "../../../config/config.service";
import Mail from "nodemailer/lib/mailer";

export const sendEmail = async (mailOptions: Mail.Options ) => {
    // Create a transporter using Ethereal test credentials.
    // For production, replace with your actual SMTP server details.
    const transporter = nodemailer.createTransport({
        //service: "gmail", // you can user service or handel it manulay like the next 3 lines (host,port,secure)
        host: "smtp.gmail.com",
        port: 587,
        secure: false, // Use true for port 465, false for port 587
        auth: {
            user: configService.APPE_MAIL,
            pass: configService.SENDING_EMAIL_PASSWORD, 
        },
        tls: {
        rejectUnauthorized: false
        }
    });

    // Send an email using async/await
    const info = await transporter.sendMail({
        from: `"SocialMedia App 🤦‍♀️🤷‍♀️" <${configService.APPE_MAIL}>`,
        ...mailOptions
    });


    return info.accepted.length > 0 ? true : false;
};

export const generateOTP = async () => {
    return Math.floor(Math.random() * 900000 + 100000);
};
