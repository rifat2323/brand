const mongoose = require('mongoose')


const connectDB = async ()=>{
  const connection = await  mongoose.connect(process.env.DB_URL)
  return connection

}
module.exports = connectDB