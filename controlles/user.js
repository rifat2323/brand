const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt')
const User = require('../model/user')



const createUser = async(req,res)=>{
    const { username, password } = req.body;
    if(!username || !password) return res.status(404).json({"message": "pleaser Enter username or password"})
    const hashPassword =  await bcrypt.hash(password,10)
    const newUser =  await User.create({
      username:username,
      password:hashPassword
    })
  res.status(201).json(newUser)
/*   console.log(newUser) */
}

const SignIn = async (req, res) => {
    const { username, password } = req.body;
  if(!username || !password) return res.status(404).json({"message": "pleaser Enter username or password"})
  const foundUser = await User.findOne({username:username})
if(!foundUser) return res.status(404).json({"message": "no user found in that name sig"})
  const hashPassword =  await bcrypt.compare(password,foundUser.password)
if(!hashPassword) return res.status(404).json({"message": "password doesn't match"})
  
  const roles = Object.values(foundUser.Roles)

    const accessToken = jwt.sign(
        {
           "userInfo":{
            "username": username,
            "roles": roles
           } 
        },
        process.env.ACCESS_TOKEN,
        { expiresIn: '1h' }
    );

    const refreshToken = jwt.sign(
        {
            username: username
        },
        process.env.REFRESH_TOKEN,
        { expiresIn: '1h' }
    );
    
    foundUser.refreshToken = refreshToken;
    foundUser.save()
    res.cookie('jwt', refreshToken, { httpOnly:true,maxAge: 18000000, sameSite:'none', secure:true,Partitioned:true });
 /* console.log(`refresh token: ${refreshToken}`); */
 

    res.status(200).json({ accessToken });
}

const refresh = async (req,res)=>{
    const cookie = req.cookies;
    if(!cookie) return res.status(400).send('no cookie')
    const token = cookie.jwt;
    if(!token) return res.status(404).send("nothing as token")
   const foundUser = await User.findOne({refreshToken:token})
   if(!foundUser) return res.status(404).json({"error":"token not match"})
 
   const roles = Object.values(foundUser.Roles)
   jwt.verify(token, process.env.REFRESH_TOKEN, (err, decoded) => {
    if (err || foundUser.username !== decoded.username)
      return res.sendStatus(403);
    const accessToken = jwt.sign(
      {
        "userInfo": {
          "username": decoded.username,
          "roles": roles,
        },
      },
      process.env.REFRESH_TOKEN,
      { expiresIn: "30s" }
    );
    res.status(200).json({ accessToken });
  });
    
}
const addedToCart =  async (req,res)=>{
  const {username,id,price} = req.body;
  if(!username || !id || !price) return res.sendStatus(403)
  const decoded = jwt.decode(username)
  const matchName = decoded.userInfo.username
  if(!matchName) return res.status(404).send("hello")
  const oneUser = await User.findOne({username:matchName})
  if(!oneUser) return res.status(404).json({"error":"user not found"});
  //409
    const exist  = await oneUser.cart.find(item=>item.Product.toString()===id)
    if(exist) return res.status(409).json({"message":"Product already exists"})
    try{
            oneUser.cart.push({Product:id,Quantity:1,Total:price})
           await oneUser.save()
           res.status(200).json({"success":"add to cart"})

    }catch(error){
        console.log(error)
    }


}
const cartItem =  async(req,res)=>{
  const {username} = req.query
 if(!username) return res.status(400).send("no username")
  const decoded = jwt.decode(username)

  if(!decoded) return res.status(404).send("no name")
  if(!decoded || !decoded.userInfo || !decoded.userInfo.username) return res.status(400).send("nothing")
  const matchName = decoded.userInfo.username
   if(!matchName) return res.status(404).send("no username match")
  
if(!username) res.sendStatus(404)
 const findUser = await User.findOne({username:matchName}).populate({
path:'cart',
populate:{
  path:"Product", // that i ref on the model
  model:"Product" // actually the model name
}

})


 if(!findUser) res.sendStatus(404)
 res.status(200).json({
  cart:findUser.cart,
  userName:findUser.username

 })


}
const Quantity = async(req,res)=>{
  const {username,id} = req.body;
   if(!username || !id) return res.sendStatus(404)
  const foundUser = await User.findOne({username:username}).populate('cart.Product')
  if(!foundUser) return res.status(404).json({"error": "User not found"})
  try{
    const findProduct = await foundUser.cart.find(item=>item._id.toString() === id)
    if(!findProduct) return res.status(400).json({'message':"can't find the product"})
        findProduct.Quantity =parseInt(findProduct.Quantity)+1;
        findProduct.Total = findProduct.Product.Price*findProduct.Quantity
      
   await foundUser.save()
   res.status(200).json({"success": "Quantity increased"})
  }catch(error){
      console.log(error)
  }
}
const QuantityDec = async(req,res)=>{
  const {username,id} = req.body;
  if(!username || !id) return res.sendStatus(404)
  const foundUser = await User.findOne({username:username})
  if(!foundUser) return res.status(404).json({"error": "User not found"})
  try{
    const findProduct = await foundUser.cart.find(item=>item._id.toString() === id)
    if(!findProduct) return res.status(400).json({'message':"can't find the product"})
        findProduct.Quantity = findProduct.Quantity-1;

   await foundUser.save()
   res.status(200).json({"success": "Quantity decreased"})
  }catch(error){
      console.log(error)
  }
}
module.exports ={createUser,SignIn,refresh,addedToCart,cartItem,Quantity,QuantityDec}