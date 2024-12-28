import express from 'express';
import { addShop,loginAdmin } from '../controller/adminController.js';
import upload from '../Middleware/multer.js';
import authAdmin from '../Middleware/authAdmin.js';

const adminRouter = express.Router()

adminRouter.post('/add-shop',authAdmin,upload.single('image'),addShop)
adminRouter.post('/login',loginAdmin)


export default adminRouter;