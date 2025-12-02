const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

// Use your External Database URL from Render
const connectionString = process.env.DATABASE_URL || 'postgresql://opina_db_2uqp_user:uYXXCTlzD9GDfIyyMWF0ZG9G47PptX8x@dpg-d4nd5mk9c44c738oqlqg-a.frankfurt-postgres.render.com/opina_db_2uqp';

async function initializeDatabase() {
  const client = new Client({
    connectionString,
    ssl: {
      rejectUnauthorized: false // Needed for Render
    }
  });

  try {
    console.log('🔌 Connecting to database...');
    await client.connect();
    console.log('✅ Connected!');

    // Read and execute schema.sql
    console.log('\n📄 Running schema.sql...');
    const schemaSQL = fs.readFileSync(
      path.join(__dirname, '../database/schema.sql'),
      'utf8'
    );
    await client.query(schemaSQL);
    console.log('✅ Schema created!');

    // Read and execute add-categories.sql
    console.log('\n📄 Running add-categories.sql...');
    const categoriesSQL = fs.readFileSync(
      path.join(__dirname, '../database/add-categories.sql'),
      'utf8'
    );
    await client.query(categoriesSQL);
    console.log('✅ Categories added!');

    // Create super admin
    console.log('\n👤 Creating super admin...');
    const adminSQL = `
      INSERT INTO utilisateurs (nom, email, mot_de_passe, est_admin, est_super_admin, methode_auth)
      VALUES (
        'Super Admin',
        'admin@opina.com',
        '$2b$10$N9qo8uLOickgx2ZZpqF/K.e2IkFmZO3IrV6rOv2S7GbCKLvDXmBK2',
        TRUE,
        TRUE,
        'local'
      )
      ON CONFLICT (email) DO NOTHING;
    `;
    await client.query(adminSQL);
    console.log('✅ Super admin created! (admin@opina.com / admin123)');

    console.log('\n🎉 Database initialized successfully!');
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  } finally {
    await client.end();
  }
}

initializeDatabase();
