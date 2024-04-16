const mongoose = require("mongoose");

const DB_HOST = process.env.DB_HOST;
const DB_NAME = process.env.DB_NAME;
const mongoURI = `${DB_HOST}/${DB_NAME}?directConnection=true`;
mongoose.set('strictQuery', true);
const connectToMongo = ()=>{
    mongoose.connect(mongoURI,()=>{
        console.log("Connect To mongoDB Successfully");
    });
}

module.exports = connectToMongo;