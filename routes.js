const { handleSignup, handleVerifyOTP, handleLogin } = require("./authRoutes");
const { handleCheckReceiver, handleSendMoney } = require("./transactions");

const routes = [
  {
    url: "/health",
    method: "GET",
    handler: (req, res) => {
      res.write("This is health");
      res.end();
    }
  },
  {
    url: "/auth/signup",
    method: "POST",
    handler: handleSignup
  },
  {
    url: "/auth/verify-otp",
    method: "POST",
    handler: handleVerifyOTP
  },
  {
    url: "/auth/login",
    method: "POST",
    handler: handleLogin
  },
  {
    url: "/transaction/check-receiver",
    method: "POST",
    handler: handleCheckReceiver
  },
  {
    url: "/transaction/send-money",
    method: "POST",
    handler: handleSendMoney
  }
];

module.exports = { routes };
