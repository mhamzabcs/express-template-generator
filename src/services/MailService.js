const nodemailer = require('nodemailer');
const rp = require('request-promise');
const roleId = require('../util/constants').roleId;
const UserModel = require('../models/User');

class MailService {

    constructor() {}

    sendVerificationMail(email, token) {
        const mailOptions = {
            from: 'talha@approcket.xyz',
            to: email,
            subject: 'Zazu LineSkipper Email Verification',
            text: 'Use this link to verify your account: ' + process.env.BASE_URL + '/users/verify-email/' + token
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

    generatePasswordEmail(email, role, token) {
        let html;
        if (role == roleId.lineSkipper) {
            html = 'Use this link to generate password for your account: ' + 'http://lineskipper/' + token
        } else if (role == roleId.lineWaiter) {
            html = 'Use this link to generate password for your account: ' + 'http://linewaiter/' + token
        }
        const mailOptions = {
            from: 'talha@approcket.xyz',
            to: email,
            subject: 'Zazu LineSkipper Password',
            html: html
        };
        const transporter = nodemailer.createTransport({
            host: 'smtp.zoho.com',
            port: 465,
            secure: true, // use SSL
            auth: {
                user: process.env.MAIL_USER,
                pass: process.env.MAIL_PASS
            }
        });
        transporter.sendMail(mailOptions, function(err, info) {});
    }

    createTicket(body) {
        let role;
        if (body.roleId == roleId.lineSkipper) {
            role = 'lineskipper'
        } else if (body.roleId == roleId.lineWaiter) {
            role = 'linewaiter'
        }

        if (!role) {
            return Promise.reject('Invalid role')
        } else if (!body.userId || body.userId.length === 0) {
            return Promise.reject('Invalid user id')
        } else if (!body.issue || body.issue.length === 0) {
            return Promise.reject('Issue cant be empty')
        } else if (!body.description || body.description.length === 0) {
            return Promise.reject('Description cant be empty')
        }

        return UserModel.findOne({ _id: body.userId, roleId: body.roleId })
            .lean({ autopopulate: false })
            .select('email -_id')
            .then(user => {
                let options = {
                    method: 'POST',
                    uri: `https://api.hubapi.com/crm-objects/v1/objects/tickets?hapikey=${process.env.HUBSPOT_API_KEY}`,
                    body: [{
                            "name": "subject",
                            "value": `${body.issue}: ${user.email} - ${role}`
                        },
                        {
                            "name": "content",
                            "value": body.description
                        },
                        {
                            name: "hs_pipeline",
                            value: "0"
                        },
                        {
                            "name": "hs_pipeline_stage",
                            "value": "1"
                        },
                        {
                            "name": "source_type",
                            "value": "EMAIL"
                        }
                    ],
                    json: true // Automatically stringifies the body to JSON
                };

                return rp(options)
            })
    }
}
module.exports = new MailService();