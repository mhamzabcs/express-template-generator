const Model = require('../models/User'),
    BaseService = require('../services/BaseService'),
    CryptoJS = require("crypto-js"),
    VerificationModel = require('../models/Verification'),
    constants = require('../util/constants'),
    config = require('../util/config');

class UserService extends BaseService {

    constructor() {
        super(Model);
    }

    get(id) {
        return Model.find({ _id: id }, { "password": 0, "phoneNumber": 0 }).lean();
    }

    // //Overriding BaseService Method
    add(body) {
        let user = new Model(body);
        return user.validate()
            .then(function() {
                return Model.findOne({ email: body.email }).lean()
                    .then(resp => {
                        if (resp) {
                            return Promise.reject({ message: 'User with this email already exists' })
                        } else {
                            return Model.hashPassword(user.password)
                                .then(resp => {
                                    user.password = resp;
                                    return user.save();
                                })
                                .catch(err => console.log(err))
                        }
                    })
            })
            .catch(err => {
                return Promise.reject(err);
            })
    }

    // TO:DO Better way for this
    verifyEmail(token) {
        // token = token.replace(" ", "+");
        token = token.replace(/ /g, "+")
        let bytes = CryptoJS.AES.decrypt(token.toString(), process.env.CRYPTO_SECRET);
        let plaintext = bytes.toString(CryptoJS.enc.Utf8);
        let email = plaintext.substring(8, plaintext.length)

        return Model.findOne({ email: email })
            .then(user => {
                if (user) {
                    return VerificationModel.findOne({ userId: user._id, verificationType: constants.mailType.emailVerification }).lean()
                        .then(resp => {
                            if (resp) {
                                if (resp.updatedAt > (new Date() - 1000 * 60 * config.verification.emailExpireTime)) {
                                    return VerificationModel.deleteOne({ _id: resp._id })
                                        .then(resp => {
                                            return Model.updateOne({ email: email, verified: true }).lean()
                                                .then(resp => {
                                                    return "User verified"
                                                })
                                        })
                                } else {
                                    // generate new one here
                                    VerificationModel.deleteOne({ _id: resp._id })
                                        .then(deleted => {})
                                        .catch(err => console.log(err))
                                    return "token expired"
                                }
                            } else {
                                return "Invalid token"
                            }
                        })
                } else {
                    return "No user found";
                }
            })
    }

}
module.exports = new UserService();