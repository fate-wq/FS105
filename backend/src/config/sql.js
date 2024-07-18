const mysql = require('mysql2/promise');

const pool = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: 'root', // replace with your actual MySQL password
  database: 'werkpay',
  port: 8889
});

module.exports = pool;