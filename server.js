// const express = require('express');
import express from 'express';
import dotenv from 'dotenv';
import { sql } from './config/db.js'; // Adjust the import path as necessary

dotenv.config();

const app = express();

app.use(express.json()); // Middleware to parse JSON bodies



const PORT = process.env.PORT || 5000;

async function connectToDatabase() {
    try{
        await sql`CREATE TABLE IF NOT EXISTS transactions (
            id SERIAL PRIMARY KEY,
            user_id VARCHAR(255) NOT NULL,
            title VARCHAR(255) NOT NULL,
            amount DECIMAL(10,2) NOT NULL,
            catagory VARCHAR(255) NOT NULL,
            created_at DATE NOT NULL DEFAULT CURRENT_DATE
        )`
        console.log("Database initialized.....")
    } catch (error) {
        console.error("Error initializing database", error);
        process.exit(1);
    }
}

app.get("/", (req, res) => {
    res.send("Hello World");
});

app.post("/api/transactions", async (req, res) => {
    try{
        const { user_id, title, amount, category } = req.body;

        if(!title || !amount || !category || !user_id) {
            return res.status(400).json({ error: "all fields are required" });
        }

        await sql`
            INSERT INTO transactions (user_id,title, amount, catagory)
            VALUES (${user_id}, ${title}, ${amount}, ${category})
            RETURNING *
        `;

        console.log("Transaction created successfully");
        res.status(201).json({ message: "Transaction created successfully" });
    } catch (error) {
        console.error("Error creating transaction", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

connectToDatabase().then(() => {
    console.log("Connected to the database successfully");
    app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
    });
});
