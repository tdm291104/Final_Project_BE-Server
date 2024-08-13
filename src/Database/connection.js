const mysql = require('mysql2');
require('dotenv').config();

const connection = mysql.createConnection({
    host: process.env.HOST,
    user: process.env.USERNAME_DATABASE,
    password: process.env.PASSWORD_DATABASE,
    database: process.env.DATABASE
}).promise();

connection.connect()
    .then(() => console.log('Success'))
    .catch(e => console.log('Failed', e));

module.exports = connection;