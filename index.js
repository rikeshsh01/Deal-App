const connectToMongo = require("./db");
const express = require('express')
var cors = require('cors');
require('dotenv').config();

connectToMongo();

const app = express()
const port = process.env.PORT || 8080;

app.use(express.json());
app.use(cors())



// Available Routes 
app.use('/api',require('./routes/auth'));
app.use("/api",require("./routes/notes"));
app.use("/api",require("./routes/tag"));
app.use("/api",require("./routes/sub-tag"));
app.use("/api",require("./routes/role"));
app.use("/api",require("./routes/search"));
app.use("/api",require("./routes/comment"));
app.use("/api",require("./routes/aditionaldetail"));
app.use("/api",require("./routes/like"));
app.use("/api",require("./routes/favourite"));
app.use("/api",require("./routes/bookingprocess"));


// endpoints for seeding 
app.use("/api",require("./seeder/seed"));

// access image stored in server　
app.use("/images", express.static("images"))

app.listen(port, () => {
  console.log(`Deal app listening on port ${port}`)
});