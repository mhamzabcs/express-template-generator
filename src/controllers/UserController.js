const UserService = require('../services/UserService'),
    validation = require('../util/validation'),
    VerificationService = require('../services/VerificationService'),
    config = require('../util/config');

module.exports = {
    index(req, res) {
        res.status(200).json({ message: "Welcome" })
    },
    onSignUp(req, res) {
        UserService.add(req.body)
            .then(user => {
                if (config.verification.emailVerification) VerificationService.add(user._id, user.email)
                res.status(200).json({ data: user })
            })
            .catch(err => {
                if (err.errors) {
                    res.status(400).json({ error: validation(err.errors) })
                } else if (err.message) {
                    res.status(400).json({ error: err.message })
                } else { res.status(400); }
            })
    },
    onUpdate(req, res) {
        UserService.update(req.params.userId, req.body)
            .then(resp => {
                console.log(resp)
            })
            .catch(err => console.log(err))
    },
    onLoginSuccess(req, res) {
        res.status(200).json({ data: req.user })
    },
    onEmailVerification(req, res) {
        UserService.verifyEmail(req.query.token)
            .then(resp => {
                res.status(200).json({ message: resp })
            })
            .catch(err => console.log(err))
    }
}