const admin = require("firebase-admin");
const serviceAccount = require("../../service-account.json");

try {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });

  console.log("Firebase initialized");

  const messaging = admin.messaging();

  module.exports = messaging;
} catch (error) {
  console.error("Firebase initialization error:", error);
  module.exports = null;
}
