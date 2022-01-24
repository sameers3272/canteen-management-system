const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const orderSchema = Schema({
    items: [{
            type: Object,
            required:true,
    }],
    user:{
        type:Object,
        required:true
    },
    customer:{
        name:{
            type:String,
            required:true
        },
        mobile_no:{
            type:String,
            required:true
        },
    },
    totalPrice:{
        type:Number,
        required:true
    }
});


module.exports = mongoose.model('Order',orderSchema);