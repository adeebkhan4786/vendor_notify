import express from 'express';




//Importing Files
import { vendorNotify } from '../controllers/vendorController.js';


//Instances
const router = express.Router();

//User routes
router.post('/vendorNotify', vendorNotify);




export default router;