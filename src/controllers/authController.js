const nodemailer = require("nodemailer");
const jwt = require("jsonwebtoken");
const { pool } = require("../config/db");

const JWT_SECRET = "masud924";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "porao404@gmail.com",
    pass: "hbpuevhllmqfiqrd",
  },
});

const sendOTP = async (phone) => {
  const otp = "1234";
  await pool.query(
    "UPDATE users SET otp = $1, last_otp_sent_at = CURRENT_TIMESTAMP WHERE phone = $2",
    [otp, phone]
  );

  // Email sending disabled for now - using fixed OTP 1234
  // await transporter.sendMail({
  //   from: "porao404@gmail.com",
  //   to: "porao404@gmail.com",
  //   subject: "OTP for " + phone,
  //   text: `OTP for phone ${phone} is: ${otp}`,
  // });
};

const handleSignup = async (req, res) => {
  let body = "";
  req.on("data", (chunk) => (body += chunk));
  req.on("end", async () => {
    const data = JSON.parse(body);
    const existingUser = await pool.query(
      "SELECT * FROM users WHERE phone = $1",
      [data.phone],
    );
    if (existingUser.rows.length > 0) {
      res.end(JSON.stringify({ errorMessage: "User already exists" }));
      return;
    }

    const result = await pool.query(
      "INSERT INTO users (phone, pin) VALUES ($1, $2) RETURNING id",
      [data.phone, data.pin],
    );

    const userId = result.rows[0].id;

    await pool.query(
      "INSERT INTO wallets (user_id, balance) VALUES ($1, 50.00)",
      [userId],
    );

    await sendOTP(data.phone);
    res.end(JSON.stringify({ successMessage: "User created successfully" }));
  });
};

const handleVerifyOTP = async (req, res) => {
  let body = "";
  req.on("data", (chunk) => (body += chunk));
  req.on("end", async () => {
    const data = JSON.parse(body);
    const user = await pool.query("SELECT * FROM users WHERE phone = $1", [
      data.phone,
    ]);

    if (user.rows.length === 0 || user.rows[0].otp !== data.otp) {
      res.end(JSON.stringify({ errorMessage: "Invalid OTP" }));
      return;
    }

    await pool.query(
      "UPDATE users SET isVerified = TRUE, otp = NULL WHERE phone = $1",
      [data.phone],
    );

    const token = jwt.sign(
      { userId: user.rows[0].id, phone: user.rows[0].phone },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    const wallet = await pool.query(
      "SELECT * FROM wallets WHERE user_id = $1",
      [user.rows[0].id]
    );

    res.end(
      JSON.stringify({
        successMessage: "Account verified successfully",
        token,
        user: user.rows[0],
        wallet: wallet.rows[0],
      }),
    );
  });
};

const handleLogin = async (req, res) => {
  let body = "";
  req.on("data", (chunk) => (body += chunk));
  req.on("end", async () => {
    const data = JSON.parse(body);
    const user = await pool.query(
      "SELECT * FROM users WHERE phone = $1 AND pin = $2",
      [data.phone, data.pin],
    );

    if (user.rows.length === 0) {
      res.end(JSON.stringify({ errorMessage: "Invalid credentials" }));
      return;
    }

    if (!user.rows[0].isverified) {
      res.end(JSON.stringify({ errorMessage: "Account not verified" }));
      return;
    }

    const token = jwt.sign(
      { userId: user.rows[0].id, phone: user.rows[0].phone },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    const wallet = await pool.query(
      "SELECT * FROM wallets WHERE user_id = $1",
      [user.rows[0].id]
    );

    res.end(
      JSON.stringify({
        successMessage: "Login successful",
        token,
        user: user.rows[0],
        wallet: wallet.rows[0],
      }),
    );
  });
};

const handleResendOTP = async (req, res) => {
  let body = "";
  req.on("data", (chunk) => (body += chunk));
  req.on("end", async () => {
    const data = JSON.parse(body);
    
    const user = await pool.query(
      "SELECT * FROM users WHERE phone = $1",
      [data.phone]
    );

    if (user.rows.length === 0) {
      res.end(JSON.stringify({ errorMessage: "User not found" }));
      return;
    }

    if (user.rows[0].isverified) {
      res.end(JSON.stringify({ errorMessage: "Account already verified" }));
      return;
    }

    // Check if last OTP was sent within 30 seconds
    if (user.rows[0].last_otp_sent_at) {
      const lastSent = new Date(user.rows[0].last_otp_sent_at);
      const now = new Date();
      const diffSeconds = (now - lastSent) / 1000;
      
      if (diffSeconds < 30) {
        const remainingTime = Math.ceil(30 - diffSeconds);
        res.end(
          JSON.stringify({
            errorMessage: `Please wait ${remainingTime} seconds before resending OTP`,
            remainingTime,
          })
        );
        return;
      }
    }

    await sendOTP(data.phone);
    res.end(
      JSON.stringify({
        successMessage: "OTP resent successfully",
        message: "Please wait 30 seconds before requesting another OTP",
        remainingTime: 30,
      })
    );
  });
};

module.exports = { handleSignup, handleVerifyOTP, handleLogin, handleResendOTP };
