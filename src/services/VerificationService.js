const BaseService = require('./BaseService'),
    Model = require('../models/Verification'),
    constants = require('../util/constants');




class VerificationService extends BaseService {

    constructor() {
        super(Model);
    }

    add(userId) {
        const possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
        let verifying_str = "";
        for (let i = 0; i < 8; i++) {
            verifying_str += possible.charAt(Math.floor(Math.random() * possible.length));
        }
        new Model({
            userId: userId,
            verificationType: constants.mailType.emailVerification,
            token: verifying_str
        }).save()
    }

}
module.exports = new VerificationService();