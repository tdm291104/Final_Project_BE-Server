const nodemailer = require('nodemailer');

const sendMail = async (email, otp) => {
    try {
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL,
                pass: process.env.PASSWORD_EMAIL
            }
        });
        const mailOptions = {
            from: process.env.EMAIL,
            to: email,
            subject: 'OTP',
            text: `NEW OTP: ${otp}`
        };

        await transporter.sendMail(mailOptions);
    } catch (e) {
        console.log(e);
    }
}


module.exports = { sendMail };