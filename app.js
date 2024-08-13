const express = require('express');
require('dotenv').config();
const PORT = process.env.PORT || 8080;


const app = express()

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.listen(PORT, () => {
    console.log('Server is running ' + PORT);
});