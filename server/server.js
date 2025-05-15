const express = require("express");
const app = express();
const cors = require("cors");

const coursOptions = {
    origin: "http://localhost:3000",
};

app.use(cors(coursOptions))
const port = 5000;
app.get("/",(req,res)=>{
    res.send("hello from seerver");
});
app.listen(port, () => {
  console.log(`Server started on port ${port}`);
});