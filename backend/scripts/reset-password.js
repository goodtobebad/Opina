const { Client } = require('pg');
const bcrypt = require('bcrypt');

// Use your External Database URL from Render
const connectionString = process.env.DATABASE_URL || 'postgresql://opina_db_2uqp_user:uYXXCTlzD9GDfIyyMWF0ZG9G47PptX8x@dpg-d4nd5mk9c44c738oqlqg-a.frankfurt-postgres.render.com/opina_db_2uqp';

async function resetPassword() {
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

    // Hash password
    const motDePasseHash = await bcrypt.hash('admin123', 10);

    // Update super admin password
    console.log('🔑 Resetting superadmin@opina.com password...');
    await client.query(`
      UPDATE utilisateurs 
      SET mot_de_passe = $1
      WHERE email = 'superadmin@opina.com'
    `, [motDePasseHash]);
    console.log('✅ Password reset to: admin123\n');

    // Also ensure admin@opina.com has correct password
    console.log('🔑 Resetting admin@opina.com password...');
    await client.query(`
      UPDATE utilisateurs 
      SET mot_de_passe = $1
      WHERE email = 'admin@opina.com'
    `, [motDePasseHash]);
    console.log('✅ Password reset to: admin123\n');

    console.log('✅ Both accounts ready to use:');
    console.log('   - superadmin@opina.com / admin123 (Super Admin)');
    console.log('   - admin@opina.com / admin123 (Admin)');

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  } finally {
    await client.end();
  }
}

resetPassword();
