const express = require('express');
const cors = require('cors');
require('dotenv').config();
const app = express();
const port = process.env.PORT || 5000


// middleware

app.use(cors());
app.use(express.json());


app.get('/', (req,res) => {
    res.send('B9A11 assignment is running')
})

app.listen(port, () => {
    console.log(`B9A11 Server is running on port:${port}`);
})
