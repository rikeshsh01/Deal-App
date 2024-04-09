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
app.use("/api/subtag",require("./routes/sub-tag"));
app.use("/api/role",require("./routes/role"));
app.use("/api",require("./routes/search"));
app.use("/api/comment",require("./routes/comment"));


app.listen(port, () => {
  console.log(`Deal app listening on port ${port}`)
});