require('dotenv').config({ path: '.env' });
const mysql = require('mysql2/promise');

async function main() {
  const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT || 3306,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
  });

  try {
    console.log('Altering companies table...');
    await pool.query("ALTER TABLE companies ADD COLUMN customDomain VARCHAR(255) NULL");
    await pool.query("ALTER TABLE companies ADD COLUMN customDomainStatus VARCHAR(50) DEFAULT 'none'");
    console.log('Columns added successfully.');
  } catch (error) {
    if (error.code === 'ER_DUP_FIELDNAME') {
      console.log('Columns already exist, proceeding...');
    } else {
      console.error('Error altering table:', error);
    }
  } finally {
    await pool.end();
  }
}

main();
