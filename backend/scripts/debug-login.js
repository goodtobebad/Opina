const { Client } = require('pg');
const bcrypt = require('bcrypt');

// Use your External Database URL from Render
const connectionString = process.env.DATABASE_URL || 'postgresql://opina_db_2uqp_user:uYXXCTlzD9GDfIyyMWF0ZG9G47PptX8x@dpg-d4nd5mk9c44c738oqlqg-a.frankfurt-postgres.render.com/opina_db_2uqp';

async function debugLogin() {
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

    // Get superadmin account with password
    const result = await client.query(`
      SELECT id, nom, email, mot_de_passe, est_admin, est_super_admin, methode_auth
      FROM utilisateurs 
      WHERE email = 'superadmin@opina.com'
    `);

    if (result.rows.length === 0) {
      console.log('❌ No user found with email superadmin@opina.com');
      return;
    }

    const user = result.rows[0];
    console.log('👤 User found:');
    console.log('   ID:', user.id);
    console.log('   Name:', user.nom);
    console.log('   Email:', user.email);
    console.log('   Password hash:', user.mot_de_passe ? user.mot_de_passe.substring(0, 20) + '...' : 'NULL');
    console.log('   Admin:', user.est_admin);
    console.log('   Super Admin:', user.est_super_admin);
    console.log('   Auth method:', user.methode_auth);
    console.log();

    // Test password comparison
    const testPassword = 'admin123';
    console.log(`🔑 Testing password: "${testPassword}"`);
    
    if (user.mot_de_passe) {
      const isValid = await bcrypt.compare(testPassword, user.mot_de_passe);
      console.log('   Result:', isValid ? '✅ VALID' : '❌ INVALID');
      
      if (!isValid) {
        console.log('\n🔧 Generating new hash for comparison...');
        const newHash = await bcrypt.hash(testPassword, 10);
        console.log('   New hash:', newHash.substring(0, 20) + '...');
      }
    } else {
      console.log('   ❌ Password is NULL in database!');
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  } finally {
    await client.end();
  }
}

debugLogin();
