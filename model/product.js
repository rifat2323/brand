const mongoose = require('mongoose')

const Schema  = mongoose.Schema




const productDetails = new Schema({
 ProductName:{
    type:String,
    required:true
 },
 Image:{
    type:String,
    required:true
 },
 Category:{
    type:String,
    required:true
 },
 Description:String,
 Rating:Number,
 Price:{
   type:Number,
   required:true
 },




})

const Product = mongoose.model("Product",productDetails)

module.exports = Product