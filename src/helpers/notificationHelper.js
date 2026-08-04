const messaging = require("../config/firebase");

const sendNotification = async (fcmToken, title, body, data = {}) => {
  if (!fcmToken) {
    console.log("No FCM token provided, skipping notification");
    return;
  }

  const message = {
    token: fcmToken,
    notification: {
      title: title,
      body: body,
    },
    data: data,
    android: {
      priority: "high",
    },
  };

  try {
    const response = await messaging.send(message);
    console.log("Notification sent successfully:", response);
    return response;
  } catch (error) {
    console.error("Error sending notification:", error);
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
