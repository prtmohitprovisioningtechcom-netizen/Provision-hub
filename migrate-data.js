const fs = require('fs');
const { MongoClient } = require('mongodb');
const mysql = require('mysql2/promise');

async function migrateData() {
  const mongoUri = 'mongodb+srv://prtmohitprovisioningtechcom_db_user:03Abq9h8ydWP3Krp@cluster0.tdqleki.mongodb.net/';
  const mongoClient = new MongoClient(mongoUri);
  const mysqlPool = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'multi-tenant',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    multipleStatements: true
  });

  try {
    // 1. Initialize schema
    const schema = fs.readFileSync('schema.sql', 'utf8');
    console.log('Executing schema.sql to ensure tables exist...');
    await mysqlPool.query(schema);
    console.log('Schema initialized.');

    await mongoClient.connect();
    console.log('Connected to MongoDB');
    const db = mongoClient.db('test');

    // 2. Migrate Platform Settings
    const settings = await db.collection('platformsettings').find({}).toArray();
    if (settings.length > 0) {
      const doc = settings[0];
      const id = doc._id.toString();
      
      const themeConfig = doc.themeConfig ? JSON.stringify(doc.themeConfig) : null;
      const featureToggles = doc.featureToggles ? JSON.stringify(doc.featureToggles) : null;
      const seoConfig = doc.seoConfig ? JSON.stringify(doc.seoConfig) : null;
      const heroConfig = doc.heroConfig ? JSON.stringify(doc.heroConfig) : null;
      const featuresConfig = doc.featuresConfig ? JSON.stringify(doc.featuresConfig) : null;
      const howItWorksConfig = doc.howItWorksConfig ? JSON.stringify(doc.howItWorksConfig) : null;
      const pricingConfig = doc.pricingConfig ? JSON.stringify(doc.pricingConfig) : null;
      const faqConfig = doc.faqConfig ? JSON.stringify(doc.faqConfig) : null;
      const testimonialsConfig = doc.testimonialsConfig ? JSON.stringify(doc.testimonialsConfig) : null;
      const contactConfig = doc.contactConfig ? JSON.stringify(doc.contactConfig) : null;
      const footerConfig = doc.footerConfig ? JSON.stringify(doc.footerConfig) : null;

      await mysqlPool.execute('DELETE FROM platform_settings');
      await mysqlPool.execute(
        'INSERT INTO platform_settings (id, themeConfig, featureToggles, seoConfig, heroConfig, featuresConfig, howItWorksConfig, pricingConfig, faqConfig, testimonialsConfig, contactConfig, footerConfig) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
        [id, themeConfig, featureToggles, seoConfig, heroConfig, featuresConfig, howItWorksConfig, pricingConfig, faqConfig, testimonialsConfig, contactConfig, footerConfig]
      );
      console.log('Successfully migrated platform_settings!');
    }

    // 3. Migrate Users
    const users = await db.collection('users').find({}).toArray();
    console.log(`Found ${users.length} users to migrate.`);
    for (const user of users) {
       await mysqlPool.execute(
         'INSERT IGNORE INTO users (id, name, email, password, role, companyId, createdAt) VALUES (?, ?, ?, ?, ?, ?, ?)',
         [
           user._id.toString(),
           user.name || 'User',
           user.email,
           user.password || '',
           user.role || 'user',
           user.companyId ? user.companyId.toString() : null,
           user.createdAt || new Date(),
         ]
       );
    }

    // 4. Migrate Companies
    const companies = await db.collection('companies').find({}).toArray();
    console.log(`Found ${companies.length} companies to migrate.`);
    for (const company of companies) {
       const ownerId = company.ownerId ? company.ownerId.toString() : (users.length > 0 ? users[0]._id.toString() : null);
       await mysqlPool.execute(
         'INSERT IGNORE INTO companies (id, name, slug, ownerId, logo, category, address, socialLinks, businessHours, theme, seo, status, isVerified, subscription, createdAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
         [
           company._id.toString(),
           company.name,
           company.slug,
           ownerId,
           company.logo || null,
           company.category || null,
           company.address ? JSON.stringify(company.address) : null,
           company.socialLinks ? JSON.stringify(company.socialLinks) : null,
           company.businessHours ? JSON.stringify(company.businessHours) : null,
           company.theme ? JSON.stringify(company.theme) : null,
           company.seo ? JSON.stringify(company.seo) : null,
           company.status || 'pending',
           company.isVerified ? 1 : 0,
           company.subscription || 'free',
           company.createdAt || new Date()
         ]
       );
       if (ownerId) {
         await mysqlPool.execute(
           'UPDATE users SET companyId = ? WHERE id = ? AND (companyId IS NULL OR companyId = "")',
           [company._id.toString(), ownerId]
         );
       }
    }
    
    // 5. Migrate Products
    const products = await db.collection('products').find({}).toArray();
    console.log(`Found ${products.length} products to migrate.`);
    for (const product of products) {
       await mysqlPool.execute(
         'INSERT IGNORE INTO products (id, companyId, name, slug, description, price, offerPrice, category, stock, images, status, createdAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
         [
           product._id.toString(),
           product.companyId.toString(),
           product.name,
           product.slug || product.name.toLowerCase().replace(/\s+/g, '-'),
           product.description || null,
           product.price || 0,
           product.offerPrice || null,
           product.category || null,
           product.stock || 0,
           product.images ? JSON.stringify(product.images) : null,
           product.status || 'active',
           product.createdAt || new Date()
         ]
       );
    }

    // 6. Migrate Landing Pages
    const landingPages = await db.collection('landingpages').find({}).toArray();
    console.log(`Found ${landingPages.length} landing pages to migrate.`);
    for (const lp of landingPages) {
       await mysqlPool.execute(
         'INSERT IGNORE INTO landing_pages (id, companyId, templateId, sections, isPublished, createdAt) VALUES (?, ?, ?, ?, ?, ?)',
         [
           lp._id.toString(),
           lp.companyId.toString(),
           lp.template || 'default',
           lp.sections ? JSON.stringify(lp.sections) : null,
           lp.isPublished ? 1 : 0,
           lp.createdAt || new Date()
         ]
       );
    }

    console.log('Migration completed completely!');
    
  } catch(e) {
    console.error('Migration error:', e);
  } finally {
    await mongoClient.close();
    await mysqlPool.end();
  }
}

migrateData();
