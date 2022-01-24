const mongoose = require('mongoose');

const { Schema } = mongoose

const UserSchema = Schema({
    name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
    },
    password: {
        type: String,
        required: true
    },
    admin:{
        type:Boolean,
        required:true
    },
    cart: {
        items: [{
            foodId: {
                type: Schema.Types.ObjectId,
                required: true,
                ref: 'Food'
            },
            quantity: {
                type: Number,
                required: true
            }
        }]
    },
    resetToken: String,
    resetTokenExpiration: String,
});

UserSchema.methods.addToCart = function (foodId) {
    const cartFoodIndex = this.cart.items.findIndex(f => {
        return f.foodId.toString() === foodId.toString()
    })

    let newQuantity = 1;
    const updatedCartItem = [...this.cart.items];

    if (cartFoodIndex >= 0) {
        newQuantity = this.cart.items[cartFoodIndex].quantity + 1;
        updatedCartItem[cartFoodIndex].quantity = newQuantity;
    }
    else {
        updatedCartItem.unshift({ foodId: foodId, quantity: newQuantity });
    }
    const updatedCart = { items: updatedCartItem };
    this.cart = updatedCart;
    return this.save();
}

UserSchema.methods.deleteCartItems = function (foodItemId) {

    const foodItemIndex = this.cart.items.findIndex(f => {
        return f.foodId.toString() === foodItemId.toString();
    })

    const updatedCartItem = [...this.cart.items];

    updatedCartItem.splice(foodItemIndex, 1);

    const updateCart = { items: updatedCartItem };

    this.cart = updateCart;
    return this.save()


}

UserSchema.methods.deleteCart = function () {
    this.cart.items = [];
    return this.save();
}

module.exports = mongoose.model('User', UserSchema);