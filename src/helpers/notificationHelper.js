const messaging = require("../config/firebase");

const sendNotification = async (fcmToken, title, body, data = {}) => {
  if (!fcmToken) {
    console.log("No FCM token provided, skipping notification");
    return;
  }

  // Convert all data values to strings and handle null/undefined
  const stringData = {};
  for (const [key, value] of Object.entries(data)) {
    stringData[key] = value !== null && value !== undefined ? String(value) : "";
  }

  const message = {
    token: fcmToken,
    notification: {
      title: title,
      body: body,
    },
    data: stringData,
    android: {
      priority: "high",
    },
  };

  try {
    const response = await messaging.send(message);
    console.log("Notification sent successfully:", response);
    return response;
  } catch (error) {
    if (error.errorInfo?.code === "messaging/mismatched-credential") {
      console.error(
        "FCM Token SenderId mismatch: The FCM token was created by a different Firebase project than the service account key (paylo-560c4)."
      );
    } else if (error.errorInfo?.code === "messaging/registration-token-not-registered") {
      console.error("FCM Token expired or invalid: The token is no longer registered.");
    } else {
      console.error("Error sending notification:", error);
    }
    throw error;
  }
};

const sendMoneyReceivedNotification = async (receiverFcmToken, senderName, amount) => {
  return await sendNotification(
    receiverFcmToken,
    "Money Received",
    `You received ${amount} from ${senderName}`,
    {
      type: "money_received",
      amount: amount.toString(),
      sender_name: senderName,
    }
  );
};

const sendMoneySentNotification = async (senderFcmToken, receiverName, amount) => {
  return await sendNotification(
    senderFcmToken,
    "Money Sent",
    `You sent ${amount} to ${receiverName}`,
    {
      type: "money_sent",
      amount: amount.toString(),
      receiver_name: receiverName,
    }
  );
};

module.exports = {
  sendNotification,
  sendMoneyReceivedNotification,
  sendMoneySentNotification,
};
