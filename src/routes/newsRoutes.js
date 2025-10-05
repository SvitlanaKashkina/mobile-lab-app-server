
import express from 'express';
import multer from 'multer';
import * as newsController from '../controllers/newsController.js';

const router = express.Router();

// File upload
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

//intercepts the file from the form field name="foto"
router.post('/', upload.single('foto'), newsController.createNews);

router.get('/', newsController.getAllNews);
router.delete('/:newsId', newsController.deleteNews);

export default router;