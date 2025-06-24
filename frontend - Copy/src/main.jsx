import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import { CategoryProvider } from './context/CategoryContext.jsx';
import './index.css';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <BrowserRouter>
    <CategoryProvider>
      <App />
    </CategoryProvider>
  </BrowserRouter>
);