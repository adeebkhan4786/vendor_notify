import express from 'express';
import multer from 'multer';
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });




//Importing Files
import { vendorNotify, sendingMail } from '../controllers/vendorController.js';


//Instances
const router = express.Router();

//User routes
router.post('/vendorNotify', vendorNotify);
router.post('/sendingMail', upload.single('file'), sendingMail);




export default router;