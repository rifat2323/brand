const express = require('express');
const Rating = require('../model/rating.js')
const jwt  = require('jsonwebtoken')
const User =require('../model/user.js')
const Router = express.Router()

Router.post('/', async (req,res)=>{
    const {productId,username,rating} = req.body
    if(!productId ) return res.status(404).send("we need  productId")
    if(!username) return res.status(404).send("we need  username")
    if(!rating) return res.status(404).send("we need  rating")

    if(rating > 5) return res.status(409).send('highest value is 5')
    const accessToken = jwt.decode(username)
    if(!accessToken ||!accessToken.userInfo || !accessToken.userInfo.username) return res.status(404).send("wrong access")
    const decodedName = accessToken.userInfo.username

     const userOne = await User.findOne({username:decodedName})
     if(!userOne) return res.status(400).send("can't find user")

       const isProductExist  = await Rating.findOne({Product:productId})
       try{
        if(isProductExist){
          const isUserExist = await isProductExist.user.find(user=>user.oneUser.toString()===userOne._id.toString())
          if(isUserExist){
              isUserExist.Rating = rating
              
             
          }else{
              isProductExist.user.push({oneUser:userOne._id,Rating:rating})
              
             
          }
          const average = await isProductExist.user.reduce((total,sum)=>{
            return total + (sum.Rating)
          },0)/isProductExist.user.length
       
         isProductExist.avgRating= await Number(average)
          await isProductExist.save()
          return res.status(200).json({"message":"rating updated successfully"})
         }else{
           const newRatingProduct = await Rating.create({
              Product:productId,
              user :[{oneUser:userOne._id,Rating:rating}],
              avgRating:rating
  
           })
          return res.status(200).json(newRatingProduct)
         }
        
       }catch(error){
        return res.status(500).send("server error")
       }
      

})
Router.get('/', async (req,res)=>{
  const {id} = req.query

  if(!id) return res.status(404).send('no id ')
   try{
   const oneProduct = await Rating.findOne({Product:id})
     if(!oneProduct) return res.status(404).send("no product found")
   res.status(200).json(oneProduct.avgRating)
     
  }catch(error){
    return res.status(500).send("server error")
  }

})



module.exports  = Router