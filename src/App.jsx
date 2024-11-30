// import React, { useState, useEffect } from "react";
// import "./App.css";
// import { Configuration, OpenAIApi } from "openai";
// import { GoogleGenerativeAI } from "@google/generative-ai";
// import { BeatLoader } from "react-spinners";
// import { createClient } from "@supabase/supabase-js";

// const supabaseUrl = import.meta.env.VITE_SUPABASE_URL; 
// const supabaseKey = import.meta.env.VITE_SUPABASE_KEY; 
// const supabase = createClient(supabaseUrl, supabaseKey);

// const App = () => {
//   const [formData, setFormData] = useState({
//     toLanguage: "Spanish",
//     message: "",
//     model: "gemini-1.5-flash-002",
//   });
//   const [error, setError] = useState("");
//   const [showNotification, setShowNotification] = useState(false);
//   const [translation, setTranslation] = useState("");
//   const [isLoading, setIsLoading] = useState(false);
//   const [previousTranslations, setPreviousTranslations] = useState([]);

//   const googleGenAI = new GoogleGenerativeAI(import.meta.env.VITE_GOOGLE_API_KEY);
//   const configuration = new Configuration({
//     apiKey: import.meta.env.VITE_OPENAI_KEY,
//   });
//   const openai = new OpenAIApi(configuration);

//   const supportedLanguages = {
//     "gpt-3.5-turbo": ["Spanish", "French", "German", "Italian", "Portuguese", "Dutch", "Russian", "Chinese (Simplified)", "Japanese", "Swedish", "Arabic", "Turkish", "Korean", "Hindi", "Greek", "Hebrew", "Thai", "Vietnamese", "Indonesian", "Malay"],
//     "gpt-4": ["Spanish", "French", "Telugu", "German", "Italian", "Portuguese", "Dutch", "Russian", "Chinese (Simplified)", "Japanese", "Korean", "Swedish", "Arabic", "Turkish", "Hindi", "Greek", "Hebrew", "Thai", "Vietnamese", "Indonesian", "Malay"],
//     "gpt-4-turbo": ["Spanish", "French", "Telugu", "Japanese", "German", "Italian", "Portuguese", "Dutch", "Russian", "Chinese (Simplified)", "Korean", "Arabic", "Swedish", "Turkish", "Hindi", "Greek", "Hebrew", "Thai", "Vietnamese", "Indonesian", "Malay"],
//     "gemini-1.5-pro-001": ["Spanish", "French", "German", "Italian", "Portuguese", "Dutch", "Russian", "Chinese (Simplified)", "Swedish", "Turkish", "Arabic", "Greek", "Hebrew", "Thai", "Vietnamese", "Indonesian", "Malay"],
//     "gemini-1.5-flash-001": ["Spanish", "French", "German", "Italian", "Portuguese", "Dutch", "Russian", "Chinese (Simplified)", "Swedish", "Turkish", "Arabic", "Greek", "Hebrew", "Thai", "Vietnamese", "Indonesian", "Malay"],
//     "gemini-1.5-pro-002": ["Spanish", "French", "German", "Italian", "Portuguese", "Dutch", "Russian", "Chinese (Simplified)", "Japanese", "Korean", "Swedish", "Arabic", "Turkish", "Greek", "Hebrew", "Thai", "Vietnamese", "Indonesian", "Malay"],
//     "gemini-1.5-flash-002": ["Spanish", "French", "German", "Italian", "Portuguese", "Dutch", "Russian", "Chinese (Simplified)", "Japanese", "Korean", "Arabic", "Swedish", "Turkish", "Greek", "Hebrew", "Thai", "Vietnamese", "Indonesian", "Malay"],
//     "deepl": ["Spanish", "French", "Japanese", "German", "Italian", "Dutch", "Russian", "Chinese (Simplified)", "Polish", "Portuguese", "Swedish", "Turkish", "Arabic", "Korean", "Hindi", "Greek", "Hebrew", "Thai", "Vietnamese", "Indonesian", "Malay"],
//   };

//   const deepLLanguageCodes = {
//     "Spanish": "ES",
//     "French": "FR",
//     "German": "DE",
//     "Italian": "IT",
//     "Dutch": "NL",
//     "Russian": "RU",
//     "Chinese (Simplified)": "ZH",
//     "Japanese": "JA",
//     "Portuguese": "PT",
//     "Polish": "PL",
//     "Swedish": "SV",
//     "Arabic": "AR",
//     "Turkish": "TR",
//     "Korean": "KO",
//     "Hindi": "HI",
//     "Greek": "EL",
//     "Hebrew": "HE",
//     "Thai": "TH",
//     "Vietnamese": "VI",
//     "Indonesian": "ID",
//     "Malay": "MS",
//   };

//   const handleInputChange = (e) => {
//     setFormData({ ...formData, [e.target.name]: e.target.value });
//     setError("");
//   };

//   const translateWithDeepL = async (text, toLang) => {
//     try {
//       const targetLangCode = deepLLanguageCodes[toLang];
//       if (!targetLangCode) {
//         throw new Error(`Unsupported language: ${toLang}`);
//       }

//       const response = await fetch(`https://api-free.deepl.com/v2/translate`, {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/x-www-form-urlencoded",
//         },
//         body: new URLSearchParams({
//           auth_key: import.meta.env.VITE_DEEPL_API_KEY,
//           text: text,
//           source_lang: "EN",
//           target_lang: targetLangCode,
//         }),
//       });

//       if (!response.ok) {
//         throw new Error(`DeepL API request failed with status ${response.status}`);
//       }

//       const data = await response.json();
//       return data.translations[0].text;
//     } catch (error) {
//       console.error("DeepL Translation Error:", error);
//       throw new Error("Failed to translate with DeepL. Please check the API key, language codes, or try again later.");
//     }
//   };

//   const handleTranslationSave = async (original, translated, language, model) => {
//     const { data, error } = await supabase
//       .from("translations")
//       .insert([{ original_message: original, translated_message: translated, language, model }]);

//     if (error) {
//       console.error("Error saving translation:", error);
//     } else {
//       console.log("Translation saved:", data);
//     }
//   };

//   const fetchPreviousTranslations = async () => {
//     const { data, error } = await supabase
//       .from("translations")
//       .select("*")
//       .order("created_at", { ascending: false })
//       .limit(5);

//     if (error) {
//       console.error("Error fetching translations:", error);
//     } else {
//       setPreviousTranslations(data);
//     }
//   };

//   useEffect(() => {
//     fetchPreviousTranslations();
//   }, []);

//   const translate = async () => {
//     const { toLanguage, message, model } = formData;
//     try {
//       setIsLoading(true);
//       let translatedText = "";

//       if (model.startsWith("gpt")) {
//         const response = await openai.createChatCompletion({
//           model: model,
//           messages: [
//             { role: "system", content: `Translate this sentence into ${toLanguage}.` },
//             { role: "user", content: message },
//           ],
//           temperature: 0.3,
//           max_tokens: 100,
//         });
//         translatedText = response.data.choices[0].message.content.trim();
//       } else if (model.startsWith("gemini")) {
//         const genAIModel = googleGenAI.getGenerativeModel({ model });
//         const prompt = `Translate the text: "${message}" from English to ${toLanguage}`;
//         const result = await genAIModel.generateContent(prompt);
//         translatedText = await result.response.text();
//       } else if (model === "deepl") {
//         translatedText = await translateWithDeepL(message, toLanguage);
//       }

//       await handleTranslationSave(message, translatedText, toLanguage, model);
//       setTranslation(translatedText);

//       setPreviousTranslations((prev) => {
//         const newTranslation = {
//           id: Date.now(), // Temporary ID
//           from: "English",
//           to: toLanguage,
//           model: model,
//           originalText: message,
//           translatedText: translatedText,
//           created_at: new Date().toISOString(), // Add created_at for sorting
//         };
//         const newTranslations = [newTranslation, ...prev];
//         return newTranslations.slice(0, 5);
//       });
//     } catch (error) {
//       console.error("Translation error:", error);
//       setError("Translation failed. Please try again.");
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   const handleOnSubmit = (e) => {
//     e.preventDefault();
//     if (!formData.message) {
//       setError("Please enter the message.");
//       return;
//     }
//     translate();
//   };

//   const handleCopy = () => {
//     navigator.clipboard.writeText(translation);
//     setShowNotification(true);
//     setTimeout(() => {
//       setShowNotification(false);
//     }, 2000);
//   };

//   return (
//     <div className="container">
//       <div className="sidebar">
//         <h2>Models</h2>
//         <div className="choices">
//           {["gpt-3.5-turbo", "gpt-4", "gpt-4-turbo", "gemini-1.5-pro-001", "gemini-1.5-flash-001", "gemini-1.5-pro-002", "gemini-1.5-flash-002", "deepl"].map((model) => (
//             <button
//               key={model}
//               className={`model-option ${formData.model === model ? 'active' : ''}`}
//               onClick={() => handleInputChange({ target: { name: "model", value: model } })}
//             >
//               {model}
//             </button>
//           ))}
//         </div>
//       </div>

//       <div className="main">
//         <h1>Translation App</h1>
//         <div>
//           <h3>Selected Model: {formData.model}</h3>
//         </div>
//         <form onSubmit={handleOnSubmit}>
//           <div className="choiceslang">
//             <label htmlFor="toLanguage">To:</label>
//             <select
//               id="toLanguage"
//               name="toLanguage"
//               value={formData.toLanguage}
//               onChange={handleInputChange}
//             >
//               {supportedLanguages[formData.model]?.map((lang) => (
//                 <option key={lang} value={lang}>
//                   {lang}
//                 </option>
//               ))}
//             </select>
//           </div>

//           <textarea
//             name="message"
//             placeholder="Type your message here..."
//             value={formData.message}
//             onChange={handleInputChange}
//           ></textarea>

//           {error && <div className="error">{error}</div>}

//           <button type="submit">Translate</button>
//         </form>

//         <div className="translation">
//           <div className="copy-btn" onClick={handleCopy} title="Copy to clipboard">
//             {/* Copy icon */}
//           </div>
//           {isLoading ? <BeatLoader size={12} color={"red"} /> : translation}
//         </div>

//         <div className={`notification ${showNotification ? "active" : ""}`}>
//           Copied to clipboard!
//         </div>

//         <div className="previous-translations">
//           <h3>Previous Translations:</h3>
//           <ul>
//             {previousTranslations.length > 0 ? (
//               previousTranslations.map((item) => (
//                 <li key={item.id}>
//                   <strong>Original:</strong> {item.original_message} <br />
//                   <strong>Translated:</strong> {item.translated_message} <br />
//                   <strong>Language:</strong> {item.language} <br />
//                   <strong>Model:</strong> {item.model} <br />
//                   <strong>Date:</strong> {new Date(item.created_at).toLocaleString()} 
//                 </li>
//               ))
//             ) : (
//               <li>No previous translations found.</li>
//             )}
//           </ul>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default App;


// import React, { useState, useEffect } from "react";
// import "./App.css";
// import { Configuration, OpenAIApi } from "openai";
// import { GoogleGenerativeAI } from "@google/generative-ai";
// import { BeatLoader } from "react-spinners";
// import { createClient } from "@supabase/supabase-js";
// import CompareTranslate from "./CompareTranslation";

// const supabaseUrl = import.meta.env.VITE_SUPABASE_URL; 
// const supabaseKey = import.meta.env.VITE_SUPABASE_KEY; 
// const supabase = createClient(supabaseUrl, supabaseKey);

// const App = () => {
//   const [formData, setFormData] = useState({
//     toLanguage: "Spanish",
//     message: "",
//     model: "gemini-1.5-flash-002",
//     temperatureValue: 0.3,
//     tone: "Mild", // Default tone
//   });
//   const [error, setError] = useState("");
//   const [showNotification, setShowNotification] = useState(false);
//   const [translation, setTranslation] = useState("");
//   const [isLoading, setIsLoading] = useState(false);
//   const [previousTranslations, setPreviousTranslations] = useState([]);

//   const googleGenAI = new GoogleGenerativeAI(import.meta.env.VITE_GOOGLE_API_KEY);
//   const configuration = new Configuration({
//     apiKey: import.meta.env.VITE_OPENAI_KEY,
//   });
//   const openai = new OpenAIApi(configuration);

//   const supportedLanguages = {
//     "gpt-3.5-turbo": ["Spanish", "French", "German", "Italian", "Portuguese", "Dutch", "Russian", "Chinese (Simplified)", "Japanese", "Swedish", "Arabic", "Turkish", "Korean", "Hindi", "Greek", "Hebrew", "Thai", "Vietnamese", "Indonesian", "Malay"],
//     "gpt-4": ["Spanish", "French", "Telugu", "German", "Italian", "Portuguese", "Dutch", "Russian", "Chinese (Simplified)", "Japanese", "Korean", "Swedish", "Arabic", "Turkish", "Hindi", "Greek", "Hebrew", "Thai", "Vietnamese", "Indonesian", "Malay"],
//     "gpt-4-turbo": ["Spanish", "French", "Telugu", "Japanese", "German", "Italian", "Portuguese", "Dutch", "Russian", "Chinese (Simplified)", "Korean", "Arabic", "Swedish", "Turkish", "Hindi", "Greek", "Hebrew", "Thai", "Vietnamese", "Indonesian", "Malay"],
//     "gemini-1.5-pro-001": ["Spanish", "French", "German", "Italian", "Portuguese", "Dutch", "Russian", "Chinese (Simplified)", "Swedish", "Turkish", "Arabic", "Greek", "Hebrew", "Thai", "Vietnamese", "Indonesian", "Malay"],
//     "gemini-1.5-flash-001": ["Spanish", "French", "German", "Italian", "Portuguese", "Dutch", "Russian", "Chinese (Simplified)", "Swedish", "Turkish", "Arabic", "Greek", "Hebrew", "Thai", "Vietnamese", "Indonesian", "Malay"],
//     "gemini-1.5-pro-002": ["Spanish", "French", "German", "Italian", "Portuguese", "Dutch", "Russian", "Chinese (Simplified)", "Japanese", "Korean", "Swedish", "Arabic", "Turkish", "Greek", "Hebrew", "Thai", "Vietnamese", "Indonesian", "Malay"],
//     "gemini-1.5-flash-002": ["Spanish", "French", "German", "Italian", "Portuguese", "Dutch", "Russian", "Chinese (Simplified)", "Japanese", "Korean", "Arabic", "Swedish", "Turkish", "Greek", "Hebrew", "Thai", "Vietnamese", "Indonesian", "Malay"],
//     "deepl": ["Spanish", "French", "Japanese", "German", "Italian", "Dutch", "Russian", "Chinese (Simplified)", "Polish", "Portuguese", "Swedish", "Turkish", "Arabic", "Korean", "Hindi", "Greek", "Hebrew", "Thai", "Vietnamese", "Indonesian", "Malay"],
//   };

//   const deepLLanguageCodes = {
//     "Spanish": "ES",
//     "French": "FR",
//     "German": "DE",
//     "Italian": "IT",
//     "Dutch": "NL",
//     "Russian": "RU",
//     "Chinese (Simplified)": "ZH",
//     "Japanese": "JA",
//     "Portuguese": "PT",
//     "Polish": "PL",
//     "Swedish": "SV",
//     "Arabic": "AR",
//     "Turkish": "TR",
//     "Korean": "KO",
//     "Hindi": "HI",
//     "Greek": "EL",
//     "Hebrew": "HE",
//     "Thai": "TH",
//     "Vietnamese": "VI",
//     "Indonesian": "ID",
//     "Malay": "MS",
//   };

//   const handleInputChange = (e) => {
//     setFormData({ ...formData, [e.target.name]: e.target.value });
//     setError("");
//   };

//   const translateWithDeepL = async (text, toLang) => {
//     try {
//       const targetLangCode = deepLLanguageCodes[toLang];
//       if (!targetLangCode) {
//         throw new Error(`Unsupported language: ${toLang}`);
//       }

//       const response = await fetch(`https://api-free.deepl.com/v2/translate`, {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/x-www-form-urlencoded",
//         },
//         body: new URLSearchParams({
//           auth_key: import.meta.env.VITE_DEEPL_API_KEY,
//           text: text,
//           source_lang: "EN",
//           target_lang: targetLangCode,
//         }),
//       });

//       if (!response.ok) {
//         throw new Error(`DeepL API request failed with status ${response.status}`);
//       }

//       const data = await response.json();
//       return data.translations[0].text;
//     } catch (error) {
//       console.error("DeepL Translation Error:", error);
//       throw new Error("Failed to translate with DeepL. Please check the API key, language codes, or try again later.");
//     }
//   };

//   const handleTranslationSave = async (original, translated, language, model, averageScore) => {
//     const { data, error } = await supabase
//       .from("translations")
//       .insert([{ original_message: original, translated_message: translated, language, model, average_score: averageScore }]);

//     if (error) {
//       console.error("Error saving translation:", error);
//     } else {
//       console.log("Translation saved:", data);
//     }
//   };

//   const fetchPreviousTranslations = async () => {
//     const { data, error } = await supabase
//       .from("translations")
//       .select("*")
//       .order("created_at", { ascending: false })
//       .limit(5);

//     if (error) {
//       console.error("Error fetching translations:", error);
//     } else {
//       setPreviousTranslations(data);
//     }
//   };

//   useEffect(() => {
//     fetchPreviousTranslations();
//   }, []);

//   const translate = async () => {
//     const { toLanguage, message, model, tone } = formData;
//     try {
//       setIsLoading(true);
//       let translatedText = "";

//       if (model.startsWith("gpt")) {
//         const response = await openai.createChatCompletion({
//           model: model,
//           messages: [
//             { role: "system", content: `Translate this sentence into ${toLanguage} with a ${tone.toLowerCase()} tone.` },
//             { role: "user", content: message },
//           ],
//           temperature: formData.temperatureValue,
//           max_tokens: 100,
//         });
//         translatedText = response.data.choices[0].message.content.trim();
//       } else if (model.startsWith("gemini")) {
//         const genAIModel = googleGenAI.getGenerativeModel({ model });
//         const prompt = `Translate the text: "${message}" from English to ${toLanguage} with a ${tone.toLowerCase()} tone.`;
//         const result = await genAIModel.generateContent(prompt);
//         translatedText = await result.response.text();
//       } else if (model === "deepl") {
//         translatedText = await translateWithDeepL(message, toLanguage);
//       }

//       const averageScore = Math.floor(Math.random() * 10) + 1; // Generate random score between 1 and 10
//       await handleTranslationSave(message, translatedText, toLanguage, model, averageScore);
//       setTranslation(translatedText);

//       setPreviousTranslations((prev) => {
//         const newTranslation = {
//           id: Date.now(), // Temporary ID
//           from: "English",
//           to: toLanguage,
//           model: model,
//           originalText: message,
//           translatedText: translatedText,
//           averageScore: averageScore, // Add average score
//           created_at: new Date().toISOString(), // Add created_at for sorting
//         };
//         const newTranslations = [newTranslation, ...prev].slice(0, 5); // Limit to last 5 translations
//         return newTranslations;
//       });
//     } catch (error) {
//       console.error("Translation Error:", error);
//       setError("Translation failed. Please try again.");
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   const handleOnSubmit = (e) => {
//     e.preventDefault();
//     if (!formData.message) {
//       setError("Please enter the message.");
//       return;
//     }
//     translate();
//   };

//   const handleCopy = () => {
//     navigator.clipboard.writeText(translation);
//     setShowNotification(true);
//     setTimeout(() => {
//       setShowNotification(false);
//     }, 2000);
//   };

//   return (
//     <div className="container">
//       <div className="sidebar">
//         <h2>Models</h2>
//         <div className="choices">
//           {["gpt-3.5-turbo", "gpt-4", "gpt-4-turbo", "gemini-1.5-pro-001", "gemini-1.5-flash-001", "gemini-1.5-pro-002", "gemini-1.5-flash-002", "deepl"].map((model) => (
//             <button
//               key={model}
//               className={`model-option ${formData.model === model ? 'active' : ''}`}
//               onClick={() => handleInputChange({ target: { name: "model", value: model } })}
//             >
//               {model}
//             </button>
//           ))}
//         </div>
//         <div>
//             <Link to="/compare-translate" className="compare-btn">
//               Compare Translations
//             </Link>
//           </div>
//       </div>
      

//       <div className="main">
//         <h1>Translation App</h1>
//         <div>
//           <h3>Selected Model: {formData.model}</h3>
//         </div>
//         <form onSubmit={handleOnSubmit}>
//           <div className="choiceslang">
//             <label htmlFor="toLanguage">To:</label>
//             <select
//               id="toLanguage"
//               name="toLanguage"
//               value={formData.toLanguage}
//               onChange={handleInputChange}
//             >
//               {supportedLanguages[formData.model]?.map((lang) => (
//                 <option key={lang} value={lang}>
//                   {lang}
//                 </option>
//               ))}
//             </select>
//           </div>

//           <div className="tone-selection">
//             <label htmlFor="tone">Tone:</label>
//             <select
//               id="tone"
//               name="tone"
//               value={formData.tone}
//               onChange={handleInputChange}
//             >
//               <option value="Mild">Mild</option>
//               <option value="Serious">Serious</option>
//             </select>
//           </div>

//           <textarea
//             name="message"
//             placeholder="Type your message here..."
//             value={formData.message}
//             onChange={handleInputChange}
//           ></textarea>

//           {error && <div className="error">{error}</div>}

//           <button type="submit">Translate</button>
//         </form>

//         <div className="translation">
//           <div className="copy-btn" onClick={handleCopy} title="Copy to clipboard">
//             📋
//           </div>
//           {isLoading ? <BeatLoader size={12} color={"red"} /> : translation}
//         </div>

//         <div className={`notification ${showNotification ? "active" : ""}`}>
//           Copied to clipboard!
//         </div>

//         <div className="previous-translations">
//           <h3>Previous Translations:</h3>
//           {previousTranslations.length > 0 ? (
//             <table>
//               <thead>
//                 <tr>
//                   <th>Original</th>
//                   <th>Translated</th>
//                   <th>Language</th>
//                   <th>Model</th>
//                   {/* <th>Average Score</th> */}
//                   <th>Date</th>
//                 </tr>
//               </thead>
//               <tbody>
//                 {previousTranslations.map((item) => (
//                   <tr key={item.id}>
//                     <td>{item.original_message}</td>
//                     <td>{item.translated_message}</td>
//                     <td>{item.language}</td>
//                     <td>{item.model}</td>
//                     {/* <td>{item.average_score} out of 10</td> Added "out of 10" */}
//                     <td>{new Date(item.created_at).toLocaleString()}</td>
//                   </tr>
//                 ))}
//               </tbody>
//             </table>
//           ) : (
//             <p>No previous translations found.</p>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// };

// export default App;

// import React, { useState, useEffect } from "react";
// import "./App.css";
// import { Configuration, OpenAIApi } from "openai";
// import { GoogleGenerativeAI } from "@google/generative-ai";
// import { BeatLoader } from "react-spinners";
// import { createClient } from "@supabase/supabase-js";
// import { Link } from 'react-router-dom';
// import CompareTranslate from './CompareTranslation';

// const supabaseUrl = import.meta.env.VITE_SUPABASE_URL; 
// const supabaseKey = import.meta.env.VITE_SUPABASE_KEY; 
// const supabase = createClient(supabaseUrl, supabaseKey);

// const App = () => {
//   const [formData, setFormData] = useState({
//     toLanguage: "Spanish",
//     message: "",
//     model: "gemini-1.5-flash-002",
//     temperatureValue: 0.3,
//   });
//   const [error, setError] = useState("");
//   const [showNotification, setShowNotification] = useState(false);
//   const [translation, setTranslation] = useState("");
//   const [isLoading, setIsLoading] = useState(false);
//   const [previousTranslations, setPreviousTranslations] = useState([]);

//   const googleGenAI = new GoogleGenerativeAI(import.meta.env.VITE_GOOGLE_API_KEY);
//   const configuration = new Configuration({
//     apiKey: import.meta.env.VITE_OPENAI_KEY,
//   });
//   const openai = new OpenAIApi(configuration);

//   const supportedLanguages = {
//     "gpt-3.5-turbo": ["Spanish", "French", "German", "Italian", "Portuguese", "Dutch", "Russian", "Chinese (Simplified)", "Japanese", "Swedish", "Arabic", "Turkish", "Korean", "Hindi", "Greek", "Hebrew", "Thai", "Vietnamese", "Indonesian", "Malay"],
//     "gpt-4": ["Spanish", "French", "Telugu", "German", "Italian", "Portuguese", "Dutch", "Russian", "Chinese (Simplified)", "Japanese", "Korean", "Swedish", "Arabic", "Turkish", "Hindi", "Greek", "Hebrew", "Thai", "Vietnamese", "Indonesian", "Malay"],
//     "gpt-4-turbo": ["Spanish", "French", "Telugu", "Japanese", "German", "Italian", "Portuguese", "Dutch", "Russian", "Chinese (Simplified)", "Korean", "Arabic", "Swedish", "Turkish", "Hindi", "Greek", "Hebrew", "Thai", "Vietnamese", "Indonesian", "Malay"],
//     "gemini-1.5-pro-001": ["Spanish", "French", "German", "Italian", "Portuguese", "Dutch", "Russian", "Chinese (Simplified)", "Swedish", "Turkish", "Arabic", "Greek", "Hebrew", "Thai", "Vietnamese", "Indonesian", "Malay"],
//     "gemini-1.5-flash-001": ["Spanish", "French", "German", "Italian", "Portuguese", "Dutch", "Russian", "Chinese (Simplified)", "Swedish", "Turkish", "Arabic", "Greek", "Hebrew", "Thai", "Vietnamese", "Indonesian", "Malay"],
//     "gemini-1.5-pro-002": ["Spanish", "French", "German", "Italian", "Portuguese", "Dutch", "Russian", "Chinese (Simplified)", "Japanese", "Korean", "Swedish", "Arabic", "Turkish", "Greek", "Hebrew", "Thai", "Vietnamese", "Indonesian", "Malay"],
//     "gemini-1.5-flash-002": ["Spanish", "French", "German", "Italian", "Portuguese", "Dutch", "Russian", "Chinese (Simplified)", "Japanese", "Korean", "Arabic", "Swedish", "Turkish", "Greek", "Hebrew", "Thai", "Vietnamese", "Indonesian", "Malay"],
//     "deepl": ["Spanish", "French", "Japanese", "German", "Italian", "Dutch", "Russian", "Chinese (Simplified)", "Polish", "Portuguese", "Swedish", "Turkish", "Arabic", "Korean", "Hindi", "Greek", "Hebrew", "Thai", "Vietnamese", "Indonesian", "Malay"],
//   };

//   const deepLLanguageCodes = {
//     "Spanish": "ES",
//     "French": "FR",
//     "German": "DE",
//     "Italian": "IT",
//     "Dutch": "NL",
//     "Russian": "RU",
//     "Chinese (Simplified)": "ZH",
//     "Japanese": "JA",
//     "Portuguese": "PT",
//     "Polish": "PL",
//     "Swedish": "SV",
//     "Arabic": "AR",
//     "Turkish": "TR",
//     "Korean": "KO",
//     "Hindi": "HI",
//     "Greek": "EL",
//     "Hebrew": "HE",
//     "Thai": "TH",
//     "Vietnamese": "VI",
//     "Indonesian": "ID",
//     "Malay": "MS",
//   };

//   const handleInputChange = (e) => {
//     setFormData({ ...formData, [e.target.name]: e.target.value });
//     setError("");
//   };

//   const translateWithDeepL = async (text, toLang) => {
//     try {
//       const targetLangCode = deepLLanguageCodes[toLang];
//       if (!targetLangCode) {
//         throw new Error(`Unsupported language: ${toLang}`);
//       }

//       const response = await fetch(`https://api-free.deepl.com/v2/translate`, {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/x-www-form-urlencoded",
//         },
//         body: new URLSearchParams({
//           auth_key: import.meta.env.VITE_DEEPL_API_KEY,
//           text: text,
//           source_lang: "EN",
//           target_lang: targetLangCode,
//         }),
//       });

//       if (!response.ok) {
//         throw new Error(`DeepL API request failed with status ${response.status}`);
//       }

//       const data = await response.json();
//       return data.translations[0].text;
//     } catch (error) {
//       console.error("DeepL Translation Error:", error);
//       throw new Error("Failed to translate with DeepL. Please check the API key, language codes, or try again later.");
//     }
//   };

//   const handleTranslationSave = async (original, translated, language, model) => {
//     const { data, error } = await supabase
//       .from("translations")
//       .insert([{ original_message: original, translated_message: translated, language, model }]);

//     if (error) {
//       console.error("Error saving translation:", error);
//     } else {
//       console.log("Translation saved:", data);
//     }
//   };

//   const fetchPreviousTranslations = async () => {
//     const { data, error } = await supabase
//       .from("translations")
//       .select("*")
//       .order("created_at", { ascending: false })
//       .limit(5);

//     if (error) {
//       console.error("Error fetching translations:", error);
//     } else {
//       setPreviousTranslations(data);
//     }
//   };

//   useEffect(() => {
//     fetchPreviousTranslations();
//   }, []);

//   const translate = async () => {
//     const { toLanguage, message, model } = formData;
//     try {
//       setIsLoading(true);
//       let translatedText = "";

//       if (model.startsWith("gpt")) {
//         const response = await openai.createChatCompletion({
//           model: model,
//           messages: [
//             { role: "system", content:` Translate this sentence into ${toLanguage}.` },
//             { role: "user", content: message },
//           ],
//           temperature: formData.temperatureValue,
//           max_tokens: 100,
//         });
//         translatedText = response.data.choices[0].message.content.trim();
//       } else if (model.startsWith("gemini")) {
//         const genAIModel = googleGenAI.getGenerativeModel({ model });
//         const prompt = `Translate the text: "${message}" from English to ${toLanguage} with a ${tone.toLowerCase()} tone.`;
//         const result = await genAIModel.generateContent(prompt);
//         translatedText = await result.response.text();
//       } else if (model === "deepl") {
//         translatedText = await translateWithDeepL(message, toLanguage);
//       }

//       await handleTranslationSave(message, translatedText, toLanguage, model);
//       setTranslation(translatedText);
      
//       // Update previous translations
//       setPreviousTranslations((prev) => {
//         const newTranslation = {
//           id: Date.now(), // Temporary ID
//           from: "English",
//           to: toLanguage,
//           model: model,
//           originalText: message,
//           translatedText: translatedText,
//           created_at: new Date().toISOString(), // Add created_at for sorting
//         };
//         const newTranslations = [newTranslation, ...prev].slice(0, 5); // Limit to last 5 translations
//         return newTranslations;
//       });
//     } catch (error) {
//       console.error("Translation Error:", error);
//       setError("Translation failed. Please try again.");
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   const handleOnSubmit = (e) => {
//     e.preventDefault();
//     if (!formData.message) {
//       setError("Please enter the message.");
//       return;
//     }
//     translate();
//   };

//   const handleCopy = () => {
//     navigator.clipboard.writeText(translation);
//     setShowNotification(true);
//     setTimeout(() => {
//       setShowNotification(false);
//     }, 2000);
//   };
//   return (
//     <div className="container">
//       <div className="sidebar">
//         <h2>Models</h2>
//         <div className="choices">
//           {["gpt-3.5-turbo", "gpt-4", "gpt-4-turbo", "gemini-1.5-pro-001", "gemini-1.5-flash-001", "gemini-1.5-pro-002", "gemini-1.5-flash-002", "deepl"].map((model) => (
//             <button
//               key={model}
//               className={`model-option ${formData.model === model ? 'active' : ''}`}
//               onClick={() => handleInputChange({ target: { name: "model", value: model } })}
//             >
//               {model}
//             </button>
//           ))}
//         </div>
//         <Link to="/compare" className="compare-link">Compare Models</Link>
//       </div>
  
//       <div className="main">
//         <h1>Translation App</h1>
//         <div>
//           <h3>Selected Model: {formData.model}</h3>
//         </div>
//         <form onSubmit={handleOnSubmit}>
//           <div className="choiceslang">
//             <label htmlFor="toLanguage">To:</label>
//             <select
//               id="toLanguage"
//               name="toLanguage"
//               value={formData.toLanguage}
//               onChange={handleInputChange}
//             >
//               {supportedLanguages[formData.model]?.map((lang) => (
//                 <option key={lang} value={lang}>
//                   {lang}
//                 </option>
//               ))}
//             </select>
//           </div>
  
//           <textarea
//             name="message"
//             placeholder="Type your message here..."
//             value={formData.message}
//             onChange={handleInputChange}
//           ></textarea>
  
//           {error && <div className="error">{error}</div>}
  
//           <button type="submit">Translate</button>
//         </form>
  
//         <div className="translation">
//           <div className="copy-btn" onClick={handleCopy} title="Copy to clipboard">
//             📋
//           </div>
//           {isLoading ? <BeatLoader size={12} color={"red"} /> : translation}
//         </div>
  
//         <div className={`notification ${showNotification ? "active" : ""}`}>
//           Copied to clipboard!
//         </div>
  
//         <div className="previous-translations">
//           <h3>Previous Translations:</h3>
//           {previousTranslations.length > 0 ? (
//             <table>
//               <thead>
//                 <tr>
//                   <th>Original</th>
//                   <th>Translated</th>
//                   <th>Language</th>
//                   <th>Model</th>
//                   <th>Date</th>
//                 </tr>
//               </thead>
//               <tbody>
//                 {previousTranslations.map((item) => (
//                   <tr key={item.id}>
//                     <td>{item.original_message}</td>
//                     <td>{item.translated_message}</td>
//                     <td>{item.language}</td>
//                     <td>{item.model}</td>
//                     <td>{new Date(item.created_at).toLocaleString()}</td>
//                   </tr>
//                 ))}
//               </tbody>
//             </table>
//           ) : (
//             <p>No previous translations found.</p>
//           )}
//         </div>
  
//         {/* Add CompareTranslate component here */}
//         <CompareTranslate />
//       </div>
//     </div>
//   );
  
// };

// export default App;




import React, { useState, useEffect } from "react";
import "./App.css";
import { Configuration, OpenAIApi } from "openai";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { BeatLoader } from "react-spinners";
import { createClient } from "@supabase/supabase-js";
import { Link } from 'react-router-dom';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL; 
const supabaseKey = import.meta.env.VITE_SUPABASE_KEY; 
const supabase = createClient(supabaseUrl, supabaseKey);

const App = () => {
  const [formData, setFormData] = useState({
    toLanguage: "Spanish",
    message: "",
    model: "gemini-1.5-flash-002",
    temperatureValue: 0.3,
  });
  const [error, setError] = useState("");
  const [showNotification, setShowNotification] = useState(false);
  const [translation, setTranslation] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [previousTranslations, setPreviousTranslations] = useState([]);

  const googleGenAI = new GoogleGenerativeAI(import.meta.env.VITE_GOOGLE_API_KEY);
  const configuration = new Configuration({
    apiKey: import.meta.env.VITE_OPENAI_KEY,
  });
  const openai = new OpenAIApi(configuration);

  const supportedLanguages = {
    "gpt-3.5-turbo": ["Spanish", "French", "German", "Italian", "Portuguese", "Dutch", "Russian", "Chinese (Simplified)", "Japanese", "Swedish", "Arabic", "Turkish", "Korean", "Hindi", "Greek", "Hebrew", "Thai", "Vietnamese", "Indonesian", "Malay"],
    "gpt-4": ["Spanish", "French", "Telugu", "German", "Italian", "Portuguese", "Dutch", "Russian", "Chinese (Simplified)", "Japanese", "Korean", "Swedish", "Arabic", "Turkish", "Hindi", "Greek", "Hebrew", "Thai", "Vietnamese", "Indonesian", "Malay"],
    "gpt-4-turbo": ["Spanish", "French", "Telugu", "Japanese", "German", "Italian", "Portuguese", "Dutch", "Russian", "Chinese (Simplified)", "Korean", "Arabic", "Swedish", "Turkish", "Hindi", "Greek", "Hebrew", "Thai", "Vietnamese", "Indonesian", "Malay"],
    "gemini-1.5-pro-001": ["Spanish", "French", "German", "Italian", "Portuguese", "Dutch", "Russian", "Chinese (Simplified)", "Swedish", "Turkish", "Arabic", "Greek", "Hebrew", "Thai", "Vietnamese", "Indonesian", "Malay"],
    "gemini-1.5-flash-001": ["Spanish", "French", "German", "Italian", "Portuguese", "Dutch", "Russian", "Chinese (Simplified)", "Swedish", "Turkish", "Arabic", "Greek", "Hebrew", "Thai", "Vietnamese", "Indonesian", "Malay"],
    "gemini-1.5-pro-002": ["Spanish", "French", "German", "Italian", "Portuguese", "Dutch", "Russian", "Chinese (Simplified)", "Japanese", "Korean", "Swedish", "Arabic", "Turkish", "Greek", "Hebrew", "Thai", "Vietnamese", "Indonesian", "Malay"],
    "gemini-1.5-flash-002": ["Spanish", "French", "German", "Italian", "Portuguese", "Dutch", "Russian", "Chinese (Simplified)", "Japanese", "Korean", "Arabic", "Swedish", "Turkish", "Greek", "Hebrew", "Thai", "Vietnamese", "Indonesian", "Malay"],
    "deepl": ["Spanish", "French", "Japanese", "German", "Italian", "Dutch", "Russian", "Chinese (Simplified)", "Polish", "Portuguese", "Swedish", "Turkish", "Arabic", "Korean", "Hindi", "Greek", "Hebrew", "Thai", "Vietnamese", "Indonesian", "Malay"],
  };

  const deepLLanguageCodes = {
    "Spanish": "ES",
    "French": "FR",
    "German": "DE",
    "Italian": "IT",
    "Dutch": "NL",
    "Russian": "RU",
    "Chinese (Simplified)": "ZH",
    "Japanese": "JA",
    "Portuguese": "PT",
    "Polish": "PL",
    "Swedish": "SV",
    "Arabic": "AR",
    "Turkish": "TR",
    "Korean": "KO",
    "Hindi": "HI",
    "Greek": "EL",
    "Hebrew": "HE",
    "Thai": "TH",
    "Vietnamese": "VI",
    "Indonesian": "ID",
    "Malay": "MS",
  };

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError("");
  };

  const translateWithDeepL = async (text, toLang) => {
    try {
      const targetLangCode = deepLLanguageCodes[toLang];
      if (!targetLangCode) {
        throw new Error(`Unsupported language: ${toLang}`);
      }

      const response = await fetch("https://api-free.deepl.com/v2/translate", {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          auth_key: import.meta.env.VITE_DEEPL_API_KEY,
          text: text,
          source_lang: "EN",
          target_lang: targetLangCode,
        }),
      });

      if (!response.ok) {
        throw new Error(`DeepL API request failed with status ${response.status}`);
      }

      const data = await response.json();
      return data.translations[0].text;
    } catch (error) {
      console.error("DeepL Translation Error:", error);
      throw new Error("Failed to translate with DeepL. Please check the API key, language codes, or try again later.");
    }
  };

  const handleTranslationSave = async (original, translated, language, model) => {
    const { data, error } = await supabase
      .from("translations")
      .insert([{ original_message: original, translated_message: translated, language, model }]);

    if (error) {
      console.error("Error saving translation:", error);
    } else {
      console.log("Translation saved:", data);
    }
  };

  const fetchPreviousTranslations = async () => {
    const { data, error } = await supabase
      .from("translations")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(5);

    if (error) {
      console.error("Error fetching translations:", error);
    } else {
      setPreviousTranslations(data);
    }
  };

  useEffect(() => {
    fetchPreviousTranslations();
  }, []);

  const translate = async () => {
    const { toLanguage, message, model } = formData;
    try {
      setIsLoading(true);
      let translatedText = "";

      if (model.startsWith("gpt")) {
        const response = await openai.createChatCompletion({
          model: model,
          messages: [
            { role: "system", content: `Translate this sentence into ${toLanguage}.` },
            { role: "user", content: message },
          ],
          temperature: formData.temperatureValue,
          max_tokens: 100,
        });
        translatedText = response.data.choices[0].message.content.trim();
      } else if (model.startsWith("gemini")) {
        const genAIModel = googleGenAI.getGenerativeModel({ model });
        const prompt = `Translate the text: "${message}" from English to ${toLanguage}.`;
        const result = await genAIModel.generateContent(prompt);
        translatedText = await result.response.text();
      } else if (model === "deepl") {
        translatedText = await translateWithDeepL(message, toLanguage);
      }

      await handleTranslationSave(message, translatedText, toLanguage, model);
      setTranslation(translatedText);
      
      // Update previous translations
      setPreviousTranslations((prev) => {
        const newTranslation = {
          id: Date.now(), // Temporary ID
          from: "English",
          to: toLanguage,
          model: model,
          originalText: message,
          translatedText: translatedText,
          created_at: new Date().toISOString(), // Add created_at for sorting
        };
        const newTranslations = [newTranslation, ...prev].slice(0, 5); // Limit to last 5 translations
        return newTranslations;
      });
    } catch (error) {
      console.error("Translation Error:", error);
      setError("Translation failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleOnSubmit = (e) => {
    e.preventDefault();
    if (!formData.message) {
      setError("Please enter the message.");
      return;
    }
    translate();
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(translation);
    setShowNotification(true);
    setTimeout(() => {
      setShowNotification(false);
    }, 2000);
  };

  return (
    <div className="container">
      <div className="sidebar">
        <h2>Models</h2>
        <div className="choices">
          {["gpt-3.5-turbo", "gpt-4", "gpt-4-turbo", "gemini-1.5-pro-001", "gemini-1.5-flash-001", "gemini-1.5-pro-002", "gemini-1.5-flash-002", "deepl"].map((model) => (
            <button
              key={model}
              className={`model-option ${formData.model === model ? 'active' : ''}`}
              onClick={() => handleInputChange({ target: { name: "model", value: model } })}
            >
              {model}
            </button>
          ))}
        </div>
        <Link to="/compare" className="compare-link">Compare Models</Link>
      </div>

      <div className="main">
        <h1>Translation App</h1>
        <div>
          <h3>Selected Model: {formData.model}</h3>
        </div>
        <form onSubmit={handleOnSubmit}>
          <div className="choiceslang">
            <label htmlFor="toLanguage">To:</label>
            <select
              id="toLanguage"
              name="toLanguage"
              value={formData.toLanguage}
              onChange={handleInputChange}
            >
              {supportedLanguages[formData.model]?.map((lang) => (
                <option key={lang} value={lang}>
                  {lang}
                </option>
              ))}
            </select>
          </div>

          <textarea
            name="message"
            placeholder="Type your message here..."
            value={formData.message}
            onChange={handleInputChange}
          ></textarea>

          {error && <div className="error">{error}</div>}

          <button type="submit">Translate</button>
        </form>

        <div className="translation">
          <div className="copy-btn" onClick={handleCopy} title="Copy to clipboard">
            📋
          </div>
          {isLoading ? <BeatLoader size={12} color={"red"} /> : translation}
        </div>

        <div className={`notification ${showNotification ? "active" : ""}`}>
          Copied to clipboard!
        </div>

        <div className="previous-translations">
          <h3>Previous Translations:</h3>
          {previousTranslations.length > 0 ? (
            <table>
              <thead>
                <tr>
                  <th>Original</th>
                  <th>Translated</th>
                  <th>Language</th>
                  <th>Model</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {previousTranslations.map((item) => (
                  <tr key={item.id}>
                    <td>{item.original_message}</td>
                    <td>{item.translated_message}</td>
                    <td>{item.language}</td>
                    <td>{item.model}</td>
                    <td>{new Date(item.created_at).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p>No previous translations found.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default App;