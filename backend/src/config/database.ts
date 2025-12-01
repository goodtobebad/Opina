import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

// Configure pg to parse timestamps as UTC and return ISO strings
import { types } from 'pg';
types.setTypeParser(1114, (str) => new Date(str + 'Z').toISOString());

const pool = new Pool({
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
});

pool.on('connect', () => {
  console.log('✓ Connecté à la base de données PostgreSQL');
});

pool.on('error', (err: Error) => {
  console.error('Erreur de connexion à la base de données:', err);
  process.exit(-1);
});

export default pool;
