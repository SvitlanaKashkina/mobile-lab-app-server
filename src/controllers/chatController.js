import prisma from '../prisma/lib/prisma.js';
import { io } from '../socket/chatSocket.js';
import { sendChatPushNotification } from '../controllers/pushTokenController.js';


// Retrieve all chat messages
export const getAllChats = async (req, res) => {
  try {
    const chats = await prisma.chat.findMany({
      orderBy: { chatId: 'asc' },
      include: {
        user: {
          select: { firstname: true, lastname: true, foto: true }
        }
      }
    });
    // Base64 encoding for user photo and image message
    const chatsWithBase64 = chats.map(chat => ({
      ...chat,
      createdAt: chat.createdAt,
      foto: chat.foto ? Buffer.from(chat.foto).toString('base64') : null,
      user: {
        ...chat.user,
        foto: chat.user?.foto ? Buffer.from(chat.user.foto).toString('base64') : null,
      }
    }));

    res.json(chatsWithBase64);
    console.log("📨 Old chats were sent to the frontend with Base64 images");
  } catch (error) {
    console.error("❌ Error loading chats:", error.message);
    res.status(500).json({ error: 'Error loading chats' });
  }
};


// Create new chat message
export const createChatMessage = async (req, res) => {
  try {
    const { message, foto, userId } = req.body;
    console.log("Received userId:", userId);
    console.log("Received message:", message);

    // Validate input data
    if (!message && !foto) {
      return res.status(400).json({ error: 'Message or photo required' });
    }

    if (!userId || isNaN(userId)) {
      return res.status(400).json({ error: 'Invalid userId' });
    }

    // Process photo if available
    let fotoBuffer = null;
    if (foto) {
      const base64Regex = /^([A-Za-z0-9+/=]|\n)*$/;
      if (!base64Regex.test(foto)) {
        return res.status(400).json({ error: 'Photo must be in Base64 format' });
      }
      fotoBuffer = Buffer.from(foto, 'base64');
    }

    // Save message in the database
    const newMessage = await prisma.chat.create({
      data: {
        user: {
          connect: { userId: parseInt(userId, 10) }
        },
        message: message || "",
        foto: fotoBuffer || null,
      },
      include: {
        user: {
          select: {
            firstname: true,
            lastname: true,
            foto: true,
          },
        },
      },
    });
    console.log("Message successfully saved in DB");


    // Send message via WebSocket to all clients, including user information
    io.emit('newMessage', {
      ...newMessage,
      createdAt: newMessage.createdAt,
      userId: newMessage.userId,
      user: {
        firstname: newMessage.user.firstname,
        lastname: newMessage.user.lastname,
        foto: newMessage.user.foto ? newMessage.user.foto.toString('base64') : null,
      },
      foto: newMessage.foto ? newMessage.foto.toString('base64') : null // If no photo, then zero
    });
    // Send push message
    await sendChatPushNotification({ title: "New chat message", senderUserId: newMessage.userId });

    return res.json(newMessage);
  } catch (error) {
    console.error("❌ Error sending message:", error);
    return res.status(500).json({ error: 'Error sending message' });
  }
};

export const deleteChat = async (req, res) => {
  const chatId = parseInt(req.params.chatId);

  if (isNaN(chatId)) {
    return res.status(400).json({ error: 'Invalid chat ID' });
  }

  try {
    const deleted = await prisma.chat.delete({
      where: { chatId: chatId },
    });

    res.status(200).json({ message: 'Message deleted', deleted });
  } catch (error) {
    console.error('Error deleting message:', error);
    res.status(500).json({ error: 'Error deleting or message not found' });
  }
};