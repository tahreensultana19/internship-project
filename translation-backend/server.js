const express = require("express");
const cors = require("cors");
const { Pool } = require("pg");
require("dotenv").config();


const app = express();
const port = process.env.PORT || 5000;

// Middleware
const cors = require('cors');
// app.use(cors());
app.use(cors());
app.use(express.json());

// PostgreSQL connection setup
const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

// Endpoint to save a translation
app.post("/api/translations", async (req, res) => {
  const { original_message, translated_message, language, model, score } = req.body;

  // Validate input
  if (!original_message || !translated_message || !language || !model || typeof score !== 'number') {
    return res.status(400).json({ error: "Missing required fields" });
  }

  try {
    const result = await pool.query(
      'INSERT INTO translations (original_message, translated_message, language, model, score) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [original_message, translated_message, language, model, score]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error("Error saving translation:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Endpoint to fetch previous translations
app.get("/api/translations", async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM translations ORDER BY created_at DESC LIMIT 5'
    );

    res.status(200).json(result.rows);
  } catch (error) {
    console.error("Error fetching translations:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Endpoint to save a compare translation
app.post("/api/compareTranslate", async (req, res) => {
  const { original_message, translated_message, language, model, score } = req.body;

  // Validate input
  if (!original_message || !translated_message || !language || !model || typeof score !== 'number') {
    return res.status(400).json({ error: "Missing required fields" });
  }

  try {
    const result = await pool.query(
      'INSERT INTO compareTranslate (original_message, translated_message, language, model, score) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [original_message, translated_message, language, model, score]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error("Error saving compare translation:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Endpoint to fetch previous compare translations
app.get("/api/compare-translations", async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM compareTranslate ORDER BY created_at DESC LIMIT 5'
    );

    res.status(200).json(result.rows);
  } catch (error) {
    console.error("Error fetching compare translations:", error);
    res.status (500).json({ error: "Internal server error" });
  }
});

// Endpoint to use Assembly for translation or Q&A
app.post("/api/assembly", async (req, res) => {
  const { prompt, model } = req.body;

  // Validate input
  if (!prompt || !model) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  try {
    const response = await fetch("https://cors-anywhere.herokuapp.com/https://api.assemblyai.com/v2/translate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.ASSEMBLY_API_KEY}`
      },
      body: JSON.stringify({ prompt })
    });

    const data = await response.json();
    if (response.ok) {
      res.status(200).json(data);
    } else {
      res.status(400).json({ error: data.error || "Error from Assembly API" });
    }
  } catch (error) {
    console.error("Error with Assembly API:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
}); 
