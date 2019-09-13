const nodemailer = require('nodemailer');
const roleId = require('../util/constants').roleId;
const UserModel = require('../models/User');

class MailService {

    constructor() {}

    sendVerificationMail(email, token) {

        const mailOptions = {
            from: 'talha@approcket.xyz',
            to: email,
            subject: 'Zazu LineSkipper Email Verification',
            text: 'Use this link to verify your account: ' + process.env.BASE_URL + '/users/verify-email?token=' + token
        };
        const transporter = nodemailer.createTransport({
            host: 'smtp.zoho.com',
            port: 465,
            secure: true, // use SSL
            auth: {
                user: 'talha@approcket.xyz',
                pass: 'AppRocket001!'
            }
        });
        transporter.sendMail(mailOptions, function(err, info) {});
    }

}
module.exports = new MailService();