const UserModel = require('../models/User'),
    LocalStrategy = require('passport-local').Strategy;

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
            // passReqToCallback: true // uncomment if you want req in callback function
        },
        function(username, password, done) {
            UserModel.findOne({ email: username }, function(err, user) {
                if (err) { return done(err); }
                if (!user) {
                    res.status(400).json({
                        message: 'Incorrect email.'
                    })
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