const User = require('../model/user')
const jwt = require('jsonwebtoken');



const verify = async (req,res,next)=>{
    const cookie = req.cookies;
    if(!cookie) return res.status(400).send('no cookie')
    const token = cookie.jwt;
    if(!token) return res.status(404).send("nothing as token")
   const foundUser = await User.findOne({refreshToken:token})
   if(!foundUser) return res.status(404).json({"error":"token not match"})
   if(foundUser.Roles.Admin===500){
    next()
   }else(
    res.status(403).send("you have to be an admin for post ")
   )
  
}

module.exports= verify