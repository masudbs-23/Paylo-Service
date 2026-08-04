const { pool } = require("../config/db");

const handleCheckReceiver = async (req, res) => {
  let body = "";
  req.on("data", (chunk) => (body += chunk));
  req.on("end", async () => {
    const data = JSON.parse(body);

    const user = await pool.query(
      "SELECT id, phone, name, profile_image, user_type FROM users WHERE phone = $1",
      [data.phone],
    );

    if (user.rows.length === 0) {
      res.end(JSON.stringify({ error: "User not found" }));
      return;
    }

    if (user.rows[0].user_type !== "Personal") {
      res.end(JSON.stringify({ error: "Can only send to Personal accounts" }));
      return;
    }
 
    if (user.rows[0].id === req.user.userId) {
      res.end(JSON.stringify({ error: "Cannot send to yourself" }));
      return;
    }

    res.end(
      JSON.stringify({
        message: "Receiver found",
        receiver: user.rows[0],
      }),
    );
  });
};

const handleSendMoney = async (req, res) => {
  let body = "";
  req.on("data", (chunk) => (body += chunk));
  req.on("end", async () => {
    const data = JSON.parse(body);

    const sender = await pool.query("SELECT * FROM users WHERE id = $1", [
      req.user.userId,
    ]);

    if (sender.rows.length === 0) {
      res.end(JSON.stringify({ error: "Sender not found" }));
      return;
    }

    if (sender.rows[0].pin !== data.pin) {
      res.end(JSON.stringify({ error: "Invalid PIN" }));
      return;
    }

    const receiver = await pool.query(
      "SELECT * FROM users WHERE phone = $1 AND user_type = $2",
      [data.receiverPhone, "Personal"],
    );

    if (receiver.rows.length === 0) {
      res.end(JSON.stringify({ error: "Receiver not found or not Personal" }));
      return;
    }

    if (receiver.rows[0].id === req.user.userId) {
      res.end(JSON.stringify({ error: "Cannot send to yourself" }));
      return;
    }

    const senderWallet = await pool.query(
      "SELECT * FROM wallets WHERE user_id = $1",
      [sender.rows[0].id],
    );

    if (
      senderWallet.rows.length === 0 ||
      senderWallet.rows[0].balance < data.amount
    ) {
      res.end(JSON.stringify({ error: "Insufficient balance" }));
      return;
    }

    const receiverWallet = await pool.query(
      "SELECT * FROM wallets WHERE user_id = $1",
      [receiver.rows[0].id],
    );

    await pool.query("BEGIN");

    try {
      await pool.query(
        "UPDATE wallets SET balance = balance - $1 WHERE user_id = $2",
        [data.amount, sender.rows[0].id],
      );

      await pool.query(
        "UPDATE wallets SET balance = balance + $1 WHERE user_id = $2",
        [data.amount, receiver.rows[0].id],
      );

      await pool.query(
        "INSERT INTO transactions (sender_id, receiver_id, amount, transaction_type, status) VALUES ($1, $2, $3, $4, $5)",
        [
          sender.rows[0].id,
          receiver.rows[0].id,
          data.amount,
          "send_money",
          "completed",
        ],
      );

      await pool.query("COMMIT");

      res.end(
        JSON.stringify({
          message: "Send money successful",
          amount: data.amount,
          receiverPhone: receiver.rows[0].phone,
          receiverName: receiver.rows[0].name,
        }),
      );
    } catch (err) {
      await pool.query("ROLLBACK");
      res.end(JSON.stringify({ error: "Transaction failed" }));
    }
  });
};


const transactionHistory = async (req, res) => {
  const { userId } = req.user;
  const transactions=await pool.query("SELECT * FROM transactions WHERE sender_id =$1 OR receiver_id=$1",[userId])
  res.end(JSON.stringify({ message: "Transaction history", transactions: transactions.rows }));
  
}

module.exports = { handleCheckReceiver, handleSendMoney, transactionHistory };
