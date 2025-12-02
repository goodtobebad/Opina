const bcrypt = require('./backend/node_modules/bcrypt');
const { Pool } = require('./backend/node_modules/pg');

const pool = new Pool({
  host: 'localhost',
  port: 5432,
  database: 'opina',
  user: 'postgres',
  password: process.argv[2] || 'postgres' // PostgreSQL password from command line or default
});

async function createAdmin() {
  try {
    // Hash the password
    const hashedPassword = await bcrypt.hash('admin123', 10);
    
    // Create/update super admin
    console.log('Creating superadmin@opina.com...');
    await pool.query(
      `INSERT INTO utilisateurs (nom, email, mot_de_passe, est_admin, est_super_admin, methode_auth)
       VALUES ($1, $2, $3, $4, $5, $6)
       ON CONFLICT (email) 
       DO UPDATE SET 
         mot_de_passe = EXCLUDED.mot_de_passe,
         est_admin = EXCLUDED.est_admin,
         est_super_admin = EXCLUDED.est_super_admin`,
      ['Super Admin', 'superadmin@opina.com', hashedPassword, true, true, 'local']
    );
    console.log('✅ Super admin created/updated!');
    
    // Create/update regular admin
    console.log('Creating admin@opina.com...');
    await pool.query(
      `INSERT INTO utilisateurs (nom, email, mot_de_passe, est_admin, est_super_admin, methode_auth)
       VALUES ($1, $2, $3, $4, $5, $6)
       ON CONFLICT (email) 
       DO UPDATE SET 
         mot_de_passe = EXCLUDED.mot_de_passe,
         est_admin = EXCLUDED.est_admin,
         est_super_admin = EXCLUDED.est_super_admin`,
      ['Admin', 'admin@opina.com', hashedPassword, true, false, 'local']
    );
    console.log('✅ Regular admin created/updated!');
    
    console.log('\n✅ Admin accounts ready!');
    console.log('\n🔴 Super Admin:');
    console.log('   Email: superadmin@opina.com');
    console.log('   Password: admin123');
    console.log('\n🟠 Admin:');
    console.log('   Email: admin@opina.com');
    console.log('   Password: admin123');
    console.log('\nLogin at: http://localhost:5173/connexion');
    
    await pool.end();
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

createAdmin();
