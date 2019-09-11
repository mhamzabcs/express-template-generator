const Model = require('../models/User'),
    BaseService = require('../services/BaseService');

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

}
module.exports = new UserService();