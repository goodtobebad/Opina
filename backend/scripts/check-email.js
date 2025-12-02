const { Client } = require('pg');

const connectionString = 'postgresql://opina_db_2uqp_user:uYXXCTlzD9GDfIyyMWF0ZG9G47PptX8x@dpg-d4nd5mk9c44c738oqlqg-a.frankfurt-postgres.render.com/opina_db_2uqp';

async function checkEmail() {
  const client = new Client({
    connectionString,
    ssl: {
      rejectUnauthorized: false
    }
  });

  try {
    await client.connect();

    const result = await client.query(`
      SELECT id, email, length(email) as email_length, 
             encode(email::bytea, 'hex') as email_hex
      FROM utilisateurs 
      WHERE email LIKE '%superadmin%'
    `);

    if (result.rows.length === 0) {
      console.log('❌ No user found with email containing "superadmin"');
      
      // List all emails
      const allEmails = await client.query('SELECT id, email FROM utilisateurs ORDER BY id');
      console.log('\n📋 All users in database:');
      allEmails.rows.forEach(u => console.log(`  ${u.id}: ${u.email}`));
      return;
    }

    const user = result.rows[0];
    console.log('✅ Found user:\n');
    console.log('  Email:', `"${user.email}"`);
    console.log('  Length:', user.email_length);
    console.log('  Expected:', '"superadmin@opina.com"');
    console.log('  Expected length:', 'superadmin@opina.com'.length);
    console.log('  Hex:', user.email_hex);
    console.log('  Match:', user.email === 'superadmin@opina.com' ? '✅ YES' : '❌ NO');
    
    // Check for hidden characters
    if (user.email_length !== 'superadmin@opina.com'.length) {
      console.log('\n⚠️  WARNING: Email length mismatch! Hidden characters detected.');
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await client.end();
  }
}

checkEmail();
