const User = require('../models/user');

const bcrypt = require('bcryptjs');
const { validationResult } = require('express-validator/check');

exports.getLogin = (req, res, next) => {
    if (req.session && req.session.user) {
        return res.redirect('/');
    }
    let message = req.flash('sign-up-success');
    if (message.length > 0) {
        message = message[0]
    }
    else {
        message = null
    }
    res.render('auth/login', {
        pageTitle: "Login",
        path: "/login",
        oldData: {
            email: '',
            password: ''
        },
        errorMessage: '',
        errors: [],
        signedUp: message,
    });
    req.flash = null;

}

exports.postLogin = (req, res, next) => {
    const email = req.body.email;
    const password = req.body.password;
    const errors = validationResult(req);
    let fetchuser;

    if (!errors.isEmpty()) {
        return res.status(422).render('auth/login', {
            pageTitle: "Login",
            path: "/login",
            oldData: {
                email: email,
                password: password
            },
            errorMessage: errors.array()[0].msg,
            errors: errors.array(),
            signedUp: null,
        });
    }

    User.findOne({ email: email })
        .then(user => {
            if (!user) {
                return res.status(422).render('auth/login', {
                    pageTitle: "Login",
                    path: "/login",
                    oldData: {
                        email: email,
                        password: password
                    },
                    errorMessage: 'User not found.! Please register your account',
                    errors: [{ param: 'email' }],
                    signedUp: null,
                });
            }

            fetchuser = user;
            bcrypt.compare(password, user.password)
                .then(doMatch => {
                    if (!doMatch) {
                        return res.status(422).render('auth/login', {
                            pageTitle: "Login",
                            path: "/login",
                            oldData: {
                                email: email,
                                password: password
                            },
                            errorMessage: "Password doesn't match.! Please enter correct password",
                            errors: [{ param: 'password' }],
                            signedUp: null,
                        });
                    }

                    req.session.isLoggedIn = true;
                    req.session.user = fetchuser;
                    return req.session.save(() => {
                        req.flash('logged-in-success', `You are success logged in ${fetchuser.name}..`);
                        return res.redirect('/');
                    })
                })

        })
        .catch(err => {
            const error = new Error(err);
            error.httpStatusCode = 500;
            return next(error);
        })

}

exports.getSignup = (req, res, next) => {
    if (req.session && req.session.user) {
        return res.redirect('/');
    }
    res.render('auth/sign-up', {
        pageTitle: "Sign Up",
        path: "/sign-up",
        oldData: {
            name: '',
            email: '',
            password: '',
            confirmPassword: ''
        },
        errorMessage: '',
        errors: []
    });
}


exports.postSignup = (req, res, next) => {
    const name = req.body.name;
    const email = req.body.email;
    const password = req.body.password;
    const confirmPassword = req.body.confirmPassword;
    const errors = validationResult(req);


    if (!errors.isEmpty()) {
        return res.status(422).render('auth/sign-up', {
            pageTitle: "Sign Up",
            path: "/sign-up",
            oldData: {
                name: name,
                email: email,
                password: password,
                confirmPassword: confirmPassword
            },
            errorMessage: errors.array()[0].msg,
            errors: errors.array()
        });
    }

    bcrypt.hash(password, 12)
        .then(pass => {
            const user = new User({
                name: name,
                email: email,
                password: pass,
                cart: { items: [] },
                resetToken: null,
                resetTokenExpiration: null,
                admin: false,
            });
            return user.save();
        })
        .then(result => {
           return req.flash('sign-up-success', `Congratulation ${name}..! Thanks for Registering`);
        })
        .then(()=>{
            return res.redirect('/login');
        })
        .catch(err => {
            const error = new Error(err);
            error.httpStatusCode = 500;
            return next(error);
        })
}


exports.postLogout = (req, res, next) => {
    req.session.destroy(() => {
        res.redirect('/login');
    });
}


exports.getReset = (req, res, next) => {
    res.render('auth/reset', {
        pageTitle: "Reset Password",
        path: "/reset",
        oldData: {
            email: '',
        },
        errorMessage: '',
        errors: []
    });
}

exports.postReset = (req, res, next) => {
    const email = req.body.email;
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        return res.status(422).render('auth/reset', {
            pageTitle: "Reset Password",
            path: "/reset",
            oldData: {
                email: email,
            },
            errorMessage: errors.array()[0].msg,
            errors: errors.array()
        });

    }

    User.findOne({ email: email })
        .then(user => {
            if (!user) {
                return res.status(422).render('auth/reset', {
                    pageTitle: "Reset Password",
                    path: "/reset",
                    oldData: {
                        email: email,
                    },
                    errorMessage: "Email doesn't exist, Please create your account..!",
                    errors: [{ param: 'email' }]
                });
            }
            user.resetToken = true;
            return user.save(() => {
                return res.redirect(`/new-password/${email}`);
            })
        })
        .catch(err => {
            const error = new Error(err);
            error.httpStatusCode = 500;
            return next(error);
        })
}


exports.getNewPassword = (req, res, next) => {
    const email = req.params.email;
    User.findOne({ email: email, resetToken: true })
        .then(user => {
            if (!user) {
                return res.redirect('/reset');
            }
            res.render('auth/new-password', {
                pageTitle: "New Password",
                path: "/new-password",
                oldData: {
                    password: '',
                    confirmPassword: ''
                },
                errorMessage: '',
                errors: [],
                email: email
            });
        })
        .catch(err => {
            const error = new Error(err);
            error.httpStatusCode = 500;
            return next(error);
        })

}


exports.postNewPassword = (req, res, next) => {
    const email = req.body.email;
    const password = req.body.password;
    const confirmPassword = req.body.confirmPassword;
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        return res.status(422).render('auth/new-password', {
            pageTitle: "New Password",
            path: "/new-password",
            oldData: {
                password: password,
                confirmPassword: confirmPassword
            },
            errorMessage: errors.array()[0].msg,
            errors: errors.array(),
            email: email

        });
    }
    bcrypt.hash(password, 12)
        .then(pass => {
            User.findOne({ email: email, resetToken: true })
                .then(user => {
                    if (!user) {
                        return res.redirect('/reset');
                    }
                    user.password = pass;
                    user.resetToken = null;
                    user.save(() => {
                        res.redirect('/login');
                    })
                })
        })
        .catch(err => {
            const error = new Error(err);
            error.httpStatusCode = 500;
            return next(error);
        })
}