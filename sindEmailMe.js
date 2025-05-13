const nodemailer = require('nodemailer');

const sendemailMe = async (ob) => {
    const transporter = nodemailer.createTransport({
        host: "smtp.gmail.com",
        port: 465,
        secure: true,
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
        }
    });

    const mailopts = {
        from: "BEST TO YOU",
        to: process.env.RECEIVER_EMAIL, // البريد الذي ستستقبل عليه الرسائل
        subject: ob.subject,
        text: `البريد الإلكتروني: ${ob.email}\n\nالرسالة:\n${ob.message}`
    };

    try {
        const info = await transporter.sendMail(mailopts);
        console.log('Email sent: ' + info.response);
    } catch (error) {
        console.error('Error sending email: ', error);
    }
}

module.exports = sendemailMe;
