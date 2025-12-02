const { Client } = require('pg');

// Use your External Database URL from Render
const connectionString = process.env.DATABASE_URL || 'postgresql://opina_db_2uqp_user:uYXXCTlzD9GDfIyyMWF0ZG9G47PptX8x@dpg-d4nd5mk9c44c738oqlqg-a.frankfurt-postgres.render.com/opina_db_2uqp';

async function clearPolls() {
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

    // Count before deletion
    const countBefore = await client.query('SELECT COUNT(*) as total FROM sondages');
    console.log(`📊 Sondages avant suppression: ${countBefore.rows[0].total}`);

    // Delete all polls (cascade will delete options and votes)
    console.log('\n🗑️  Suppression de tous les sondages...');
    await client.query('DELETE FROM sondages');
    
    console.log('✅ Tous les sondages ont été supprimés!');

    // Count after deletion
    const countAfter = await client.query('SELECT COUNT(*) as total FROM sondages');
    console.log(`📊 Sondages après suppression: ${countAfter.rows[0].total}`);

    // Also count related data
    const votesCount = await client.query('SELECT COUNT(*) as total FROM votes');
    const optionsCount = await client.query('SELECT COUNT(*) as total FROM options_sondage');
    
    console.log(`\n📋 État de la base:`);
    console.log(`   Sondages: ${countAfter.rows[0].total}`);
    console.log(`   Options: ${optionsCount.rows[0].total}`);
    console.log(`   Votes: ${votesCount.rows[0].total}`);

    console.log('\n🎉 Base de données nettoyée avec succès!');

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  } finally {
    await client.end();
  }
}

clearPolls();
