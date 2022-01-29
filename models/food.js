const mongoose = require('mongoose');

const { Schema } = mongoose;

const FoodSchema = Schema({
    title: {
        type:String,
        required:true
    },
    price: {
        type: Number,
        required:true
    },
   
    description: {
        type: String,
        required:true
    },

    userId:{
        type:Schema.Types.ObjectId,
        required:true,
        ref:'User'
    }


});

module.exports = mongoose.model('Food',FoodSchema);

