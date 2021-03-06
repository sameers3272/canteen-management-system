const Food = require("../models/food");
const Order = require("../models/order");


exports.getIndex = (req, res, next) => {
    const search = req.query.search;
    let message = req.flash('logged-in-success');
    if (message.length > 0) {
        message = message[0]
    }
    else {
        message = null
    }
    Food.find({ $or: [{ title: { $regex: search ? new RegExp(`^${search}`, 'i') : '' } }] })
        .then(foods => {
            return res.render("canteen/index", {
                pageTitle: "Canteen Management System",
                path: '/',
                foods: foods,
                loggedIn: message,
            });

        }).then(() => {
            req.flash = null;
        })
        .catch(err => {
            const error = new Error(err);
            error.httpStatusCode = 500;
            return next(error);
        })
};

exports.getCart = (req, res, next) => {
    req.user
        .populate('cart.items.foodId')
        .then(user => {
            const foods = user.cart.items;
            const total = foods.reduce((intialValue, nextValue, index, curr) => {
                return intialValue + (nextValue.quantity * nextValue.foodId.price);
            }, 0)
            res.render("canteen/cart", {
                pageTitle: "Cart",
                path: '/cart',
                foods: foods,
                total: Math.round(total),

            });
        })
        .catch(err => {
            const error = new Error(err);
            error.httpStatusCode = 500;
            return next(error);
        })


};

exports.postAddToCart = (req, res, next) => {
    const foodId = req.params.id;
    req.user
        .addToCart(foodId)
        .then(() => {

            res.redirect('/cart');
        })
        .catch(err => {
            const error = new Error(err);
            error.httpStatusCode = 500;
            return next(error);
        })
}

exports.postDeleteCartItem = (req, res, next) => {
    const foodId = req.params.id;
    req.user
        .deleteCartItems(foodId)
        .then(() => {
            res.redirect('/cart');
        })
        .catch(err => {
            const error = new Error(err);
            error.httpStatusCode = 500;
            return next(error);
        })
}

exports.postDeleteCart = (req, res, next) => {
    req.user
        .deleteCart()
        .then(() => {
            res.redirect('/cart');
        })
        .catch(err => {
            const error = new Error(err);
            error.httpStatusCode = 500;
            return next(error);
        });
}

exports.postAddOrder = (req, res, next) => {
    const cname = req.body.cname;
    const cmobile_no = req.body.cmobile_no;
    const totalPrice = req.body.totalPrice;
    let fetchUser;

    req.user
        .populate('cart.items.foodId')
        .then(user => {
            fetchUser = user;
            const items = user.cart.items.map(f => {

                return {
                    ...f.foodId._doc,
                    quantity: f.quantity,
                }

            });
            const UpdatedUser = { _id: user._id, name: user.name }
            const customer = {
                name: cname,
                mobile_no: cmobile_no,
            }

            const order = new Order({ items: items, user: UpdatedUser, customer: customer, totalPrice: totalPrice });
            return order.save();
        })
        .then(result => {
            return req.user.deleteCart()
                .then(user => {
                    return user.save();
                });
        })
        .then(result => {
            req.flash('add-order', `Order Added successfully..! Please tell ${cname} that order is preparing`);
            res.redirect('/orders');
        })
        .catch(err => {
            const error = new Error(err);
            error.httpStatusCode = 500;
            return next(error);
        })
};

exports.getOrders = (req, res, next) => {
    const addorder = req.flash('add-order')[0];
    Order.find()
        .then(orders => {
           return res.render("canteen/orders", {
                pageTitle: "Orders",
                path: '/orders',
                orders: orders,
                addorder: addorder
            });
        })
        .then(()=>{
            req.flash = null;
        })
        .catch(err => {
            const error = new Error(err);
            error.httpStatusCode = 500;
            return next(error);
        })
};

exports.getCheckout = (req, res, next) => {
    res.render("canteen/checkout", {
        pageTitle: "Checkout",
    });
};
