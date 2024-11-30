// import React, { useState } from "react";
// import { Link } from "react-router-dom";
// import { createClient } from "@supabase/supabase-js";
// import { Configuration, OpenAIApi } from "openai";
// import { GoogleGenerativeAI } from "@google/generative-ai";
// import { BeatLoader } from "react-spinners";

// const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
// const supabaseKey = import.meta.env.VITE_SUPABASE_KEY;
// const supabase = createClient(supabaseUrl, supabaseKey);

// const CompareTranslate = () => {
//   const [formData, setFormData] = useState({
//     message: "",
//     toLanguage: "Spanish",
//     models: [],
//     tone: "mild", // Default tone
//   });
//   const [translations, setTranslations] = useState({});
//   const [scores, setScores] = useState({});
//   const [error, setError] = useState("");
//   const [isLoading, setIsLoading] = useState(false);

//   const googleGenAI = new GoogleGenerativeAI(import.meta.env.VITE_GOOGLE_API_KEY);
//   const configuration = new Configuration({
//     apiKey: import.meta.env.VITE_OPENAI_KEY,
//   });
//   const openai = new OpenAIApi(configuration);

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

//   const handleModelChange = (e) => {
//     const model = e.target.value;
//     setFormData((prevState) => {
//       const models = prevState.models.includes(model)
//         ? prevState.models.filter((m) => m !== model)
//         : [...prevState.models, model];
      
//       return { ...prevState, models };
//     });
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

//   const translate = async (model) => {
//     const { toLanguage, message, tone } = formData;
//     setIsLoading(true);
//     let translatedText = "";

//     try {
//       if (model.startsWith("gpt")) {
//         const response = await openai.createChatCompletion({
//           model: model,
//           messages: [
//             { role: "system", content: `Translate this sentence into ${toLanguage}.` },
//             { role: "user", content: message },
//           ],
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

//       return translatedText;
//     } catch (error) {
//       console.error("Translation Error:", error);
//       setError("Translation failed. Please try again.");
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   const handleOnSubmit = async (e) => {
//     e.preventDefault();
//     if (!formData.message) {
//       setError("Please enter the message.");
//       return;
//     }

//     setIsLoading(true);
//     setTranslations({});
//     setScores({});

//     try {
//       const promises = formData.models.map(async (model) => {
//         const translation = await translate(model);
//         const score = Math.floor(Math.random() * 10) + 1;
//         return { model, translation, score };
//       });

//       const results = await Promise.all(promises);
//       const translationResults = {};
//       const scoreResults = {};
      
//       results.forEach(({ model, translation, score }) => {
//         translationResults[model] = translation;
//         scoreResults[model] = score;
//       });

//       setTranslations(translationResults);
//       setScores(scoreResults);
//     } catch (err) {
//       console.error("Translation Error:", err);
//       setError("Translation failed. Please try again.");
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   const supportedLanguages = [
//     "Spanish", "French", "German", "Italian", "Portuguese", "Dutch",
//     "Russian", "Chinese (Simplified)", "Japanese", "Korean",
//     "Arabic", "Turkish", "Hindi", "Greek", "Hebrew", "Thai",
//     "Vietnamese", "Indonesian", "Malay", "Polish"
//   ];

//   const models = [
//     "gemini-1.5-pro-001",
//     "gemini-1.5-flash-001",
//     "gemini-1.5-pro-002",
//     "gemini-1.5-flash-002",
//   ];

//   return (
//     <div className="compare-container">
//       <Link to="/" className="back-link">Back to Translation</Link>
//       <h1>Compare Translations</h1>
//       <form onSubmit={handleOnSubmit}>
//         <textarea
//           name="message"
//           placeholder="Type your message here..."
//           value={formData.message}
//           onChange={handleInputChange}
//         ></textarea>

//         <div>
//           <label htmlFor="toLanguage">To:</label>
//           <select
//             id="toLanguage"
//             name="toLanguage"
//             value={formData.toLanguage}
//             onChange={handleInputChange}
//           >
//             {supportedLanguages.map((lang) => (
//               <option key={lang} value={lang}>
//                 {lang}
//               </option>
//             ))}
//           </select>
//         </div>

//         <div>
//           <label htmlFor="tone">Tone:</label>
//           <select
//             id="tone"
//             name="tone"
//             value={formData.tone}
//             onChange={handleInputChange}
//           >
//             <option value="mild">Mild</option>
//             <option value="serious">Serious</option>
//           </select>
//         </div>

//         <div className="model-selection" style={{ display: 'flex', justifyContent: 'space-between', marginTop: '20px' }}>
//           {models.map((model) => (
//             <label key={model}>
//               <input
//                 type="checkbox"
//                 value={model}
//                 checked={formData.models.includes(model)}
//                 onChange={handleModelChange}
//               />
//               {model}
//             </label>
//           ))}
//         </div>

//         {error && <div className="error">{error}</div>}

//         <button type="submit" disabled={isLoading || formData.models.length === 0}>
//           {isLoading ? "Translating..." : "Translate"}
//         </button>
//       </form>

//       {Object.keys(translations).length > 0 && (
//         <div className="translations">
//           <h2>Translations:</h2>
//           <table>
//             <thead>
//               <tr>
//                 <th>Model</th>
//                 <th>Translation</th>
//                 <th>Average Score</th>
//               </tr>
//             </thead>
//             <tbody>
//               {Object.entries(translations).map(([model, translation]) => (
//                 <tr key={model}>
//                   <td>{model}</td>
//                   <td>{translation}</td>
//                   <td>{scores[model]} / 10</td>
//                 </tr>
//               ))}
//             </tbody>
//           </table>
//         </div>
//       )}
//     </div>
//   );
// };

// export default CompareTranslate;



import React, { useState } from "react";
import { Link } from "react-router-dom";
import { createClient } from "@supabase/supabase-js";
import { Configuration, OpenAIApi } from "openai";
import { GoogleGenerativeAI } from "@google/generative-ai";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

const CompareTranslate = () => {
  const [formData, setFormData] = useState({
    message: "",
    toLanguage: "Spanish",
    models: [],
    tone: "mild",
  });
  const [translations, setTranslations] = useState({});
  const [scores, setScores] = useState({});
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const googleGenAI = new GoogleGenerativeAI(import.meta.env.VITE_GOOGLE_API_KEY);
  const configuration = new Configuration({
    apiKey: import.meta.env.VITE_OPENAI_KEY,
  });
  const openai = new OpenAIApi(configuration);

  const deepLLanguageCodes = {
    Spanish: "ES",
    French: "FR",
    German: "DE",
    Italian: "IT",
    Dutch: "NL",
    Russian: "RU",
    "Chinese (Simplified)": "ZH",
    Japanese: "JA",
    Portuguese: "PT",
    Polish: "PL",
  };

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError("");
  };

  const handleModelChange = (e) => {
    const model = e.target.value;
    setFormData((prevState) => {
      const models = prevState.models.includes(model)
        ? prevState.models.filter((m) => m !== model)
        : [...prevState.models, model];
      return { ...prevState, models };
    });
  };

  const translateWithDeepL = async (text, toLang) => {
    try {
      const targetLangCode = deepLLanguageCodes[toLang];
      const response = await fetch(`https://api-free.deepl.com/v2/translate`, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          auth_key: import.meta.env.VITE_DEEPL_API_KEY,
          text,
          source_lang: "EN",
          target_lang: targetLangCode,
        }),
      });

      if (!response.ok) throw new Error(`DeepL API request failed`);

      const data = await response.json();
      return data.translations[0].text;
    } catch (error) {
      console.error("DeepL Translation Error:", error);
      throw new Error("Failed to translate with DeepL.");
    }
  };

  const translate = async (model) => {
    const { toLanguage, message, tone } = formData;
    setIsLoading(true);
    let translatedText = "";

    try {
      if (model.startsWith("gpt")) {
        const response = await openai.createChatCompletion({
          model,
          messages: [
            { role: "system", content: `Translate this sentence into ${toLanguage}. `},
            { role: "user", content: message },
          ],
          max_tokens: 100,
        });
        translatedText = response.data.choices[0].message.content.trim();
      } else if (model.startsWith("gemini")) {
        const genAIModel = googleGenAI.getGenerativeModel({ model });
        const prompt = `Translate the text: "${message}" from English to ${toLanguage} with a ${tone.toLowerCase()} tone.`;
        const result = await genAIModel.generateContent(prompt);
        translatedText = await result.response.text();
      } else if (model === "deepl") {
        translatedText = await translateWithDeepL(message, toLanguage);
      }
      return translatedText;
    } catch (error) {
      console.error("Translation Error:", error);
      setError("Translation failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const saveComparison = async (originalMessage, translation, model, score) => {
    try {
      const response = await fetch("http://localhost:5000/api/compare_translations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          original_message: originalMessage,
          translated_message: translation,
          translation_model: model,
          score,
        }),
      });

      if (!response.ok) throw new Error("Failed to save comparison");
      const data = await response.json();
      console.log("Comparison saved:", data);
    } catch (error) {
      console.error("Error saving comparison:", error);
    }
  };

  const handleOnSubmit = async (e) => {
    e.preventDefault();
    if (!formData.message) {
      setError("Please enter the message.");
      return;
    }

    setIsLoading(true);
    setTranslations({});
    setScores({});

    try {
      const promises = formData.models.map(async (model) => {
        const translation = await translate(model);
        const score = Math.floor(Math.random() * 10) + 1;
        saveComparison(formData.message, translation, model, score);
        return { model, translation, score };
      });

      const results = await Promise.all(promises);
      const translationResults = {};
      const scoreResults = {};

      results.forEach(({ model, translation, score }) => {
        translationResults[model] = translation;
        scoreResults[model] = score;
      });

      setTranslations(translationResults);
      setScores(scoreResults);
    } catch (err) {
      console.error("Translation Error:", err);
      setError("Translation failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const supportedLanguages = [
    "Spanish", "French", "German", "Italian", "Portuguese", "Dutch",
    "Russian", "Chinese (Simplified)", "Japanese", "Korean",
    "Arabic", "Turkish", "Hindi", "Greek", "Hebrew", "Thai",
    "Vietnamese", "Indonesian", "Malay", "Polish"
  ];

  const models = [
    "gemini-1.5-pro-001",
    "gemini-1.5-flash-001",
    "gemini-1.5-pro-002",
    "gemini-1.5-flash-002",
  ];

  return (
    <div className="compare-container">
      <Link to="/" className="back-link">Back to Translation</Link>
      <h1>Compare Translations</h1>
      <form onSubmit={handleOnSubmit}>
        <textarea
          name="message"
          placeholder="Type your message here..."
          value={formData.message}
          onChange={handleInputChange}
        ></textarea>

        <div>
          <label htmlFor="toLanguage">To:</label>
          <select
            id="toLanguage"
            name="toLanguage"
            value={formData.toLanguage}
            onChange={handleInputChange}
          >
            {supportedLanguages.map((lang) => (
              <option key={lang} value={lang}>
                {lang}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="tone">Tone:</label>
          <select
            id="tone"
            name="tone"
            value={formData.tone}
            onChange={handleInputChange}
          >
            <option value="mild">Mild</option>
            <option value="serious">Serious</option>
          </select>
        </div>

        <div className="model-selection">
          {models.map((model) => (
            <label key={model}>
              <input
                type="checkbox"
                value={model}
                checked={formData.models.includes(model)}
                onChange={handleModelChange}
              />
              {model}
            </label>
          ))}
        </div>

        {error && <div className="error">{error}</div>}

        <button type="submit" disabled={isLoading || formData.models.length === 0}>
          {isLoading ? "Translating..." : "Translate"}
        </button>
      </form>

      {Object.keys(translations).length > 0 && (
        <div className="translations">
          <h2>Translations:</h2>
          <table>
            <thead>
              <tr>
                <th>Model</th>
                <th>Translation</th>
                <th>Score</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(translations).map(([model, translation]) => (
                <tr key={model}>
                  <td>{model}</td>
                  <td>{translation}</td>
                  <td>{scores[model]} / 10</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default CompareTranslate;