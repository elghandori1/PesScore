const express = require('express');
const path = require('path');

const app = express();
const port = 3000;

app.use(express.static(path.join(__dirname)));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, './Home/index.html'));
});

app.get('/login',(req,res)=>{
    res.sendFile(path.join(__dirname,'./Home/login.html'))
})

app.get('/register', (req, res) => {
    res.sendFile(path.join(__dirname,'./Home/register.html'))
});

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});