const UserController = require('../controllers').UserController;

module.exports = function(app, passport) {
    app.post('/users/login', passport.authenticate('local-login', { failureRedirect: '/login/failure', failureFlash: true }), UserController.onLoginSuccess);
    app.get('/login/failure', UserController.failureRedirect);
    app.get('/', UserController.index);
    app.use('/users', require('./users'));
};