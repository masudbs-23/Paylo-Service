const autoMigrate = async (pool) => {
  try {
    const usersColumns = await pool.query(`
      SELECT column_name FROM information_schema.columns 
      WHERE table_name = 'users'
    `);
    const existingColumns = usersColumns.rows.map(row => row.column_name);
    
    const desiredUsersColumns = ['id', 'phone', 'pin', 'name', 'profile_image', 'user_type', 'otp', 'isverified'];
    
    for (const column of desiredUsersColumns) {
      if (!existingColumns.includes(column)) {
        console.log(`Adding column ${column} to users table`);
        if (column === 'name') {
          await pool.query('ALTER TABLE users ADD COLUMN name VARCHAR(255)');
        } else if (column === 'profile_image') {
          await pool.query('ALTER TABLE users ADD COLUMN profile_image VARCHAR(500)');
        } else if (column === 'user_type') {
          await pool.query('ALTER TABLE users ADD COLUMN user_type VARCHAR(20) DEFAULT \'Personal\'');
        }
      }
    }

    const walletsColumns = await pool.query(`
      SELECT column_name FROM information_schema.columns 
      WHERE table_name = 'wallets'
    `);
    const existingWalletColumns = walletsColumns.rows.map(row => row.column_name);
    
    const desiredWalletColumns = ['id', 'user_id', 'balance', 'created_at'];
    
    for (const column of desiredWalletColumns) {
      if (!existingWalletColumns.includes(column)) {
        console.log(`Adding column ${column} to wallets table`);
        if (column === 'balance') {
          await pool.query('ALTER TABLE wallets ADD COLUMN balance DECIMAL(10, 2) DEFAULT 0.00');
        } else if (column === 'created_at') {
          await pool.query('ALTER TABLE wallets ADD COLUMN created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP');
        }
      }
    }
  } catch (err) {
    console.log('Auto migration skipped (tables may not exist yet)');
  }
};

module.exports = { autoMigrate };
