import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import App from './App';
import CompareTranslate from './CompareTranslation'; // Import CompareTranslate component

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Router>
      <Routes>
        <Route path="/" element={<App />} />  {/* Default path to App */}
        <Route path="/compare" element={<CompareTranslate />} />  {/* Route for CompareTranslate */}
      </Routes>
    </Router>
  </React.StrictMode>
);
