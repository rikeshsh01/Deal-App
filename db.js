const mongoose = require("mongoose");
const mongoURI = "mongodb://127.0.0.1:27017/Deal?directConnection=true";
mongoose.set('strictQuery', true);
const connectToMongo = ()=>{
    mongoose.connect(mongoURI,()=>{
        console.log("Connect To mongoDB Successfully");
    });
}

module.exports = connectToMongo;