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
        if (column === 'balance') {
          await pool.query('ALTER TABLE wallets ADD COLUMN balance DECIMAL(10, 2) DEFAULT 0.00');
        } else if (column === 'created_at') {
          await pool.query('ALTER TABLE wallets ADD COLUMN created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP');
        }
      }
    }

    const transactionsColumns = await pool.query(`
      SELECT column_name FROM information_schema.columns 
      WHERE table_name = 'transactions'
    `);
    const existingTransactionColumns = transactionsColumns.rows.map(row => row.column_name);
    
    const desiredTransactionColumns = ['id', 'sender_id', 'receiver_id', 'amount', 'transaction_type', 'status', 'created_at'];
    
    for (const column of desiredTransactionColumns) {
      if (!existingTransactionColumns.includes(column)) {
        console.log(`Adding column ${column} to transactions table`);
        if (column === 'amount') {
          await pool.query('ALTER TABLE transactions ADD COLUMN amount DECIMAL(10, 2)');
        } else if (column === 'transaction_type') {
          await pool.query('ALTER TABLE transactions ADD COLUMN transaction_type VARCHAR(20) DEFAULT \'send_money\'');
        } else if (column === 'status') {
          await pool.query('ALTER TABLE transactions ADD COLUMN status VARCHAR(20) DEFAULT \'completed\'');
        } else if (column === 'created_at') {
          await pool.query('ALTER TABLE transactions ADD COLUMN created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP');
        }
      }
    }
  } catch (err) {
    console.log('Auto migration skipped (tables may not exist yet)');
  }
};

module.exports = { autoMigrate };
