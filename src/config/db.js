const { Pool } = require('pg');
const { autoMigrate } = require('./migration');

const pool = new Pool({
  connectionString: 'postgresql://neondb_owner:npg_5MhJwPBEgYG2@ep-bitter-term-axrirhjh-pooler.c-4.us-east-2.aws.neon.tech/neondb?sslmode=verify-full'
});

const connectDB = async () => {
  try {
    await pool.connect();
    console.log('Database connected');
    
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        phone VARCHAR(20) UNIQUE NOT NULL,
        pin VARCHAR(10) NOT NULL,
        name VARCHAR(255),
        profile_image VARCHAR(500),
        user_type VARCHAR(20) DEFAULT 'Personal',
        otp VARCHAR(10),
        isVerified BOOLEAN DEFAULT FALSE,
        fcm_token TEXT
      )
    `);
    
    await pool.query(`
      CREATE TABLE IF NOT EXISTS wallets (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id),
        balance DECIMAL(10, 2) DEFAULT 0.00,
        status VARCHAR(20) DEFAULT 'active',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    await pool.query(`
      CREATE TABLE IF NOT EXISTS transactions (
        id SERIAL PRIMARY KEY,
        sender_id INTEGER REFERENCES users(id),
        receiver_id INTEGER REFERENCES users(id),
        amount DECIMAL(10, 2) NOT NULL,
        transaction_type VARCHAR(20) DEFAULT 'send_money',
        status VARCHAR(20) DEFAULT 'completed',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    await autoMigrate(pool);
  } catch (err) {
    console.error("Database connection failed", err);
  }
};

module.exports = { pool, connectDB };