import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import App from './App'; // Import the main App component
import CompareTranslate from './CompareTranslation'; // Import the CompareTranslate component
import ResponseAnswer from './ResponseAnswer'; // Import the responseAnswer component

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Router>
      <Routes>
        <Route path="/" element={<App />} /> {/* Default path to App */}
        <Route path="/compare" element={<CompareTranslate />} /> {/* Route for CompareTranslate */}
        <Route path="/Q&A" element={<ResponseAnswer />} /> {/* Route for responseAnswer */}
      </Routes>
    </Router>
  </React.StrictMode>
);