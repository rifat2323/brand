const express = require('express')
const Router = express.Router()
const multer = require('multer')
const Product = require('../model/product')
const path = require('path')
const fs = require('fs/promises')
const verify = require('../middleware/UserVerify')
const primaryURL = process.env.IMG_PATH

const storage = multer.diskStorage({
   destination:(req,file,cb)=>{
      cb(null,path.join(__dirname,'../picture'))
   },
   filename:(req,file,cb)=>{
      cb(null,path.join(file.originalname))
   }
})

const upload = multer({storage:storage})
/* Router.use('/picture',express.static('../picture')) */
//!have to add paginetions here
Router.get('/', async(req,res)=>{
   
   const sort  = Number(req.query.sort) ||0;
   const min = Number(req.query.min)||0;
   const max = Number(req.query.max)||10000

 try{
   let allProducts =  await Product.find({Price:{$gte:min,$lte:max}})
   allProducts = allProducts.filter(Product=> Product.Price != null)
   if(sort === 101){
      allProducts =  allProducts.sort((a,b)=>
          a.Price - b.Price
         
      )
    
      
   }
   else if(sort === 102){
    allProducts =  allProducts.sort((a,b)=>
        b.Price - a.Price
      )
      
   }
   res.status(200).json({
      allProducts:allProducts
   })
 }catch(e){
   console.error(e)
 }
  
})
Router.get('/single/:productID',async (req,res)=>{
   const id= req.params.productID
   if(!id) return res.status(404)
  try{
    const oneProduct = await Product.findOne({_id:id}).exec()
    if(!oneProduct) return res.status(400).json({"message":"can't find it"})
    res.status(200).json(oneProduct)
  }catch(error){
   console.log(error)
  }
})
Router.get('/src',async(req,res)=>{
   const { search } = req.query;
   if(search.length<2) return res.status(404).send('at last 3 word')
   try {
       const resultedSearch = await Product.find({
           ProductName: { $regex: new RegExp(search, 'i') }
       });
       res.status(200).json(resultedSearch);
   } catch (error) {
       console.log(error);
       res.status(500).json({ error: 'Internal server error' });
   }
});
 
Router.post('/',upload.single('image'),verify,async (req,res)=>{
   const {ProductName,Category,Description,Price}  = req.body

   const newProduct = await Product.create({
      ProductName:ProductName,
      Image:`${primaryURL}/picture/${req.file.originalname}`,
      Category:Category,
      Description:Description,
      Price:Price


   })
   res.status(200).json({newProduct})
})
Router.get('/:category', async(req,res)=>{

const category = req.params.category
if(!category) return res.status(404).json({"message": "no category specified from params"})

const categoryProduct = await Product.find({Category:category})

res.status(200).json(categoryProduct)


})

Router.delete('/:id',async(req,res)=>{
const id =req.params.id
if(!id) return res.status(404).json({"message": "no id specified from params"})
 try{
   const deleteItem = await Product.findByIdAndDelete({_id:id})
   const imgUrl = deleteItem.Image;
   const imageName = imgUrl.split('/')[4]
    const filePath = await path.join(__dirname,'..','picture',imageName)
    await fs.unlink(filePath)
   res.status(200).json({deleteItem})
  }catch(error){
   return res.status(500).json(error)
  }



})
Router.patch('/:id', async(req,res)=>{
   const id =req.params.id
   const {ProductName,Image,Category,Description} = req.body
  
   if(!id) return res.status(404).json({"message": "no id specified from params"})
    try{
       const findProduct = await Product.findOne({_id:id})
       if(!findProduct) return res.status(401).json({"message":"cant find the product"})
   
        findProduct.ProductName = ProductName
        findProduct.Image = Image
        findProduct.Category = Category
        findProduct.Description = Description
        const saveProduct = await findProduct.save()
        res.status(200).json({saveProduct})
   }catch(error){
      return res.status(500).json(error)
   }
})

module.exports = Router