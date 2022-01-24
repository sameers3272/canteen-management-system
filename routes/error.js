const express = require('express');
const errorController = require('../controllers/error');
const isAuth = require('../middleware/is-auth');

const router = express.Router();

router.get('/500',isAuth, errorController.get500);



module.exports = router;
