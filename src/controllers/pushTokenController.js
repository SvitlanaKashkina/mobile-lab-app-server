import prisma from '../prisma/lib/prisma.js';
import { Expo } from 'expo-server-sdk';

const expo = new Expo();

// Stores a user's push token in the database
export async function pushTokenEmpfangen(req, res) {
   try {
    const { userId, token } = req.body;

    if (!userId || !token) {
      return res.status(400).json({ error: "userId and token are required" });
    }

    const userIdInt = parseInt(userId);
    if (isNaN(userIdInt)) {
      return res.status(400).json({ error: "userId must be a number" });
    }

    await prisma.user_data.update({
      where: { userId: userIdInt },
      data: { pushtoken: token }
    });

    console.log("Push token saved:", token);
    res.status(200).json({ message: "Push token saved" });

  } catch (error) {
    console.error("Error saving push token:");
    res.status(500).json({ error: "Internal Server Error" });
  }
}

//Sends a news push message to all users who have stored a valid push token
export async function sendNewsPushNotification ({ title, senderUserId }) {
    const finalTitle = title || ".....New News";

    try {
       if (!senderUserId) {
        console.log("⚠️ No senderUserId specified");
      }

      const senderIdNum = Number(senderUserId);
      if (isNaN(senderIdNum)) {
        console.log("⚠️ senderUserId is not a number or not set");
      } else {
        console.log("🚫 Sender excluded with userId:", senderIdNum);
      }

      const users = await prisma.user_data.findMany({
        where: { pushtoken: { not: null },  userId: !isNaN(senderIdNum) ? { not: senderIdNum } : undefined},
        select: { pushtoken: true },
      });

      if (users.length === 0) {
        console.log("⚠️ No registered PushTokens found");
        return; // just stop sending
      }

      const uniqueTokens = [...new Set(users.map(user => user.pushtoken))];

      const messages = uniqueTokens
        .filter(token => Expo.isExpoPushToken(token))
        .map(token => ({
          to: token,
          sound: 'default',
          title: finalTitle,
        }));

      const chunks = expo.chunkPushNotifications(messages);

      for (const chunk of chunks) {
        await expo.sendPushNotificationsAsync(chunk);
      }

      console.log("✅ Push notifications sent");
      console.log("▶️ Title for push:", finalTitle);
      console.log("🚫 Sender excluded with userId:", senderIdNum);
    } catch (error) {
      console.error('❌ Error sending push message:', error);
      throw error;
    }
}

// Sends a chat push message to all users with a valid token
export async function sendChatPushNotification({ title, senderUserId }) {
    const finalTitle = title || ".......New chat message";

    try {
      if (!senderUserId) {
        console.log("⚠️ No senderUserId specified ");
      }

      const senderIdNum = Number(senderUserId);
      if (isNaN(senderIdNum)) {
        console.log("⚠️ senderUserId is not a number or not set");
      } else {
        console.log("🚫 Sender excluded with userId:", senderIdNum);
      }

      const users = await prisma.user_data.findMany({
        where: { pushtoken: { not: null }, userId: !isNaN(senderIdNum) ? { not: senderIdNum } : undefined },
        select: { pushtoken: true, userId: true },
      });
      console.log("Tokens to be sent:", users.map(u => ({userId: u.userId, pushtoken: u.pushtoken})));

      if (users.length === 0) {
        console.log("⚠️ No registered PushTokens found");
        return;
      }

      const uniqueTokens = [...new Set(users.map(user => user.pushtoken))];

      const messages = uniqueTokens
        .filter(token => Expo.isExpoPushToken(token))
        .map(token => ({
          to: token,
          sound: 'default',
          title: finalTitle,
        }));

      const chunks = expo.chunkPushNotifications(messages);
      for (const chunk of chunks) {
        await expo.sendPushNotificationsAsync(chunk);
      }
      console.log("✅ Chat push messages sent");
      console.log("▶️ Title for chat push:", finalTitle);
      console.log("🚫 Sender excluded with userId:", senderIdNum);
    } catch (error) {
      console.error('❌ Error sending chat push message:', error);
      throw error;
    }
}
