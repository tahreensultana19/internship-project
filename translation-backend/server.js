const express = require("express");
const cors = require("cors");
const { createClient } = require("@supabase/supabase-js");
require("dotenv").config();

const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Supabase client setup
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

// Endpoint to save a translation
app.post("/api/translations", async (req, res) => {
  const { original_message, translated_message, language, model, score } = req.body;

  // Validate input
  if (!original_message || !translated_message || !language || !model || typeof score !== 'number') {
    return res.status(400).json({ error: "Missing required fields" });
  }

  try {
    const { data, error } = await supabase
      .from("translations") // Ensure this table exists
      .insert([{ original_message, translated_message, language, model, score }]);

    if (error) {
      return res.status(400).json({ error: error.message });
    }
    res.status(201).json(data);
  } catch (error) {
    console.error("Error saving translation:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Endpoint to fetch previous translations
app.get("/api/translations", async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("translations")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(5);

    if (error) {
      return res.status(400).json({ error: error.message });
    }
    res.status(200).json(data);
  } catch (error) {
    console.error("Error fetching translations:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Endpoint to save a compare translation
app.post("/api/compareTranslate", async (req, res) => {
  const { original_message, translated_message, model, score } = req.body;

  // Validate input
  if (!original_message || !translated_message || !model || typeof score !== "number") {
    return res.status(400).json({ error: "Missing required fields" });
  }

  try {
    const { data, error } = await supabase
      .from("compare_translations") // Updated table name
      .insert([{ original_message, translated_message, model, score }]);

    if (error) {
      return res.status(400).json({ error: error.message });
    }
    res.status(201).json(data);
  } catch (error) {
    console.error("Error saving compare translation:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Endpoint to fetch previous compare translations
app.get("/api/compare-translations", async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("compare_translations") // Updated table name
      .select("*")
      .order("created_at", { ascending: false }) // Ensure created_at exists in the table schema
      .limit(5);

    if (error) {
      return res.status(400).json({ error: error.message });
    }
    res.status(200).json(data);
  } catch (error) {
    console.error("Error fetching compare translations:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});
const saveToSupabase = async (response) => {
  try {
    const { data, error } = await supabase
      .from("responses")
      .insert([{
        model: response.model,
        type: response.type,
        response: response.response,
        rating: response.rating || 0, // Defaults to 0 if not provided
        rank: response.rank || 0,    // Defaults to 0 if not provided
        message: response.message,
        to_language: response.to_language || null, // Optional
        created_at: new Date().toISOString(), // Explicit timestamp
      }]);

    if (error) {
      console.error("Error saving response to Supabase:", error.message);
    } else {
      console.log("Response saved to Supabase:", data);
    }
  } catch (err) {
    console.error("Error interacting with Supabase:", err.message);
  }
};


// Start the server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});