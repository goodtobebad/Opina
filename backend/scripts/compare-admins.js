const { Client } = require('pg');
const bcrypt = require('bcrypt');

const connectionString = 'postgresql://opina_db_2uqp_user:uYXXCTlzD9GDfIyyMWF0ZG9G47PptX8x@dpg-d4nd5mk9c44c738oqlqg-a.frankfurt-postgres.render.com/opina_db_2uqp';

async function compareAccounts() {
  const client = new Client({
    connectionString,
    ssl: {
      rejectUnauthorized: false
    }
  });

  try {
    await client.connect();
    console.log('✅ Connected to database\n');

    // Get both admin accounts
    const result = await client.query(`
      SELECT id, nom, email, mot_de_passe, est_admin, est_super_admin, methode_auth
      FROM utilisateurs 
      WHERE email IN ('admin@opina.com', 'superadmin@opina.com')
      ORDER BY email
    `);

    console.log('📋 Comparing both admin accounts:\n');

    for (const user of result.rows) {
      console.log(`${user.est_super_admin ? '🔴 SUPER ADMIN' : '🟠 ADMIN'}`);
      console.log(`  Email: ${user.email}`);
      console.log(`  Name: ${user.nom}`);
      console.log(`  Auth method: ${user.methode_auth}`);
      console.log(`  Password hash: ${user.mot_de_passe ? user.mot_de_passe.substring(0, 30) + '...' : 'NULL'}`);
      
      if (user.mot_de_passe) {
        const isValid = await bcrypt.compare('admin123', user.mot_de_passe);
        console.log(`  Password "admin123": ${isValid ? '✅ VALID' : '❌ INVALID'}`);
        
        // Check password hash format
        if (user.mot_de_passe.startsWith('$2b$')) {
          console.log('  Hash format: bcrypt (correct)');
        } else if (user.mot_de_passe.startsWith('$2a$')) {
          console.log('  Hash format: bcrypt old format');
        } else {
          console.log('  Hash format: UNKNOWN - might be the problem!');
        }
      } else {
        console.log('  ❌ NO PASSWORD SET');
      }
      console.log('');
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await client.end();
  }
}

compareAccounts();
