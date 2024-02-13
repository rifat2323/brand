const express = require('express');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const path = require('path')
 require('dotenv').config()
const app = express();
const User = require('./model/user')
const connectDB = require('./config/DB')
const mongoose = require('mongoose')
const{createUser,SignIn,refresh,addedToCart,cartItem,Quantity,QuantityDec}  = require('./controlles/user')
const Router = require('./routes/product')
const jwt = require('jsonwebtoken');
const { configDotenv } = require('dotenv');
const xss = require('xss')
const helmet = require('helmet')
const rate = require('express-rate-limit')
// rwyCSzyTwvFxOYI8
// password 12345
app.use('/picture', express.static('./picture'))
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use(helmet())
app.set('trust proxy',2)
app.use(rate({
    windowMs: 15 * 60 * 1000, 
	max: 100,
}))
// Configure CORS to allow requests from http://localhost:3000
app.use(cors({
    origin: ['http://localhost:3000','https://rifatshop.netlify.app'],
    credentials: true,
}));

app.use(cookieParser());
connectDB();
app.post('/reg',createUser )
app.post('/sig', SignIn);
app.get('/refresh', refresh)
app.get('/logout',async (req,res)=>{
    const cookie = req.cookies;
    if(!cookie) return res.status(400).send('no cookie')
    const token = cookie.jwt;

   const foundUser = await User.findOne({refreshToken:token})
   if(!foundUser) return res.status(404).json({"error":"token not match"})
   try{  
foundUser.refreshToken =''
foundUser.save()
res.clearCookie('jwt',{httpOnly:true,sameSite:'none',secure:true,Partitioned:true})
return res.status(200).send('log Out successfully')
    }catch(error){
        return res.status(500).send("server down")
    }
})
app.post('/cart',addedToCart)
app.get('/cart/item',cartItem)
app.put('/cart/item/inc', Quantity)
app.put('/cart/item/dec', QuantityDec)
app.delete('/cart/item',async (req,res)=>{
    const {username,id} = req.body;
    if(!id) return res.status(404).send('no id')
    
   
    try{
        let findUser = await User.findOne({username:username})
        findUser.cart = findUser.cart.filter(item=>item._id.toString()!==id)
       if(!findUser) return res.status(404).json({"message":"maybe item not exist"})
       await findUser.save()
       res.status(200).json({'success': "item deleted successfully"})
    }catch(error){
        console.log(error)
    }
})



app.use('/product',Router)

app.use('/rating',require('./routes/rating.js'))

mongoose.connection.once('open',()=>{
    console.log('connected to database')
    app.listen(4000, () => {
        console.log('Listening on 4000');
    });
   
})

