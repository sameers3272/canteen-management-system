const express = require('express');
const { body } = require('express-validator/check');

const adminController = require('../controller/admin');
const isAuth = require('../middleware/is-auth');

const router = express.Router();


router.get('/all-food', isAuth, adminController.getAllFood);

router.get('/add-food', isAuth, adminController.getAddFood);

router.post('/add-food',
    [
        body('title').isLength({ min: 3 }).withMessage('Title Should be atleast 3 characters')
            .isAlphanumeric('en-IN', { ignore: " " }).withMessage('Only text and numbers are allowed for Title'),
        body('description').isLength({ min: 5 }).withMessage('Descripition should be atleast 5 characters'),
    ]

    , isAuth, adminController.postAddFood);

router.get('/edit-food/:id', isAuth, adminController.getEditFood);

router.post('/edit-food',
    [
        body('title').isLength({ min: 3 }).withMessage('Title Should be atleast 3 characters')
            .isAlphanumeric('en-IN', { ignore: " " }).withMessage('Only text and numbers are allowed for Title'),
        body('description').isLength({ min: 5 }).withMessage('Descripition should be atleast 5 characters'),
    ]
    , isAuth, adminController.postEditFood);

router.post('/delete-food/:id', isAuth, adminController.postDeleteFood);


module.exports = router;