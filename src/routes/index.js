const UserController = require('../controllers').UserController;

module.exports = function(app, passport) {
    app.post('/users/login', passport.authenticate('local-login'), UserController.onLoginSuccess);
    app.get('/', UserController.index);
    app.use('/users', require('./users'));
};