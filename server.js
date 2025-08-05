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

        await sql`DROP TABLE IF EXISTS users CASCADE`;
        await sql`CREATE TABLE IF NOT EXISTS transactions (
            id SERIAL PRIMARY KEY,
            user_id VARCHAR(255) NOT NULL,
            title VARCHAR(255) NOT NULL,
            amount DECIMAL(10,2) NOT NULL,
            catagory VARCHAR(255) NOT NULL,
            created_at DATE NOT NULL DEFAULT CURRENT_DATE
        )`

    await sql`CREATE TABLE IF NOT EXISTS users(
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL,
        created_at DATE NOT NULL DEFAULT CURRENT_DATE
    )`

    await sql`CREATE TABLE IF NOT EXISTS test(
    id SERIAL PRIMARY KEY,
    name varchar(255) NOT Null
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

app.get("/api/transactions/:userId", async (req, res) => {
    try{
        const {userId}=req.params;
       
        const transactions = await sql`
        SELECT * FROM transactions WHERE user_id = ${userId}  ORDER BY created_at DESC
        `

        res.status(200).json(transactions);
        console.log("Transactions fetched successfully");
        
    } catch (error) {
        console.error("Error fetching transactions", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

app.delete("/api/transactions/:id", async (req, res) => {
    try{
        const {id} = req.params;
        const result = await sql`
            DELETE FROM transactions WHERE id = ${id} RETURNING *`
        if(result.length === 0) {
            return res.status(404).json({ error: "Transaction not found" });
        }
        console.log("Transaction deleted successfully");
        res.status(200).json({ message: "Transaction deleted successfully" });
    }catch (error) {
        console.error("Error deleting transaction", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
})

app.get("/api/transactions/summary/:userId", async (req, res) => {
    try{
        const {userId} = req.params;

        const balanceResult = await sql`
            SELECT COALESCE(SUM(amount),0) AS balance FROM transactions WHERE user_id = ${userId}`

        const incomeResult = await sql`
            SELECT COALESCE(SUM(amount),0) AS income FROM transactions WHERE user_id = ${userId} AND amount > 0` 
            
        const expensesResult = await sql`
            SELECT COALESCE(SUM(amount),0) AS expenses FROM transactions WHERE user_id = ${userId} AND amount < 0`        

        res.status(200).json({
            balance: balanceResult[0].balance,
            income: incomeResult[0].income,
            expenses: expensesResult[0].expenses  
        });
        console.log("Transaction summary fetched successfully");
    }catch (error) {
        console.error("Error fetching transaction summary", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});




connectToDatabase().then(() => {
    console.log("Connected to the database successfully");
    app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
    });
});
