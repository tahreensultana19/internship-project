import React, { useState, useEffect } from "react";
import "./App.css";
import { Link } from "react-router-dom";
import { Configuration, OpenAIApi } from "openai";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { BeatLoader } from "react-spinners";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);



const ResponseAnswer = () => {
  const [formData, setFormData] = useState({
    inputType: "translation",
    toLanguage: "Spanish",
    message: "",
  });
  const [responses, setResponses] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [recognition, setRecognition] = useState(null);
  const [performanceAnalysis, setPerformanceAnalysis] = useState({});
  const [averageScores, setAverageScores] = useState({});

  const googleGenAI = new GoogleGenerativeAI(import.meta.env.VITE_GOOGLE_API_KEY);
  const configuration = new Configuration({
    apiKey: import.meta.env.VITE_OPENAI_KEY,
  });
  const openai = new OpenAIApi(configuration);

  const models = [
    "gpt-3.5-turbo",
    "gpt-4",
    "gpt-4-turbo",
    "gemini-1.5-pro-001",
    "gemini-1.5-flash-001",
    "gemini-1.5-flash-002",
    "gemini-1.5-pro-002",
    "deepl",
  ];

  const supportedLanguages = {
    "deepl": [
      "Arabic", "Bulgarian", "Chinese (Simplified)", "Chinese (Traditional)", "Czech", "Danish",
      "Dutch", "English", "Estonian", "Finnish", "French", "German", "Greek", "Hungarian",
      "Indonesian", "Italian", "Japanese", "Korean", "Latvian", "Lithuanian", "Norwegian",
      "Polish", "Portuguese", "Romanian", "Russian", "Slovak", "Slovenian", "Spanish",
      "Swedish", "Thai", "Turkish", "Ukrainian", "Vietnamese"
    ],
  };

  const deepLLanguageCodes = {
    "Arabic": "AR", "Bulgarian": "BG", "Chinese (Simplified)": "ZH",
    "Chinese (Traditional)": "ZH-TW", "Czech": "CS", "Danish": "DA",
    "Dutch": "NL", "English": "EN", "Estonian": "ET", "Finnish": "FI",
    "French": "FR", "German": "DE", "Greek": "EL", "Hungarian": "HU",
    "Indonesian": "ID", "Italian": "IT", "Japanese": "JA", "Korean": "KO",
    "Latvian": "LV", "Lithuanian": "LT", "Norwegian": "NO", "Polish": "PL",
    "Portuguese": "PT", "Romanian": "RO", "Russian": "RU", "Slovak": "SK",
    "Slovenian": "SL", "Spanish": "ES", "Swedish": "SV", "Thai": "TH",
    "Turkish": "TR", "Ukrainian": "UK", "Vietnamese": "VI",
  };
  const analyzePerformance = () => {
    const analysis = {};
    const averages = {};

    responses.forEach((response) => {
      const { model, type, rating } = response;

      // Initialize model analysis
      if (!analysis[model]) {
        analysis[model] = { totalRating: 0, count: 0, typeCounts: { translation: 0, question: 0 } };
      }

      // Update total rating and count
      analysis[model].totalRating += rating;
      analysis[model].count += 1;

      // Count types
      analysis[model].typeCounts[type] = (analysis[model].typeCounts[type] || 0) + 1;
    });

    // Calculate average scores and identify top-performing models
    for (const model in analysis) {
      const { totalRating, count, typeCounts } = analysis[model];
      averages[model] = totalRating / count; // Average rating
      const topType = typeCounts.translation > typeCounts.question ? "translation" : "question";
      analysis[model].topType = topType; // Identify top type
    }

    setPerformanceAnalysis(analysis);
    setAverageScores(averages);
  };

  useEffect(() => {
    if (responses.length > 0) {
      analyzePerformance();
    }
  }, [responses]);

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError("");
  };
  const saveToSupabase = async (response, index) => {
    try {
      const { data, error } = await supabase
        .from("responses")
        .insert([{
          model: response.model,
          type: response.type,
          response: response.response,
          rating: response.rating || 0,
          rank: response.rank || 0,
          message: response.message,
          to_language: response.to_language || null,
          created_at: new Date().toISOString(),
        }])
        .select("id");
  
      if (error) {
        console.error("Error saving response to Supabase:", error.message);
      } else if (data && data[0]?.id) {
        console.log(`Saved response ID for model ${response.model}:`, data[0].id);
        setResponses((prevResponses) => {
          const updatedResponses = [...prevResponses];
          updatedResponses[index].id = data[0].id; // Ensure every response gets its ID
          return updatedResponses;
        });
      } else {
        console.error(`No ID returned for model ${response.model}`);
      }
    } catch (err) {
      console.error("Error interacting with Supabase:", err.message);
    }
  };
  
  const translateOrAnswer = async (model, message, toLang) => {
    try {
      if (model === "deepl") {
        const targetLangCode = deepLLanguageCodes[toLang];
        if (!targetLangCode) {
          return { type: "error", response: `Unsupported language for DeepL: ${toLang}` };
        }

        const response = await fetch("https://api-free.deepl.com/v2/translate", {
          method: "POST",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
          body: new URLSearchParams({
            auth_key: import.meta.env.VITE_DEEPL_API_KEY,
            text: message,
            source_lang: "EN",
            target_lang: targetLangCode,
          }),
        });

        const data = await response.json();
        if (!response.ok || !data.translations) {
          return { type: "error", response: `DeepL API Error: ${data.message || "Unknown error"}` };
        }

        return { type: "translation", response: data.translations[0]?.text || "No response" };
      }

      const prompt =
        formData.inputType === "translation"
          ? `Translate the text: "${message}" into ${toLang}`
          : `Answer the question: "${message}"`;

      if (model.startsWith("gemini")) {
        const genAIModel = googleGenAI.getGenerativeModel({ model });
        const result = await genAIModel.generateContent(prompt);
        return { type: formData.inputType, response: result.response.text() };
      }

      if (model.startsWith("gpt")) {
        const response = await openai.createChatCompletion({
          model,
          messages: [{ role: "user", content: prompt }],
        });

        return {
          type: formData.inputType,
          response: response.data.choices[0].message.content.trim(),
        };
      }

      return { type: "error", response: "Unsupported model" };
    } catch (error) {
      console.error(`Error with ${model}:`, error.message);
      return { type: "error", response: `Error with ${model}: ${error.message}` };
    }
  };
  const handleRatingChange = async (index, value) => {
    const newRating = parseInt(value, 10);
  
    if (isNaN(newRating)) {
      console.error("Invalid rating value provided.");
      setError("Invalid rating value.");
      return;
    }
  
    // Update the rating for the specific response
    const updatedResponses = [...responses];
    updatedResponses[index].rating = newRating;
  
    // Sort responses by rating in descending order and assign ranks
    const rankedResponses = updatedResponses
      .slice() // Create a shallow copy for sorting
      .sort((a, b) => (b.rating || 0) - (a.rating || 0))
      .map((res, idx) => ({
        ...res,
        rank: idx + 1, // Assign rank based on sorted position
      }));
  
    setResponses(rankedResponses);
  
    // Update the rank and rating in the database
    const updatedResponse = rankedResponses.find((res) => res.model === updatedResponses[index].model);
    if (!updatedResponse || !updatedResponse.id) {
      console.error("Missing response ID for update.");
      return;
    }
  
    try {
      const { data, error } = await supabase
        .from("responses")
        .update({
          rating: updatedResponse.rating,
          rank: updatedResponse.rank,
        })
        .eq("id", updatedResponse.id);
  
      if (error) {
        console.error(`Failed to update rating and rank for ${updatedResponse.model}:`, error.message);
      } else {
        console.log(`Successfully updated rating and rank for ${updatedResponse.model}:`, data);
      }
    } catch (err) {
      console.error("Error updating response in database:", err.message);
    }
  };
  const handleTranslateOrAnswer = async () => {
    const { inputType, toLanguage, message } = formData;
  
    if (!message || (inputType === "translation" && !toLanguage)) {
      setError("Please fill in all fields.");
      return;
    }
  
    setError("");
    setIsLoading(true);
    setResponses([]);
  
    try {
      const results = await Promise.all(
        models.map((m) => translateOrAnswer(m, message, toLanguage))
      );
  
      // Calculate initial ranks
      const formattedResponses = models.map((m, i) => ({
        model: m,
        type: results[i]?.type,
        response: results[i]?.response,
        rating: 0,
        rank: i + 1, // Default rank based on initial order
        message,
        to_language: formData.inputType === "translation" ? toLanguage : null,
      }));
  
      setResponses(formattedResponses);
  
      // Save all responses to Supabase
      await Promise.all(
        formattedResponses.map((response, index) => saveToSupabase(response, index))
      );
    } catch (error) {
      console.error("Error processing request:", error.message);
      setError("An error occurred while processing your request.");
    } finally {
      setIsLoading(false);
    }
  };

  const calculateAverageRatings = (data) => {
    const modelRatings = {};
    data.forEach(item => {
      if (!modelRatings[item.model]) {
        modelRatings[item.model] = { totalRating: 0, count: 0 };
      }
      modelRatings[item.model].totalRating += item.rating;
      modelRatings[item.model].count += 1;
    });
  
    // Calculate average for each model
    const averageRatings = Object.keys(modelRatings).map(model => ({
      model,
      averageRating: (modelRatings[model].totalRating / modelRatings[model].count).toFixed(2)
    }));
  
    return averageRatings;
  };
  const identifyTopPerformingModels = (data) => {
    const modelRatings = calculateAverageRatings(data);
    return modelRatings.sort((a, b) => b.averageRating - a.averageRating);
  };

  const fetchResponsesFromSupabase = async () => {
    try {
      const { data, error } = await supabase
        .from('responses')
        .select('*');
  
      if (error) {
        throw error;
      }
  
      return data;
    } catch (error) {
      console.error('Error fetching data from Supabase:', error);
      return [];
    }
  };
  // Function to convert data to CSV format
const convertToCSV = (data) => {
  const header = ["Model", "Average Rating"];
  const rows = data.map(item => [item.model, item.averageRating]);

  const csvContent = [header, ...rows].map(e => e.join(",")).join("\n");
  return csvContent;
};

// Function to download the CSV file
const downloadCSV = async () => {
  try {
    const responses = await fetchResponsesFromSupabase(); // Assume this function fetches your data from Supabase
    const topPerformingModels = identifyTopPerformingModels(responses);
    const csvContent = convertToCSV(topPerformingModels);

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "top_performing_models.csv"; // Specify the filename
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url); // Clean up URL object
  } catch (error) {
    console.error("Error exporting CSV:", error);
  }
};
  return (
    <div className="container">
      <Link to="/" className="back-link">Back to Translation</Link>
  
      <h1>AI Translation & QA App</h1>
      <form onSubmit={(e) => e.preventDefault()}>
  <div className="input-type">
    <label className="label-radio">
      <input
        type="radio"
        name="inputType"
        value="translation"
        checked={formData.inputType === "translation"}
        onChange={handleInputChange}
      />
      Translation
    </label>
    <label className="label-radio">
      <input
        type="radio"
        name="inputType"
        value="question"
        checked={formData.inputType === "question"}
        onChange={handleInputChange}
      />
      Question
    </label>
  </div>





  
        <textarea
          name="message"
          placeholder={
            formData.inputType === "translation"
              ? "Enter text to translate..."
              : "Enter your question..."
          }
          value={formData.message}
          onChange={handleInputChange}
        ></textarea>
  
        {formData.inputType === "translation" && (
          <select
            name="toLanguage"
            value={formData.toLanguage}
            onChange={handleInputChange}
          >
            {supportedLanguages.deepl.map((lang) => (
              <option key={lang} value={lang}>
                {lang}
              </option>
            ))}
          </select>
        )}
  
        {error && <div className="error">{error}</div>}
        <button onClick={handleTranslateOrAnswer}>Submit</button>
      </form>

      <div className="container">
      
      <button onClick={downloadCSV} className="export-btn">
        Export Responses to CSV
      </button>
      
    </div>
      {isLoading ? (
        <BeatLoader size={12} color={"red"} />
      ) : (
        responses.length > 0 && (
          <div>
            <table className="response-table">
              <thead>
                <tr>
                  <th>Model</th>
                  <th>Type</th>
                  <th>Response</th>
                  <th>Rating (1-10)</th>
                  <th>Rank</th>
                </tr>
              </thead>
              <tbody>
                {responses.map((response, index) => (
                  <tr key={index}>
                    <td>{response.model}</td>
                    <td>{response.type}</td>
                    <td>{response.response}</td>
                    <td>
                      <input
                        type="number"
                        min="1"
                        max="10"
                        value={response.rating || ""}
                        onChange={(e) => handleRatingChange(index, e.target.value)}
                      />
                    </td>
                    <td>{response.rank || "N/A"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
  
            {/* Performance Analysis Section */}
            <div className="performance-analysis">
              <h2>Performance Analysis</h2>
              <table>
                <thead>
                  <tr>
                    <th>Model</th>
                    <th>Average Score</th>
                    <th>Top Type</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.keys(averageScores).map((model) => (
                    <tr key={model}>
                      <td>{model}</td>
                      <td>{averageScores[model].toFixed(2)}</td>
                      <td>{performanceAnalysis[model]?.topType}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )
      )}
    </div>
  )};

    
export default ResponseAnswer;