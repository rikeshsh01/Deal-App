const connectToMongo = require("./db");
const express = require('express')
var cors = require('cors')

connectToMongo();

const app = express()
const port = 8080

app.use(express.json());
app.use(cors())



// Available Routes 
app.use('/api/auth',require('./routes/auth'));
app.use("/api/notes",require("./routes/notes"));
app.use("/api/tag",require("./routes/tag"));

app.listen(port, () => {
  console.log(`Deal app listening on port ${port}`)
});