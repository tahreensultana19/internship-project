
// const express = require("express");
// const cors = require("cors");
// const { createClient } = require("@supabase/supabase-js");
// require("dotenv").config();

// const app = express();
// const port = process.env.PORT || 5000;

// // Middleware
// app.use(cors());
// app.use(express.json());

// // Supabase client setup
// const supabaseUrl = process.env.SUPABASE_URL;
// const supabaseKey = process.env.SUPABASE_KEY;
// const supabase = createClient(supabaseUrl, supabaseKey);

// // Endpoint to save a translation
// app.post("/api/translations", async (req, res) => {
//   const { original_message, translated_message, language, model } = req.body;

//   // Validate input
//   if (!original_message || !translated_message || !language || !model) {
//     return res.status(400).json({ error: "Missing required fields" });
//   }

//   try {
//     const { data, error } = await supabase
//       .from("translations")
//       .insert([{ original_message, translated_message, language, model }]);

//     if (error) {
//       return res.status(400).json({ error: error.message });
//     }
//     res.status(201).json(data);
//   } catch (error) {
//     console.error("Error saving translation:", error);
//     res.status(500).json({ error: "Internal server error" });
//   }
// });

// // Endpoint to fetch previous translations
// app.get("/api/translations", async (req, res) => {
//   try {
//     const { data, error } = await supabase
//       .from("translations")
//       .select("*")
//       .order("created_at", { ascending: false })
//       .limit(5);

//     if (error) {
//       return res.status(400).json({ error: error.message });
//     }
//     res.status(200).json(data);
//   } catch (error) {
//     console.error("Error fetching translations:", error);
//     res.status(500).json({ error: "Internal server error" });
//   }
// });
// app.post("/compareTranslate", (req, res) => {
//   const { message, sourceLanguage, destinationLanguage, temperatureValue, selectedModels } = req.body;
  
//   // Add your translation logic here
//   // For now, we're just returning a dummy response
//   res.json({ translation: "Translation result here" });
// });
// // Start the server
// app.listen(port, () => {
//   console.log(`Server running at http://localhost:${port}`);
// });


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
  const { original_message, translated_message, language, model, score } = req.body;

  // Validate input
  if (!original_message || !translated_message || !language || !model || typeof score !== 'number') {
    return res.status(400).json({ error: "Missing required fields" });
  }

  try {
    const { data, error } = await supabase
      .from("compareTranslate") // Ensure this table exists
      .insert([{ original_message, translated_message, language, model, score }]);

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
      .from("compareTranslate")
      .select("*")
      .order("created_at", { ascending: false })
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

// Start the server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});