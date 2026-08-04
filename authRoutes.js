const nodemailer = require('nodemailer');
const { pool } = require('./db');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'your-email@gmail.com',
    pass: 'your-app-password'
  }
});

const sendOTP = async (phone) => {
  const otp = '1234';
  await pool.query('UPDATE users SET otp = $1 WHERE phone = $2', [otp, phone]);
  
  await transporter.sendMail({
    from: 'your-email@gmail.com',
    to: 'your-email@gmail.com',
    subject: 'OTP for ' + phone,
    text: `OTP for phone ${phone} is: ${otp}`
  });
};

const handleSignup = async (req, res) => {
  let body;
  req.on('data', chunk => body += chunk);
  req.on('end', async () => {
    const data = JSON.parse(body);
    console.log(data);
    
    const existingUser = await pool.query('SELECT * FROM users WHERE phone = $1', [data.phone]);
    if (existingUser.rows.length > 0) {
      res.end(JSON.stringify({ error: 'User already exists' }));
      return;
    }
    
    const result = await pool.query(
      'INSERT INTO users (phone, pin) VALUES ($1, $2) RETURNING id',
      [data.phone, data.pin]
    );
    
    const userId = result.rows[0].id;
    
    await pool.query(
      'INSERT INTO wallets (user_id, balance) VALUES ($1, 0.00)',
      [userId]
    );
    
    await sendOTP(data.phone);
    res.end(JSON.stringify({ message: 'User created successfully' }));
  });
};

const handleVerifyOTP = async (req, res) => {
  let body = '';
  req.on('data', chunk => body += chunk);
  req.on('end', async () => {
    const data = JSON.parse(body);
    const user = await pool.query('SELECT * FROM users WHERE phone = $1', [data.phone]);
    
    if (user.rows.length === 0 || user.rows[0].otp !== data.otp) {
      res.end(JSON.stringify({ error: 'Invalid OTP' }));
      return;
    }
    
    await pool.query(
      'UPDATE users SET isVerified = TRUE, otp = NULL WHERE phone = $1',
      [data.phone]
    );
    res.end(JSON.stringify({ message: 'Account verified' }));
  });
};

const handleLogin = async (req, res) => {
  let body = '';
  req.on('data', chunk => body += chunk);
  req.on('end', async () => {
    const data = JSON.parse(body);
    const user = await pool.query(
      'SELECT * FROM users WHERE phone = $1 AND pin = $2',
      [data.phone, data.pin]
    );
    
    if (user.rows.length === 0) {
      res.end(JSON.stringify({ error: 'Invalid credentials' }));
      return;
    }
    
    if (!user.rows[0].isverified) {
      res.end(JSON.stringify({ error: 'Account not verified' }));
      return;
    }
    
    res.end(JSON.stringify({ message: 'Login successful', user: user.rows[0] }));
  });
};

module.exports = { handleSignup, handleVerifyOTP, handleLogin };
