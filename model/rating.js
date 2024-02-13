const mongoose = require('mongoose')
const Product = require('./product.js')
const User = require('./user.js')

const ratingDetails = new mongoose.Schema({
  
    Product:{
        type:mongoose.Schema.Types.ObjectId,
        ref:Product
    },
    avgRating:{
        type:Number,
        max:5
    },
    user:[
        {
            oneUser:{
                type:mongoose.Schema.Types.ObjectId,
                ref:User
            },
            Rating:Number
        }
    ]
  
 
})

const Rating = mongoose.model('Rating',ratingDetails)
module.exports = Rating