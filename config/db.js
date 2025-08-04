import {neon} from "@neondatabase/serverless";
import "dotenv/config";

// backend/config/db.js
// This file sets up the database connection using Neon
export const sql = neon(process.env.DATABASE_URL);