const mysql = require('mysql2/promise');
require('dotenv').config({ path: '.env.local' });

async function checkDatabases() {
    console.log('Connecting with URL:', process.env.DATABASE_URL);

    // Parse URL to get connection details or use default parsing
    // Note: mysql2/promise might not parse the URL exactly the same as Prisma, 
    // but let's try connecting to the server base directly.

    // Trying to debug connection.
    // Ensure the password is correct. Special characters might need URI encoding in connection strings, 
    // but here we are passing it directly.
    // Testing connection with correct config
    const connectionConfig = {
        host: 'localhost',
        user: 'root',
        password: 'kathir@20666350248', // Correct password provided by user
        port: 3306
    };

    console.log('Attempting connection...');

    try {
        const connection = await mysql.createConnection(connectionConfig);
        const [rows] = await connection.query('SHOW DATABASES;');
        console.log('Success! Databases found:', rows.map(r => r.Database));
        await connection.end();
    } catch (error) {
        console.error('Connection failed:', error.message);
    }
}

checkDatabases();
