import pool from '../lib/db';

async function addIndexes() {
  const queries = [
    // Companies
    `CREATE INDEX idx_company_slug ON companies(slug);`,
    `CREATE INDEX idx_company_owner ON companies(ownerId);`,
    `CREATE INDEX idx_company_status ON companies(status);`,
    `CREATE INDEX idx_company_category ON companies(category);`,
    // Products
    `CREATE INDEX idx_product_company ON products(companyId);`,
    `CREATE INDEX idx_product_status ON products(status);`,
    // Services
    `CREATE INDEX idx_service_company ON services(companyId);`,
    // Blogs
    `CREATE INDEX idx_blog_company ON blogs(companyId);`,
    `CREATE INDEX idx_blog_slug ON blogs(slug);`
  ];

  console.log('Adding performance indexes to MySQL database...');
  
  for (const q of queries) {
    try {
      await pool.execute(q);
      console.log(`✅ Success: ${q}`);
    } catch (err: any) {
      if (err.code === 'ER_DUP_KEYNAME') {
        console.log(`⚠️ Index already exists: ${q.split(' ')[2]}`);
      } else {
        console.error(`❌ Error on: ${q}`);
        console.error(err.message);
      }
    }
  }

  console.log('Done adding indexes.');
  process.exit(0);
}

addIndexes();
