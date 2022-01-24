const express = require('express');
const authController = require('../controller/auth');
const User = require('../models/user');
const { body } = require('express-validator/check');
const bcrypt = require('bcryptjs');

const router = express.Router();


router.get('/login', authController.getLogin);

router.post('/login', [

    body('email').isEmail().withMessage('Invalid Email Id'),

    body('password').isLength(6).withMessage('Password must be atleast 6 charachters')
        .trim()
        .isAlphanumeric().withMessage('Password must be text or number only')

], authController.postLogin);

router.get('/sign-up', authController.getSignup);

router.post('/sign-up',
    [
        body('name')
            .isAlpha('en-US', { ignore: ' ' }).withMessage('Name should be text Only')
            .isLength(4).withMessage('Name should be '),

        body('email')
            .trim().isEmail().withMessage('Invalid Email Id')
            .custom((value, { req }) => {
                return User.findOne({ email: value })
                    .then(user => {
                        if (user) {
                            return Promise.reject('Email exist already, Pick a different one');
                        }
                    })
            })
            .normalizeEmail(),

        body('password').isLength(6).withMessage('Password must be atleast 6 charachters')
            .trim()
            .isAlphanumeric().withMessage('Password must be text or number only'),

        body('confirmPassword').trim()
            .custom((value, { req }) => {
                if (value !== req.body.password) {
                    throw new Error("Password and Confirm Password doesn't match..!");
                }
                return true;
            })
    ]

    , authController.postSignup);


router.post('/logout', authController.postLogout);

router.get('/reset', authController.getReset);

router.post('/reset',
    [
        body('email').isEmail().withMessage('Invalid Email Id'),
    ]

    , authController.postReset);

router.get('/new-password/:email', authController.getNewPassword);

router.post('/new-password',
    [
        body('password').isLength(6).withMessage('Password must be atleast 6 charachters')
            .trim()
            .isAlphanumeric().withMessage('Password must be text or number only')

        ,

        body('confirmPassword').trim()
            .custom((value, { req }) => {
                if (value !== req.body.password) {
                    throw new Error("Password and Confirm Password doesn't match..!");
                }
                return true;
            }),
        body('password')
            .custom((value, { req }) => {
                return User.findOne({ email: req.body.email })
                    .then(user => {
                        return bcrypt.compare(value, user.password)
                            .then(doMatch => {
                                if (doMatch) {
                                    return Promise.reject('You Entered Same Password Please Choose Different One');
                                }
                            })
                    })
            })
    ]

    , authController.postNewPassword);


module.exports = router;