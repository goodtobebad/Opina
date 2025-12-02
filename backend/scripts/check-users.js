const { Client } = require('pg');

// Use your External Database URL from Render
const connectionString = process.env.DATABASE_URL || 'postgresql://opina_db_2uqp_user:uYXXCTlzD9GDfIyyMWF0ZG9G47PptX8x@dpg-d4nd5mk9c44c738oqlqg-a.frankfurt-postgres.render.com/opina_db_2uqp';

async function checkUsers() {
  const client = new Client({
    connectionString,
    ssl: {
      rejectUnauthorized: false
    }
  });

  try {
    console.log('🔌 Connecting to database...');
    await client.connect();
    console.log('✅ Connected!\n');

    // Count total users
    const countResult = await client.query('SELECT COUNT(*) as total FROM utilisateurs');
    console.log(`👥 Total users: ${countResult.rows[0].total}`);

    // Get all users details
    const usersResult = await client.query(`
      SELECT id, nom, email, est_admin, est_super_admin, methode_auth, date_creation 
      FROM utilisateurs 
      ORDER BY date_creation DESC
    `);

    console.log('\n📋 Users list:\n');
    usersResult.rows.forEach(user => {
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

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  } finally {
    await client.end();
  }
}

checkUsers();
