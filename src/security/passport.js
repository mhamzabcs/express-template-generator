const UserModel = require('../models/User'),
    LocalStrategy = require('passport-local').Strategy,
    config = require('../util/config').validation;

module.exports = function(passport) {
    passport.serializeUser(function(user, done) {
        done(null, user);
    });
    passport.deserializeUser(function(id, done) {
        UserModel.findById(id, null, { autopopulate: false }).lean()
            .then((resp) => done(null, resp))
            .catch((err) => done(err, null))
    })

    passport.use('local-login', new LocalStrategy({
            usernameField: 'email',
            passwordField: 'password',
        },
        function(username, password, done) {
            let query = { username: username }
            if (config.loginField === 'username_email') {
                query = {
                    $or: [
                        { username: username },
                        { email: username }
                    ]
                }
            } else {
                query = {
                    [config.loginField]: username
                }
            }
            console.log(query)
            UserModel.findOne(query, function(err, user) {
                if (err) { return done(err); }
                if (!user) {
                    return done(null, false, { message: 'Incorrect email.' });
                }
                return UserModel.comparePassword(password, user.password)
                    .then(isMatch => {
                        if (isMatch) return done(null, user);
                        else {
                            return done(null, false, {
                                message: 'Invalid password'
                            });
                        }
                    })
                    .catch(err => {
                        return done(null, false, {
                            message: 'Unknown error occurred'
                        });
                    });
            });
        }
    ));

};