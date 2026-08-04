const { pool } = require("../config/db");

const getBalance = async (req, res) => {
  let body = "";
  req.on("data", (chunk) => (body += chunk));
  req.on("end", async () => {
    try {
      const wallet = await pool.query(
        "SELECT * FROM wallets WHERE user_id = $1",
        [req.user.userId],
      );

      if (wallet.rows.length === 0) {
        res.end(JSON.stringify({ errorMessage: "Wallet not found" }));
        return;
      }

      res.end(
        JSON.stringify({
          successMessage: "Balance retrieved successfully",
          balance: wallet.rows[0].balance,
        }),
      );
    } catch (error) {
      res.end(JSON.stringify({ errorMessage: "Error retrieving balance" }));
    }
  });
};

module.exports = { getBalance };
