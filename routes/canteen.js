const express = require('express');
const canteenController = require('../controller/canteen');
const isAuth = require('../middleware/is-auth');

const router = express.Router();


router.get('/cart',isAuth, canteenController.getCart);

router.post('/add-to-cart/:id',isAuth, canteenController.postAddToCart);

router.post('/delete-cart-item/:id',isAuth,canteenController.postDeleteCartItem);

router.post('/delete-cart',isAuth,canteenController.postDeleteCart);

router.post('/add-order',isAuth,canteenController.postAddOrder);

router.get('/orders',isAuth, canteenController.getOrders);

// router.get('/checkout', canteenController.getCheckout);

router.get('/',isAuth, canteenController.getIndex);






module.exports = router;