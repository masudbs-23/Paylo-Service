const { handleSignup, handleVerifyOTP, handleLogin, handleResendOTP } = require("../controllers/authController");
const { handleCheckReceiver, handleSendMoney } = require("../controllers/transactionController");
const { getBalance } = require("../controllers/walletController");
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
    handler: handleCheckReceiver,
  },
  {
    url: "/transaction/send-money",
    method: "POST",
    handler: handleSendMoney,
  },
];

module.exports = { routes, baseUrl };
