import mysql from 'mysql2/promise';
import fs from 'fs';
import path from 'path';

async function setupDb() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'multi-tenant',
    port: parseInt(process.env.DB_PORT || '3306'),
    multipleStatements: true, // Required to run multiple queries in one string
  });

  try {
    const schemaPath = path.join(process.cwd(), 'schema.sql');
    console.log(`Reading schema from ${schemaPath}...`);
    const schemaSql = fs.readFileSync(schemaPath, 'utf8');

    console.log('Executing schema...');
    await connection.query(schemaSql);
    console.log('Database tables created successfully!');
  } catch (error) {
    console.error('Failed to setup database:', error);
  } finally {
    await connection.end();
  }
}

setupDb();
