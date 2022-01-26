const { validationResult } = require('express-validator/check');
const { deleteFile } = require('../middleware/fileHandler');
const Food = require('../models/food');
const User = require('../models/user');

exports.getAllFood = (req, res, next) => {
    if (!req.user.admin) {
        return res.redirect('/');
    }
    const search = req.query.search;

    let addmessage = req.flash('food-add')[0];

    let editmessage = req.flash('food-edit')[0];

    let deletemessage = req.flash('food-delete')[0];

    console.log(addmessage, editmessage);
    Food.find({ $or: [{ title: { $regex: search ? new RegExp(`^${search}`, 'i') : '' } }] })
        .then(foods => {

            res.render('admin/all-food', {
                pageTitle: 'Admin All Foods',
                path: '/admin/all-food',
                foods: foods,
                addmessage: addmessage,
                editmessage: editmessage,
                deletemessage: deletemessage
            });
        })
        .then(() => {
            req.flash = null
        })
        .catch(err => {
            const error = new Error(err);
            error.httpStatusCode = 500;
            return next(error);
        })
};

exports.getAddFood = (req, res, next) => {
    if (!req.user.admin) {
        return res.redirect('/');
    }
    res.render('admin/add-food', {
        pageTitle: 'Admin Add Foods',
        path: '/admin/add-food',
        editing: false,
        oldData: {
            title: '',
            price: '',
            description: ''
        },
        errorMessage: '',
        errors: [],
    });
}

exports.postAddFood = (req, res, next) => {
    const title = req.body.title;
    const image = req.file;
    const price = +req.body.price;
    const description = req.body.description;
    const food = new Food({
        title: title,
        price: price.toFixed(2),
        image: image.path,
        description: description,
        userId: req.user._id
    })
    return food.save(() => {
        req.flash('food-add', 'Food Successfully Added..!')
        return res.redirect('/admin/all-food');
    })
}




exports.getEditFood = (req, res, next) => {
    const editing = req.query.editing;

    if (!editing) {
        return res.redirect('/');
    }
    const foodId = req.params.id;

    Food.findById(foodId)

        .then(food => {
            res.render('admin/add-food', {
                pageTitle: "Edit Food",
                path: "/edit-food",
                editing: true,

                oldData: {
                    title: food.title,
                    price: food.price,
                    description: food.description,
                    _id: food._id,
                },
                errorMessage: '',
                errors: [],

            })
        })
        .catch(err => {
            const error = new Error(err);
            error.httpStatusCode = 500;
            return next(error);
        })

}

exports.postEditFood = (req, res, next) => {
    const foodId = req.body.foodId;
    const updatedTitle = req.body.title;
    const updatedImage = req.file;
    const updatedPrice = +req.body.price;
    const updatedDescription = req.body.description;
    const errors = validationResult(req);


    if (!errors.isEmpty()) {
        return res.status(422).render('admin/add-food', {
            pageTitle: "Edit Food",
            path: "/edit-food",
            editing: true,

            oldData: {
                title: updatedTitle,
                price: updatedPrice,
                description: updatedDescription,
                _id: foodId,
            },
            errorMessage: errors.array()[0].msg,
            errors: errors.array(),

        })
    }

    return Food.findById(foodId)
        .then(food => {
            food.title = updatedTitle;
            if (updatedImage) {
                deleteFile(food.image);
                food.image = updatedImage.path;
            }
            food.price = updatedPrice.toFixed(2);
            food.description = updatedDescription;
            food.save(() => {
                req.flash('food-edit', 'Food successfully Updated..!');
                return res.redirect('/admin/all-food');
            })
        })
        .catch(err => {
            const error = new Error(err);
            error.httpStatusCode = 500;
            return next(error);
        })
}

exports.postDeleteFood = (req, res, next) => {
    const foodId = req.params.id;

    Food.findByIdAndDelete(foodId)
        .then(food => {
            deleteFile(food.image);
            return User.find();
        })
        .then(users => {
            return users.forEach(user => {
                return user.cart.items.forEach(f => {
                    if (f.foodId.toString() === foodId.toString()) {
                        return user.deleteCartItems(foodId)
                    }
                })
            })
        })
        .then(result => {
            req.flash('food-delete', 'Food Successfully Deleted..!');
            return res.redirect('/admin/all-food');
        })
        .catch(err => {
            const error = new Error(err);
            error.httpStatusCode = 500;
            return next(error);
        })
}