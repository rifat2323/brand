const mongoose = require('mongoose')
const Schema = mongoose.Schema
const Product = require('./product')


const UserInfo = new Schema({
    username:{
        type:String,
        required:true
    },
    password:{
        type:String,
        required:true
    },
    refreshToken:String,
    Roles:{
        User:{
            type:Number,
            default:300
        },
        Admin:Number
    },
    cart:[
        {
            Product:{
                type:mongoose.Schema.Types.ObjectId,
                ref:Product
            },
            Quantity:Number,
            Total:Number
        }
    ]
})
const User = mongoose.model("User",UserInfo)

module.exports = User