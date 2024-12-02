// import React, { useState } from "react";
// import "./App.css";
// import { Link } from "react-router-dom";
// import { Configuration, OpenAIApi } from "openai";
// import { GoogleGenerativeAI } from "@google/generative-ai";
// import { BeatLoader } from "react-spinners";

// const ResponseAnswer = () => {
//   const [formData, setFormData] = useState({
//     inputType: "translation", // Default input type
//     toLanguage: "Spanish",
//     message: "",
//   });
//   const [responses, setResponses] = useState([]);
//   const [isLoading, setIsLoading] = useState(false);
//   const [error, setError] = useState("");

//   const googleGenAI = new GoogleGenerativeAI(import.meta.env.VITE_GOOGLE_API_KEY);
//   const configuration = new Configuration({
//     apiKey: import.meta.env.VITE_OPENAI_KEY,
//   });
//   const openai = new OpenAIApi(configuration);

//   const models = [
//     "gpt-3.5-turbo",
//     "gpt-4",
//     "gpt-4-turbo",
//     "gemini-1.5-pro-001",
//     "gemini-1.5-flash-001",
//     "gemini-1.5-flash-002",
//     "gemini-1.5-pro-002",
//     "deepl",
//     "assembly",
//   ];

//   // Expanded list of supported languages
//   const supportedLanguages = {
//     "deepl": [
//       "Arabic", "Bulgarian", "Chinese (Simplified)", "Chinese (Traditional)", "Czech", "Danish", 
//       "Dutch", "English", "Estonian", "Finnish", "French", "German", "Greek", "Hungarian", 
//       "Indonesian", "Italian", "Japanese", "Korean", "Latvian", "Lithuanian", "Norwegian", 
//       "Polish", "Portuguese", "Romanian", "Russian", "Slovak", "Slovenian", "Spanish", 
//       "Swedish", "Thai", "Turkish", "Ukrainian", "Vietnamese"
//     ],
//     "default": [
//       "Arabic", "Bulgarian", "Chinese (Simplified)", "Chinese (Traditional)", "Czech", "Danish", 
//       "Dutch", "English", "Estonian", "Finnish", "French", "German", "Greek", "Hungarian", 
//       "Indonesian", "Italian", "Japanese", "Korean", "Latvian", "Lithuanian", "Norwegian", 
//       "Polish", "Portuguese", "Romanian", "Russian", "Slovak", "Slovenian", "Spanish", 
//       "Swedish", "Thai", "Turkish", "Ukrainian", "Vietnamese"
//     ],
//   };

//   const deepLLanguageCodes = {
//     "Arabic": "AR",
//     "Bulgarian": "BG",
//     "Chinese (Simplified)": "ZH",
//     "Chinese (Traditional)": "ZH-TW",
//     "Czech": "CS",
//     "Danish": "DA",
//     "Dutch": "NL",
//     "English": "EN",
//     "Estonian": "ET",
//     "Finnish": "FI",
//     "French": "FR",
//     "German": "DE",
//     "Greek": "EL",
//     "Hungarian": "HU",
//     "Indonesian": "ID",
//     "Italian": "IT",
//     "Japanese": "JA",
//     "Korean": "KO",
//     "Latvian": "LV",
//     "Lithuanian": "LT",
//     "Norwegian": "NO",
//     "Polish": "PL",
//     "Portuguese": "PT",
//     "Romanian": "RO",
//     "Russian": "RU",
//     "Slovak": "SK",
//     "Slovenian": "SL",
//     "Spanish": "ES",
//     "Swedish": "SV",
//     "Thai": "TH",
//     "Turkish": "TR",
//     "Ukrainian": "UK",
//     "Vietnamese": "VI",
//   };

//   const handleInputChange = (e) => {
//     setFormData({ ...formData, [e.target.name]: e.target.value });
//     setError("");
//   };

//   const translateOrAnswer = async (model, message, toLang) => {
//     try {
//       if (model === "deepl") {
//         if (formData.inputType === "question") {
//           return { type: "translation", response: "DeepL does not support question answering." };
//         }
//         const targetLangCode = deepLLanguageCodes[toLang];
//         const response = await fetch("https://api-free.deepl.com/v2/translate", {
//           method: "POST",
//           headers: { "Content-Type": "application/x-www-form-urlencoded" },
//           body: new URLSearchParams({
//             auth_key: import.meta.env.VITE_DEEPL_API_KEY,
//             text: message,
//             source_lang: "EN",
//             target_lang: targetLangCode,
//           }),
//         });
//         const data = await response.json();
//         return { type: "translation", response: data.translations[0]?.text || "No response" };
//       } else if (model.startsWith("gpt")){
//         const prompt =
//           formData.inputType === "translation"
//             ? `Translate the text: "${message}" into ${toLang}`
//             : `Answer the question: "${message}"`;
//         const api = model.startsWith("gpt") ? openai : googleGenAI;
//         const response = await api.createChatCompletion({
//           model,
//           messages: [{ role: "user", content: prompt }],
//         });
//         return {
//           type: formData.inputType === "translation" ? "translation" : "answer",
//           response: response.data.choices[0].message.content.trim(),
//         };
//       }else if (model.startsWith("gemini")) {
//         const prompt = `Translate the text: "${message}" from English to ${toLang}.`;
//         const genAIModel = googleGenAI.getGenerativeModel({ model });
//         const result = await genAIModel.generateContent(prompt);
//         return { type: "translation", response: result.response.text() };
//       }
//       else if (model === "assembly") {
//         const prompt = formData.inputType === "translation"
//             ? `Translate the text: "${message}" into ${toLang}`
//             : `Answer the question: "${message}"`;

//         const response = await fetch("https://cors-anywhere.herokuapp.com/https://api.assemblyai.com/v2/translate", {
//             method: "POST",
//             headers: {
//                 "Content-Type": "application/json",
//                 "Authorization": `Bearer ${import.meta.env.VITE_ASSEMBLY_API_KEY}` // Use your Assembly API key
//             },
//             body: JSON.stringify({
//                 prompt: prompt,
//                 // Add any additional parameters required by the Assembly API
//             })
//         });

//         const data = await response.json();
//         if (!response.ok) {
//           console.error("Error from Assembly API:", data);
//           return `Error fetching response from Assembly: ${data.error || "Unknown error"}`;
//       }
//         return data.response; 
//     } 
//     } catch (error) {
//       console.error(`Error with ${model}:`, error);
//       return { type: "error", response: `Error fetching response from ${model}` };
//     }
//   };

//   const handleTranslateOrAnswer = async () => {
//     const { inputType, toLanguage, message } = formData;

//     if (!message || (inputType === "translation" && !toLanguage)) {
//       setError("Please fill in all fields.");
//       return;
//     }

//     setError("");
//     setIsLoading(true);
//     setResponses([]);

//     try {
//       const results = await Promise.all(
//         models.map((m) => translateOrAnswer(m, message, toLanguage))
//       );

//       const formattedResponses = models.map((m, i) => ({
//         model: m,
//         type: results[i]?.type,
//         response: results[i]?.response,
//         rating: null, // Initialize rating
//         rank: null, // Initialize rank
//       }));

//       setResponses(formattedResponses);
//     } catch (error) {
//       console.error("Error processing request:", error);
//       setError("An error occurred while processing your request.");
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   const handleRatingChange = (index, value) => {
//     const updatedResponses = [...responses];
//     updatedResponses[index].rating = parseInt(value, 10) || null;

//     // Recalculate ranks based on ratings
//     const rankedResponses = [...updatedResponses].sort((a, b) => (b.rating || 0) - (a.rating || 0));
//     rankedResponses.forEach((res, idx) => (res.rank = idx + 1));

//     setResponses(rankedResponses);
//   };

//   return (
//     <div className="container">
//         <Link to="/" className="back-link">Back to Translation</Link>

//     <div className="container">
//       <h1>AI Translation & QA App</h1>

//       <form onSubmit={(e) => e.preventDefault()}>
//         <div className="input-type">
//           <label>
//             <input
//               type="radio"
//               name="inputType"
//               value="translation"
//               checked={formData.inputType === "translation"}
//               onChange={handleInputChange}
//             />
//             Translation
//           </label>
//           <label>
//             <input
//               type="radio"
//               name="inputType"
//               value="question"
//               checked={formData.inputType === "question"}
//               onChange={handleInputChange}
//             />
//             Question
//           </label>
//         </div>
    
    

//         <textarea
//           name="message"
//           placeholder={
//             formData.inputType === "translation"
//               ? "Enter text to translate..."
//               : "Enter your question..."
//           }
//           value={formData.message}
//           onChange={handleInputChange}
//         ></textarea>

//         {formData.inputType === "translation" && (
//           <select
//             name="toLanguage"
//             value={formData.toLanguage}
//             onChange={handleInputChange}
//           >
//             {supportedLanguages.deepl.map((lang) => (
//               <option key={lang} value={lang}>
//                 {lang}
//               </option>
//             ))}
//           </select>
//         )}

//         {error && <div className="error">{error}</div>}
//         <button onClick={handleTranslateOrAnswer}>Submit</button>
//       </form>

//       {isLoading ? (
//         <BeatLoader size={12} color={"red"} />
//       ) : (
//         responses.length > 0 && (
//           <table className="response-table">
//             <thead>
//               <tr>
//                 <th>Model</th>
//                 <th>Type</th>
//                 <th>Response</th>
//                 <th>Rating (1-10)</th>
//                 <th>Rank</th>
//               </tr>
//             </thead>
//             <tbody>
//               {responses.map((response, index) => (
//                 <tr key={response.model}>
//                   <td>{response.model}</td>
//                   <td>{response.type}</td>
//                   <td>{response.response}</td>
//                   <td>
//                     <input
//                       type="number"
//                       min="1"
//                       max="10"
//                       value={response.rating || ""}
//                       onChange={(e) => handleRatingChange(index, e.target.value)}
//                     />
//                   </td>
//                   <td>{response.rank || "N/A"}</td>
//                 </tr>
//               ))}
//             </tbody>
//           </table>
//         )
//       )}
//     </div>
//     </div>
//   );
// };

// export default ResponseAnswer;



import React, { useState, useEffect } from "react";
import "./App.css";
import { Link } from "react-router-dom";
import { Configuration, OpenAIApi } from "openai";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { createClient } from "@supabase/supabase-js";
import { BeatLoader } from "react-spinners";

// const supabaseUrl = import.meta.env.VITE_SUPABASE_URL; 
// const supabaseKey = import.meta.env.VITE_SUPABASE_KEY; 
// const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
// const supabaseKey = process.env.REACT_APP_SUPABASE_KEY;
// const supabase = createClient(supabaseUrl, supabaseKey)

const ResponseAnswer = () => {
  const [loading, setLoading] = useState(true); // State for loading status
  const [feedbacks, setFeedbacks] = useState([]);
  const [formData, setFormData] = useState({
    inputType: "translation", // Default input type
    toLanguage: "Spanish",
    message: "",
  });
  const [responses, setResponses] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [recognition, setRecognition] = useState(null);

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
    "assembly",
  ];

  // Expanded list of supported languages
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
    "Arabic": "AR",
    "Bulgarian": "BG",
    "Chinese (Simplified)": "ZH",
    "Chinese (Traditional)": "ZH-TW",
    "Czech": "CS",
    "Danish": "DA",
    "Dutch": "NL",
    "English": "EN",
    "Estonian": "ET",
    "Finnish": "FI",
    "French": "FR",
    "German": "DE",
    "Greek": "EL",
    "Hungarian": "HU",
    "Indonesian": "ID",
    "Italian": "IT",
    "Japanese": "JA",
    "Korean": "KO",
    "Latvian": "LV",
    "Lithuanian": "LT",
    "Norwegian": "NO",
    "Polish": "PL",
    "Portuguese": "PT",
    "Romanian": "RO",
    "Russian": "RU",
    "Slovak": "SK",
    "Slovenian": "SL",
    "Spanish": "ES",
    "Swedish": "SV",
    "Thai": "TH",
    "Turkish": "TR",
    "Ukrainian": "UK",
    "Vietnamese": "VI",
  };
  useEffect(() => {
    const fetchFeedbacks = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('feedback')
        .select('*')
        .order('created_at', { ascending: false }); // Order by created_at if desired

      if (error) {
        setError(error.message);
      } else {
        setFeedbacks(data);
      }
      setLoading(false);
    };

    fetchFeedbacks();
  }, []);

  
  useEffect(() => {
    // Set up speech recognition
    if (window.SpeechRecognition || window.webkitSpeechRecognition) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognitionInstance = new SpeechRecognition();
      recognitionInstance.interimResults = false;
      recognitionInstance.lang = 'en-US'; // Set the language as needed

      recognitionInstance.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setFormData({ ...formData, message: transcript });
      };

      recognitionInstance.onerror = (event) => {
        console.error("Speech recognition error:", event.error);
        setError("Error recognizing speech. Please try again.");
      };

      setRecognition(recognitionInstance);
    } else {
      console.error("Speech recognition not supported in this browser.");
      setError("Speech recognition is not supported in this browser.");
    }
  }, []);

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError("");
  };
  const translateOrAnswer = async (model, message, toLang) => {
    try {
      if (model === "deepl") {
        // DeepL does not support question answering
        return { type: "translation", response: "DeepL does not support question answering." };
      }
  
      const prompt =
        formData.inputType === "translation"
          ? `Translate the text: "${message}" into ${toLang}`
          : `Answer the question: "${message}" in ${toLang}`;
  
      const api = model.startsWith("gpt") ? openai : googleGenAI;
  
      // If the model is a Gemini model, adjust the prompt accordingly
      if (model.startsWith("gemini")) {
        const genAIModel = googleGenAI.getGenerativeModel({ model });
        const result = await genAIModel.generateContent(prompt);
        return { type: formData.inputType === "translation" ? "translation" : "answer", response: result.response.text() };
      }
  
      const response = await api.createChatCompletion({
        model,
        messages: [{ role: "user", content: prompt }],
      });
  
      return {
        type: formData.inputType === "translation" ? "translation" : "answer",
        response: response.data.choices[0].message.content.trim(),
      };
    } catch (error) {
      console.error(`Error with ${model}:`, error);
      return { type: "error", response: `Error fetching response from ${model}` };
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

      const formattedResponses = models.map((m, i) => ({
        model: m,
        type: results[i]?.type,
        response: results[i]?.response,
        rating: null,
        rank: null,
      }));

      setResponses(formattedResponses);
    } catch (error) {
      console.error("Error processing request:", error);
      setError("An error occurred while processing your request.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRatingChange = (index, value) => {
    const updatedResponses = [...responses];
    updatedResponses[index].rating = parseInt(value, 10) || null;

    // Recalculate ranks based on ratings
    const rankedResponses = [...updatedResponses].sort((a, b) => (b.rating || 0) - (a.rating || 0));
    rankedResponses.forEach((res, idx) => (res.rank = idx + 1));

    setResponses(rankedResponses);
  };

  const startListening = () => {
    if (recognition) {
      recognition.start();
    }
  };

  const stopListening = () => {
    if (recognition) {
      recognition.stop();
    }
  };
  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }


  return (
    <div className="container">
      <Link to="/" className="back-link">Back to Translation</Link>

      <h1>AI Translation & QA App</h1>

      <form onSubmit={(e) => e.preventDefault()}>
        <div className="input-type">
          <label>
            <input
              type="radio"
              name="inputType"
              value="translation"
              checked={formData.inputType === "translation"}
              onChange={handleInputChange}
            />
            Translation
          </label>
          <label>
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
        {/* {formData.inputType === "translation" && ( */}
        { (
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

      <div>
        <h2>Speech Recognition</h2>
        <button onClick={startListening}>Start Listening</button>
        <button onClick={stopListening}>Stop Listening</button>
      </div>

      {isLoading ? (
        <BeatLoader size={12} color={"red"} />
      ) : (
        responses.length > 0 && (
          <table className="response-table">
            <thead>
              <tr>
                <th>Model</th>
                <th>Type</th>
                <th>Response</th>
                <th>Rating (1-10)</th>
                <th>Rank</th>
                <th>Created At</th>
              </tr>
            </thead>
            <tbody>
              {responses.map((response, index) => (
                <tr key={response.model}>
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
        )
      )}
    </div>
  );
};

export default ResponseAnswer;