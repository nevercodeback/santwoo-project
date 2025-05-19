// File: santwoo_project/backend/db.js

const mysql = require('mysql2');
require('dotenv').config(); // Ensure .env variables are loaded at the start

// Create a connection pool using settings from your .env file
const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 10, // Max number of connections in the pool
    queueLimit: 0 // No limit on the number of queued connection requests
});

// Test the connection (optional, but good for immediate feedback)
pool.getConnection((err, connection) => {
    if (err) {
        console.error('Error connecting to the database: ', err.message);
        if (err.code === 'PROTOCOL_CONNECTION_LOST') {
            console.error('Database connection was closed.');
        }
        if (err.code === 'ER_CON_COUNT_ERROR') {
            console.error('Database has too many connections.');
        }
        if (err.code === 'ECONNREFUSED') {
            console.error('Database connection was refused. Check if MySQL server is running and credentials in .env are correct.');
        }
        if (err.code === 'ER_ACCESS_DENIED_ERROR') {
            console.error('Database access denied. Check username/password in .env file.');
        }
        if (err.code === 'ER_BAD_DB_ERROR') {
            console.error('Database not found. Ensure DB_NAME in .env is correct and the database exists.');
        }
        // You might want to exit the process if a db connection is critical
        // process.exit(1); 
        return;
    }
    if (connection) {
        console.log('Successfully connected to the MySQL database.');
        connection.release(); // Release the connection back to the pool
    }
    return;
});

// Export the pool with promise support to be used in other files
module.exports = pool.promise();