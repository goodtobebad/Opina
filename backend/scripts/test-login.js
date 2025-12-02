const { Client } = require('pg');
const bcrypt = require('bcrypt');

// Test de connexion exactement comme le fait le backend
const connectionString = 'postgresql://opina_db_2uqp_user:uYXXCTlzD9GDfIyyMWF0ZG9G47PptX8x@dpg-d4nd5mk9c44c738oqlqg-a.frankfurt-postgres.render.com/opina_db_2uqp';

async function testLogin() {
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

    // Simuler exactement ce que fait le backend lors de la connexion
    const email = 'superadmin@opina.com';
    const password = 'admin123';
    
    console.log(`🔍 Searching user with email: ${email}`);
    const result = await client.query(
      'SELECT * FROM utilisateurs WHERE email = $1 AND methode_auth = $2',
      [email, 'local']
    );

    if (result.rows.length === 0) {
      console.log('❌ No user found with this email and auth method "local"');
      return;
    }

    console.log('✅ User found!');
    const utilisateur = result.rows[0];
    
    console.log('\n👤 User details:');
    console.log('   ID:', utilisateur.id);
    console.log('   Name:', utilisateur.nom);
    console.log('   Email:', utilisateur.email);
    console.log('   Admin:', utilisateur.est_admin);
    console.log('   Super Admin:', utilisateur.est_super_admin);
    console.log('   Auth method:', utilisateur.methode_auth);
    console.log('   Has password:', utilisateur.mot_de_passe ? 'YES' : 'NO');

    if (!utilisateur.mot_de_passe) {
      console.log('\n❌ ERROR: Password is NULL in database!');
      return;
    }

    console.log('\n🔑 Testing password comparison...');
    console.log(`   Password to test: "${password}"`);
    console.log('   Hash in DB:', utilisateur.mot_de_passe.substring(0, 30) + '...');
    
    const motDePasseValide = await bcrypt.compare(password, utilisateur.mot_de_passe);
    
    if (motDePasseValide) {
      console.log('   ✅ PASSWORD VALID - Login should work!');
    } else {
      console.log('   ❌ PASSWORD INVALID - Login will fail!');
      
      // Try to understand why
      console.log('\n🔧 Debug info:');
      console.log('   Password length:', password.length);
      console.log('   Hash algorithm:', utilisateur.mot_de_passe.substring(0, 4));
      console.log('   Hash cost factor:', utilisateur.mot_de_passe.substring(4, 6));
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error);
  } finally {
    await client.end();
  }
}

testLogin();
