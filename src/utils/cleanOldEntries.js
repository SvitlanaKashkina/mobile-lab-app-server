import prisma from '../prisma/lib/prisma.js';

export async function deleteOldEntries() {
  const twoMonthsAgo = new Date();
  twoMonthsAgo.setMonth(twoMonthsAgo.getMonth() - 2);

  try {
    // Delete news older than two months, except start-news with Id 10
    const deletedNews = await prisma.news.deleteMany({
      where: {
        createdAt: { lt: twoMonthsAgo },
        NOT: { newsId: 10 }
      }
    });

    // Delete chat messages older than two months, except start-chat with ID 410
    const deletedChats = await prisma.chat.deleteMany({
      where: {
        createdAt: { lt: twoMonthsAgo },
        NOT: { chatId: 410 }
      }
    });

    console.log(`🧹 Deleted entries: ${deletedNews.count} news, ${deletedChats.count} chats`);

  } catch (error) {
    console.error('❌ Error deleting old entries:', error);
  }
}
