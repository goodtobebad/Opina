const bcrypt = require('./backend/node_modules/bcrypt');
const { Pool } = require('./backend/node_modules/pg');

const pool = new Pool({
  host: 'localhost',
  port: 5432,
  database: 'sondy',
  user: 'postgres',
  password: process.argv[2] || 'postgres' // PostgreSQL password from command line or default
});

async function createAdmin() {
  try {
    // Hash the password
    const hashedPassword = await bcrypt.hash('admin123', 10);
    
    // Update the existing admin user with proper password hash
    const result = await pool.query(
      `UPDATE utilisateurs 
       SET mot_de_passe = $1 
       WHERE email = 'admin@sondy.com' 
       RETURNING id, nom, email, est_admin`,
      [hashedPassword]
    );
    
    if (result.rows.length > 0) {
      console.log('\n✅ Admin account updated successfully!');
      console.log('\nCredentials:');
      console.log('Email: admin@sondy.com');
      console.log('Password: admin123');
      console.log('\nYou can now login at: http://localhost:5173/connexion');
    }
    
    await pool.end();
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

createAdmin();
