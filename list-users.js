const { Pool } = require('./backend/node_modules/pg');

const pool = new Pool({
  host: 'localhost',
  port: 5432,
  database: 'opina',
  user: 'postgres',
  password: process.argv[2] || 'admin'
});

async function listUsers() {
  try {
    const result = await pool.query(`
      SELECT id, nom, email, est_admin, est_super_admin, methode_auth, date_creation
      FROM utilisateurs 
      ORDER BY date_creation DESC
    `);
    
    console.log(`\n👥 Total users: ${result.rows.length}\n`);
    
    if (result.rows.length === 0) {
      console.log('No users found in database.');
    } else {
      result.rows.forEach(user => {
        const badges = [];
        if (user.est_super_admin) badges.push('🔴 SUPER ADMIN');
        if (user.est_admin && !user.est_super_admin) badges.push('🟠 ADMIN');
        
        console.log(`ID: ${user.id}`);
        console.log(`Name: ${user.nom}`);
        console.log(`Email: ${user.email}`);
        console.log(`Auth: ${user.methode_auth}`);
        if (badges.length > 0) console.log(`Role: ${badges.join(', ')}`);
        console.log(`Created: ${new Date(user.date_creation).toLocaleString()}`);
        console.log('---');
      });
    }
    
    await pool.end();
  } catch (error) {
    console.error('❌ Error:', error.message);
    if (error.code === 'ECONNREFUSED') {
      console.error('\n⚠️  Cannot connect to local PostgreSQL.');
      console.error('   Make sure PostgreSQL is running.');
    }
    process.exit(1);
  }
}

listUsers();
