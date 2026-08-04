const { handleSignup, handleVerifyOTP, handleLogin, handleResendOTP } = require("../controllers/authController");
const { handleCheckReceiver, handleSendMoney, transactionHistory } = require("../controllers/transactionController");
const { getBalance, freezeWallet, unfreezeWallet, blockWallet, unblockWallet } = require("../controllers/walletController");
const { authenticateToken } = require("../middleware/auth");

const baseUrl = "/api/v1";

const routes = [
  {
    url: "/health",
    method: "GET",
    handler: (req, res) => {
      res.write("This is health");
      res.end();
    },
  },
  {
    url: "/auth/signup",
    method: "POST",
    handler: handleSignup,
  },
  {
    url: "/auth/verify-otp",
    method: "POST",
    handler: handleVerifyOTP,
  },
  {
    url: "/auth/login",
    method: "POST",
    handler: handleLogin,
  },
  {
    url: "/auth/resend-otp",
    method: "POST",
    handler: handleResendOTP,
  },
  {
    url: "/wallet/balance",
    method: "GET",
    middleware: authenticateToken,
    handler: getBalance,
  },
  {
    url: "/transaction/check-receiver",
    method: "POST",
    middleware: authenticateToken,
    handler: handleCheckReceiver,
  },
  {
    url: "/transaction/send-money",
    method: "POST",
    middleware: authenticateToken,
    handler: handleSendMoney,
  },
  {
    url: "/transaction/history",
    method: "GET",
    middleware: authenticateToken,
    handler: transactionHistory,
  },
  {
    url: "/wallet/freeze",
    method: "POST",
    middleware: authenticateToken,
    handler: freezeWallet,
  },
  {
    url: "/wallet/unfreeze",
    method: "POST",
    middleware: authenticateToken,
    handler: unfreezeWallet,
  },
  {
    url: "/wallet/block",
    method: "POST",
    middleware: authenticateToken,
    handler: blockWallet,
  },
  {
    url: "/wallet/unblock",
    method: "POST",
    middleware: authenticateToken,
    handler: unblockWallet,
  },
];

module.exports = { routes, baseUrl };
