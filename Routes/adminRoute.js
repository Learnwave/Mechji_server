import express from 'express';
import { addShop } from '../controller/adminController.js';
import upload from '../Middleware/multer.js';

const adminRouter = express.Router()

adminRouter.post('/add-shop',upload.single('image'),addShop)

export default adminRouter;