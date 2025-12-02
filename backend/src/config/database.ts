import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

// Configure pg to parse timestamps as UTC and return ISO strings
import { types } from 'pg';
types.setTypeParser(1114, (str) => new Date(str + 'Z').toISOString());

// Use DATABASE_URL if available (Render), otherwise use individual variables (local)
const pool = process.env.DATABASE_URL
  ? new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: {
        rejectUnauthorized: false
      }
    })
  : new Pool({
      host: process.env.DB_HOST,
      port: parseInt(process.env.DB_PORT || '5432'),
      database: process.env.DB_NAME,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
    });

// Log which database configuration is being used
if (process.env.DATABASE_URL) {
  const dbUrl = process.env.DATABASE_URL;
  const dbName = dbUrl.split('/').pop()?.split('?')[0] || 'unknown';
  console.log(`📊 Using DATABASE_URL (database: ${dbName})`);
} else {
  console.log(`📊 Using local database: ${process.env.DB_NAME || 'opina'} on ${process.env.DB_HOST || 'localhost'}`);
}

pool.on('connect', () => {
  console.log('✓ Connecté à la base de données PostgreSQL');
});

pool.on('error', (err: Error) => {
  console.error('Erreur de connexion à la base de données:', err);
  process.exit(-1);
});

export default pool;
