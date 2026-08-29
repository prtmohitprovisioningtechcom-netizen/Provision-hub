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
    console.log('Altering landing_pages table...');
    await pool.query("ALTER TABLE landing_pages ADD COLUMN websiteType ENUM('single_page', 'multi_page') DEFAULT 'single_page'");
    console.log('Column websiteType added successfully.');
  } catch (error) {
    if (error.code === 'ER_DUP_FIELDNAME') {
      console.log('Column websiteType already exists, proceeding...');
    } else {
      console.error('Error altering table:', error);
    }
  } finally {
    await pool.end();
  }
}

main();
