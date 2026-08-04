const { pool } = require('./db');

const handleCheckReceiver = async (req, res) => {
  let body = '';
  req.on('data', chunk => body += chunk);
  req.on('end', async () => {
    const data = JSON.parse(body);
    
    const user = await pool.query(
      'SELECT id, phone, name, profile_image, user_type FROM users WHERE phone = $1',
      [data.phone]
    );
    
    if (user.rows.length === 0) {
      res.end(JSON.stringify({ error: 'User not found' }));
      return;
    }
    
    if (user.rows[0].user_type !== 'Personal') {
      res.end(JSON.stringify({ error: 'Can only send to Personal accounts' }));
      return;
    }
    
    res.end(JSON.stringify({ 
      message: 'Receiver found', 
      receiver: user.rows[0] 
    }));
  });
};

const handleSendMoney = async (req, res) => {
  let body = '';
  req.on('data', chunk => body += chunk);
  req.on('end', async () => {
    const data = JSON.parse(body);
    
    const sender = await pool.query(
      'SELECT * FROM users WHERE phone = $1',
      [data.senderPhone]
    );
    
    if (sender.rows.length === 0) {
      res.end(JSON.stringify({ error: 'Sender not found' }));
      return;
    }
    
    if (sender.rows[0].pin !== data.pin) {
      res.end(JSON.stringify({ error: 'Invalid PIN' }));
      return;
    }
    
    const receiver = await pool.query(
      'SELECT * FROM users WHERE phone = $1 AND user_type = $2',
      [data.receiverPhone, 'Personal']
    );
    
    if (receiver.rows.length === 0) {
      res.end(JSON.stringify({ error: 'Receiver not found or not Personal' }));
      return;
    }
    
    const senderWallet = await pool.query(
      'SELECT * FROM wallets WHERE user_id = $1',
      [sender.rows[0].id]
    );
    
    if (senderWallet.rows.length === 0 || senderWallet.rows[0].balance < data.amount) {
      res.end(JSON.stringify({ error: 'Insufficient balance' }));
      return;
    }
    
    const receiverWallet = await pool.query(
      'SELECT * FROM wallets WHERE user_id = $1',
      [receiver.rows[0].id]
    );
    
    await pool.query('BEGIN');
    
    try {
      await pool.query(
        'UPDATE wallets SET balance = balance - $1 WHERE user_id = $2',
        [data.amount, sender.rows[0].id]
      );
      
      await pool.query(
        'UPDATE wallets SET balance = balance + $1 WHERE user_id = $2',
        [data.amount, receiver.rows[0].id]
      );
      
      await pool.query('COMMIT');
      
      res.end(JSON.stringify({ 
        message: 'Send money successful',
        senderBalance: senderWallet.rows[0].balance - data.amount,
        receiverBalance: receiverWallet.rows[0].balance + data.amount
      }));
    } catch (err) {
      await pool.query('ROLLBACK');
      res.end(JSON.stringify({ error: 'Transaction failed' }));
    }
  });
};

module.exports = { handleCheckReceiver, handleSendMoney };
