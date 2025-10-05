import prisma from '../prisma/lib/prisma.js';
import { sendNewsPushNotification } from './pushTokenController.js';

// Create news and save it in DB
export async function createNews(req, res) {
    const { title, content, author, userId } = req.body;
    const fotoBuffer = req.file ? req.file.buffer : null;

    try {
      const news = await prisma.news.create({
        data: {
          title,
          content,
          createdAt: new Date(),
          author,
          foto: fotoBuffer,
        },
      });

      const authorId = parseInt(req.body.userId);
      // Send push message
      await sendNewsPushNotification({ title: `.....New news`, senderUserId: authorId });

      res.status(201).json(news);

    } catch (error) {
      console.error('Error creating news:', error);
      res.status(500).json({ error: 'Error creating news' });
    }
}

// Retrieve all news
export async function getAllNews(req, res) {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 2;
  const skip = (page - 1) * limit;

  try {
    const news = await prisma.news.findMany({
      skip: skip,
      take: limit,
      orderBy: { createdAt: 'desc' }, // Latest news first
      select: {
        newsId: true,
        title: true,
        content: true,
        author: true,
        createdAt: true,
        foto: true,
      },
    });

    // Optional: Convert photo to Base64
    const newsWithBase64 = news.map(item => ({
      newsId: item.newsId,
      title: item.title,
      content: item.content,
      createdAt: item.createdAt,
      author: item.author,
      image: item.foto ? item.foto.toString('base64') : null,
    }));

    // Get total number of news (for hasMore)
    const totalCount = await prisma.news.count();

    res.json({
      data: newsWithBase64,
      hasMore: skip + limit < totalCount, // true if there is more news
    });
  } catch (error) {
    console.error('Fehler beim Abrufen der News:', error);
    res.status(500).json({ error: 'Fehler beim Abrufen der News' });
  }
}

//  DELETE NEWS
export async function deleteNews (req, res) {
    const { newsId } = req.params;

    try {
      // Check if news exists
      const existingNews = await prisma.news.findUnique({
        where: { newsId: parseInt(newsId) },
      });

      if (!existingNews) {
        return res.status(404).json({ error: "News not found" });
      }

      // Delete news
      await prisma.news.delete({
        where: { newsId: parseInt(newsId) },
      });

      res.json({ message: "News deleted successfully" });
      console.log("News deleted successfully");
    } catch (error) {
      console.error("Deletion error:", error);
      res.status(500).json({ error: "Delete failed" });
    }
};
