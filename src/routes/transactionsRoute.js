import express from 'express';
import {sql} from '../config/db.js'; // Adjust the import path as necessary
import { getTransactionsByUserId } from '../controllers/transactionsController.js'; // Adjust the import path as necessary
import { deleteTransactionById } from '../controllers/transactionsController.js'; // Adjust the import path as necessary
import { createTransaction } from '../controllers/transactionsController.js'; // Adjust the import path as necessary   
import { getSummaryByUserId } from '../controllers/transactionsController.js'; // Adjust the import path as necessary      

const router = express.Router();




router.post("/", createTransaction); 

router.get("/:userId", getTransactionsByUserId);

router.delete("/:id",deleteTransactionById);

router.get("/summary/:userId", getSummaryByUserId);
export default router;